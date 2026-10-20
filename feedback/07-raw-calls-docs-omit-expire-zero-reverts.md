# Raw and operator calls docs don't say that `expireTimestampNs = 0` reverts `OrderAlreadyExpired()`

Severity: normal
Area: docs

The dev docs section "Raw and operator calls" lists the `placeOrderFor` signature and "three things [that] trip people up": base decimals, gas and IOC no-fill. It never explains `expireTimestampNs`. On many venues 0 means "good till cancel", but on a perp pool `expireTimestampNs = 0` reverts with `OrderAlreadyExpired()` (`0x3154078e`). The receipt gives no reason, as the same docs page notes. The spot bot kit has to guard against this explicitly in `packages/core/src/gotchas.ts` ("0 is NOT 'no expiry' — it is rejected"), so it does trip people up. The perps page just doesn't mention it.

## Steps to reproduce

`cd repro && npx tsx sim.ts` runs `eth_call` (simulation only, nothing is sent) of `PerpPool.placeOrder` on BTC-PERP `0x4181dd08e73bbcdd1ba3e615a18f6abd941b94c0` from a funded account (`0x1E3eDE6E34143efb8FbC16f1659e1a0b790FDB45`). The order is a resting bid with qty `13000` (= minQuantity) at 70000.0, gas 10,000,000:

1. with `expireTimestampNs = 0`
2. with `expireTimestampNs = 2^64-1`

## Expected

The docs say what to pass for "no expiry" (for example a far-future value, or `now + duration` in ns) and list `OrderAlreadyExpired` with the other pitfalls.

## Actual

```
expireTimestampNs = 0        -> revert 0x3154078e  OrderAlreadyExpired()
expireTimestampNs = 2^64-1   -> OK (true, 11584555278289604914297)
```

(`0x3154078e` decoded with `toFunctionSelector("OrderAlreadyExpired()")` and found in the SDK's `contractErrorsAbi`.)

## Evidence

`evidence/placeorder-simulation.txt`. The first run (expiry 0) reverted every case with `0x3154078e`, including the valid one. The second run (far-future expiry) is the one shown in that file.

## Environment

- SDK: `@somnia-chain/markets-sdk` 0.32.1 (the version the dev docs name), viem 2.57.7, Node 20.19.2, Linux
- Network: Somnia Tokyo testnet (Hideki, chain 50383), RPC `https://api.hideki2.infra.testnet.somnia.network`, indexer `https://hideki-dev.smk.somnia.host/v1/graphql`
- Wallet: `0xAF3E4FE0eB3dB2a6dEC0649C0Ce98518fF01560e` (the bounty test wallet; read-only calls, no transactions)
- Date: 2026-10-20 (UTC)
