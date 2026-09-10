import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import solc from 'solc'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const sourceRoots = [
  path.join(root, 'game', 'contracts'),
  path.join(root, 'game', 'interfaces'),
  path.join(root, 'game', 'test', 'mocks'),
]

function collectSolidityFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name)
    if (entry.isDirectory()) return collectSolidityFiles(fullPath)
    return entry.name.endsWith('.sol') ? [fullPath] : []
  })
}

const sources = {}
for (const file of sourceRoots.flatMap(collectSolidityFiles)) {
  const sourceName = path.relative(root, file).split(path.sep).join('/')
  sources[sourceName] = { content: fs.readFileSync(file, 'utf8') }
}

const input = {
  language: 'Solidity',
  sources,
  settings: {
    optimizer: { enabled: true, runs: 200 },
    outputSelection: {
      '*': { '*': ['abi', 'evm.bytecode.object', 'evm.deployedBytecode.object'] },
    },
  },
}

const output = JSON.parse(solc.compile(JSON.stringify(input)))
const diagnostics = output.errors || []
for (const diagnostic of diagnostics) {
  const stream = diagnostic.severity === 'error' ? process.stderr : process.stdout
  stream.write(`${diagnostic.formattedMessage}\n`)
}
if (diagnostics.some((diagnostic) => diagnostic.severity === 'error')) {
  process.exit(1)
}

const artifactsRoot = path.join(root, 'artifacts')
fs.rmSync(artifactsRoot, { recursive: true, force: true })
let largestContract = { name: '', bytes: 0 }
for (const [sourceName, contracts] of Object.entries(output.contracts || {})) {
  for (const [contractName, contract] of Object.entries(contracts)) {
    const deployedBytes = contract.evm.deployedBytecode.object.length / 2
    if (deployedBytes > largestContract.bytes) {
      largestContract = { name: contractName, bytes: deployedBytes }
    }
    if (deployedBytes > 24_576) {
      throw new Error(`${contractName} exceeds the EIP-170 deployed bytecode limit`)
    }
    const targetDirectory = path.join(artifactsRoot, path.dirname(sourceName))
    fs.mkdirSync(targetDirectory, { recursive: true })
    fs.writeFileSync(
      path.join(targetDirectory, `${contractName}.json`),
      JSON.stringify({
        contractName,
        sourceName,
        abi: contract.abi,
        bytecode: `0x${contract.evm.bytecode.object}`,
        deployedBytecode: `0x${contract.evm.deployedBytecode.object}`,
      }, null, 2)
    )
  }
}

console.log(`Compiled ${Object.keys(sources).length} Solidity source files with solc ${solc.version()}.`)
console.log(`Largest deployed bytecode: ${largestContract.name} (${largestContract.bytes} bytes).`)
