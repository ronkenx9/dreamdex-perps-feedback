# "unknown symbol … call loadMarkets() first" is thrown even after loadMarkets(), and symbol lookup is silently case-sensitive

Severity: normal
Area: SDK

When the exchange gets a symbol it doesn't know, it always throws `InvalidInputError: unknown symbol X — call loadMarkets() first`, even when `loadMarkets()` has already run and the markets are loaded. The real cause is usually a casing difference (`USDSO` vs `USDso`) or the app's display name (`BTC-PERP`, which the bot kit's `PERP_SYMBOL` also uses). The message sends developers to the wrong fix. The server-side filters are case-sensitive in the same way: `listPerpMarkets({ baseSymbol: "btc" })` and `listPerpMarkets({ quoteSymbol: "USDSO" })` return `[]` without any warning.

## Steps to reproduce

`cd repro && npx tsx edge.ts` (it calls `await exchange.loadMarkets()` first, then):

1. `exchange.fetchTicker("BTC/USDSO:USDSO")`
2. `exchange.fetchTicker("BTC-PERP")`
3. `exchange.fetchTicker("BTC/USDso")`
4. `client.listPerpMarkets({ baseSymbol: "btc" })`, `client.listPerpMarkets({ quoteSymbol: "USDSO" })`, `client.listPerpMarkets({ quoteSymbol: "USDso" })`

## Expected

After `loadMarkets()` the error names the real problem and ideally suggests the closest match, for example `unknown symbol "BTC/USDSO:USDSO"; did you mean "BTC/USDso:USDso"?`. It only says "call loadMarkets() first" when markets really are not loaded. It would also help to resolve symbols case-insensitively (and accept the app name `BTC-PERP`), or document that they are case-sensitive.

## Actual

```
fetchTicker BTC/USDSO:USDSO -> InvalidInputError | unknown symbol BTC/USDSO:USDSO — call loadMarkets() first
fetchTicker BTC-PERP        -> InvalidInputError | unknown symbol BTC-PERP — call loadMarkets() first
fetchTicker BTC/USDso       -> InvalidInputError | unknown symbol BTC/USDso — call loadMarkets() first
listPerpMarkets baseSymbol btc     -> 0 rows
listPerpMarkets quoteSymbol USDSO  -> 0 rows
listPerpMarkets quoteSymbol USDso  -> 21 rows
```

## Evidence

`evidence/edge-cases.txt`

## Environment

- SDK: `@somnia-chain/markets-sdk` 0.32.1 (the version the dev docs name), viem 2.57.7, Node 20.19.2, Linux
- Network: Somnia Tokyo testnet (Hideki, chain 50383), RPC `https://api.hideki2.infra.testnet.somnia.network`, indexer `https://hideki-dev.smk.somnia.host/v1/graphql`
- Wallet: `0xAF3E4FE0eB3dB2a6dEC0649C0Ce98518fF01560e` (the bounty test wallet; read-only calls, no transactions)
- Date: 2026-10-20 (UTC)
