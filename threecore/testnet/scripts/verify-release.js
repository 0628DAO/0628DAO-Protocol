import { Contract, Interface, getAddress, id, keccak256 } from 'ethers'

export const symbols = ['DAT', 'EMA', 'CAWELON']
const address = value => getAddress(value)

// Read-only gate: a deployment file alone is never evidence of a live release.
export async function verifyRelease(report, artifacts, artifactHash, provider) {
  if (report.chainId !== 84532 || (await provider.getNetwork()).chainId !== 84532n) throw new Error('Base Sepolia (84532) required')
  if (report.status !== 'TESTNET_TRAINING_EXERCISED' || report.pendingAction) throw new Error('Completed training exercise with no pending action required')
  if (report.artifactHash !== artifactHash) throw new Error('Deployment build fingerprint mismatch')
  const owner = address(report.owner), factoryAddress = address(report.factory)
  const code = await provider.getCode(factoryAddress)
  if (code === '0x' || keccak256(code) !== keccak256(artifacts.TrainingFactory.deployedBytecode)) throw new Error('Factory bytecode mismatch')
  const factory = new Contract(factoryAddress, artifacts.TrainingFactory.abi, provider)
  const verified = {}
  const seenAddresses = new Set([factoryAddress])
  for (const symbol of symbols) {
    const recorded = report.agents?.[symbol]
    const agentAddress = address(recorded?.agent)
    if (address(await factory.agents(owner, id(symbol))) !== agentAddress) throw new Error(`${symbol}: factory mapping mismatch`)
    const agent = new Contract(agentAddress, artifacts.TrainingAgent.abi, provider)
    if (address(await agent.owner()) !== owner || await agent.agentId() !== id(symbol)) throw new Error(`${symbol}: owner or identity mismatch`)
    const game = address(await agent.game()), credit = address(await agent.credit())
    if (game !== address(recorded.game) || credit !== address(recorded.credit)) throw new Error(`${symbol}: contract binding mismatch`)
    for (const target of [agentAddress, game, credit]) {
      if (seenAddresses.has(target) || await provider.getCode(target) === '0x') throw new Error(`${symbol}: missing or shared contract`)
      seenAddresses.add(target)
    }
    verified[symbol] = { agent: agentAddress, game, credit }
  }
  const receipts = []
  const seenHashes = new Set()
  for (const symbol of symbols) {
    for (const [action, method] of [['training-play', 'execute'], ['training-credit-burn', 'burnProfit']]) {
      const entry = report.transactions?.find(row => row.action === action && row.token === symbol)
      if (!entry || !/^0x[0-9a-f]{64}$/i.test(entry.hash) || seenHashes.has(entry.hash)) throw new Error(`${symbol}: missing or duplicate ${action} receipt`)
      seenHashes.add(entry.hash)
      const receipt = await provider.getTransactionReceipt(entry.hash)
      if (!receipt || receipt.status !== 1) throw new Error(`${symbol}: unsuccessful transaction`)
      // Smart-wallet relayers may be the outer sender. Authenticate the outcome
      // at the factory-verified agent, whose functions enforce owner/operator.
      const eventName = method === 'execute' ? 'Executed' : 'ProfitBurned'
      const iface = new Interface(artifacts.TrainingAgent.abi)
      const events = receipt.logs.filter(log => address(log.address) === verified[symbol].agent).map(log => {
        try { return iface.parseLog(log) } catch { return null }
      })
      const matching = events.filter(log => log?.name === eventName)
      const event = matching.length === 1 ? matching[0] : null
      if (!event || (method === 'execute' ? event.args.pnl <= 0n : event.args.amount <= 0n)) throw new Error(`${symbol}: successful training outcome missing`)
      const agent = new Contract(verified[symbol].agent, artifacts.TrainingAgent.abi, provider)
      if (!await agent.usedCommands(event.args.commandId)) throw new Error(`${symbol}: command was not executed`)
      const target = method === 'execute' ? verified[symbol].game : verified[symbol].credit
      const outcomeInterface = new Interface(method === 'execute' ? artifacts.TrainingGame.abi : artifacts.TrainingCredit.abi)
      const outcomes = receipt.logs.filter(log => address(log.address) === target).map(log => {
        try { return outcomeInterface.parseLog(log) } catch { return null }
      })
      const confirmed = method === 'execute'
        ? outcomes.some(log => log?.name === 'Played' && address(log.args.player) === verified[symbol].agent && log.args.round === event.args.round && log.args.stake === event.args.stake && log.args.payout === event.args.payout && log.args.correct && event.args.pnl === event.args.payout - event.args.stake)
        : outcomes.some(log => log?.name === 'Transfer' && address(log.args.from) === verified[symbol].agent && log.args.to === '0x0000000000000000000000000000000000000000' && log.args.amount === event.args.amount)
      if (!confirmed) throw new Error(`${symbol}: game or credit outcome mismatch`)
      const block = await provider.getBlock(receipt.blockNumber)
      if (!block || block.hash !== receipt.blockHash) throw new Error(`${symbol}: receipt is not canonical`)
      receipts.push({ symbol, action, hash: receipt.hash, blockNumber: receipt.blockNumber })
    }
  }
  return { status: 'VERIFIED_TESTNET_TRAINING', chainId: 84532, owner, factory: factoryAddress, agents: verified, receipts }
}
