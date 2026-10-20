# Bot kit installs markets-sdk 0.31.0 (perp-core) and 0.30.0 (ec-core), but the perps dev docs build against 0.32.1, "the one the app runs"

Severity: major
Area: SDK

The dev docs (Perps on Testnet for Developers) say: "Build against it with `@somnia-chain/markets-sdk`; this page uses version 0.32.1, the one the app runs." The bot kit that the same page recommends (`somnia-chain/dreamdex-bot-kit`, commit `2579866`) declares `"@somnia-chain/markets-sdk": "^0.31.0"` in `packages/perp-core/package.json`. Under semver, a caret on 0.x pins the minor version, so `^0.31.0` can never resolve to 0.32.x, and `npm install` on a fresh clone installs **0.31.0**. `ec-core` gets 0.30.0. The repo's own `npm run check` passes with `sdk-floor PASS ^0.30.0`, so the guard doesn't catch the drift. This has real effects. Diffing the public client surface of the two installed versions shows that 0.31.0 **lacks the calls the dev docs' own "Get test funds" snippet uses**: `client.getPerpVoucherEligibility`, `getPerpVoucherCampaign`, `getPerpVoucher` and `trader.claimPerpVoucher` are all missing. So do `getAccountEquity`, `listAccountEquities`, `getPerpFeedStatus`, `getPerpStopOrders`, `listLiquidations`, `watchPerpMarkets`, `listPerpPositionChanges` and `listPerpPositionChangesForFills`, which the SDK Perps guide documents. Code written against the docs fails to compile, or crashes at runtime, inside the kit's workspace.

## Steps to reproduce

```bash
git clone https://github.com/somnia-chain/dreamdex-bot-kit && cd dreamdex-bot-kit   # HEAD 2579866
npm install
npm ls @somnia-chain/markets-sdk
npm view @somnia-chain/markets-sdk dist-tags
npm run check | grep sdk-floor
```

## Expected

perp-core depends on `^0.32.1` (or whatever the app runs), and the `sdk-floor` check enforces the version the docs name.

## Actual

```
├─┬ @dreamdex-bot-kit/ec-core@0.1.0 -> ./packages/ec-core
│ └── @somnia-chain/markets-sdk@0.30.0
└─┬ @dreamdex-bot-kit/perp-core@0.1.0 -> ./packages/perp-core
  └── @somnia-chain/markets-sdk@0.31.0

dist-tags: { latest: '0.32.1', 'next-0.32': '0.32.1-rc.1791818930433', ... }
sdk-floor        PASS  ^0.30.0
```

## Evidence

Command output above, captured 2026-10-20 at roughly 09:23 UTC. API diff: compare the method names in `node_modules/@somnia-chain/markets-sdk/dist/somniaMarketsClient.d.ts` for 0.31.0 (the kit) and 0.32.1. `grep -rl claimPerpVoucher` finds nothing in 0.31.0's `dist/*.d.ts` and finds `perp/voucher.d.ts` in 0.32.1.

## Environment

- Bot kit: `somnia-chain/dreamdex-bot-kit` @ `2579866`, Node 20.19.2, npm 11.21.0, Linux
- Network: Somnia Tokyo testnet (Hideki, chain 50383)
- Wallet: `0xAF3E4FE0eB3dB2a6dEC0649C0Ce98518fF01560e`
