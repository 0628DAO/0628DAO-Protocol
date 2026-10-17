import fs from 'node:fs'
import { FetchRequest, JsonRpcProvider, Interface, keccak256 } from 'ethers'

// Read-only: no signer, wallet, private key, approvals or transaction submission.
const registry = JSON.parse(fs.readFileSync(new URL('../config/base-mainnet.json', import.meta.url)))
const request = new FetchRequest(process.env.BASE_READ_RPC_URL || 'https://mainnet.base.org')
request.timeout = 15000
const provider = new JsonRpcProvider(request)
const abi = new Interface(['function symbol() view returns (string)', 'function decimals() view returns (uint8)', 'function totalSupply() view returns (uint256)'])
try {
  const network = await provider.getNetwork()
  if (network.chainId !== BigInt(registry.chainId)) throw new Error('Wrong chain')
  const block = await provider.getBlock('latest')
  if (!block?.hash) throw new Error('Missing block')
  const results = []
  for (const token of registry.tokens) {
    const code = await provider.getCode(token.address, block.number)
    if (code === '0x') throw new Error(`Missing contract: ${token.symbol}`)
    const read = async name => abi.decodeFunctionResult(name, await provider.call({ to: token.address, data: abi.encodeFunctionData(name), blockTag: block.number }))[0]
    const [symbol, decimals, supply] = await Promise.all([read('symbol'), read('decimals'), read('totalSupply')])
    if (symbol !== token.symbol || Number(decimals) !== token.decimals || supply > BigInt(token.initialSupply)) throw new Error(`Token metadata mismatch: ${token.symbol}`)
    results.push({ symbol, address: token.address, decimals: Number(decimals), totalSupply: supply.toString(), runtimeCodeHash: keccak256(code) })
  }
  const checkBlock = await provider.getBlock(block.number)
  if (checkBlock?.hash !== block.hash) throw new Error('Block changed during checks; retry')
  console.log(JSON.stringify({ status: 'READ_ONLY_TOKEN_CHECK_PASSED', agentRuntimeReady: false, chainId: registry.chainId, blockNumber: block.number, blockHash: block.hash, tokens: results }, null, 2))
} catch {
  // Do not print the provider exception: RPC URLs can contain credentials.
  console.error('Preflight failed: RPC unavailable, wrong chain, changed block or token metadata mismatch. No transactions were submitted.')
  process.exitCode = 1
} finally { provider.destroy() }
