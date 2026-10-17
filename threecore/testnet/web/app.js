import { BrowserProvider, Contract, ContractFactory, Interface, id, parseEther, formatEther, isAddress, keccak256 } from './ethers.js'
const $ = name => document.getElementById(name)
const config = await (await fetch('./config.json')).json()
const artifacts = await (await fetch('./contracts.json')).json()
const hosts = { DAT: 'datcore.fun', EMA: 'emacore.fun', CAWELON: 'cawelon.fun' }
let provider, signer, account, factory, agent, game, credit, busy = false
const records = []
$('agent').value = config.token
$('deploymentStatus').textContent = config.status === 'VERIFIED_TESTNET_TRAINING' && isAddress(config.factory || '')
  ? `公開テストネット検証済み · Base Sepolia ／ Factory ${config.factory}`
  : '未配備プレビュー · 公開テストネットでの動作確認は未完了です。'
function key() { return `threecore-training:84532:${account?.toLowerCase()}` }
function appearance() {
  const token = $('agent').value
  $('title').textContent = `${token} · Game Training`
  $('destination').textContent = `公開予定先：${hosts[token]} ／ 現在の表示：${location.host}`
  document.documentElement.style.setProperty('--accent', { DAT: '#e4bb66', EMA: '#ef98ba', CAWELON: '#b7d7eb' }[token])
}
function controls() {
  for (const name of ['deploy', 'attach']) $(name).disabled = busy || !signer
  $('create').disabled = busy || !factory
  for (const name of ['play', 'lose', 'burn', 'refresh']) $(name).disabled = busy || !agent
  $('connect').disabled = busy
  $('agent').disabled = busy
}
async function chainCheck() {
  if (!window.ethereum || Number(await window.ethereum.request({ method: 'eth_chainId' })) !== 84532) throw new Error('Base Sepolia（84532）に切り替えてください。')
}
async function action(fn) {
  if (busy) return
  busy = true; controls()
  try { await chainCheck(); await fn(); $('status').textContent = '確認完了' }
  catch (error) { $('status').textContent = error.shortMessage || error.message || '処理失敗'; }
  finally { busy = false; controls() }
}
async function receipt(tx, label) {
  $('status').textContent = `${label}：承認・確定待ち`
  const result = await tx.wait()
  if (!result || result.status !== 1) throw new Error('取引が成功していません。')
  const row = { label, chainId: 84532, hash: result.hash, block: result.blockNumber, gasCostWei: result.fee.toString(), agent: $('agent').value }
  records.push(row)
  const li = document.createElement('li'), link = document.createElement('a')
  link.href = `https://sepolia.basescan.org/tx/${result.hash}`; link.target = '_blank'; link.rel = 'noopener'; link.textContent = result.hash
  li.append(document.createTextNode(`${label} · ガス ${formatEther(result.fee)} ETH · `), link)
  $('log').prepend(li)
  return result
}
async function attachFactory(address) {
  // A failed replacement must never leave the previous contract actionable.
  factory = agent = game = credit = undefined
  $('cash').textContent = $('pnl').textContent = $('burned').textContent = '—'
  $('contracts').textContent = '契約は未接続です。アドレスを確認してください。'
  $('challenge').textContent = '契約を準備すると課題を表示します。'
  controls()
  if (!isAddress(address)) throw new Error('Factoryの契約アドレスを確認してください。')
  const code = await provider.getCode(address)
  if (code === '0x' || keccak256(code) !== keccak256(artifacts.TrainingFactory.deployedBytecode)) throw new Error('Factoryのコードがこのビルドと一致しません。')
  const candidate = new Contract(address, artifacts.TrainingFactory.abi, signer)
  await candidate.agents(account, id($('agent').value))
  factory = candidate
  try { await loadAgent() }
  catch (error) { factory = agent = game = credit = undefined; throw error }
  $('factory').value = address; localStorage.setItem(key(), address)
}
async function loadAgent() {
  agent = game = credit = undefined
  const address = await factory.agents(account, id($('agent').value))
  if (address === '0x0000000000000000000000000000000000000000') { $('contracts').textContent = 'Factory確認済み。このエージェントは未作成です。'; controls(); return }
  const candidate = new Contract(address, artifacts.TrainingAgent.abi, signer)
  if ((await candidate.owner()).toLowerCase() !== account.toLowerCase() || await candidate.agentId() !== id($('agent').value)) throw new Error('エージェントの所有者または識別子が一致しません。')
  agent = candidate; credit = new Contract(await agent.credit(), artifacts.TrainingCredit.abi, signer); game = new Contract(await agent.game(), artifacts.TrainingGame.abi, signer)
  $('contracts').textContent = `Agent ${address} ／ Game ${game.target} ／ テスト用Credit ${credit.target}`
  await refresh()
}
async function refresh() {
  const [cash, pnl, burned, challenge] = await Promise.all([credit.balanceOf(agent.target), agent.realizedPnl(), agent.burnedFromProfit(), game.challenge(agent.target)])
  $('cash').textContent = formatEther(cash); $('pnl').textContent = formatEther(pnl); $('burned').textContent = formatEther(burned)
  $('challenge').textContent = `Round ${challenge[0]}： ${challenge[1]} + ${challenge[2]} = ?`
}
$('network').onclick = async () => {
  try {
    if (!window.ethereum) throw new Error('ブラウザのテスト用ウォレットが必要です。')
    try { await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: '0x14a34' }] }) }
    catch (e) {
      if (e.code !== 4902) throw e
      await window.ethereum.request({ method: 'wallet_addEthereumChain', params: [{ chainId: '0x14a34', chainName: 'Base Sepolia', nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 }, rpcUrls: ['https://sepolia.base.org'], blockExplorerUrls: ['https://sepolia.basescan.org'] }] })
    }
  } catch (e) { $('status').textContent = e.message }
}
$('connect').onclick = async () => {
  try {
    if (!window.ethereum) throw new Error('ブラウザのテスト用ウォレットが必要です。')
    await window.ethereum.request({ method: 'eth_requestAccounts' })
    await chainCheck()
    provider = new BrowserProvider(window.ethereum); signer = await provider.getSigner(); account = await signer.getAddress()
    $('wallet').textContent = `Base Sepolia ／ ${account}`
    const saved = config.factory || localStorage.getItem(key()); if (saved) await action(() => attachFactory(saved))
  } catch (e) { $('status').textContent = e.message }
  controls()
}
$('deploy').onclick = () => action(async () => {
  const f = new ContractFactory(artifacts.TrainingFactory.abi, artifacts.TrainingFactory.bytecode, signer)
  const deployed = await f.deploy(); await receipt(deployed.deploymentTransaction(), 'Factory配備'); await attachFactory(await deployed.getAddress())
})
$('attach').onclick = () => action(() => attachFactory($('factory').value.trim()))
$('create').onclick = () => action(async () => { await receipt(await factory.deployAgent($('agent').value), 'エージェント作成'); await loadAgent() })
async function play(correct) {
  const [round, a, b] = await game.challenge(agent.target)
  const command = id(`${account}:${$('agent').value}:${crypto.randomUUID()}`)
  await receipt(await agent.execute(command, round, a + b + (correct ? 0n : 1n), parseEther('1')), correct ? 'ルール型プレイ' : '不正解検証'); await refresh()
}
$('play').onclick = () => action(() => play(true))
$('lose').onclick = () => action(() => play(false))
$('burn').onclick = () => action(async () => { await receipt(await agent.burnProfit(id(crypto.randomUUID()), parseEther('0.5')), 'テスト利益Burn'); await refresh() })
$('refresh').onclick = () => action(refresh)
$('agent').onchange = () => { appearance(); $('cash').textContent = $('pnl').textContent = $('burned').textContent = '—'; if (factory) action(loadAgent) }
$('export').onclick = () => {
  const url = URL.createObjectURL(new Blob([JSON.stringify({ status: 'TESTNET_TRAINING_ONLY', account, factory: factory?.target, records }, null, 2)], { type: 'application/json' }))
  const link = document.createElement('a'); link.href = url; link.download = 'threecore-training-records.json'; link.click(); URL.revokeObjectURL(url)
}
window.ethereum?.on('accountsChanged', () => location.reload())
window.ethereum?.on('chainChanged', () => location.reload())
appearance(); controls()
