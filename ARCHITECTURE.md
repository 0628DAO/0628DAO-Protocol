# Architecture

> **Development / Unaudited / Not deployed to mainnet**

## Scope

`0628DAO-Protocol` owns reusable integration modules and their verification
rules. It does not own the CAW token contract and it does not replace the
formal CAWELON, EMA or DAT product repositories.

## Current module map

| Layer | Path | Responsibility |
|---|---|---|
| Protocol contract | `game/contracts/CawGameGateway.sol` | CAW-funded rewards, item purchase escrow and atomic player trades |
| Token boundary | `game/interfaces/ICawToken.sol` | Narrow ERC-20-compatible interoperability surface |
| Game boundary | `game/interfaces/IGameAssetAdapter.sol` | Game-owned item delivery and ownership transfer |
| Verification | `game/test/`, `scripts/` | In-memory tests, local compiler and repository invariants |
| Project records | `docs/` | Machine-readable public repository state and lineage |

## Separation rules

1. Upstream CAW source is referenced through `0628DAO/GilgameshCaw`; it is not
   copied into this repository because the recorded upstream tree has no
   repository-level license grant.
2. The common protocol depends only on narrow interfaces and constructor-
   supplied addresses. No production address is committed.
3. Product-specific token economics, supply, chain selection and deployment
   configuration belong in the future formal CAWELON, EMA and DAT repositories.
4. The historical `*-Draft` repositories remain unchanged and are never used
   as CI or deployment targets.
5. Private planning documents and their access-bearing references are not
   published from this repository. A private document cannot silently become
   an executable requirement without an approved public specification change.

## Verification boundary

The current checks cover deterministic local compilation, Solhint, unit tests,
repository policy checks, public metadata validation and high/critical npm
advisories. They do not constitute an independent audit, formal verification,
fuzzing, invariant testing, fork testing, gas analysis or deployment approval.
