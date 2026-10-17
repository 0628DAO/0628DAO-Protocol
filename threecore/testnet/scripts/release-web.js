import fs from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
import { JsonRpcProvider } from 'ethers'
import { rpcRequest } from './rpc.js'
import { symbols, verifyRelease } from './verify-release.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')
const reportPath = path.join(root, 'threecore/testnet/deployments/base-sepolia.json')
const target = path.join(root, 'threecore/testnet/release')
if (process.argv.length !== 2) throw new Error('No arguments supported; uses the recorded Base Sepolia deployment')
if (!fs.existsSync(reportPath)) throw new Error('No deployment record. Deploy and exercise the testnet contracts before preparing a public release.')
if (fs.existsSync(target)) throw new Error('Release directory already exists. Preserve/review the previous release before building again.')
const changes = execFileSync('git', ['status', '--porcelain'], { cwd: root, encoding: 'utf8' }).split('\n').filter(line => line && !line.slice(3).startsWith('threecore/testnet/deployments/'))
if (changes.length) throw new Error('Release requires a clean committed source checkout')
const fingerprint = createHash('sha256'), artifacts = {}
for (const name of ['TrainingFactory', 'TrainingAgent', 'TrainingGame', 'TrainingCredit']) {
  const bytes = fs.readFileSync(path.join(root, `artifacts/threecore/testnet/contracts/${name}.json`))
  fingerprint.update(bytes); artifacts[name] = JSON.parse(bytes)
}
const provider = new JsonRpcProvider(rpcRequest(process.env.BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org'))
let staging
try {
  const verified = await verifyRelease(JSON.parse(fs.readFileSync(reportPath)), artifacts, fingerprint.digest('hex'), provider)
  // Build fresh files only after chain verification. Never alter preview bundles.
  execFileSync(process.execPath, [path.join(root, 'threecore/testnet/scripts/build-web.js')], { cwd: root, stdio: 'inherit' })
  staging = fs.mkdtempSync(path.join(root, 'threecore/testnet/.release-staging-'))
  const sourceCommit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim()
  for (const symbol of symbols) {
    const dir = path.join(staging, symbol.toLowerCase())
    fs.cpSync(path.join(root, 'threecore/testnet/dist', symbol.toLowerCase()), dir, { recursive: true })
    const configPath = path.join(dir, 'config.json')
    const config = JSON.parse(fs.readFileSync(configPath))
    fs.writeFileSync(configPath, JSON.stringify({ ...config, status: verified.status, factory: verified.factory, sourceCommit }))
  }
  fs.writeFileSync(path.join(staging, 'verification.json'), JSON.stringify({ ...verified, sourceCommit, verifiedAt: new Date().toISOString() }, null, 2))
  fs.renameSync(staging, target); staging = undefined
  console.log('Verified release prepared in threecore/testnet/release. Hosting publication is a separate step.')
} catch {
  console.error('Release verification failed. No verified release is available; inspect the deployment record and chain before retrying.')
  process.exitCode = 1
} finally {
  provider.destroy()
  if (staging) fs.rmSync(staging, { recursive: true, force: true })
}
