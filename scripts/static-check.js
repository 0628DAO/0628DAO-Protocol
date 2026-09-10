import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const requiredFiles = [
  'README.md',
  'ARCHITECTURE.md',
  'CHANGELOG.md',
  'CONTRIBUTING.md',
  'LINEAGE.md',
  'SECURITY.md',
  'THIRD_PARTY_NOTICES.md',
  'UPSTREAM.md',
  'docs/PROJECT_METADATA.json',
  'docs/PROJECT_METADATA.schema.json',
  'scripts/validate-metadata.js',
  '.github/workflows/game-ci.yml',
  '.solhint.json',
  'game/README.md',
  'game/THREAT_MODEL.md',
  'game/contracts/CawGameGateway.sol',
  'game/interfaces/ICawToken.sol',
  'game/interfaces/IGameAssetAdapter.sol',
  'game/test/CawGameGateway.test.js',
  'game/examples/local-flow.js',
]

for (const file of requiredFiles) {
  const fullPath = path.join(root, file)
  if (!fs.existsSync(fullPath) || fs.statSync(fullPath).size === 0) {
    throw new Error(`Missing or empty required file: ${file}`)
  }
}

const rootReadme = fs.readFileSync(path.join(root, 'README.md'), 'utf8')
const gameReadme = fs.readFileSync(path.join(root, 'game/README.md'), 'utf8')
const lineage = fs.readFileSync(path.join(root, 'LINEAGE.md'), 'utf8')
const gateway = fs.readFileSync(path.join(root, 'game/contracts/CawGameGateway.sol'), 'utf8')
const workflow = fs.readFileSync(path.join(root, '.github/workflows/game-ci.yml'), 'utf8')

for (const text of [rootReadme, gameReadme]) {
  if (!text.includes('Development / Unaudited / Not deployed to mainnet')) {
    throw new Error('Required development safety label is missing')
  }
}

if (!lineage.includes('e2074718bcea293726ddfcf8764e1499e7b9217c')) {
  throw new Error('Recorded CAW upstream SHA is missing')
}
if (!lineage.includes('CAW → 0628DAO GilgameshCaw → 0628DAO → CAWELON・EMA・DAT')) {
  throw new Error('Confirmed lineage statement is missing')
}
if (/0x[a-fA-F0-9]{40}/.test(gateway)) {
  throw new Error('Production-like address must not be hard-coded in the gateway')
}
if (/private\s*key|mnemonic|seed\s*phrase/i.test(gateway)) {
  throw new Error('Credential-like wording found in the gateway')
}
if (!workflow.includes('permissions:\n  contents: read')) {
  throw new Error('CI workflow must retain read-only repository permissions')
}
if (/deploy|mainnet|testnet|sepolia|private.?key|mnemonic/i.test(workflow)) {
  throw new Error('CI workflow must not contain a deployment or signing path')
}

console.log(`Static project checks passed (${requiredFiles.length} required files).`)
