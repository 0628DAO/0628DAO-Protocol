# Training dApp validation — 2026-10-16

## Follow-up — 2026-10-17

- Public Base Sepolia factory and three independent agent/game/credit sets were
  deployed using the browser wallet. Each agent completed one positive play and
  one 0.5-credit profit burn. Public evidence is recorded under deployments/.
- MetaMask relayed transactions use an outer sender/recipient different from the
  owner/agent. Release verification now authenticates the factory-bound agent's
  used-command event and matching game/credit outcome, rather than assuming a
  direct outer call. Local tests reject missing agent, game and credit events.

- Added a read-only website release gate. A real local EVM fixture verifies all
  three agent bindings and six positive-play/profit-burn receipts; eight invalid
  deployment reports are rejected. Successful receipts must contain the matching
  agent outcome event, and play must have positive credit P&L. The gate rejects
  missing public deployment records before creating a release directory.
- Public bundles are staged separately and only promoted after verification;
  undeployed preview bundles display an explicit status label. Public chain
  deployment and hosting publication have not occurred. In-app wallet connection
  was attempted with authorization; the page reported no browser test wallet.

- Failed factory replacement now clears the previous factory, agent, game and
  credit bindings, resets displayed balances/challenge, and disables contract
  actions. Invalid addresses and addresses without matching bytecode are tested
  for all three agents; reattaching the valid factory restores the existing state.
- Windows checks normalize workflow line endings and import the UI controller
  module through a file URL, avoiding platform-specific check failures.
- All three built pages were opened in the desktop in-app browser. Agent identity,
  intended domain, training disclosure and initially disabled transaction controls
  were verified, and screenshots saved. This is initial rendering QA only;
  browser-wallet connection and signed browser gameplay remain unverified.

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
- The original 2026-10-16 run lacked browser QA. Initial page rendering was
  checked on 2026-10-17 as described above; wallet interaction is still outstanding.
- No external game, AI model, real-token buyback or economic yield was verified.

This evidence establishes local EVM and controller behavior, not public-testnet
operation. Public deployment requires a dedicated signing wallet and test ETH.
