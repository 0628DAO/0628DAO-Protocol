import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const metadataPath = path.join(root, 'docs', 'PROJECT_METADATA.json')
const registryPath = path.join(root, 'docs', 'DOCUMENT_SOURCES.md')
const metadataText = fs.readFileSync(metadataPath, 'utf8')
const metadata = JSON.parse(metadataText)
const registryText = fs.readFileSync(registryPath, 'utf8')

const expectedLineage = 'CAW → 0628DAO GilgameshCaw → 0628DAO → CAWELON・EMA・DAT'
const isoDateTime = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/
const commitSha = /^[0-9a-f]{40}$/

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

assert(metadata.schemaVersion === '1.0.0', 'Unsupported metadata schema version')
assert(isoDateTime.test(metadata.verifiedAt), 'verifiedAt must be an ISO UTC timestamp')
assert(metadata.status?.stage === 'development', 'Repository stage must remain development')
assert(metadata.status?.audited === false, 'Repository must not claim an audit')
assert(metadata.status?.testnetDeployed === false, 'Repository must not claim Testnet deployment')
assert(metadata.status?.mainnetDeployed === false, 'Repository must not claim Mainnet deployment')
assert(
  metadata.lineage?.confirmedBusinessAndDevelopmentLineage === expectedLineage,
  'Confirmed business and development lineage changed'
)
assert(
  commitSha.test(metadata.lineage?.formalCawFork?.recordedCommit || ''),
  'Formal CAW fork commit must be a full SHA'
)

const formalProducts = metadata.repositories?.formalProductRepositories || []
assert(formalProducts.length === 3, 'Exactly three formal product repositories are required')
assert(
  formalProducts.map(({ product }) => product).sort().join(',') === 'CAWELON,DAT,EMA',
  'Formal product set must be CAWELON, EMA and DAT'
)
assert(
  formalProducts.every(({ state }) => state === 'not-created'),
  'Formal repository state changed; update and re-verify the registry'
)

const drafts = metadata.repositories?.preservedDrafts || []
assert(drafts.length === 3, 'Exactly three preserved Draft records are required')
for (const draft of drafts) {
  assert(draft.state === 'preserved-unchanged', `${draft.product} Draft is not marked preserved`)
  assert(commitSha.test(draft.recordedHead || ''), `${draft.product} Draft needs a full recorded HEAD`)
}

const documentRegistry = metadata.documentRegistry || {}
assert(
  documentRegistry.humanReadableFile === 'docs/DOCUMENT_SOURCES.md',
  'Unexpected document registry path'
)
assert(documentRegistry.sourceSystem === 'Google Drive', 'Unexpected document source system')
assert(
  documentRegistry.accessBearingReferencesPublished === false,
  'Access-bearing source references must remain private'
)
assert(
  documentRegistry.privateSourceDerivedSummariesPublished === false,
  'Private-source-derived summaries must not be exported in public JSON'
)
assert(!/docs\.google\.com/i.test(metadataText), 'Google Drive URLs must not appear in public JSON')
assert(!/\/document\/d\//i.test(metadataText), 'Google Drive document locators must not appear in public JSON')
assert(!/docs\.google\.com/i.test(registryText), 'Google Drive URLs must not appear in the public registry')
assert(!/\/document\/d\//i.test(registryText), 'Google Drive document locators must not appear in the public registry')

for (const requiredText of [
  'THE 0628DAO MANIFESTO Version 4.0（日本語）',
  'THE 0628DAO MANIFESTO Version 4.0 (English)',
  'CAWELON(NEO) White Paper',
  'EMA(NEO)White Paper(日本語)',
  '0628DAT white paper(日本語)',
]) {
  assert(registryText.includes(requiredText), `Missing public source record: ${requiredText}`)
}

console.log('Document source publication boundary and project metadata passed.')
