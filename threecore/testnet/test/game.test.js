import fs from 'node:fs'
import assert from 'node:assert/strict'
import hre from 'hardhat'
import { ethers } from 'ethers'

const artifact = name => JSON.parse(fs.readFileSync(new URL(`../../../artifacts/threecore/testnet/contracts/${name}.json`, import.meta.url)))
const deploy = async (name, signer, args = []) => {
  const a = artifact(name), c = await new ethers.ContractFactory(a.abi, a.bytecode, signer).deploy(...args)
  await c.waitForDeployment(); return c
}
const reject = async action => { await assert.rejects(async () => { const tx = await action(); if (tx?.wait) await tx.wait() }) }
const unit = ethers.parseEther

describe('ThreeCore EVM training dApps (test credits only)', function () {
  let connection, provider, owner, other, factory, suites
  beforeEach(async () => {
    connection = await hre.network.create({ network: 'hardhatMainnet' })
    provider = new ethers.BrowserProvider(connection.provider)
    owner = await provider.getSigner(0); other = await provider.getSigner(1)
    factory = await deploy('TrainingFactory', owner)
    suites = {}
    for (const symbol of ['DAT', 'EMA', 'CAWELON']) {
      await (await factory.deployAgent(symbol)).wait()
      const address = await factory.agents(await owner.getAddress(), ethers.id(symbol))
      const agent = new ethers.Contract(address, artifact('TrainingAgent').abi, owner)
      suites[symbol] = { agent, token: new ethers.Contract(await agent.credit(), artifact('TrainingCredit').abi, owner), game: new ethers.Contract(await agent.game(), artifact('TrainingGame').abi, owner) }
    }
  })
  afterEach(async () => { await connection.close() })
  const play = async (s, id, correct = true, stake = unit('1')) => {
    const [round, a, b] = await s.game.challenge(await s.agent.getAddress())
    return s.agent.execute(ethers.id(id), round, a + b + (correct ? 0n : 1n), stake)
  }
  for (const symbol of ['DAT', 'EMA', 'CAWELON']) it(`${symbol}: deploy, play, settle, verify net result and burn training profit`, async () => {
    const s = suites[symbol], address = await s.agent.getAddress()
    assert.equal(await s.token.balanceOf(address), unit('100'))
    await (await play(s, 'win')).wait()
    assert.equal(await s.agent.realizedPnl(), unit('1'))
    assert.equal(await s.token.balanceOf(address), unit('101'))
    assert.equal(await s.token.allowance(address, await s.game.getAddress()), 0n)
    const supply = await s.token.totalSupply()
    await (await s.agent.burnProfit(ethers.id('burn'), unit('1'))).wait()
    assert.equal(await s.token.totalSupply(), supply - unit('1'))
    assert.equal(await s.agent.burnedFromProfit(), unit('1'))
    for (const otherSymbol of Object.keys(suites).filter(x => x !== symbol)) {
      const otherSuite = suites[otherSymbol]
      assert.equal(await otherSuite.token.balanceOf(await otherSuite.agent.getAddress()), unit('100'))
      assert.equal(await otherSuite.agent.realizedPnl(), 0n)
    }
  })
  it('rejects deployment on an unsupported chain', async () => {
    const bad = await hre.network.create({ network: 'trainingUnsupported' })
    try {
      const p = new ethers.BrowserProvider(bad.provider)
      const signer = await p.getSigner(0)
      await reject(() => deploy('TrainingFactory', signer))
    } finally { await bad.close() }
  })
  it('losses carry forward and deposited principal cannot be burned as earnings', async () => {
    const s = suites.DAT
    await reject(() => s.agent.burnProfit(ethers.id('burn-before'), unit('1')))
    await (await play(s, 'loss', false)).wait()
    assert.equal(await s.agent.realizedPnl(), -unit('1'))
    await (await play(s, 'recover')).wait()
    assert.equal(await s.agent.realizedPnl(), 0n)
    await reject(() => s.agent.burnProfit(ethers.id('burn-zero'), 1n))
    await (await play(s, 'profit')).wait()
    await (await s.agent.burnProfit(ethers.id('burn'), unit('1'))).wait()
    await reject(() => s.agent.burnProfit(ethers.id('burn2'), 1n))
  })
  it('rejects unauthorized execution, operator replacement and burns', async () => {
    const s = suites.DAT, [round, a, b] = await s.game.challenge(await s.agent.getAddress())
    await reject(() => s.agent.connect(other).execute(ethers.id('x'), round, a + b, unit('1')))
    await reject(() => s.agent.connect(other).setOperator(ethers.ZeroAddress))
    await reject(() => s.agent.connect(other).burnProfit(ethers.id('b'), 1n))
  })
  it('pause, stake limits and reserve floor reject without consuming command IDs', async () => {
    const s = suites.EMA
    await (await s.agent.setPaused(true)).wait()
    await reject(() => play(s, 'paused'))
    assert.equal(await s.agent.usedCommands(ethers.id('paused')), false)
    await (await s.agent.setPaused(false)).wait()
    await reject(() => play(s, 'large', true, unit('11')))
    // Nine ten-credit losses leave 10; a tenth would breach the reserve of 5.
    for (let i = 0; i < 9; i++) await (await play(s, `loss-${i}`, false, unit('10'))).wait()
    await reject(() => play(s, 'reserve', false, unit('10')))
    assert.equal(await s.agent.usedCommands(ethers.id('reserve')), false)
  })
  it('rejects duplicate commands and stale game rounds atomically', async () => {
    const s = suites.CAWELON
    await (await play(s, 'one')).wait()
    await reject(() => play(s, 'one'))
    await reject(() => s.agent.execute(ethers.id('stale'), 0, 0, unit('1')))
    assert.equal(await s.agent.usedCommands(ethers.id('stale')), false)
    assert.equal(await s.token.allowance(await s.agent.getAddress(), await s.game.getAddress()), 0n)
  })
  it('funding does not alter P&L and deployments cannot silently repeat', async () => {
    const s = suites.DAT
    await (await s.token.approve(await s.agent.getAddress(), unit('5'))).wait()
    await (await s.agent.fund(unit('5'))).wait()
    assert.equal(await s.agent.realizedPnl(), 0n)
    await reject(() => factory.deployAgent('DAT'))
    await reject(() => factory.deployAgent('CAW'))
    await reject(() => factory.deployAgent('OTHER'))
  })
  it('burn commands cannot replay and native currency deposits fail', async () => {
    const s = suites.DAT
    await (await play(s, 'win')).wait()
    await (await s.agent.burnProfit(ethers.id('b'), unit('0.5'))).wait()
    await reject(() => s.agent.burnProfit(ethers.id('b'), unit('0.5')))
    await reject(() => owner.sendTransaction({ to: s.agent.target, value: 1n }))
  })
})
