# 0628DAO Protocol

> **Development / Unaudited / Not deployed to mainnet**

`0628DAO-Protocol` is the public development repository for integration modules
maintained by 0628DAO. The first module makes CAW usable from a game without
changing the CAW token contract.

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
