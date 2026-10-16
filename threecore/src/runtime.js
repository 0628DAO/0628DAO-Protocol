import { createHash } from 'node:crypto'

export const TOKENS = Object.freeze(['DAT', 'EMA', 'CAWELON'])
const MAX = (1n << 256n) - 1n
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex')
const copy = value => JSON.parse(JSON.stringify(value))
function requireThat(condition, message) { if (!condition) throw new Error(message) }
function amount(value) {
  requireThat(typeof value === 'string' && /^(0|[1-9][0-9]*)$/.test(value), 'Amount must be an unsigned integer string')
  const result = BigInt(value)
  requireThat(result <= MAX, 'Amount exceeds uint256')
  return result
}
function id(value) { requireThat(typeof value === 'string' && /^[a-zA-Z0-9:_-]{1,100}$/.test(value), 'Invalid identifier'); return value }
function positive(value) { const n = amount(value); requireThat(n > 0n, 'Amount must be positive'); return n }

function ownTokenOnly(agent, target) {
  // Current stage prioritizes ThreeCore. No CAW platform flag, model output or
  // roadmap announcement can activate financial support through this runtime.
  requireThat(target !== 'CAW', 'CAW purchases and burns are inactive in the current ThreeCore stage')
  requireThat(target === agent, 'Only own-token buybacks and burns are permitted')
}

// Offline only. No RPC, signer, model, transaction broadcast or live adapter.
// All monetary values are integer strings in ONE configured accounting asset.
export class SimulationRuntime {
  #config; #accounts; #events = []; #used = new Set(); #receipts = new Set()
  constructor(config) {
    requireThat(config?.mode === 'simulation' && config.chainId === 31337, 'Only local simulation is supported')
    requireThat(config.accountingAsset === 'SIM_USDC' && config.decimals === 6, 'Unsupported accounting asset')
    requireThat(config.agents && Object.keys(config.agents).sort().join() === [...TOKENS].sort().join(), 'Exactly three agents are required')
    this.#config = copy(config)
    this.#accounts = {}
    for (const token of TOKENS) {
      const p = config.agents[token]
      positive(p.maxPosition); positive(p.maxExposure); amount(p.reserve)
      requireThat(amount(p.maxPosition) <= amount(p.maxExposure), 'Position limit exceeds exposure limit')
      requireThat(Number.isInteger(p.buybackBps) && p.buybackBps >= 0 && p.buybackBps <= 10000, 'Invalid buyback ratio')
      requireThat(Array.isArray(p.adapters) && p.adapters.length > 0 && p.adapters.every(x => id(x)), 'Adapter allowlist required')
      this.#accounts[token] = { cash: '0', pnl: '0', allocated: '0', burned: '0', paused: false, positions: {}, buybacks: {} }
    }
  }
  snapshot() { return copy(this.#accounts) }
  journal() { return copy(this.#events) }
  config() { return copy(this.#config) }
  #apply(command) {
    const c = copy(command)
    id(c.id)
    requireThat(!this.#used.has(c.id), 'Duplicate command')
    requireThat(TOKENS.includes(c.token), 'Unknown token')
    const a = copy(this.#accounts[c.token]), p = this.#config.agents[c.token]
    const cash = BigInt(a.cash)
    let receiptKey
    if (c.type === 'fund') {
      a.cash = (cash + positive(c.amount)).toString()
    } else if (c.type === 'pause') {
      requireThat(typeof c.paused === 'boolean', 'Invalid pause value')
      a.paused = c.paused
    } else if (c.type === 'open') {
      requireThat(!a.paused, 'Agent paused')
      requireThat(p.adapters.includes(c.adapter), 'Adapter not permitted')
      id(c.positionId)
      requireThat(!a.positions[c.positionId], 'Position already exists')
      const stake = positive(c.amount), fee = amount(c.fee)
      const exposure = Object.values(a.positions).filter(x => x.status === 'open').reduce((n, x) => n + BigInt(x.principal), 0n)
      requireThat(stake <= amount(p.maxPosition) && exposure + stake <= amount(p.maxExposure), 'Exposure limit exceeded')
      requireThat(cash - stake - fee >= amount(p.reserve), 'Insufficient funds or reserve breach')
      a.cash = (cash - stake - fee).toString()
      a.positions[c.positionId] = { status: 'open', principal: c.amount, entryFee: c.fee, adapter: c.adapter }
    } else if (c.type === 'settle') {
      const pos = a.positions[c.positionId]
      requireThat(pos?.status === 'open', 'Position is not open')
      requireThat(c.adapter === pos.adapter, 'Settlement adapter mismatch')
      id(c.receiptId)
      receiptKey = `${c.adapter}:${c.receiptId}`
      requireThat(!this.#receipts.has(receiptKey), 'Receipt already consumed')
      const proceeds = amount(c.proceeds), fee = amount(c.fee)
      requireThat(cash + proceeds >= fee, 'Insufficient settlement fee balance')
      a.cash = (cash + proceeds - fee).toString()
      a.pnl = (BigInt(a.pnl) + proceeds - BigInt(pos.principal) - BigInt(pos.entryFee) - fee).toString()
      Object.assign(pos, { status: 'settled', proceeds: c.proceeds, exitFee: c.fee, receiptId: c.receiptId })
    } else if (c.type === 'buyback') {
      requireThat(!a.paused, 'Agent paused')
      ownTokenOnly(c.token, c.targetToken)
      requireThat(!Object.values(a.positions).some(x => x.status === 'open'), 'Settle all positions before allocating profit')
      id(c.buybackId)
      requireThat(!a.buybacks[c.buybackId], 'Buyback already exists')
      const spend = positive(c.amount), fee = amount(c.fee), cost = spend + fee
      const net = BigInt(a.pnl)
      const entitled = (net > 0n ? net : 0n) * BigInt(p.buybackBps) / 10000n
      requireThat(cost <= entitled - BigInt(a.allocated), 'No eligible realized earnings')
      requireThat(cash - cost >= amount(p.reserve), 'Reserve breach')
      const received = positive(c.received), minimum = positive(c.minimumReceived)
      requireThat(received >= minimum, 'Minimum output not met')
      a.cash = (cash - cost).toString()
      a.allocated = (BigInt(a.allocated) + cost).toString()
      a.buybacks[c.buybackId] = { status: 'acquired', cost: cost.toString(), received: received.toString(), targetToken: c.token }
    } else if (c.type === 'burn') {
      requireThat(!a.paused, 'Agent paused')
      const b = a.buybacks[c.buybackId]
      requireThat(b?.status === 'acquired', 'No unburned buyback')
      ownTokenOnly(c.token, c.targetToken)
      a.burned = (BigInt(a.burned) + BigInt(b.received)).toString()
      b.status = 'burned'
    } else { throw new Error('Unknown command') }
    requireThat(BigInt(a.cash) >= 0n && BigInt(a.cash) <= MAX, 'Invalid cash balance')
    this.#accounts[c.token] = a
    this.#used.add(c.id)
    if (receiptKey) this.#receipts.add(receiptKey)
    return c
  }
  execute(command) {
    const c = this.#apply(command)
    const body = { sequence: this.#events.length, configHash: hash(this.#config), previousHash: this.#events.at(-1)?.hash ?? null, command: c }
    this.#events.push({ ...body, hash: hash(body) })
    return this.snapshot()
  }
  static replay(config, journal) {
    requireThat(Array.isArray(journal), 'Journal must be an array')
    const runtime = new SimulationRuntime(config)
    for (const event of journal) {
      const { hash: digest, ...body } = event
      requireThat(digest === hash(body), 'Journal integrity failure')
      requireThat(body.sequence === runtime.#events.length && body.configHash === hash(config) && body.previousHash === (runtime.#events.at(-1)?.hash ?? null), 'Journal chain or configuration mismatch')
      runtime.execute(body.command)
      requireThat(runtime.#events.at(-1).hash === digest, 'Noncanonical event')
    }
    return runtime
  }
}
