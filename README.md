# 0628DAO Protocol

> **Development / Unaudited / Not deployed to mainnet**

`0628DAO-Protocol` is the public development repository for integration modules
maintained by 0628DAO. The game module makes CAW usable from a game without changing the CAW token
contract. The separate ThreeCore module adds shared offline accounting and
policy simulation for DAT, EMA and CAWELON.

## Future focus: agents that play decentralized dApp games

**Direction set by founder Masashi Kuroda on 2026-10-16.** The future focus of
DATCORE, EMA CORE and CAWELON CORE is to specialize in decentralized dApp games.
Each token's associated AI agent is intended to analyze game conditions, choose
strategies and play permitted games within its own funding and authorization
limits, with the aim of earning revenue through gameplay. The agents are active
players; the ERC-20 tokens themselves do not run AI or play games.

The plan is to record gameplay outcomes, rewards, losses and operating costs,
then use eligible realized net earnings for the corresponding token's buyback
and burn under the approved policy. Token rewards alone are not proof of net
profit. Funds, permissions and accounting remain independent across the three
agents; direct dividends to holders are not part of this design.

**Looking toward AGI:** the founder anticipates that AI agents may develop toward
more general, AGI-level capabilities. The design aims to allow the decision
component to be replaced as capabilities improve, while retaining independent
authorization, spending limits and verifiable records. This is a forward-looking
design premise, not a claim that AGI is available, that the current agents will
automatically become AGI, or that a development date or profitable outcome is
guaranteed. Initial development does not depend on AGI becoming available.

**Relationship to CAW:** the founder sees potential affinity between ThreeCore's
game-playing agents and a future decentralized gaming ecosystem built around
CAW. The published [CAW manifesto](https://github.com/cawdevelopment/manifesto)
primarily specifies decentralized social communication, identity and value
transfer. The gaming connection described here is the founder's strategic
outlook, not a verified CAW-wide gaming roadmap, partnership or implemented
integration. The separate 0628DAO CAW game module is development work, not proof
of a live upstream CAW gaming platform.

This gaming specialization is the current intended application focus. Earlier
film examples of betting, prediction and trading are illustrations, not a fixed
production game list. Selection must establish that agent play is permitted and
that rewards, costs and settlement can be verified. Current published simulation
code does not yet implement a live game-playing agent.

### 日本語：dAppゲームへの特化とAGIを見据えた将来像

司令塔・黒田昌資の方針として、DATCORE・EMA CORE・CAWELON COREの将来は、
**分散型dAppゲームに特化し、各トークンに対応するAIエージェント自身が
分析・判断・プレイを行い、収益獲得を目指す**方向で開発します。
トークン自体がゲームを動かすという意味ではありません。

ゲーム報酬、損失、参加費、ガス代等の運用費用を記録し、所定の条件を満たす
実現純利益を自トークンのBuyback & Burnにつなげる構想です。
3者の資金・権限・会計は独立させ、ホルダーへの直接配当は想定しません。

司令塔はAIエージェントが将来AGIエージェントへ発展する可能性を見据えています。
その進歩を取り込めるよう判断部分を差し替え可能な構成を目指し、権限管理・
資金上限・検証可能な記録を維持します。AGIの実現時期や自動的な移行、
利益の保証を意味せず、現段階の開発はAGIの登場を待たずに進めます。

CAWを基盤とする分散型ゲームへの将来的な発展と、ThreeCoreとの親和性を
司令塔は見込んでいます。ただし、確認できたCAW原典は分散型SNSが中心です。
ここでは司令塔の将来展望として述べ、CAW全体の確定済みロードマップ、
公式提携、接続実装済みとは表現しません。

## ThreeCore project direction

[ThreeCore — project direction and dedicated wallets](docs/THREECORE.md)
documents the DAT / EMA / CAWELON vision from the six-minute film and the
independent 120-second wallet special, with an English explanation and Japanese
summary. The direction centers on each agent's decisions, dedicated wallet,
authorized execution and own-token value return. x402 is not a prerequisite.

The development label above applies to the game module and ThreeCore simulation.
Published Base token deployments in their own repositories are separate from
the still-developing ThreeCore agent and wallet workflow. The `threecore/` directory implements the offline simulation described below;
its game gateway is not a ThreeCore trading runtime.

ThreeCoreの6分映像と120秒のウォレット特別編に基づく方向性を、
[共通説明](docs/THREECORE.md#日本語)に整理しています。
基本トークンの公開状況と、専用ウォレット／エージェントの開発状況を区別します。

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

## ThreeCore implementation progress — 2026-10-16

The [shared simulation](threecore/README.md) now includes separate accounting for
DAT, EMA and CAWELON, position/exposure limits, reserve protection, pause,
fee-aware realized P&L, loss carryforward, own-token buyback/burn simulation,
duplicate rejection and hash-linked event replay. Automated tests cover the
three complete lifecycles and failure paths. A separate read-only Base token
preflight is included; it cannot sign or submit transactions.

```sh
npm run test:threecore
npm run demo:threecore
```

**Status: offline simulation implemented; live wallets, AI decisions and dApp
execution are not implemented by this module. Not mainnet-ready.** The sample
limits and allocation ratio are testing fixtures, not approved production policy.
See [release evidence and remaining work](docs/THREECORE_RELEASE.md).

**日本語：** DAT・EMA・CAWELON共通の模擬実行基盤を実装しました。
資金・会計の分離、投入上限、損失・手数料を反映した損益計算、自トークンの
買戻し・Burn、二重処理防止をテストします。専用ウォレットと外部dAppの実接続、
本番運用は未完了です。公開前の残作業は上記の開発記録に明記しています。

## CAW game integration

The [`game/`](game/) module provides a small Solidity gateway for:

- one-to-one player-wallet registration;
- CAW balance and allowance reads;
- funded reward grants with replay-safe, one-time claims;
- escrowed in-game item purchase requests;
- atomic CAW-for-item player trades through a game-owned asset adapter;
- operator separation, emergency pause, two-step ownership and treasury changes;
- structured events for game indexers and audit trails.

All automated tests use an in-memory chain, a mock CAW token and a mock game
asset adapter. No private key, live RPC endpoint or real asset is required.

## Repository lineage

The confirmed project lineage is:

**CAW → 0628DAO/GilgameshCaw → 0628DAO → CAWELON · EMA · DAT**

- Formal CAW fork: [`0628DAO/GilgameshCaw`](https://github.com/0628DAO/GilgameshCaw)
- Direct fork parent: [`GilgameshCaw/Caw`](https://github.com/GilgameshCaw/Caw)
- Recorded upstream commit: `e2074718bcea293726ddfcf8764e1499e7b9217c`

See [`LINEAGE.md`](LINEAGE.md) for the boundary between upstream CAW and the
original 0628DAO game module.

## Local verification

```bash
npm ci --ignore-scripts
npm run check
```

The test suite compiles Solidity with the pinned local `solc-js` package and
runs only against Hardhat's EDR in-memory EVM. Solidity source is also checked
with Solhint, and CI rejects high or critical dependency advisories.

## Safety status

- No Mainnet or Testnet deployment is included.
- No production CAW address is hard-coded.
- The contracts are unaudited and must not hold real funds.
- Deployment, real signing and gas testing require a separate review and an
  explicit human decision.

No license is granted for this repository at this stage. Licensing will be
decided before any production release.
