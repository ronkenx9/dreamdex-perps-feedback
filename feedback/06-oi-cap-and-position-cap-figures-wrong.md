# Docs' open-interest caps are 2x to 4x off on six markets, and "a tenth of OI cap on most markets" is wrong for the per-account cap

Severity: normal
Area: docs

1. The market table in Perps on Testnet gives an "Open interest cap" per market. On-chain `maxOpenInterest` (`client.getPerpRiskParams(pool)`) matches for 15 markets but not for these six:

| Market | Docs | On-chain `maxOpenInterest` | Ratio |
| --- | --- | --- | --- |
| BTC-PERP | 246.81545 BTC | 493.6309 BTC | 2x |
| ETH-PERP | 3,995.6125 ETH | 7,991.225 ETH | 2x |
| HYPE-PERP | 23,812.72 HYPE | 47,625.44 HYPE | 2x |
| SOL-PERP | 47,654.44 SOL | 95,308.88 SOL | 2x |
| XRP-PERP | 344,632 XRP | 1,378,528 XRP | 4x |
| NEAR-PERP | 250,410 NEAR | 1,001,640 NEAR | 4x |

2. Both doc pages state the per-account rule: "A single account is capped at a tenth of it on most markets" (trader docs) and "Each account has a position cap per market, a tenth of the market's open interest cap on most markets" (dev docs, Common pitfalls). On-chain `maxPositionSize / maxOpenInterest` is 0.1 on only 7 of 21 markets. It is 0.2 on 8 (XLM, AVAX, LINK, SUI, ADA, BNB, DOGE, BTC), 0.05 on 5 (NEAR, XRP, HYPE, SOL, ETH) and 1.0 on ZEC (cap 420 = 420). A bot that sizes from the documented rule is off by up to 10x, either way.

## Steps to reproduce

`cd repro && npx tsx table.ts` prints, for every market from `client.listPerpMarkets()`, `getPerpRiskParams(pool).maxOpenInterest` and `maxPositionSize` in human units, plus their ratio (`posOverOI`).

## Expected

The table matches `maxOpenInterest`. The per-account rule either matches the chain or the docs say to read `getPerpRiskParams(pool).maxPositionSize` (or `getMaxPerpOrderSize().maxPositionSize`) rather than derive it.

## Actual

See the table above. The full output is in `evidence/market-params-onchain.txt` (columns `maxOI`, `maxPos`, `posOverOI`). Tick, lot, minimum size, decimals and IM/MM in the docs all matched the chain. Only the OI caps and the cap rule are off.

## Evidence

`evidence/market-params-onchain.txt`

## Environment

- SDK: `@somnia-chain/markets-sdk` 0.32.1 (the version the dev docs name), viem 2.57.7, Node 20.19.2, Linux
- Network: Somnia Tokyo testnet (Hideki, chain 50383), RPC `https://api.hideki2.infra.testnet.somnia.network`, indexer `https://hideki-dev.smk.somnia.host/v1/graphql`
- Wallet: `0xAF3E4FE0eB3dB2a6dEC0649C0Ce98518fF01560e` (the bounty test wallet; read-only calls, no transactions)
- Date: 2026-10-20 (UTC)
