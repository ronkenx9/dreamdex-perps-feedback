# SDK Perps guide describes a stale testnet: "BTC and ETH only" and "10 pools, four of them restricted SBTC* arena markets"

Severity: normal
Area: docs

Two statements in the SDK Perps guide (`docs/PERPS.md` in `@somnia-chain/markets-sdk@0.32.1`) no longer match the chain:

- "Perps are live on testnet: `BTC/USDSO:USDSO` and `ETH/USDSO:USDSO`"
- Under market discovery: "Testnet today has 10 pools, four of them restricted `SBTC*` arena markets."

The trader docs list 21 markets, and the factory has 21 pools, all registered and none restricted. A builder reading the guide would wrongly expect restricted pools to filter out and only two markets to support.

## Steps to reproduce

```ts
const cfg = await client.getPerpSystemConfig("0x478769E1177C0773c43A593DCCc4Ad15F15F1394");
const st = await client.listPerpPoolStatuses({ factory: cfg.perpPoolFactory });
console.log(st.length, st.filter(s => s.restricted).length, st.filter(s => !s.registered).length);
console.log((await client.listTradeablePerpPools({ factory: cfg.perpPoolFactory })).length);
console.log((await client.listPerpMarkets()).length);
```

## Expected

The guide either states the current inventory or, better, gives no number and points to `listPerpPoolStatuses` and `listTradeablePerpPools`.

## Actual

```
pools 21 restricted 0 unregistered 0
tradeable 21 indexed markets 21
```

There are no `SBTC*` markets. The base symbols are ZRO, LIT, VVV, 1000PEPE, PUMP, ZEC, TAO, WLD, NEAR, XLM, AVAX, LINK, SUI, ADA, BNB, DOGE, XRP, HYPE, SOL, ETH and BTC.

## Evidence

`evidence/sdk-read-probe.txt` (lines `listPerpPoolStatuses` / `listTradeablePerpPools`) and `evidence/market-params-onchain.txt` (all 21 pools read on-chain).

## Environment

- SDK: `@somnia-chain/markets-sdk` 0.32.1 (the version the dev docs name), viem 2.57.7, Node 20.19.2, Linux
- Network: Somnia Tokyo testnet (Hideki, chain 50383), RPC `https://api.hideki2.infra.testnet.somnia.network`, indexer `https://hideki-dev.smk.somnia.host/v1/graphql`
- Wallet: `0xAF3E4FE0eB3dB2a6dEC0649C0Ce98518fF01560e` (the bounty test wallet; read-only calls, no transactions)
- Date: 2026-10-20 (UTC)
