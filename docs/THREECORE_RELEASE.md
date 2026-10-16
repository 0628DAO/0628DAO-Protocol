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
| Public dApps | Publication targets: datcore.fun / emacore.fun / cawelon.fun | Per-agent UI, backend API, deployment checks and accurate live/simulation labels |
| Decision service | Defined objectives for each agent | Data inputs, selected strategy, decision records and deterministic risk validation |
| Wallet/signing | Target workflow documented | Custody choice, separate authorities, approved spending policy, key rotation and recovery drills |
| External application | Mock adapter identifier only | Named dApp/network/assets, ABI and address validation, receipts and failure handling |
| Realized profit | Integer simulation including losses and fees | Approved valuation and fee policy, externally verified settlement records |
| Buyback/burn | Own-token simulated lifecycle | DEX route, slippage and price controls, gas budget, receipts and supply reconciliation |
| Restart/replay | Journal replay and duplicate rejection | Atomic persistence, worker locks, crash recovery, nonce and unknown-transaction recovery |
| Chain behavior | Optional read-only metadata check | Fork tests, public testnet trial, confirmations and reorg handling |
| Operations | Pause behavior in simulation | Operator authentication, monitoring, alerting, incident/recovery rehearsal |
| Release | No live runtime deployment | Independent review, evidence packet, explicit production decision |

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
