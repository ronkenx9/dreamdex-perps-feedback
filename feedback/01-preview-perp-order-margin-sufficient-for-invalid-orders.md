# previewPerpOrderMargin returns `sufficient: true` for orders the pool always rejects (negative, zero, off-lot, below-minimum quantity; zero or off-tick price)

Severity: major
Area: SDK

The SDK Perps guide calls `client.previewPerpOrderMargin` "the read behind an order form's 'margin required' row and its submit gate", which "returns what the pool will actually lock and whether it will accept the order". It does no input validation. It returns `sufficient: true` (and `hasCollateralForLock: true`, `meetsInitialMargin: true`) for orders that `PerpPool.placeOrder` always reverts. For a negative quantity it also returns a **negative** `lockAmount`. The sibling read `getMaxPerpOrderSize` does validate its input (`price must be > 0`), so the two reads behave differently.

## Steps to reproduce

1. `cd repro && npm i && npx tsx neg.ts` (read-only; uses a funded account on the BTC-PERP pool so the margin gates pass).
2. It calls `client.previewPerpOrderMargin({ pool: 0x4181dd08e73bbcdd1ba3e615a18f6abd941b94c0, marginBank: 0x478769e1177c0773c43a593dccc4ad15f15f1394, account: 0x1E3eDE6E34143efb8FbC16f1659e1a0b790FDB45, isBid: true, quantity, price })` with BTC-PERP's grid (tick 0.1 = `1e17`, lot `1000`, minQuantity `13000`) and:
   - `quantity: -13000n`
   - `quantity: 0n`
   - `quantity: 13001n` (not on the lot grid)
   - `quantity: 1000n` (below `minQuantity`)
   - `price: 0n`
   - `price: 81000050000000000000000n` (81000.05, not on the 0.1 tick)
3. To confirm what the pool does, `npx tsx sim.ts` runs `eth_call` (simulation only, nothing is sent) of `placeOrder` with the same inputs from the same account.

## Expected

The preview reports any order that cannot be placed as not sufficient, or throws `InvalidInputError` the way `getMaxPerpOrderSize` does. The minimum would be rejecting `quantity <= 0` and `price <= 0`, flagging prices off `tickSize`, and flagging quantities off `lotSize` or below `minQuantity` (for example with `gridValid: false` plus a reason). `lockAmount` should never be negative.

## Actual

Every case returns `sufficient: true`:

```
quantity -13000n -> {"increasingQuantity":"-13000n","lockAmount":"-526499999999999999n","initialMarginPortion":"-526499999999999999n","hasCollateralForLock":true,"meetsInitialMargin":true,"sufficient":true}
quantity 0n      -> {"increasingQuantity":"0n","lockAmount":"0n","hasCollateralForLock":true,"meetsInitialMargin":true,"sufficient":true}
quantity 13001n  -> {"increasingQuantity":"13001n","lockAmount":"526540500000000000n","sufficient":true}
quantity 1000n   -> {"increasingQuantity":"1000n","lockAmount":"40500000000000000n","sufficient":true}
price 0n         -> sufficient true lockAmount 0n
price 81000.05   -> sufficient true lockAmount 526500325000000000n
getMaxPerpOrderSize price 0n -> InvalidInputError: price must be > 0
```

The pool rejects the same orders (`eth_call` at block ~28371606):

```
placeOrder qty 13000 @ 70000.0 (control) -> OK (true, orderId)
placeOrder qty 13001                     -> revert InvalidQuantity(uint256,uint256)   0x4f174b29
placeOrder qty 1000                      -> revert QuantityBelowMinimum(uint256,uint256) 0xeaa68ceb
placeOrder qty 0                         -> revert QuantityBelowMinimum(uint256,uint256) 0xeaa68ceb
placeOrder price 70000.05                -> revert InvalidPrice(uint256,uint256)      0xaf608abb
```

So an order form, bot or agent that gates its submit button on `sufficient`, as the guide recommends, sends transactions that always revert and still cost gas. A negative `lockAmount` shown as "margin required" is also nonsense in a UI.

## Evidence

- `evidence/preview-validation.txt`: full request and response output of `neg.ts`
- `evidence/placeorder-simulation.txt`: `eth_call` results of `sim.ts`
- Revert selectors decoded against the SDK's own `contractErrorsAbi`

## Environment

- SDK: `@somnia-chain/markets-sdk` 0.32.1 (the version the dev docs name), viem 2.57.7, Node 20.19.2, Linux
- Network: Somnia Tokyo testnet (Hideki, chain 50383), RPC `https://api.hideki2.infra.testnet.somnia.network`, indexer `https://hideki-dev.smk.somnia.host/v1/graphql`
- Wallet: `0xAF3E4FE0eB3dB2a6dEC0649C0Ce98518fF01560e` (the bounty test wallet; read-only calls, no transactions)
- Date: 2026-10-20 (UTC)
