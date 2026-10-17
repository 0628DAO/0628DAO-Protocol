import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
import { rpcRequest } from './rpc.js'
import { ContractFactory, Contract, JsonRpcProvider, Wallet, id, parseEther, keccak256 } from 'ethers'
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')
const outputPath = path.join(root, 'threecore/testnet/deployments/base-sepolia.json')
const artifact = name => JSON.parse(fs.readFileSync(path.join(root, `artifacts/threecore/testnet/contracts/${name}.json`)))
const request = rpcRequest(process.env.BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org')
const provider = new JsonRpcProvider(request)
const args = process.argv.slice(2)
if (args.some(x => !['--check', '--exercise'].includes(x))) throw new Error('Supported arguments: --check, --exercise')
const sourceCommit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim()
const fingerprint = (await import('node:crypto')).createHash('sha256')
for (const name of ['TrainingFactory', 'TrainingAgent', 'TrainingGame', 'TrainingCredit']) fingerprint.update(fs.readFileSync(path.join(root, `artifacts/threecore/testnet/contracts/${name}.json`)))
const artifactHash = fingerprint.digest('hex')
const publicReport = { status: 'NOT_DEPLOYED', chainId: 84532, sourceCommit, artifactHash, agents: {}, transactions: [] }
function save(report) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  fs.writeFileSync(`${outputPath}.tmp`, `${JSON.stringify(report, null, 2)}\n`, { mode: 0o600 })
  fs.renameSync(`${outputPath}.tmp`, outputPath)
}
try {
  if ((await provider.getNetwork()).chainId !== 84532n) throw new Error('Wrong chain; Base Sepolia required')
  console.log('Base Sepolia RPC connection verified (84532).')
  if (args.includes('--check')) {
    console.log(JSON.stringify({ status: 'READ_ONLY_CHECK', chainId: 84532, dedicatedSigningKeyAvailable: Boolean(process.env.THREECORE_TESTNET_PRIVATE_KEY), deploymentFilePresent: fs.existsSync(outputPath), artifactHash }))
  } else {
    const changes = execFileSync('git', ['status', '--porcelain'], { cwd: root, encoding: 'utf8' }).split('\n').filter(line => line && !line.slice(3).startsWith('threecore/testnet/deployments/'))
    if (changes.length) throw new Error('Uncommitted source changes: deploy from a clean, reviewed checkout')
    if (!process.env.THREECORE_TESTNET_PRIVATE_KEY) throw new Error('Dedicated testnet signer is not configured. Use the browser wallet deployment screen or configure THREECORE_TESTNET_PRIVATE_KEY outside the repository.')
    const signer = new Wallet(process.env.THREECORE_TESTNET_PRIVATE_KEY, provider)
    const owner = await signer.getAddress()
    if (await provider.getBalance(owner) === 0n) throw new Error(`Dedicated test wallet ${owner} has no Base Sepolia ETH`)
    const report = fs.existsSync(outputPath) ? JSON.parse(fs.readFileSync(outputPath)) : { ...publicReport, owner }
    if (report.chainId !== 84532 || report.owner !== owner || report.artifactHash !== artifactHash) throw new Error('Existing deployment record belongs to another owner, chain or build. Review the record before continuing.')
    if (report.pendingAction) {
      const pending = await provider.getTransactionReceipt(report.pendingAction.hash)
      if (!pending || pending.status !== 1) throw new Error('Recorded factory or action is pending/failed; reconcile before retrying')
      report.transactions.push({ action: report.pendingAction.type, token: report.pendingAction.token, hash: pending.hash, blockNumber: pending.blockNumber, gasCostWei: pending.fee.toString() })
      report.pendingAction = null; save(report)
    }
    const wait = async (tx, action, token = null) => {
      const receipt = await tx.wait()
      if (!receipt || receipt.status !== 1) throw new Error('Transaction did not succeed')
      report.transactions.push({ action, token, hash: receipt.hash, blockNumber: receipt.blockNumber, gasCostWei: receipt.fee.toString() })
      save(report); return receipt
    }
    let factory
    if (!report.factory) {
      const a = artifact('TrainingFactory')
      factory = await new ContractFactory(a.abi, a.bytecode, signer).deploy()
      // Persist address and pending hash immediately; do not submit a second deploy on retry.
      report.factory = await factory.getAddress(); report.status = 'FACTORY_PENDING'
      report.factoryTransaction = factory.deploymentTransaction().hash; save(report)
      await wait(factory.deploymentTransaction(), 'factory-deploy')
    } else {
      const code = await provider.getCode(report.factory)
      if (code === '0x' || keccak256(code) !== keccak256(artifact('TrainingFactory').deployedBytecode)) throw new Error('Recorded factory is pending, missing or differs from this build; reconcile before retrying')
      factory = new Contract(report.factory, artifact('TrainingFactory').abi, signer)
    }
    for (const symbol of ['DAT', 'EMA', 'CAWELON']) {
      let address = await factory.agents(owner, id(symbol))
      if (address === '0x0000000000000000000000000000000000000000') {
        const tx = await factory.deployAgent(symbol)
        report.pendingAction = { type: 'deploy-agent', token: symbol, hash: tx.hash }; save(report)
        await wait(tx, 'agent-deploy', symbol)
        address = await factory.agents(owner, id(symbol))
      }
      const agent = new Contract(address, artifact('TrainingAgent').abi, signer)
      report.agents[symbol] = { agent: address, game: await agent.game(), credit: await agent.credit() }
      report.pendingAction = null; save(report)
      if (args.includes('--exercise')) {
        const game = new Contract(await agent.game(), artifact('TrainingGame').abi, signer)
        // Fixed command IDs make repeated exercise calls reject duplicates rather than double-play.
        const playId = id(`threecore-training-v1:${symbol}:play`), burnId = id(`threecore-training-v1:${symbol}:burn`)
        if (!await agent.usedCommands(playId)) {
          const [round, a, b] = await game.challenge(address)
          const tx = await agent.execute(playId, round, a + b, parseEther('1'))
          report.pendingAction = { type: 'play', token: symbol, hash: tx.hash }; save(report)
          await wait(tx, 'training-play', symbol)
        }
        if (!await agent.usedCommands(burnId)) {
          const tx = await agent.burnProfit(burnId, parseEther('0.5'))
          report.pendingAction = { type: 'burn', token: symbol, hash: tx.hash }; save(report)
          await wait(tx, 'training-credit-burn', symbol)
        }
        report.agents[symbol].trainingCreditPnl = (await agent.realizedPnl()).toString()
        report.pendingAction = null; save(report)
      }
    }
    report.status = args.includes('--exercise') ? 'TESTNET_TRAINING_EXERCISED' : 'TESTNET_TRAINING_DEPLOYED'
    save(report)
    console.log(JSON.stringify(report, null, 2))
  }
} catch (error) {
  // Provider exceptions can contain credential-bearing URLs. Print only local diagnostics.
  const safe = /^Dedicated test|^Wrong chain|^Existing deployment|^Recorded factory|^Uncommitted source/.test(error.message)
  console.error(safe ? error.message : 'Deployment/check failed. Reconcile recorded pending transactions before retrying; no automatic resubmission is performed.')
  process.exitCode = 1
} finally { provider.destroy() }
