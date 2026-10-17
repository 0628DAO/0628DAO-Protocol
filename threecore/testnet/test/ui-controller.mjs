import fs from 'node:fs'
import assert from 'node:assert/strict'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import hre from 'hardhat'
import { BrowserProvider, Contract, id } from 'ethers'
import { createHash } from 'node:crypto'
import { verifyRelease } from '../scripts/verify-release.js'
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')
const connection=await hre.network.create({network:'trainingLocal'})
const storage=new Map()
const elements=()=>new Map()
const el=()=>({textContent:'',value:'',disabled:false,children:[],append(...v){this.children.push(...v)},prepend(v){this.children.unshift(v)},click(){}})
let currentToken
const report={status:'TESTNET_TRAINING_EXERCISED',chainId:84532,agents:{},transactions:[]}
const artifacts={},fingerprint=createHash('sha256')
for(const name of ['TrainingFactory','TrainingAgent','TrainingGame','TrainingCredit']){
 const bytes=fs.readFileSync(path.join(root,`artifacts/threecore/testnet/contracts/${name}.json`))
 fingerprint.update(bytes);artifacts[name]=JSON.parse(bytes)
}
const artifactHash=fingerprint.digest('hex')
report.artifactHash=artifactHash
const originalFetch=globalThis.fetch
try {
 globalThis.window={ethereum:{on(){},request:({method,params=[]})=>connection.provider.request({method:method==='eth_requestAccounts'?'eth_accounts':method,params})}}
 globalThis.localStorage={getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)}
 globalThis.location={host:'local-evm-controller-test',reload(){}}
 globalThis.fetch=async url=>({json:async()=>JSON.parse(fs.readFileSync(root+'/threecore/testnet/dist/'+currentToken.toLowerCase()+'/'+url.replace('./','')))})
 for(const token of ['DAT','EMA','CAWELON']){
  currentToken=token;const nodes=elements()
  globalThis.document={getElementById(id){if(!nodes.has(id))nodes.set(id,el());return nodes.get(id)},documentElement:{style:{setProperty(){}}},createElement:()=>el(),createTextNode:t=>t}
  await import(pathToFileURL(path.join(root,'threecore/testnet/dist/app.js')).href+'?token='+token)
  assert.match(nodes.get('deploymentStatus').textContent,/未配備プレビュー/)
  await nodes.get('connect').onclick()
  if(token==='DAT')await nodes.get('deploy').onclick()
  await nodes.get('create').onclick()
  assert.equal(nodes.get('cash').textContent,'100.0',nodes.get('status').textContent)
  await nodes.get('play').onclick()
  assert.equal(nodes.get('pnl').textContent,'1.0',nodes.get('status').textContent)
  await nodes.get('burn').onclick()
  assert.equal(nodes.get('burned').textContent,'0.5',nodes.get('status').textContent)
  await nodes.get('lose').onclick()
  assert.equal(nodes.get('pnl').textContent,'0.0',nodes.get('status').textContent)
  const validFactory=nodes.get('factory').value
  for(const invalidFactory of ['invalid-address','0x0000000000000000000000000000000000000001']){
   nodes.get('factory').value=invalidFactory
   await nodes.get('attach').onclick()
   for(const name of ['create','play','lose','burn','refresh'])assert.equal(nodes.get(name).disabled,true,`${token}: ${name} must be disabled after failed attachment`)
   assert.equal(nodes.get('cash').textContent,'—')
   assert.equal(nodes.get('pnl').textContent,'—')
   assert.equal(nodes.get('burned').textContent,'—')
   assert.equal(storage.get(`threecore-training:84532:${(await connection.provider.request({method:'eth_accounts'}))[0].toLowerCase()}`),validFactory)
   nodes.get('factory').value=validFactory
   await nodes.get('attach').onclick()
   assert.equal(nodes.get('play').disabled,false,nodes.get('status').textContent)
   assert.equal(nodes.get('pnl').textContent,'0.0')
  }
  console.log(JSON.stringify({token,cash:nodes.get('cash').textContent,pnl:nodes.get('pnl').textContent,burned:nodes.get('burned').textContent,transactionRecords:nodes.get('log').children.length}))
  report.factory=validFactory
  report.owner=(await connection.provider.request({method:'eth_accounts'}))[0]
  const p=new BrowserProvider(window.ethereum)
  const f=new Contract(validFactory,artifacts.TrainingFactory.abi,p)
  const agentAddress=await f.agents(report.owner,id(token))
  const a=new Contract(agentAddress,artifacts.TrainingAgent.abi,p)
  report.agents[token]={agent:agentAddress,game:await a.game(),credit:await a.credit()}
  for(const li of nodes.get('log').children){
   const label=li.children[0]
   const action=label.startsWith('ルール型プレイ')?'training-play':label.startsWith('テスト利益Burn')?'training-credit-burn':null
   if(action)report.transactions.push({action,token,hash:li.children[1].href.split('/').pop()})
  }
 }
 const readProvider=new BrowserProvider(window.ethereum)
 const verified=await verifyRelease(report,artifacts,artifactHash,readProvider)
 assert.equal(Object.keys(verified.agents).length,3)
 assert.equal(verified.receipts.length,6)
 const invalidReports=[
  {...report,chainId:8453},
  {...report,status:'NOT_DEPLOYED'},
  {...report,pendingAction:{hash:'pending'}},
  {...report,artifactHash:'wrong'},
  {...report,transactions:[]},
  {...report,agents:{...report.agents,EMA:report.agents.DAT}},
  {...report,transactions:report.transactions.map(row=>({...row,hash:report.transactions[0].hash}))},
  {...report,transactions:report.transactions.map(row=>({...row,hash:'0x'+'00'.repeat(32)}))},
 ]
 for(const invalidReport of invalidReports)await assert.rejects(()=>verifyRelease(invalidReport,artifacts,artifactHash,readProvider))
 console.log('Read-only release gate passed local chain verification and rejected eight invalid deployment reports. No public deployment occurred.')
 console.log('All three UI controllers exercised against local EVM. DOM was stubbed; visual/browser rendering was not tested.')
}finally{globalThis.fetch=originalFetch;await connection.close()}
