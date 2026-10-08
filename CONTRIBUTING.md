# Contributing

## Status and scope

This repository is development-only, unaudited and not deployed to mainnet.
Contributions must remain within the common 0628DAO protocol scope described in
`ARCHITECTURE.md`.

## Required workflow

1. Create a focused feature branch from `main`.
2. Do not copy code from an upstream or third-party project without a verified
   license and required notices.
3. Do not add production addresses, RPC endpoints, private keys, seed phrases,
   signing jobs or deployment automation.
4. Keep product-specific CAWELON, EMA and DAT changes out of the common layer.
5. Update tests, threat models and document provenance when behavior or source
   assumptions change.
6. Run `npm ci --ignore-scripts` followed by `npm run check`.
7. Submit the change through a pull request and record the reason, source commit
   and verification result.

## Historical drafts

Do not direct changes, CI, documentation or security settings to
`CAWELON-Draft`, `EMA-Draft` or `DAT-Draft`. Those repositories are preserved
as historical provisional records.

## Production boundary

Testnet or mainnet deployment, real signing, privilege changes and movement of
funds require a separate, explicit human decision after the applicable inputs
and review evidence are complete.
