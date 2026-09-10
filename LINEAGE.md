# Lineage and code boundary

## Confirmed lineage

**CAW → 0628DAO/GilgameshCaw → 0628DAO → CAWELON · EMA · DAT**

The GitHub fork used as the public CAW reference is:

| Field | Recorded value |
|---|---|
| 0628DAO fork | `https://github.com/0628DAO/GilgameshCaw` |
| Direct parent | `https://github.com/GilgameshCaw/Caw` |
| Fork branch | `master` |
| Recorded HEAD | `e2074718bcea293726ddfcf8764e1499e7b9217c` |
| Verification date | 2026-09-10 UTC |

At verification time, the fork and direct parent had the same `master` HEAD.

## Original 0628DAO game code

Everything under `game/`, together with this repository's test and build
scripts, was written as a separate 0628DAO integration layer. It does not copy,
patch or replace the CAW token contract.

The integration boundary is the small `ICawToken` ERC-20-compatible interface.
At deployment time a reviewed CAW token address would be provided to the
gateway constructor. Tests provide a mock address instead.

## Upstream boundary

The recorded upstream tree had no root `LICENSE`, `COPYING` or `NOTICE` file,
and its `client/package.json` declared `UNLICENSED`. For that reason this
repository does not redistribute upstream CAW source. The formal GitHub fork is
retained as the provenance record, and only interface-level interoperability is
implemented here.

The existence of a public fork is not represented as a license grant,
endorsement, partnership or audit.
