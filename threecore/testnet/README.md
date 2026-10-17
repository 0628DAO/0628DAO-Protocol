# ThreeCore testnet dApp implementation

**Development / Unaudited / Not deployed to mainnet**

## Current state — 2026-10-16

DAT, EMA and CAWELON each have a separately funded training-agent contract,
training-game instance, test-credit token and browser application bundle.
Deployment, gameplay, on-chain settlement, credit-denominated P&L and burning
eligible training-credit profit have been exercised in a local EVM. Base Sepolia
RPC access has been checked, but **no public Base Sepolia deployment is recorded
for this module yet**. No domain has been updated by this work.

| Agent | Intended official site | Built application bundle |
| --- | --- | --- |
| DAT | https://datcore.fun | `dist/dat/` |
| EMA | https://emacore.fun | `dist/ema/` |
| CAWELON | https://cawelon.fun | `dist/cawelon/` |

The reference game is an arithmetic task with a publicly computable answer.
A deterministic rule answers it; no AI model or AGI is integrated. Freely minted
`tDAT`, `tEMA` and `tCAWELON` training credits have **no economic value**. Rewards
come from a pre-funded pool of those credits. These are not production tokens,
an external game integration, actual investment profits or a DEX buyback.
Credit P&L and ETH gas cost are reported separately; no ETH valuation model is
implemented. The training-credit burn only tests profit eligibility and receipt
handling. The future own-token DEX buyback requires a separate implementation.

## Run and validate

```sh
npm ci --ignore-scripts
npm run test:testnet
npm run test:testnet-ui
```

The first command suite runs real contract transactions in Hardhat EDR. The UI
controller test runs the application handlers against the local EVM using a
stub DOM; it is not a visual browser test. Public-chain signing is not used.

```sh
npm run build:testnet
python -m http.server 8080 --directory threecore/testnet/dist
```

Open `/dat/`, `/ema/` or `/cawelon/`. The browser UI offers Base Sepolia network
selection, wallet connection, factory deployment, per-agent creation, a correct
rule-based play, an intentionally incorrect play for failure checks, eligible
credit burn, state refresh and a JSON receipt export. It checks the factory's
runtime bytecode against the compiled build before attaching. No private-key
entry field is provided. All signing is through the connected wallet.

The generated bundles include the locked local ethers browser distribution and
compiled contract artifacts; no third-party CDN is used. `dist/` is ignored by
git and can be reproduced with the build command. Each site's `config.json`
contains its agent identity, chain ID and optional factory address. A newly
built bundle is labeled `NOT_DEPLOYED`, with no invented deployment addresses.

## Public Base Sepolia deployment

### Verified website release

After deployment and `--exercise`, commit the reviewed source and run
`npm run release:testnet`. This read-only release gate requires the recorded
chain and connected RPC to be Base Sepolia, matching compiled factory bytecode
and artifact fingerprint, three distinct factory-registered agents with correct
owner/identity/game/credit bindings, and successful canonical play/burn receipts
from the recorded owner to each agent. Incomplete or pending reports are rejected.

Only after verification does it stage and atomically publish local bundles under
`threecore/testnet/release/{dat,ema,cawelon}/`, including the verified factory in
each config and a public `verification.json`. An existing release is preserved;
archive it before preparing another. The default `build:testnet` remains an
explicitly labeled undeployed preview. Neither command uploads to a website.
Upload only the verified release to the intended domain's testnet path after
confirming the hosting destination, then check HTTPS and wallet behavior there.
This gate is development evidence, not a security audit or production approval.

Supported public chain: **84532**. Constructors also allow local chain 31337 for
tests and reject other chains, including Base Mainnet. Browser transactions are
restricted to chain 84532. `trainingLocal` is an in-memory test chain with the
same ID for controller testing; its results are never public-chain evidence.

Two supported signing paths are provided:

1. Browser UI: a dedicated test wallet with Base Sepolia ETH signs factory and
   agent creation, then gameplay transactions. The UI emits explorer links and
   records ETH gas cost for each confirmed receipt.
2. CLI: securely configure `THREECORE_TESTNET_PRIVATE_KEY` outside the repository
   for a **dedicated test-only wallet**, then run `npm run deploy:testnet`.
   Add `-- --exercise` to execute a training play and credit burn for each agent.
   Never use a production private key or paste any key into chat or the website.

`BASE_SEPOLIA_RPC_URL` optionally overrides the default `https://sepolia.base.org`.
A read-only connectivity check is available as `npm run check:testnet`. In managed
proxy environments on Node 24+, prefix CLI commands with `NODE_USE_ENV_PROXY=1`.
The network transport uses native fetch and does not print provider exceptions
that could contain credential-bearing URLs.

The CLI writes a public-address/receipt report to
`deployments/base-sepolia.json`. It stores a build fingerprint and records known
pending transactions. It refuses to continue when a recorded action is pending
or failed; successful actions can be reconciled. This is a development deployment
tool, not a crash-safe multi-worker transaction service. If interrupted between
broadcast and recording the hash, reconcile the wallet nonce and chain history
before retrying. Successful training is not a production security certification.

## Contracts and policy

- `TrainingFactory`: one deployment per owner and agent identity. Initial test
  values are 100 credits in each agent, 500 in its reward pool, stake limit 10,
  reserve 5. These are development fixtures, not approved production allocations.
- `TrainingAgent`: separate funds, immutable game/token binding, owner/operator
  separation, pause, unique command IDs, bounded stake, reserve floor, settlement
  P&L and profit-only credit burn. Only the operator can play; only the owner can
  change the operator or burn eligible credits.
- `TrainingGame`: round-bound arithmetic challenges; wins and losses settle in
  one transaction. An underfunded reward pool rejects before taking the stake.
- `TrainingCredit`: freely mintable and burnable development token. No genuine
  ThreeCore token or CAW address is accepted as an alternate execution target.

There is no arbitrary-call executor, general ERC-20 withdrawal or DEX path in
this training implementation. It cannot buy or burn CAW. The founder's current
priority is ThreeCore's own development. Future CAW support remains conditional
on CAW actually operating as a gaming platform and a separately specified policy.

## Next integration work

1. Select the first external game that permits agents and specify its settlement.
2. Implement its adapter and receipt verification, then connect the decision
   service without allowing it to bypass authorization or spending controls.
3. Add persistent operations, fee valuation, recovery, monitoring and verified
   own-token buyback/burn integration.
4. Record public testnet contracts and successful/failed game-session receipts.
5. Publish the verified testnet frontend at the intended domains when the hosting
   deployment is configured, with its testnet status clearly visible.

## 日本語

3つのdAppそれぞれに、ゲームをプレイするテスト用契約と操作画面を実装しました。
ローカルEVMで、契約の作成・プレイ・勝敗確定・損益記録・テスト利益のBurnを検証します。
Base Sepoliaへの接続は確認しましたが、公開テストネットへの配備はまだ未実施です。

現在のゲームは算術問題による接続検証用で、回答はルール型です。実際のAIモデル、
外部の収益ゲーム、本番トークンの買戻しには未接続です。この実装を土台として、
各ゲーム用アダプタとAI判断部分を接続する開発へ進めます。
