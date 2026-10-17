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
      const tx = await provider.getTransaction(entry.hash)
      const receipt = await provider.getTransactionReceipt(entry.hash)
      if (!tx || !receipt || receipt.status !== 1 || address(tx.from) !== owner || address(tx.to) !== verified[symbol].agent) throw new Error(`${symbol}: unsuccessful or unrelated transaction`)
      const parsed = new Interface(artifacts.TrainingAgent.abi).parseTransaction({ data: tx.data, value: tx.value })
      if (parsed?.name !== method) throw new Error(`${symbol}: transaction action mismatch`)
      const eventName = method === 'execute' ? 'Executed' : 'ProfitBurned'
      const iface = new Interface(artifacts.TrainingAgent.abi)
      const events = receipt.logs.filter(log => address(log.address) === verified[symbol].agent).map(log => {
        try { return iface.parseLog(log) } catch { return null }
      })
      const event = events.find(log => log?.name === eventName && log.args.commandId === parsed.args[0])
      if (!event || (method === 'execute' ? event.args.pnl <= 0n : event.args.amount <= 0n)) throw new Error(`${symbol}: successful training outcome missing`)
      const block = await provider.getBlock(receipt.blockNumber)
      if (!block || block.hash !== receipt.blockHash) throw new Error(`${symbol}: receipt is not canonical`)
      receipts.push({ symbol, action, hash: receipt.hash, blockNumber: receipt.blockNumber })
    }
  }
  return { status: 'VERIFIED_TESTNET_TRAINING', chainId: 84532, owner, factory: factoryAddress, agents: verified, receipts }
}
