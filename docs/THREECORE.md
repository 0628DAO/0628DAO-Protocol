# ThreeCore — project direction and dedicated wallets

Updated: 2026-10-16

## Implementation update — 2026-10-16

The shared offline implementation now lives in [`threecore/`](../threecore/README.md),
based on commit `3993e0235a9aaef7326c2cc195dcd20e16faf9e9`. It exercises isolated
accounting, policy limits and synthetic own-token buyback/burn lifecycles for all
three agents. A separate [testnet training dApp module](../threecore/testnet/README.md) now
implements local-EVM gameplay and wallet transaction preparation. Public testnet
deployment, external revenue-game integration and AI decision services remain
incomplete. See the [release evidence matrix](THREECORE_RELEASE.md).
The design items below remain open for production; example settings are fixtures.

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

**Relationship to CAW:** [CoinMarketCap's CAW overview](https://coinmarketcap.com/currencies/caw/)
describes potential gaming applications, including purchases, rewards and
in-game transactions (accessed 2026-10-16). This published description supports
the founder's view that ThreeCore's game-playing agents have strategic affinity
with CAW's potential gaming ecosystem. This connection is therefore grounded in
a published use-case description, not solely the founder's personal projection.
The CMC overview is cited as a project description, not as an issuer-authored
technical white paper or evidence of a completed integration. The separate
0628DAO CAW game module remains development work.

### Strategy: make the future concrete, then build toward it

Founder Masashi Kuroda's view is that a crypto project should show the future it
intends to create and make present development decisions that lead toward it.
For ThreeCore, that future is a group of capable agents participating in
decentralized dApp games, recording their results and building an economic
foundation for DAT, EMA and CAWELON. The vision guides development priorities;
working software and verifiable operating records must demonstrate progress.

**First, build ThreeCore's own value.** The immediate priority is each agent's
gameplay capability, its public dApp, independent funds and accounting, and
sustainable net earnings. Eligible realized earnings are intended to support
the corresponding token's buyback and burn. Value means useful capabilities and
an economic foundation as well as the aim of improving token value; it does not
mean a guaranteed market-price increase.

**Continue supporting CAW as a fan; begin financial support only at the intended
stage.** The commitment to CAW (A Hunters Dream) remains unchanged. ThreeCore
does not currently purchase or burn CAW under this plan. Only after CAW itself
is an operational gaming platform does the founder intend to initiate CAW
purchases and burns, alongside the development of ThreeCore, to support the
long-term value of both ecosystems. A future announcement or roadmap alone does
not meet that condition. Exact funding, allocation and execution rules will be
specified for that stage; no automatic activation or reciprocal purchasing
commitment from CAW is implied.

**Build now, with future agent capabilities in mind.** Progress toward more
general AI and potentially AGI should be accommodated by replaceable decision
components. It must not bypass independent spending controls, verifiable game
results or the separation of the three agents' resources. Present development
does not wait for AGI or CAW's gaming platform.

### 日本語：未来を示し、そこから逆算して開発する

司令塔・黒田昌資は、暗号資産プロジェクトには「どのような未来を実現したいのか」
を明確に示し、その未来に向かって今の開発を積み重ねることが重要だと考えています。
ThreeCoreが目指すのは、DAT・EMA・CAWELONそれぞれに対応するエージェントが
分散型dAppゲームをプレイし、結果と収支を検証可能な形で記録しながら、
各トークンの利用価値と収益基盤を育てる未来です。
この構想を開発の指針とし、動くソフトウェアと実績で進捗を示します。

**まず最優先にするのは、ThreeCore自身の価値向上です。**
各エージェントのゲームプレイ能力、各公式サイトで公開するdApp、独立した資金・会計、
継続可能な収益基盤を整え、所定の条件を満たす実現純利益から自トークンの
買戻し・Burnにつなげることを目指します。価値向上を目標に掲げると同時に、
その根拠となる機能・利用・収支を積み上げます。

**CAWをファンとして応援する姿勢は変わりません。**
ただし、今すぐCAWを購入・Burnする方針ではありません。
CAW自体がゲームプラットフォームとして実際に稼働した段階で初めて、
CAWの購入・Burnによる支援を始め、ThreeCoreの発展と組み合わせて
双方の価値向上を目指すのが司令塔の構想です。
その段階の金額・配分・実行条件は別途定めます。
現在の開発や資金配分を、将来のCAW支援と混同しません。

AIエージェントが将来AGIエージェントへ発展する可能性も見据え、
判断部分の進歩を取り込める設計を目指します。
その一方で、資金上限・権限・記録の検証を維持し、
AGIの登場やCAWのゲーム基盤完成を待たず、現在できる開発を進めます。
将来像、現在の実装、確認できた実績をそれぞれ明示する方針です。

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

CMCのCAW紹介文にはゲーム内購入・報酬・取引への活用可能性が記載されています。
この公開説明を根拠に、司令塔はCAWのゲーム分野への発展とThreeCoreの
ゲームプレイ型エージェントとの親和性を見込んでいます。
司令塔個人の構想だけに基づく説明ではありません。
出典はCMCのプロジェクト紹介文であり、正式な技術白書や実装完了の証明とは区別します。

## Purpose

ThreeCore brings together DAT, EMA and CAWELON as three AI-agent-token identities.
The development goal is for each agent to specialize in playing decentralized dApp games within predefined
funding, permission and operating-policy limits, record realized profits and
losses, and use eligible realized earnings to buy back and burn its own token
under specified conditions. Fund movements and execution results are to be
published with supporting records so that third parties can verify them.

The three agents share a common system design, while funds, permissions and
accounting remain independent for each token. Direct dividends to holders are
not part of this design.

This is the target system definition, not evidence of a completed or operating
autonomous dApp system. Wallet count and structure, supported dApps, funding
limits, profit-allocation ratios, decision and settlement rules, profit
calculation, and failure/recovery behavior remain implementation design items.
No wallet count or allocation percentage is fixed by this definition.

The Base ERC-20 tokens and the agent/wallet software are separate components.
Holding or transferring a token does not itself execute an AI model, place an
order, or trigger an automatic distribution.

## Three personalities

| Symbol | Decision emphasis | Market illustrated in the six-minute film |
| --- | --- | --- |
| DAT | Profitability and earning potential | Decentralized sports betting |
| EMA | Practicality and sustainability | Decentralized prediction markets |
| CAWELON | Higher-return opportunities | Decentralized trading |

Each agent analyzes and acts; these are not three sequential departments for
selection, validation and distribution. The illustrated markets explain the
vision and do not establish that those integrations are already available or
permanently restrict each agent to one market.

## Dedicated-wallet development

The separate 120-second wallet special announces that dedicated-wallet coding
has begun. Its status is **development underway**, not a released wallet product.

Each agent is intended to have its own wallet/account arrangement. The number
and structure of those accounts remain design items. The target workflow is:

1. Begin with funded capital; record any exchange of existing assets.
2. Separate operating funds, the proposed position or stake, and reserves.
3. Analyze the opportunity and check the permitted amount and action.
4. Authorize and sign the transaction in the backend, then submit it to the
   selected application.
5. Track submission and settlement, with principal, costs and realized profit
   accounted for separately.
6. Apply the approved value-return policy to that agent's realized earnings.

The user experience is intended to avoid routine manual handling of seed phrases.
Backend signing still requires protected signing authority, authorization limits
and recovery arrangements; the film is not proof that those controls are deployed.

The wallet film illustrates a DEX swap to USDT followed by a sports-betting dApp.
Actual integrations must specify the network, asset, application and settlement
behavior before being described as supported.

## Value return

The films illustrate **own-token buyback and burn**:

- DAT earnings can support buying and burning DAT.
- EMA earnings can support buying and burning EMA.
- CAWELON earnings can support buying and burning CAWELON.

An external executor must perform a buyback and invoke the token's burn function.
The base tokens do not automatically generate profits or execute buybacks.
Buyback/burn and adding liquidity are distinct operations; any liquidity-return
implementation needs its own allocation policy and transaction records.
The films show successful examples, not realized project performance or a
guarantee of returns. “High dividends” describes CAWELON's narrative ambition,
not a direct-dividend policy or an implemented dividend entitlement.

## Implementation boundaries

| Component | Evidence / scope | Repository treatment |
| --- | --- | --- |
| DAT base token | Fixed-supply ERC-20, burn and permit; mainnet deployment records published | [DAT](https://github.com/0628DAO/DAT), `contracts/DATCore.sol` |
| CAWELON base token | Fixed-supply ERC-20, burn and permit; mainnet reference published | [CAWELON-Draft](https://github.com/0628DAO/CAWELON-Draft), `contracts/CAWELONCore.sol` |
| EMA base token | Fixed-supply ERC-20, burn and permit; mainnet reference published | [EMA-Draft](https://github.com/0628DAO/EMA-Draft), `contracts/EMACore.sol` |
| Dedicated wallets and application execution | Coding underway; films illustrate the target workflow | Publish and verify implementation, tests and deployment separately |
| Trading prototypes | Separate work; a trading prototype is not proof of the complete on-chain wallet workflow | Identify the canonical runtime source and release before integrating it here |
| CAW game gateway | Development / Unaudited / Not deployed to mainnet | Existing `game/` module in this repository |
| Historical DAT design | Earlier pre-deployment code and architecture | [DAT-Draft](https://github.com/0628DAO/DAT-Draft); not the live DAT source |
| CAW social-network lineage | Upstream-derived social-network software | [GilgameshCaw](https://github.com/0628DAO/GilgameshCaw); separate from ThreeCore wallet execution |

Repository names ending in `-Draft` do not establish deployment status. The
CAWELON and EMA repositories also retain historical root-level draft files;
their current token implementations are under `contracts/`.

The shared offline implementation is designated to `threecore/` in this
repository. Neither the CAW game gateway nor the base-token contracts are a
trading bot. Live adapters and execution services require the separate release
work documented in `THREECORE_RELEASE.md`.

## x402

x402 is not a prerequisite for the current ThreeCore trading and wallet direction.
Introduce an optional payment integration only when a specific external service
requires it. Base transactions, wallet signing, exchange execution, buybacks and
liquidity provision each need their own implementation; using Base does not by
itself require x402.

## Video references and interpretation

This direction is grounded in the production text for:

- The six 60-second chapters, combined into an approximately six-minute film:
  `THREECORE_REBUILT_SCRIPT.txt` and `THREECORE_REBUILT_PRODUCTION.json`.
- The independent 120-second dedicated-wallet special:
  `ThreeCore_Wallet_Special_Production.zip`, especially
  `development_stage.txt` and the English/Japanese entries in
  `locales_complete.json`.

The wallet special is separate from the six-chapter film. Its on-screen status
is “DEVELOPMENT UNDERWAY · WORKFLOW VISUALIZATION”.
The football final, election outcome, profitable BTC long and celebrations are
illustrations. The film's “BTC BUY LONG ×100” is not a current execution setting
or an instruction to deploy that leverage. Runtime settings belong to a separately
reviewed implementation, not to promotional narration.

## 日本語

ThreeCoreは、DAT・EMA・CAWELONそれぞれが独自の判断基準を持ち、
分散型dAppゲームに特化して、事前に定めた資金・権限・運用方針の範囲でプレイし、確定した損益を記録し、
所定の条件を満たした実現収益から自トークンの買戻しとBurnを実行するシステムを目指します。
資金移動と実行結果を根拠となる記録とともに公開し、第三者が検証できる設計とします。

3トークンは共通の仕組みを採用し、資金・権限・会計はそれぞれ独立させます。
ホルダーへの直接配当は想定しません。
これは開発するシステムの定義であり、自律運用の完成・本番稼働を示すものではありません。

- DAT：収益性重視。
- EMA：現実性・継続可能性重視。
- CAWELON：高リターン志向。

3者を「選ぶ担当・検証する担当・分配する担当」に分ける設計ではありません。
各エージェントが分析し、判断し、実行する方向です。

各エージェントに独立したウォレット／口座構成を設ける方針です。
ウォレット数・構成、利用dApp、金額上限、利益配分率、判断・決済条件、
利益計算、失敗時の処理・復旧方法は未確定の設計項目です。
120秒の特別編では、
コーディング開始・開発中であることを示しています。
用意した資金を交換し、運用資金・今回の投入額・予備資金を区分し、
許可された範囲でバックエンド署名とdAppへの送信を行い、
元本・費用・実現収益を記録する流れを描いています。
シードフレーズを利用者が日常的に扱わない設計でも、署名権限の保護は必要です。

映像の還元方法は、各自の実現収益による自トークンのBuyback & Burnです。
流動性への還流は別の操作・配分ルールとして扱います。
基本トークンだけでAI判断・取引・自動還元が動くわけではありません。

動画の市場・勝利・100倍取引は説明用の場面です。
現在の運用設定や実績、完成済みのdApp接続として扱いません。
Baseトークンの公開状況と、ウォレット／エージェントの開発状況を分けて示します。
x402は現段階の必須機能にせず、具体的な外部サービスの要件が生じた時に再検討します。
