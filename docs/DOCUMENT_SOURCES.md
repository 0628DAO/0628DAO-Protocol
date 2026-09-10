# Governing-document source registry

Verified through the authenticated Google Drive source on 2026-09-10 at
17:02:18 UTC. This public registry deliberately omits access-bearing Drive URLs
and file IDs. It records provenance without changing or disclosing source
sharing permissions.

## Current Manifesto

| Language | Source | Version | Document date | Drive modified (UTC) | Review status |
|---|---|---:|---|---|---|
| Japanese | `THE 0628DAO MANIFESTO Version 4.0（日本語）` | 4.0 | 2026-09-08 | 2026-09-08 04:17:00.930 | Current |
| English | `THE 0628DAO MANIFESTO Version 4.0 (English)` | 4.0 | 2026-09-08 | 2026-09-08 04:17:01.337 | Current |

Manifesto v4.0 defines AIDD as the construction layer and 0628DAO as the
governance OS. Its controlling responsibility boundary is: AI executes;
humans retain specification, verification and final shipment responsibility.

## White Paper sources

| Product | Language | Source | Version | Document date | Drive modified (UTC) | Review status |
|---|---|---|---:|---|---|---|
| CAWELON | Japanese | `CAWELON(NEO) White Paper` | 0.1 (Draft) | 2026-06-22 | 2026-06-22 06:54:28.338 | Reference only |
| EMA | Japanese | `EMA(NEO)White Paper(日本語)` | 1.0 | 2026-06-22 | 2026-06-22 06:53:54.035 | Reference only |
| DAT | Japanese | `0628DAT white paper(日本語)` | 1.7 (Full-fledged revision) | 2026-07-18 | 2026-07-18 07:42:58.467 | Reference only |
| DAT | English candidate | `0628DAT white paper(English)` | Body declares 3.0 | 2026-06-23 | 2026-06-22 22:26:37.885 | Rejected as DAT source |

## Open source-document issues

- CAWELON v0.1 still contains unspecified supply, network and contract fields.
- CAWELON, EMA and DAT Japanese sources refer to Manifesto v2.9 and require
  reconciliation with the current v4.0 human-accountability boundary.
- The EMA source author line says `Masashi Kurod`; it requires correction at
  the source before it can be promoted to current.
- The DAT Japanese source combines Solidity material and White Paper narrative;
  they require separation and formal specification review.
- The English file titled `0628DAT white paper(English)` retrieved as THE
  0628DAO MANIFESTO Version 3.0. It is not accepted as an English DAT White
  Paper source.

Until these issues are resolved, White Paper material is reference-only and
cannot override reviewed code, tests, security controls or Manifesto v4.0.

The machine-readable equivalent is
[`PROJECT_METADATA.json`](PROJECT_METADATA.json).
