import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import chai from 'chai'
import hre from 'hardhat'
import { ethers } from 'ethers'

const { expect } = chai
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')

function artifact(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, 'artifacts', relativePath), 'utf8'))
}

async function deploy(relativePath, signer, args = []) {
  const compiled = artifact(relativePath)
  const factory = new ethers.ContractFactory(compiled.abi, compiled.bytecode, signer)
  const contract = await factory.deploy(...args)
  await contract.waitForDeployment()
  return contract
}

async function expectRevert(action) {
  let reverted = false
  try {
    const transaction = await action
    if (transaction && typeof transaction.wait === 'function') await transaction.wait()
  } catch (_) {
    reverted = true
  }
  expect(reverted).to.equal(true)
}

describe('CawGameGateway', function () {
  let provider
  let owner
  let operator
  let treasury
  let alice
  let bob
  let outsider
  let token
  let adapter
  let gateway
  let ownerAddress
  let operatorAddress
  let treasuryAddress
  let aliceAddress
  let bobAddress
  let outsiderAddress
  let connection

  beforeEach(async function () {
    connection = await hre.network.create({ network: 'hardhatMainnet' })
    provider = new ethers.BrowserProvider(connection.provider)
    ;[owner, operator, treasury, alice, bob, outsider] = await Promise.all(
      [0, 1, 2, 3, 4, 5].map((index) => provider.getSigner(index))
    )
    ;[
      ownerAddress,
      operatorAddress,
      treasuryAddress,
      aliceAddress,
      bobAddress,
      outsiderAddress,
    ] = await Promise.all(
      [owner, operator, treasury, alice, bob, outsider].map((signer) => signer.getAddress())
    )

    token = await deploy('game/test/mocks/MockCawToken.json', owner)
    adapter = await deploy('game/test/mocks/MockGameAssetAdapter.json', owner)
    gateway = await deploy('game/contracts/CawGameGateway.json', owner, [
      await token.getAddress(),
      await adapter.getAddress(),
      ownerAddress,
      treasuryAddress,
      100n,
    ])

    await (await adapter.setGateway(await gateway.getAddress())).wait()
    await (await gateway.setOperator(operatorAddress, true)).wait()
    await Promise.all([
      token.mint(ownerAddress, 1_000n).then((tx) => tx.wait()),
      token.mint(aliceAddress, 500n).then((tx) => tx.wait()),
      token.mint(bobAddress, 500n).then((tx) => tx.wait()),
    ])
    await (await gateway.connect(alice).registerPlayer(ethers.id('alice-player'))).wait()
    await (await gateway.connect(bob).registerPlayer(ethers.id('bob-player'))).wait()
  })

  async function fundRewardPool(amount) {
    await (await token.approve(await gateway.getAddress(), amount)).wait()
    await (await gateway.fundRewardPool(amount)).wait()
  }

  it('registers one unique player ID per wallet and emits an event', async function () {
    const playerId = ethers.id('outsider-player')
    const transaction = await gateway.connect(outsider).registerPlayer(playerId)
    const receipt = await transaction.wait()
    const eventNames = receipt.logs.flatMap((log) => {
      try {
        return [gateway.interface.parseLog(log).name]
      } catch (_) {
        return []
      }
    })

    expect(await gateway.playerIdByWallet(outsiderAddress)).to.equal(playerId)
    expect(await gateway.walletByPlayerId(playerId)).to.equal(outsiderAddress)
    expect(eventNames).to.include('PlayerRegistered')
    await expectRevert(gateway.connect(outsider).registerPlayer(ethers.id('second-id')))
    await expectRevert(gateway.connect(owner).registerPlayer(playerId))
  })

  it('reads a player CAW balance and gateway allowance', async function () {
    await (await token.connect(alice).approve(await gateway.getAddress(), 77n)).wait()
    expect(await gateway.cawBalanceOf(aliceAddress)).to.equal(500n)
    expect(await gateway.cawAllowanceForGateway(aliceAddress)).to.equal(77n)
  })

  it('rejects reward creation by an unauthorized account', async function () {
    await fundRewardPool(100n)
    await expectRevert(
      gateway.connect(outsider).recordReward(
        ethers.id('reward-unauthorized'),
        aliceAddress,
        10n,
        ethers.id('reason')
      )
    )
  })

  it('records a funded reward and lets only the assigned player claim it', async function () {
    await fundRewardPool(100n)
    const rewardId = ethers.id('reward-one')
    await (await gateway.connect(operator).recordReward(
      rewardId,
      aliceAddress,
      40n,
      ethers.id('first-win')
    )).wait()

    expect(await gateway.reservedRewards()).to.equal(40n)
    expect(await gateway.availableRewardPool()).to.equal(60n)
    await expectRevert(gateway.connect(bob).claimReward(rewardId))

    const before = await token.balanceOf(aliceAddress)
    await (await gateway.connect(alice).claimReward(rewardId)).wait()
    expect(await token.balanceOf(aliceAddress)).to.equal(before + 40n)
    expect(await gateway.rewardClaimed(rewardId)).to.equal(true)
    expect(await gateway.reservedRewards()).to.equal(0n)
  })

  it('prevents a reward from being claimed twice', async function () {
    await fundRewardPool(50n)
    const rewardId = ethers.id('reward-replay')
    await (await gateway.connect(operator).recordReward(
      rewardId,
      aliceAddress,
      25n,
      ethers.id('quest')
    )).wait()
    await (await gateway.connect(alice).claimReward(rewardId)).wait()
    await expectRevert(gateway.connect(alice).claimReward(rewardId))
  })

  it('enforces reward caps, unique IDs and available funding', async function () {
    await fundRewardPool(50n)
    const rewardId = ethers.id('reward-bounds')
    await expectRevert(
      gateway.connect(operator).recordReward(rewardId, aliceAddress, 101n, ethers.ZeroHash)
    )
    await expectRevert(
      gateway.connect(operator).recordReward(rewardId, aliceAddress, 60n, ethers.ZeroHash)
    )
    await (await gateway.connect(operator).recordReward(
      rewardId,
      aliceAddress,
      20n,
      ethers.ZeroHash
    )).wait()
    await expectRevert(
      gateway.connect(operator).recordReward(rewardId, aliceAddress, 20n, ethers.ZeroHash)
    )
  })

  it('cancels a pending reward without transferring CAW', async function () {
    await fundRewardPool(50n)
    const rewardId = ethers.id('reward-cancel')
    await (await gateway.connect(operator).recordReward(
      rewardId,
      aliceAddress,
      30n,
      ethers.ZeroHash
    )).wait()
    await (await gateway.connect(operator).cancelReward(rewardId)).wait()
    const reward = await gateway.rewards(rewardId)
    expect(reward.status).to.equal(3n)
    expect(await gateway.reservedRewards()).to.equal(0n)
    expect(await gateway.availableRewardPool()).to.equal(50n)
  })

  it('escrows an item purchase and completes delivery atomically', async function () {
    const requestId = ethers.id('purchase-complete')
    const itemSku = ethers.id('starter-sword')
    await (await token.connect(alice).approve(await gateway.getAddress(), 30n)).wait()
    await (await gateway.connect(alice).requestItemPurchase(
      requestId,
      itemSku,
      30n,
      ethers.id('blue-skin')
    )).wait()

    expect(await gateway.escrowedPurchases()).to.equal(30n)
    const treasuryBefore = await token.balanceOf(treasuryAddress)
    await (await gateway.connect(operator).completeItemPurchase(requestId)).wait()

    expect(await token.balanceOf(treasuryAddress)).to.equal(treasuryBefore + 30n)
    expect(await adapter.purchasedTo(requestId)).to.equal(aliceAddress)
    const deliveredItemId = await adapter.deliveredItemId(requestId)
    expect(await adapter.ownerOfItem(deliveredItemId)).to.equal(aliceAddress)
    expect((await gateway.purchases(requestId)).status).to.equal(2n)
    expect(await gateway.escrowedPurchases()).to.equal(0n)
  })

  it('refunds a cancelled purchase, including while paused', async function () {
    const requestId = ethers.id('purchase-refund')
    await (await token.connect(alice).approve(await gateway.getAddress(), 20n)).wait()
    await (await gateway.connect(alice).requestItemPurchase(
      requestId,
      ethers.id('shield'),
      20n,
      ethers.ZeroHash
    )).wait()
    await (await gateway.setPaused(true)).wait()
    await expectRevert(
      gateway.connect(bob).requestItemPurchase(
        ethers.id('paused-purchase'),
        ethers.id('potion'),
        1n,
        ethers.ZeroHash
      )
    )

    const beforeRefund = await token.balanceOf(aliceAddress)
    await (await gateway.connect(alice).cancelItemPurchase(requestId)).wait()
    expect(await token.balanceOf(aliceAddress)).to.equal(beforeRefund + 20n)
    expect((await gateway.purchases(requestId)).status).to.equal(3n)
  })

  it('rejects purchase cancellation by an unrelated player', async function () {
    const requestId = ethers.id('purchase-protected')
    await (await token.connect(alice).approve(await gateway.getAddress(), 12n)).wait()
    await (await gateway.connect(alice).requestItemPurchase(
      requestId,
      ethers.id('item-protected'),
      12n,
      ethers.ZeroHash
    )).wait()
    await expectRevert(gateway.connect(bob).cancelItemPurchase(requestId))
  })

  it('settles a designated peer trade as CAW for a game item', async function () {
    const tradeId = ethers.id('trade-one')
    const itemId = ethers.id('unique-item-one')
    await (await adapter.mintItem(aliceAddress, itemId)).wait()
    const latestBlock = await provider.getBlock('latest')
    await (await gateway.connect(alice).createTradeOffer(
      tradeId,
      itemId,
      bobAddress,
      80n,
      BigInt(latestBlock.timestamp + 3600),
      ethers.id('trade-details')
    )).wait()
    await (await token.connect(bob).approve(await gateway.getAddress(), 80n)).wait()

    const sellerBefore = await token.balanceOf(aliceAddress)
    const buyerBefore = await token.balanceOf(bobAddress)
    const receipt = await (await gateway.connect(bob).acceptTrade(tradeId)).wait()
    const eventNames = receipt.logs.flatMap((log) => {
      try {
        return [gateway.interface.parseLog(log).name]
      } catch (_) {
        return []
      }
    })

    expect(await token.balanceOf(aliceAddress)).to.equal(sellerBefore + 80n)
    expect(await token.balanceOf(bobAddress)).to.equal(buyerBefore - 80n)
    expect(await adapter.ownerOfItem(itemId)).to.equal(bobAddress)
    expect((await gateway.trades(tradeId)).status).to.equal(2n)
    expect(eventNames).to.include('TradeOfferAccepted')
  })

  it('blocks a non-designated buyer', async function () {
    await (await gateway.connect(outsider).registerPlayer(ethers.id('outsider-player'))).wait()
    const tradeId = ethers.id('trade-designated')
    const itemId = ethers.id('unique-item-two')
    await (await adapter.mintItem(aliceAddress, itemId)).wait()
    const latestBlock = await provider.getBlock('latest')
    await (await gateway.connect(alice).createTradeOffer(
      tradeId,
      itemId,
      bobAddress,
      10n,
      BigInt(latestBlock.timestamp + 3600),
      ethers.ZeroHash
    )).wait()
    await expectRevert(gateway.connect(outsider).acceptTrade(tradeId))
  })

  it('blocks expired trades and permits cancellation without payment', async function () {
    const tradeId = ethers.id('trade-expiry')
    const itemId = ethers.id('unique-item-three')
    await (await adapter.mintItem(aliceAddress, itemId)).wait()
    const latestBlock = await provider.getBlock('latest')
    await (await gateway.connect(alice).createTradeOffer(
      tradeId,
      itemId,
      ethers.ZeroAddress,
      15n,
      BigInt(latestBlock.timestamp + 2),
      ethers.ZeroHash
    )).wait()
    await connection.provider.request({ method: 'evm_increaseTime', params: [3] })
    await connection.provider.request({ method: 'evm_mine', params: [] })
    await expectRevert(gateway.connect(bob).acceptTrade(tradeId))
    await (await gateway.connect(alice).cancelTrade(tradeId)).wait()
    expect((await gateway.trades(tradeId)).status).to.equal(3n)
    expect(await adapter.ownerOfItem(itemId)).to.equal(aliceAddress)
  })

  it('uses two-step ownership and treasury handovers', async function () {
    await (await gateway.proposeOwnership(outsiderAddress)).wait()
    await expectRevert(gateway.connect(bob).acceptOwnership())
    await (await gateway.connect(outsider).acceptOwnership()).wait()
    expect(await gateway.owner()).to.equal(outsiderAddress)
    await expectRevert(gateway.setPaused(true))
    await (await gateway.connect(outsider).setPaused(true)).wait()

    await (await gateway.connect(outsider).proposeTreasury(bobAddress)).wait()
    await expectRevert(gateway.connect(alice).acceptTreasury())
    await (await gateway.connect(bob).acceptTreasury()).wait()
    expect(await gateway.treasury()).to.equal(bobAddress)
  })

  it('withdraws only CAW not reserved for rewards or purchase escrow', async function () {
    await fundRewardPool(100n)
    await (await gateway.connect(operator).recordReward(
      ethers.id('reserved-reward'),
      aliceAddress,
      60n,
      ethers.ZeroHash
    )).wait()
    await (await token.connect(alice).approve(await gateway.getAddress(), 20n)).wait()
    await (await gateway.connect(alice).requestItemPurchase(
      ethers.id('escrowed-purchase'),
      ethers.id('escrowed-item'),
      20n,
      ethers.ZeroHash
    )).wait()

    expect(await gateway.availableRewardPool()).to.equal(40n)
    await expectRevert(gateway.withdrawExcessCaw(ownerAddress, 41n))
    const before = await token.balanceOf(ownerAddress)
    await (await gateway.withdrawExcessCaw(ownerAddress, 40n)).wait()
    expect(await token.balanceOf(ownerAddress)).to.equal(before + 40n)
    expect(await gateway.reservedRewards()).to.equal(60n)
    expect(await gateway.escrowedPurchases()).to.equal(20n)
  })
})
