import fs from 'node:fs'
import { SimulationRuntime, TOKENS } from '../src/runtime.js'

const config = JSON.parse(fs.readFileSync(new URL('../config/simulation.json', import.meta.url)))
const runtime = new SimulationRuntime(config)
for (const token of TOKENS) {
  const run = (type, fields) => runtime.execute({ id: `${token}:${type}`, token, type, ...fields })
  run('fund', { amount: '100000000' })
  run('open', { positionId: 'position-1', adapter: 'mock-market', amount: '10000000', fee: '100000' })
  run('settle', { positionId: 'position-1', adapter: 'mock-market', receiptId: `${token}:receipt`, proceeds: '13000000', fee: '100000' })
  run('buyback', { buybackId: 'buyback-1', targetToken: token, amount: '1300000', fee: '100000', received: '5000000000000000000', minimumReceived: '4900000000000000000' })
  run('burn', { buybackId: 'buyback-1', targetToken: token })
}
const replayed = SimulationRuntime.replay(config, runtime.journal())
console.log(JSON.stringify({ status: 'SIMULATION_ONLY', unit: 'SIM_USDC base units (6 decimals)', tokenUnit: '18 decimals', accounts: replayed.snapshot(), journal: runtime.journal() }, null, 2))
