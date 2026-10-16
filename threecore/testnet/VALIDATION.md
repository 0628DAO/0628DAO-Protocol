# Training dApp validation — 2026-10-16

## Completed

- Solidity 0.8.30 compilation and Solhint checks passed; largest deployed code is
  TrainingFactory at 12,385 bytes, below the EIP-170 size bound.
- Ten training-contract tests passed in local Hardhat EDR: complete DAT / EMA /
  CAWELON lifecycles, unsupported-chain rejection, loss carryforward,
  principal-burn rejection, access controls, pause, reserve/stake limits,
  command and round replay rejection, funding separation, one deployment per
  owner/identity, burn replay and native-currency transfer rejection.
- Existing suites: 19 ThreeCore simulation tests and 15 CAW game tests passed.
- Full `npm run check` passed, including local build and npm audit (zero reported
  vulnerabilities at check time).
- Three distinct site bundles built from the pinned ethers distribution.
- UI controllers executed against a local EVM with a stub DOM. For every agent,
  initial 100 test credits became 101 after a correct play, 100.5 after burning
  0.5 eligible credits, then 99.5 after an incorrect play. Cumulative gameplay P&L
  was zero and the burn record remained 0.5. Confirmed receipts were recorded.
- Public Base Sepolia RPC returned chain ID 84532. The CLI read-only check passed
  using native-fetch proxy support. Dedicated signer available: false.

## Not completed

- No public testnet contract deployment or gameplay transaction has been sent.
- No production domain has been updated.
- No visual browser QA was completed: the environment lacked a browser binary
  and browser installation failed. The controller check is not a screenshot test.
- No external game, AI model, real-token buyback or economic yield was verified.

This evidence establishes local EVM and controller behavior, not public-testnet
operation. Public deployment requires a dedicated signing wallet and test ETH.
