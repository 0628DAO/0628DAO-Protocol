# Third-party notices and review status

This file is an inventory aid, not a final license report.

## Upstream CAW reference

`0628DAO/GilgameshCaw` is retained as the formal GitHub provenance record for
the upstream CAW line. The inspected upstream root did not contain a
repository-level license file and declared part of the project `UNLICENSED`.
No upstream implementation source is redistributed in this repository.

## Package dependencies

The JavaScript development dependencies are pinned in `package-lock.json` and
are used for local compilation, linting and tests. Their individual licenses
and transitive notices must be regenerated and reviewed before a distributable
or production release.

## Solidity interfaces

`ICawToken.sol` and `IGameAssetAdapter.sol` are narrow, separately written
interoperability interfaces. `CawGameGateway.sol`, its mocks and tests are
original integration-layer development code in this repository.

## Repository license

No license is granted for `0628DAO-Protocol` at this stage. A repository license
and complete third-party notice set must be approved before production release
or redistribution outside the permissions applicable to each component.
