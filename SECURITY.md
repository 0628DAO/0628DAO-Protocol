# Security policy

## Status

This repository is **Development / Unaudited / Not deployed to mainnet**.
Do not use the contracts with real CAW or other assets.

## Reporting

Use GitHub's private security-advisory channel for this repository when it is
available. Do not publish exploitable details in a public issue. A public issue
may be opened only to request a private contact channel and must omit the
vulnerability details.

## Trust model

- The owner assigns game operators and can pause new activity.
- Operators can record rewards and settle or cancel item purchases.
- The game asset adapter is trusted to deliver and transfer game items.
- Players explicitly approve CAW transfers to the gateway.
- Two-step handovers reduce accidental owner or treasury replacement.
- Reserved rewards and purchase escrow cannot be withdrawn as excess funds.

The operator and asset-adapter roles remain trusted components. Production use
requires independent review, role-key operational controls, invariant testing
and a deployment-specific threat model.
