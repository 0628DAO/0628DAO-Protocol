import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const metadataPath = path.join(root, 'docs', 'PROJECT_METADATA.json')
const metadataText = fs.readFileSync(metadataPath, 'utf8')
const metadata = JSON.parse(metadataText)

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

const boundary = metadata.publicationBoundary || {}
assert(boundary.publicRepositoryFactsOnly === true, 'Only public repository facts may be published')
assert(boundary.privateDocumentContentPublished === false, 'Private document content must remain private')
assert(boundary.accessBearingReferencesPublished === false, 'Access-bearing references must remain private')
assert(!/docs\.google\.com/i.test(metadataText), 'Private document URLs must not appear in public metadata')
assert(!/\/document\/d\//i.test(metadataText), 'Private document locators must not appear in public metadata')

console.log('Public project metadata passed.')
