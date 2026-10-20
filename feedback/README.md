# dreamDEX Perps Builder Bounty: feedback

Every finding below was reproduced on Somnia Tokyo testnet (Hideki, chain 50383) with `@somnia-chain/markets-sdk@0.32.1` or the dreamDEX bot kit at commit `2579866`. The scripts are in `../repro` (read-only; the `eth_call` simulations send nothing), and the raw output is in `../evidence`.

| # | Title | Severity | Area |
| --- | --- | --- | --- |
| 01 | previewPerpOrderMargin returns `sufficient: true` for orders the pool always rejects | major | SDK |
| 02 | Perps guide snippets use symbols that don't exist (`BTC/USDSO:USDSO`, `WBTC`) | normal | docs |
| 03 | "unknown symbol … call loadMarkets() first" after loadMarkets; case-sensitive lookup | normal | SDK |
| 04 | Perps guide market inventory is stale (2 markets / 10 pools / 4 restricted vs 21 / 0) | normal | docs |
| 05 | Paper-USDso allowlist: docs say 6 markets blocked, chain allows all 21 | major | docs |
| 06 | OI caps 2x–4x off on 6 markets; "a tenth of OI cap" rule wrong | normal | docs |
| 07 | Raw-call docs omit that `expireTimestampNs = 0` reverts `OrderAlreadyExpired()` | normal | docs |
| 08 | Bot kit installs SDK 0.31.0, which lacks the voucher and other calls the 0.32.1 docs use | major | SDK |
| 09 | perp-* strategies exit in DRY_RUN on an empty bank; message ignores voucher claim | normal | SDK |
