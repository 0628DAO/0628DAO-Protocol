# ThreeCore shared runtime

**Development / Unaudited / Not deployed to mainnet**

As of 2026-10-16, this module implements an **offline accounting and policy
simulation**, shared by DAT, EMA and CAWELON. It is not an AI decision service,
wallet product, DEX integration or production execution system. No command in
the simulation signs or submits a blockchain transaction.

Validation commands, local results and the recorded read-only Base block are
published in [VALIDATION.md](VALIDATION.md).

A separate [testnet training implementation](testnet/README.md) now supplies
contracts, wallet-connected site bundles and deployment scripts. It has been
validated locally; public testnet deployment is pending. This does not change
the offline-only boundary of `SimulationRuntime` below.

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

## Run

Node.js 22 or newer:

```sh
npm run test:threecore
npm run demo:threecore
```

The simulation and its tests use only Node built-ins. The demo emits a complete
JSON report including a replayable event journal. All positions, receipts, profits,
prices, acquired tokens and burns in this report are synthetic.

The optional token preflight uses the repository's locked ethers dependency:

```sh
npm ci --ignore-scripts
npm run preflight:threecore
```

It checks Base chain ID, code presence, symbol, decimals and supply bounds at one
block, and reports the observed bytecode hash. It requires RPC access, not a key.
Override the default public RPC with `BASE_READ_RPC_URL` if needed; keep URLs
containing credentials out of commits and reports. This check does not compare
bytecode to a compiled artifact, validate pool liquidity or prove runtime readiness.

## Implemented behavior

**Current-stage policy:** ThreeCore's own development and own-token value return
come first. CAW purchases and burns are explicitly rejected for all three agents;
CAWELON remains its own distinct permitted token. No model-supplied claim or
configuration switch can activate future CAW support. The founder's conditional
future support policy requires CAW to operate as a gaming platform and separate
funding rules and implementation. See the
[development stages](../docs/THREECORE_RELEASE.md#development-priorities-derived-from-the-founders-strategy).

- Separate DAT / EMA / CAWELON accounts and policy settings.
- Integer accounting in a single simulated USDC asset with six decimals;
  acquired own-token quantities use 18 decimals. No floating-point amounts.
- Per-position and total open-exposure limits, adapter allowlist, reserve floor.
- Pause of new positions, buybacks and burns; already-open positions can settle.
- Realized P&L = proceeds minus principal minus entry and exit fees.
- Loss carryforward and prior allocation deduction. All positions must settle
  before buying back, so unknown open-position losses cannot fund a buyback.
- Buyback costs include the configured buyback fee, enforce minimum received
  output and can acquire only the same agent's token. One burn per acquisition.
- Unique command IDs, position IDs and adapter receipt IDs; replay restores
  accounting and duplicate protection.
- Hash-linked events bound to the complete simulation configuration.
- Separate read-only registry and chain preflight for the three existing tokens.

The example limits and 50% ratio are **test fixtures, not adopted funding or
profit-allocation policy**. The three personalities remain design orientations;
this module does not implement trading strategies or set leverage.

## Trust boundary and limitations

The caller supplies all simulated fills, fees, receipts and funding. There is no
authentication, external settlement verification, economic oracle, live signer,
distributed lock, database or durable transaction-submission queue. The journal
is in memory and exported by the demo; replay validates an exported journal.
A hash chain detects edits relative to a trusted checkpoint, but an attacker
controlling the entire file can rewrite it or truncate its suffix. Independently
anchor checkpoints before claiming tamper-resistant public accounting.

This is a single-process simulation, not a crash-safe production ledger. Never
connect a live signer to `SimulationRuntime`. Build a separately reviewed
execution service with atomic persistence, nonce management, pending/unknown
submission recovery, confirmation/reorg handling and verified receipt ingestion.
Gas paid in ETH, token conversion and mark-to-market positions need an approved
valuation policy; synthetic fee inputs are not a complete gas-accounting system.

No wallet count, custody vendor, supported live dApp, spend limit, allocation
percentage or recovery authority is selected by this release. See the
[release requirements](../docs/THREECORE_RELEASE.md) for remaining work.

## Module ownership

This directory is the shared ThreeCore simulation implementation, introduced
from repository base commit `3993e0235a9aaef7326c2cc195dcd20e16faf9e9`.
The three token repositories retain their deployed ERC-20 sources. The existing
`game/` module is separate. No existing token contract is changed or redeployed.
