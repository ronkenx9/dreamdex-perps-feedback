# SDK Perps guide snippets use market names that don't exist on testnet (`BTC/USDSO:USDSO`, `baseSymbol: "WBTC"`), so copy-pasted code fails

Severity: normal
Area: docs

The SDK's Perps guide (`docs/PERPS.md` shipped in `@somnia-chain/markets-sdk@0.32.1`, and its page under the Somnia Markets TypeScript docs) uses market names that don't match the live testnet:

- Line 1: "Perps are live on testnet: `BTC/USDSO:USDSO` and `ETH/USDSO:USDSO`"
- Quick start: `exchange.depositMargin("BTC/USDSO:USDSO", 1_000)`, `exchange.createOrder("BTC/USDSO:USDSO", ...)` and `exchange.fetchFundingRate("BTC/USDSO:USDSO")`
- One-shot reads: `client.listPerpMarkets({ baseSymbol: "WBTC", limit: 20 })`, followed by `client.getPerpMarket(perps[0].id)`

The real ccxt symbol is `BTC/USDso:USDso` (mixed case), and the base symbol is `BTC`, not `WBTC`. The "How to get testnet funds" page already uses the correct `BTC/USDso:USDso`, so the two pages disagree.

## Steps to reproduce

`cd repro && npm i && npx tsx edge.ts`. After `await exchange.loadMarkets()` it calls:

1. `exchange.fetchTicker("BTC/USDSO:USDSO")`
2. `exchange.fetchTicker("BTC/USDso:USDso")`
3. `client.listPerpMarkets({ baseSymbol: "WBTC" })`
4. `client.listPerpMarkets({ baseSymbol: "BTC" })`

## Expected

The guide's snippets run as written on the network the guide describes.

## Actual

```
fetchTicker BTC/USDSO:USDSO  -> InvalidInputError: unknown symbol BTC/USDSO:USDSO — call loadMarkets() first
fetchTicker BTC/USDso:USDso  -> OK {"symbol":"BTC/USDso:USDso","last":81516.8,"markPrice":81313.77,...}
listPerpMarkets({baseSymbol:"WBTC"}) -> []
listPerpMarkets({baseSymbol:"BTC"})  -> [1 market, pool 0x4181dd08e73bbcdd1ba3e615a18f6abd941b94c0]
```

The quick start throws on its first call. The one-shot example gets an empty array and then crashes at `perps[0].id` (`TypeError: Cannot read properties of undefined`).

## Evidence

- `evidence/edge-cases.txt` (lines `fetchTicker ...` and `listPerpMarkets ...`) and `evidence/guide-snippets.txt` (`repro/wbtc.ts` runs the guide snippets exactly as written)
- `exchange.markets` keys after `loadMarkets()` include `BTC/USDso:USDso`, `ZRO/USDso:USDso` and so on. None are upper-case `USDSO`.

## Environment

- SDK: `@somnia-chain/markets-sdk` 0.32.1 (the version the dev docs name), viem 2.57.7, Node 20.19.2, Linux
- Network: Somnia Tokyo testnet (Hideki, chain 50383), RPC `https://api.hideki2.infra.testnet.somnia.network`, indexer `https://hideki-dev.smk.somnia.host/v1/graphql`
- Wallet: `0xAF3E4FE0eB3dB2a6dEC0649C0Ce98518fF01560e` (the bounty test wallet; read-only calls, no transactions)
- Date: 2026-10-20 (UTC)
