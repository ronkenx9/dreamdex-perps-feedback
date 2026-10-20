# Trader docs say paper USDso can't open 1000PEPE, LIT, PUMP, VVV, ZEC or ZRO, but the MarginBank allows the voucher on all 21 markets

Severity: major
Area: docs

The market table in Perps on Testnet (`/docs/trading/perps-testnet`) has a "Paper USDso" column with **No** for 1000PEPE-PERP, LIT-PERP, PUMP-PERP, VVV-PERP, ZEC-PERP and ZRO-PERP. The dev docs say "Increasing a position in a market outside the credit's allowlist reverts, and `getMaxPerpOrderSize` reports it as `limitedBy: "voucherBlocked"`." The bot kit's `perp-core` has a dedicated voucherBlocked message as well.

On-chain, `MarginBank.isVoucherMarketAllowed(pool)` returns `true` for all six of those pools (and for all 21). For an account holding a live, unexpired voucher, `getMaxPerpOrderSize` reports those markets as placeable, limited only by `initialMargin`.

One of the two is wrong. Either the docs are stale (the restriction was lifted), or the allowlist the docs describe is not configured on the MarginBank. If it's the second, Perps Arena accounts can open positions with competition credit on the five-times-leveraged markets the rules exclude, including LIT with funding around -48% APR. I rated this major for that reason: it is a competition rule that is either misdocumented or not enforced. Please downgrade it if it's only stale docs.

## Steps to reproduce

`cd repro && npm i && npx tsx voucher.ts` (read-only). It:

1. Reads `isVoucherMarketAllowed(pool)` on MarginBank `0x478769E1177C0773c43A593DCCc4Ad15F15F1394` for each pool.
2. Finds an account holding a live voucher: `0x1E3eDE6E34143efb8FbC16f1659e1a0b790FDB45`, where `getPerpVoucher` gives `{claimed:true, floor:2000e18, expiresAt:1793636381}`, which is in the future.
3. Calls `getMaxPerpOrderSize({ pool, marginBank, account, isBid: true, price: mark rounded to tick })` for that account on each market.

## Expected

Per the docs: `isVoucherMarketAllowed` is `false` and `limitedBy: "voucherBlocked"` on 1000PEPE, LIT, PUMP, VVV, ZEC and ZRO.

## Actual

```
ZEC      pool 0x2a73129f26917124bd2a47a9b355c395c537f050 isVoucherMarketAllowed = true | limitedBy=initialMargin placeable=true
ZRO      pool 0x2a1822b02039ddf0e293f3f7243673fc03eaf16c isVoucherMarketAllowed = true | limitedBy=initialMargin placeable=true
PUMP     pool 0x76c981a52530cdf9497559140aafcd8cd16836e7 isVoucherMarketAllowed = true | limitedBy=initialMargin placeable=true
LIT      pool 0xdcb0ad226727b2ce92857f0af5751389d42b2a3f isVoucherMarketAllowed = true | limitedBy=initialMargin placeable=true
VVV      pool 0x352636ab146039851ef06d6367a106d5fb4e6409 isVoucherMarketAllowed = true | limitedBy=initialMargin placeable=true
1000PEPE pool 0xfa9b9e50cc1745113d57893991af200a74c86b6f isVoucherMarketAllowed = true | limitedBy=initialMargin placeable=true
BTC      pool 0x4181dd08e73bbcdd1ba3e615a18f6abd941b94c0 isVoucherMarketAllowed = true | limitedBy=initialMargin placeable=true  (control, docs say Yes)
block 28370302
```

`getPerpLeverage` also reports `voucherMarketAllowed: true` and `voucherLeverageCapX: 20` on all 21 markets (`evidence/market-params-onchain.txt`).

## Evidence

- `evidence/voucher-allowlist.txt`
- `evidence/market-params-onchain.txt` (voucher and voucherCapX columns)

## Environment

- SDK: `@somnia-chain/markets-sdk` 0.32.1 (the version the dev docs name), viem 2.57.7, Node 20.19.2, Linux
- Network: Somnia Tokyo testnet (Hideki, chain 50383), RPC `https://api.hideki2.infra.testnet.somnia.network`, indexer `https://hideki-dev.smk.somnia.host/v1/graphql`
- Wallet: `0xAF3E4FE0eB3dB2a6dEC0649C0Ce98518fF01560e` (the bounty test wallet; read-only calls, no transactions)
- Date: 2026-10-20 (UTC)
