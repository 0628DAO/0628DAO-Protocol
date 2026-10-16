import fs from 'node:fs'
import assert from 'node:assert/strict'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import hre from 'hardhat'
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')
const connection=await hre.network.create({network:'trainingLocal'})
const storage=new Map()
const elements=()=>new Map()
const el=()=>({textContent:'',value:'',disabled:false,children:[],append(...v){this.children.push(...v)},prepend(v){this.children.unshift(v)},click(){}})
let currentToken
const originalFetch=globalThis.fetch
try {
 globalThis.window={ethereum:{on(){},request:({method,params=[]})=>connection.provider.request({method:method==='eth_requestAccounts'?'eth_accounts':method,params})}}
 globalThis.localStorage={getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)}
 globalThis.location={host:'local-evm-controller-test',reload(){}}
 globalThis.fetch=async url=>({json:async()=>JSON.parse(fs.readFileSync(root+'/threecore/testnet/dist/'+currentToken.toLowerCase()+'/'+url.replace('./','')))})
 for(const token of ['DAT','EMA','CAWELON']){
  currentToken=token;const nodes=elements()
  globalThis.document={getElementById(id){if(!nodes.has(id))nodes.set(id,el());return nodes.get(id)},documentElement:{style:{setProperty(){}}},createElement:()=>el(),createTextNode:t=>t}
  await import(root+'/threecore/testnet/dist/app.js?token='+token)
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
  console.log(JSON.stringify({token,cash:nodes.get('cash').textContent,pnl:nodes.get('pnl').textContent,burned:nodes.get('burned').textContent,transactionRecords:nodes.get('log').children.length}))
 }
 console.log('All three UI controllers exercised against local EVM. DOM was stubbed; visual/browser rendering was not tested.')
}finally{globalThis.fetch=originalFetch;await connection.close()}
