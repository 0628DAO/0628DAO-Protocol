import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')
const target = path.join(root, 'threecore/testnet/dist')
fs.mkdirSync(target, { recursive: true })
for (const name of ['index.html', 'app.js', 'style.css']) fs.copyFileSync(path.join(root, 'threecore/testnet/web', name), path.join(target, name))
fs.copyFileSync(path.join(root, 'node_modules/ethers/dist/ethers.min.js'), path.join(target, 'ethers.js'))
const names = ['TrainingFactory', 'TrainingAgent', 'TrainingGame', 'TrainingCredit']
const contracts = Object.fromEntries(names.map(name => [name, JSON.parse(fs.readFileSync(path.join(root, `artifacts/threecore/testnet/contracts/${name}.json`)))]))
fs.writeFileSync(path.join(target, 'contracts.json'), JSON.stringify(contracts))
for (const [token, host] of [['DAT', 'datcore.fun'], ['EMA', 'emacore.fun'], ['CAWELON', 'cawelon.fun']]) {
  const dir = path.join(target, token.toLowerCase()); fs.mkdirSync(dir, { recursive: true })
  for (const file of ['index.html', 'app.js', 'style.css', 'ethers.js', 'contracts.json']) fs.copyFileSync(path.join(target, file), path.join(dir, file))
  fs.writeFileSync(path.join(dir, 'config.json'), JSON.stringify({ token, host, chainId: 84532, status: 'NOT_DEPLOYED', factory: null }))
}
fs.writeFileSync(path.join(target, 'config.json'), JSON.stringify({ token: 'DAT', host: 'datcore.fun', chainId: 84532, status: 'NOT_DEPLOYED', factory: null }))
console.log('Built three testnet application bundles in threecore/testnet/dist/{dat,ema,cawelon}. No website was published.')
