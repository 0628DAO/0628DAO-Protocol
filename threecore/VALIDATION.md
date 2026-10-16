# Validation record — 2026-10-16

## Local execution

- Node.js v24.19.0.
- `npm run test:threecore`: 16 tests passed, zero failed.
- Existing CAW game suite: 15 tests passed, zero failed.
- Solidity compile: five source files, pinned solc 0.8.30.
- Static repository checks and Solhint passed.
- Full `npm run check` passed after dependency updates.
- `npm audit --audit-level=high`: zero reported vulnerabilities at validation time.
- Updated transitive packages: adm-zip 0.6.1, brace-expansion 5.0.12,
  fast-uri 3.1.8, http-cache-semantics 4.3.0, serialize-javascript 7.1.2.
- Demo: 15 synthetic events across DAT, EMA and CAWELON, replayed successfully.

Each simulated agent starts with 100 SIM_USDC, stakes 10, pays 0.1 entry fee,
receives 13 and pays 0.1 exit fee. Realized P&L is 2.8 SIM_USDC. A synthetic
buyback costs 1.3 plus 0.1 fee, leaving 101.4 cash. The mock acquisition and burn
of five own-tokens is illustrative only; it does not represent a market quote,
actual revenue, transaction or on-chain supply reduction.

## Read-only Base Mainnet observation

`npm run preflight:threecore` succeeded against the public Base RPC:

- Chain ID: `8453`.
- Block: `52665653`.
- Block hash: `0x5962f115ff316e125f20b4db1e83c973fd9cb12a60cc726e8e89f0baf09aba6e`.
- All three contracts returned their expected symbol and 18 decimals.

| Token | Observed total supply (whole tokens) | Runtime code hash |
| --- | --- | --- |
| DAT | 1,000,000,000 | `0xa2b1eda6cdffce80a0a918e817a9beae082f41fb6ca59f75270ca89296f5689f` |
| EMA | 777,000,000 | `0x2e973da5cac7a7236f02f0f9765bfc055c0cfd3725a2ee21c402cf722319ef39` |
| CAWELON | 420,000,000,000,000 | `0xea1c982d93f44441adb62aa21a0db25cfa3bc0924ef0f7622a79a24c84063ee6` |

Addresses are recorded in `config/base-mainnet.json`. These are RPC observations,
not independent source/bytecode verification. No signer was created and no
transaction was sent. This check establishes neither the availability of an
agent wallet nor readiness for live trading, buybacks or burns.
