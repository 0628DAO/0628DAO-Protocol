# ThreeCore — project direction and dedicated wallets

Updated: 2026-10-05 (JST)

## Purpose

ThreeCore brings together DAT, EMA and CAWELON as three AI-agent-token identities.
The development goal is for each agent to analyze opportunities, make its own
decisions, execute through its dedicated wallet within authorized limits, account
for results, and use its own realized earnings to support value return to its own
token holders.

The Base ERC-20 tokens and the agent/wallet software are separate components.
Holding or transferring a token does not itself execute an AI model, place an
order, or trigger an automatic distribution.

## Three personalities

| Symbol | Decision emphasis | Market illustrated in the six-minute film |
| --- | --- | --- |
| DAT | Profitability and earning potential | Decentralized sports betting |
| EMA | Practicality and sustainability | Decentralized prediction markets |
| CAWELON | Higher returns to holders | Decentralized trading |

Each agent analyzes and acts; these are not three sequential departments for
selection, validation and distribution. The illustrated markets explain the
vision and do not establish that those integrations are already available or
permanently restrict each agent to one market.

## Dedicated-wallet development

The separate 120-second wallet special announces that dedicated-wallet coding
has begun. Its status is **development underway**, not a released wallet product.

The intended architecture provides one dedicated wallet per agent:

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
not an implemented dividend entitlement.

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

This documentation does not designate the CAW game gateway or the base-token
contracts as the home for a trading bot. Future executable work needs a confirmed
source repository, base commit and scope.

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
機会の分析・選択・実行・収益の確認・自トークンへの価値還元を目指す開発です。

- DAT：収益性重視。
- EMA：現実性・継続可能性重視。
- CAWELON：ホルダーへの高い還元を重視。

3者を「選ぶ担当・検証する担当・分配する担当」に分ける設計ではありません。
各エージェントが分析し、判断し、実行する方向です。

専用ウォレットは各エージェントに1つずつ。120秒の特別編では、
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
