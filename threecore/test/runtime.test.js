import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { SimulationRuntime, TOKENS } from '../src/runtime.js'

const config = () => JSON.parse(fs.readFileSync(new URL('../config/simulation.json', import.meta.url)))
function fixture(token = 'DAT') {
  const r = new SimulationRuntime(config())
  let n = 0
  const run = (type, fields = {}) => r.execute({ id: `command-${++n}`, token, type, ...fields })
  run('fund', { amount: '100000000' })
  const open = (fields = {}) => run('open', { positionId: 'p', adapter: 'mock-market', amount: '10000000', fee: '100000', ...fields })
  const settle = (fields = {}) => run('settle', { positionId: 'p', adapter: 'mock-market', receiptId: 'r', proceeds: '13000000', fee: '100000', ...fields })
  const buy = (fields = {}) => run('buyback', { buybackId: 'b', targetToken: token, amount: '1300000', fee: '100000', received: '5000000000000000000', minimumReceived: '4900000000000000000', ...fields })
  return { r, run, open, settle, buy }
}
for (const token of TOKENS) test(`${token}: complete lifecycle, independent accounts, exact fees and replay`, () => {
  const { r, open, settle, buy, run } = fixture(token)
  open(); settle(); buy(); run('burn', { buybackId: 'b', targetToken: token })
  const a = r.snapshot()[token]
  assert.equal(a.cash, '101400000')
  assert.equal(a.pnl, '2800000')
  assert.equal(a.allocated, '1400000')
  assert.equal(a.burned, '5000000000000000000')
  for (const other of TOKENS.filter(t => t !== token)) assert.equal(r.snapshot()[other].cash, '0')
  assert.deepEqual(SimulationRuntime.replay(config(), r.journal()).snapshot(), r.snapshot())
})
test('mainnet, testnet and malformed policies fail closed', () => {
  for (const chainId of [8453, 84532, '31337']) assert.throws(() => new SimulationRuntime({ ...config(), chainId }))
  assert.throws(() => new SimulationRuntime({ ...config(), mode: 'live' }))
  const c = config(); c.agents.DAT.buybackBps = 10001
  assert.throws(() => new SimulationRuntime(c))
})
test('malformed amounts and overflow cannot alter balances', () => {
  const { r, run } = fixture(); const before = r.snapshot()
  for (const value of ['-1', '1.5', '01', '1e6', 'NaN', 100, '0', (1n << 256n).toString()]) {
    assert.throws(() => run('fund', { amount: value }))
    assert.deepEqual(r.snapshot(), before)
  }
})
test('unknown token and adapter are rejected', () => {
  const { run, open } = fixture()
  assert.throws(() => run('fund', { token: 'OTHER', amount: '1' }), /Unknown token/)
  assert.throws(() => open({ adapter: 'untrusted' }), /not permitted/)
})
test('limits include simultaneous positions and reserve plus fees', () => {
  const { open } = fixture()
  assert.throws(() => open({ amount: '10000001' }), /Exposure/)
  assert.throws(() => open({ fee: '90000000' }), /reserve/)
  open(); open({ positionId: 'p2' })
  assert.throws(() => open({ positionId: 'p3', amount: '1' }), /Exposure/)
})
test('pause blocks new exposure and buyback but allows risk-reducing settlement', () => {
  const { run, open, settle, buy } = fixture()
  open(); run('pause', { paused: true }); settle()
  assert.throws(() => open({ positionId: 'p2' }), /paused/)
  assert.throws(() => buy(), /paused/)
  run('pause', { paused: false }); buy()
})
test('duplicate commands and settlements remain rejected after restart', () => {
  const { r, open, settle } = fixture(); open(); settle()
  const restarted = SimulationRuntime.replay(config(), r.journal())
  assert.throws(() => restarted.execute(r.journal()[0].command), /Duplicate/)
  assert.throws(() => settle(), /not open/)
})
test('adapter mismatch and repeated receipts across agents cannot create profit', () => {
  const { r, open, settle, run } = fixture(); open()
  assert.throws(() => settle({ adapter: 'other' }), /mismatch/)
  settle()
  run('fund', { token: 'EMA', amount: '100000000' })
  run('open', { token: 'EMA', positionId: 'p', adapter: 'mock-market', amount: '10000000', fee: '0' })
  assert.throws(() => run('settle', { token: 'EMA', positionId: 'p', adapter: 'mock-market', receiptId: 'r', proceeds: '12000000', fee: '0' }), /consumed/)
  assert.equal(r.snapshot().EMA.pnl, '0')
})
test('unsettled positions, deposited capital and gross returns are not distributable profit', () => {
  const { open, settle, buy } = fixture()
  assert.throws(() => buy(), /earnings/)
  open(); assert.throws(() => buy(), /Settle all/)
  settle({ proceeds: '10100000' }); assert.throws(() => buy({ amount: '1', fee: '0' }), /earnings/)
})
test('loss carryforward must be recovered before any allocation', () => {
  const { r, open, settle, buy } = fixture()
  open(); settle({ proceeds: '0' })
  open({ positionId: 'p2' }); settle({ positionId: 'p2', receiptId: 'r2', proceeds: '13000000' })
  assert.equal(r.snapshot().DAT.pnl, '-7400000')
  assert.throws(() => buy(), /earnings/)
})
test('allocation includes fees, cannot be reused and enforces own token and minimum output', () => {
  const { r, open, settle, buy } = fixture(); open(); settle()
  assert.throws(() => buy({ targetToken: 'EMA' }), /own-token/)
  assert.throws(() => buy({ amount: '1400000', fee: '1' }), /earnings/)
  assert.throws(() => buy({ minimumReceived: '5000000000000000001' }), /Minimum/)
  buy(); const before = r.snapshot()
  assert.throws(() => buy({ buybackId: 'b2', amount: '1', fee: '0' }), /earnings/)
  assert.deepEqual(r.snapshot(), before)
})
test('burn requires acquired own-token output and cannot repeat', () => {
  const { open, settle, buy, run } = fixture()
  assert.throws(() => run('burn', { buybackId: 'b', targetToken: 'DAT' }), /unburned/)
  open(); settle(); buy()
  assert.throws(() => run('burn', { buybackId: 'b', targetToken: 'EMA' }), /own-token/)
  run('burn', { buybackId: 'b', targetToken: 'DAT' })
  assert.throws(() => run('burn', { buybackId: 'b', targetToken: 'DAT' }), /unburned/)
})
test('journal edits, reordering and policy changes fail replay', () => {
  const { r, open, settle } = fixture(); open(); settle()
  const edited = r.journal(); edited[0].command.amount = '200000000'
  assert.throws(() => SimulationRuntime.replay(config(), edited), /integrity/)
  assert.throws(() => SimulationRuntime.replay(config(), r.journal().reverse()), /mismatch/)
  const c = config(); c.agents.DAT.reserve = '1'
  assert.throws(() => SimulationRuntime.replay(c, r.journal()), /mismatch/)
})
test('external snapshots/config cannot mutate internal state', () => {
  const c = config(), r = new SimulationRuntime(c)
  c.agents.DAT.reserve = '0'; r.config().agents.DAT.reserve = '0'
  r.snapshot().DAT.cash = '999'
  assert.equal(r.config().agents.DAT.reserve, '5000000')
  assert.equal(r.snapshot().DAT.cash, '0')
})

for (const token of TOKENS) test(`${token}: CAW support stays inactive even with claimed platform readiness`, () => {
  const { r, open, settle, buy, run } = fixture(token)
  open(); settle()
  const beforePurchase = r.snapshot(), beforePurchaseJournal = r.journal()
  assert.throws(() => buy({ targetToken: 'CAW', cawPlatformOperational: true }), /CAW purchases and burns are inactive/)
  assert.deepEqual(r.snapshot(), beforePurchase)
  assert.deepEqual(r.journal(), beforePurchaseJournal)
  // Own-token activity remains permitted, including CAWELON (distinct from CAW).
  buy()
  const beforeBurn = r.snapshot(), beforeBurnJournal = r.journal()
  assert.throws(() => run('burn', { buybackId: 'b', targetToken: 'CAW', cawPlatformOperational: true }), /CAW purchases and burns are inactive/)
  assert.deepEqual(r.snapshot(), beforeBurn)
  assert.deepEqual(r.journal(), beforeBurnJournal)
  run('burn', { buybackId: 'b', targetToken: token })
  assert.equal(r.snapshot()[token].burned, '5000000000000000000')
})
