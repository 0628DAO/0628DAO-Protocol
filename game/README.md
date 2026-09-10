# CAW game integration module

> **Development / Unaudited / Not deployed to mainnet**

This module turns CAW's game-use possibility into a concrete, testable
integration layer. It never changes the CAW token. A deployment supplies a CAW
ERC-20 address and a game-owned item adapter to `CawGameGateway`.

## Layout

```text
game/
├── contracts/CawGameGateway.sol
├── interfaces/ICawToken.sol
├── interfaces/IGameAssetAdapter.sol
├── test/CawGameGateway.test.js
├── test/mocks/
├── examples/local-flow.js
└── THREAT_MODEL.md
```

## Implemented flows

### Player identity and balance

Each wallet can register one non-zero `bytes32` player ID, and each player ID
can belong to only one wallet. `cawBalanceOf` and `cawAllowanceForGateway` expose
the CAW reads a game UI needs.

### Rewards

Anyone can fund the reward pool after approving CAW. An owner-approved operator
records a unique reward ID. The assigned player can claim that ID exactly once.
Reserved rewards cannot be withdrawn as excess CAW.

### Item purchases

A registered player approves CAW and creates a unique purchase request. CAW is
held in escrow. An operator completes the request by atomically calling the
game asset adapter and paying the treasury, or the player/operator cancels and
refunds the escrow.

### Player trades

A registered item owner creates a time-limited offer. An optional designated
buyer can be set. Acceptance atomically transfers CAW from buyer to seller and
asks the adapter to transfer the item. No platform fee is charged.

## Trust and integration requirements

- The supplied token must exhibit standard, fee-free ERC-20 transfer behavior.
- The game must implement `IGameAssetAdapter` and authorize the gateway.
- Owner and operator keys are trusted and need production-grade controls.
- The gateway must be funded before rewards are recorded.
- Players must approve only the CAW amount needed for the intended operation.
- Events should be indexed by the game backend for a complete operation trail.

The detailed trust boundaries, mitigations and residual risks are recorded in
[`THREAT_MODEL.md`](THREAT_MODEL.md).

## Deliberately not implemented

- Mainnet/Testnet addresses or deployment scripts
- private-key or wallet custody
- game-specific item metadata or pricing policy
- dispute resolution, cross-chain transfer, fees or tokenomics
- upgradeability or proxy administration

These are withheld until threat modeling, independent audit and explicit human
approval are complete.
