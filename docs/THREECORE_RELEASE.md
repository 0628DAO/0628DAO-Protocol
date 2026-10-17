# ThreeCore release evidence and remaining work

Updated: 2026-10-16

**Current decision: NOT READY for live autonomous operation.**

The DAT, EMA and CAWELON base-token repositories publish their existing Base
Mainnet deployment records. The new shared `threecore/` module is an offline
simulation, not a mainnet release candidate. Passing simulations is one completed
development step; it must not be described as completed wallet or dApp integration.

## Official dApp publication targets

Confirmed by the maintainer on 2026-10-16:

| Agent | Official dApp website | Implementation relationship |
| --- | --- | --- |
| DAT | https://datcore.fun | DAT-facing application and operating records |
| EMA | https://emacore.fun | EMA-facing application and operating records |
| CAWELON | https://cawelon.fun | CAWELON-facing application and operating records |

These are the intended public implementation and release destinations for the
three dApps, not merely promotional links. Each application is intended to
connect to its own agent's backend execution and accounting, using the shared
ThreeCore design while keeping funds and permissions separate. Signing secrets
must remain outside the public website and browser bundle.

This publication-target decision does not assert that live wallet execution is
already available on these sites. A website's availability and a deployed base
token do not establish completion of the autonomous service. External protocols
used by an agent are separate integrations, not replacements for these official
dApp websites.

**日本語：** DATはdatcore.fun、EMAはemacore.fun、CAWELONはcawelon.funで
それぞれのdAppを公開実装する方針です。各サイトの画面と専用バックエンドを
対応づけます。本番稼働の有無は、公開先の指定とは分けて検証・表示します。

## Evidence matrix

| Component | Current evidence | Required before live operation |
| --- | --- | --- |
| Existing base tokens | Source and deployment references in three token repositories; read-only preflight command | Deployment-specific bytecode and ownership review at a recorded block |
| Independent accounting and limits | Executable simulation and automated failure-path tests | Durable ledger, access control, reconciliation and concurrency tests |
| Public dApps | Three training frontend bundles built; controller-to-local-EVM tests passed | Browser QA, public testnet deployment, hosting and external-game/backend integration |
| Decision service | Defined objectives for each agent | Data inputs, selected strategy, decision records and deterministic risk validation |
| Wallet/signing | Dedicated training-agent contracts, wallet-connected UI and testnet CLI implemented | Public testnet signer/test ETH, followed by production custody/recovery and operational controls |
| External application | Internal arithmetic training game implemented and tested on local EVM | Selected external game, automation permission, network/asset validation and verified settlement |
| Realized profit | Integer simulation including losses and fees | Approved valuation and fee policy, externally verified settlement records |
| Buyback/burn | Own-token simulated lifecycle | DEX route, slippage and price controls, gas budget, receipts and supply reconciliation |
| Restart/replay | Journal replay and duplicate rejection | Atomic persistence, worker locks, crash recovery, nonce and unknown-transaction recovery |
| Chain behavior | Local EVM lifecycles passed; Base Sepolia read-only connectivity confirmed | Public testnet deployment/trial, fork tests, confirmations and reorg handling |
| Operations | Pause behavior in simulation | Operator authentication, monitoring, alerting, incident/recovery rehearsal |
| Release | No live runtime deployment | Independent review, evidence packet, explicit production decision |

The [training dApp implementation](../threecore/testnet/README.md) and its
[validation record](../threecore/testnet/VALIDATION.md) provide the latest local
EVM progress. No public testnet deployment is claimed.

## Development priorities derived from the founder's strategy

The strategy is to show a concrete future and build the capabilities that lead
to it. Current effort and resources prioritize ThreeCore itself. Continuing fan
support for CAW does not allocate present funds to CAW purchases or burns.

| Stage | Deliverable | Evidence required to advance | Current state |
| --- | --- | --- | --- |
| 1. ThreeCore foundation | Independent DAT, EMA and CAWELON balances, loss-aware accounting and own-token value-return limits | Reproducible simulations and rejection tests, including no CAW purchases/burns | Offline simulation implemented; production ledger pending |
| 2. First playable integration | A selected dApp game that permits agent play; observe, decide, authorize, play and settle interfaces | Published game rules/automation permission, network and contract references, result/fee verification, win/loss/failure cases | Internal training game implemented/tested locally; external game selection/adapter pending |
| 3. Agent dApps | DAT at datcore.fun, EMA at emacore.fun, CAWELON at cawelon.fun, each tied to its own backend | Visible mode (simulation/testnet/live), decisions, game results, costs and net earnings; no exposed signing secrets | Per-agent training UI built and controller-tested; hosting/public testnet pending |
| 4. Own-token return and restricted operation | Verified net earnings connected to same-token buyback/burn under approved rules | Testnet/fork evidence, durable recovery, execution review and production decision | Simulated only |
| 5. Conditional CAW support | CAW purchases/burns alongside ThreeCore's own development | CAW itself operating as a gaming platform, documented evidence and separately specified funding/allocation/execution rules | Inactive; no CAW purchase or burn path enabled |

The future CAW stage does not block stages 1–4. Announcements, promotional
websites, a token deployment or an AI model's claim of platform readiness cannot
activate stage 5. The current runtime intentionally has no automatic activation
switch for CAW support. Future support requires a separate reviewed implementation.
CAW and CAWELON are different tokens and must never be conflated.

### First game integration acceptance criteria

- Document the selected game, supported network/assets and permitted automated
  play before presenting it as supported.
- Keep observations and strategy proposals separate from authorization and
  execution. Record which agent made each decision and why.
- Bind each result to the agent, game session, authorized action and verified
  settlement evidence; handle duplicate, pending, failed and reversed outcomes.
- Record entry costs, rewards, losses and all relevant operating costs; report
  realized net earnings separately from token reward quantities.
- Demonstrate the full lifecycle and loss/failure cases in a supported test
  environment before connecting funds.
- Keep the decision component replaceable for more capable AI and potential AGI;
  replacements must retain limits and pass the same authorization/accounting tests.

### 日本語：方針を開発に結びつける

未来像を示すことを、現在の開発順序に反映します。まずThreeCore自身の基盤を整え、
自動プレイが認められるゲームを選定し、判断・プレイ・結果・費用・純利益を記録する
一連の接続を実装します。その結果を3つの公式dAppで確認できるようにし、
実現純利益から自トークンへの還元へ進みます。

CAWの購入・Burnは現在の実行対象に含めません。CAW自体のゲーム基盤が実際に
稼働したことを確認した段階で、金額・配分・実行条件を別途定めた実装として扱います。
CAW支援やAGIの到来を待つことは、ThreeCoreの開発を止める理由にはしません。

## Development sequence

1. Preserve deployed token contracts and use this shared simulation to exercise
   all three agent policies with isolated balances.
2. Implement the public application surfaces at datcore.fun, emacore.fun and
   cawelon.fun, with each connected to its own agent account. Specify the first external dApp and its settlement model, accounting asset,
   permitted actions, wallet custody/recovery, funding caps and profit allocation.
   These are production decisions; the sample configuration is not approval.
3. Implement the selected adapter and a durable execution service. The signer
   must revalidate chain, target, calldata, value, deadline, nonce and limits.
   AI output alone must never authorize arbitrary calls or unlimited approvals.
4. Run fork and Base Sepolia trials where the selected application supports
   them. Publish chain IDs, addresses, source commit, exact configuration,
   transaction receipts, failures and reconciliation results. Do not substitute
   a mock for a live application and call the integration verified.
5. Complete review, recovery drills and operating controls. Record unresolved
   findings and the production funding decision before a restricted launch.

Wallet provisioning, funding, external paid services and deployment are not
performed by the simulation or CI. Real funds have not been moved by this work.

## Press-release wording supported by this change

“ThreeCore's DAT, EMA and CAWELON token repositories publish Base Mainnet
deployment records. Development now includes a shared offline simulation for
independent agent accounting, execution limits and own-token buyback-and-burn
workflows, with automated tests. Dedicated wallets and live autonomous dApp
execution remain under development.”

Do not describe synthetic demo earnings as project revenue, synthetic burns as
on-chain burns, or the runtime as mainnet-ready. The press-release date does not
change the evidence needed for a production launch.

## 日本語

2026年10月16日、DAT・EMA・CAWELONの共通基盤として、資金・会計の独立、
投入上限、予備資金保護、損失繰越、手数料込み実現損益、自トークンの買戻し・
Burn、二重処理防止、記録の再生を模擬環境で実装しました。
これは専用ウォレットや外部dAppの本番稼働を示すものではありません。

本番直前の段階に進むには、接続dApp・署名基盤・運用条件の具体化、実接続の実装、
永続化と障害復旧、テストネット検証、セキュリティレビューが残っています。
READMEは、実装済み・模擬検証済み・実接続未完了を分けて更新します。
