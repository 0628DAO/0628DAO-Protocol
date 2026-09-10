# Game gateway threat model

> **Development / Unaudited / Not deployed to mainnet**

## Protected assets and invariants

- A reward ID can move from `Pending` to `Completed` or `Cancelled` only once.
- CAW reserved for pending rewards or purchases is never owner-withdrawable.
- A purchase pays the treasury only when the item adapter call succeeds.
- A trade transfers CAW and the item in one transaction or reverts both.
- A wallet and player ID form a unique one-to-one registration.

## Trust boundaries

| Component | Trust assumption | Boundary control |
|---|---|---|
| CAW token | Standard, fee-free ERC-20 behavior | Constructor injection; exact balance-delta checks |
| Game adapter | Correctly reports and transfers item ownership | Narrow interface; ownership checks; atomic calls |
| Owner | Manages operators and emergency pause | Two-step owner handover |
| Operator | Records rewards and settles purchases | Explicit allow-list; events; per-reward limit |
| Player | Controls their own wallet | `msg.sender`, approvals, unique operation IDs |

## Implemented abuse controls

- Reentrancy guard surrounds every flow that transfers CAW.
- State is finalized before external calls, and any downstream failure reverts
  the complete transaction.
- Unique IDs block reward replay, duplicate purchases and duplicate trades.
- Reward grants require existing uncommitted funding and a configurable cap.
- Purchase cancellation and trade cancellation have explicit authorization.
- Designated buyers and expiry bounds limit unwanted trade acceptance.
- Pause blocks new value-bearing activity while preserving refunds and
  administrative cancellation paths.
- Low-level ERC-20 calls support tokens with optional Boolean return values but
  reject failed calls and non-exact balance movement.

## Residual risks before production

- Owner, operators and the asset adapter are trusted and could act maliciously.
- Player registration is permanent in this first version; recovery and wallet
  rotation are not implemented.
- There is no dispute system, oracle, pricing policy, rate limit or sanctions
  policy.
- Timestamp expiry has normal block-timestamp tolerance and is not suitable for
  sub-minute fairness guarantees.
- No independent audit, formal verification, fuzzing or production gas study
  has been completed.

Do not add a production address, RPC endpoint, signing key or deployment job to
this module until an independent review and explicit human approval occur.
