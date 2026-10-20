# perp-* strategies exit in DRY_RUN on an empty MarginBank, and the fix they print ignores the free paper-USDso claim

Severity: normal
Area: SDK

The bot kit README promises "Every strategy defaults to `DRY_RUN=true` — it logs exactly what it *would* do without sending anything". For the perp strategies that's only true once the account is already funded. With a fresh key (the setup the kit's docs/perps.md describes: "Leave `OWNER_ADDRESS` blank to trade the key's own perps account"), `perp-starter`, `perp-maker` and `perp-funding` print an error and exit with code 1, even in dry-run, before logging a single would-be order. So you can't evaluate a strategy before funding it.

The message they print tells the user to "Approve the MarginBank … then deposit", but Hideki USDso has no public mint (`mint` reverts), so a fresh key has nothing to deposit. Per the dev docs, the real path for a fresh key is `client.getPerpVoucherEligibility` followed by `trader.claimPerpVoucher` (1,000 paper USDso). That account reads `{"eligible":true}` today. The kit has no helper or script for the claim (`grep -r claimPerpVoucher` finds nothing), and neither the message nor docs/perps.md mentions it.

## Steps to reproduce

```bash
cd dreamdex-bot-kit && npm install
# fresh EOA, no STT, no USDso
NETWORK=hideki DRY_RUN=true PERP_SYMBOL=ETH-PERP PRIVATE_KEY=0x<fresh key> npm start -w perp-starter
# repeat with -w perp-maker and -w perp-funding
```

## Expected

In `DRY_RUN=true` the strategy warns about the empty bank and keeps running, logging the orders it would size, using an assumed balance if needed. The empty-bank message names the voucher route when `getPerpVoucherEligibility(...).eligible` is true (for example: "this key can claim 1,000 paper USDso: run `npx tsx scripts/perp-claim-voucher.ts`"), and says where Hideki STT comes from.

## Actual

```
perp-starter on ETH-PERP (ETH/USDso:USDso) | long 50 USDso at 2x | take-profit 2% stop-loss 1% | dry-run true
MarginBank is empty for 0xAF3E4FE0eB3dB2a6dEC0649C0Ce98518fF01560e. Deposit collateral before trading: every perp order locks from the bank, not from your wallet, so an unfunded account fails every order. Approve the MarginBank (0x478769e1177c0773c43a593dccc4ad15f15f1394) as spender on the collateral token, then deposit.
npm error Lifecycle script `start` failed with error: ... code 1
```

perp-maker and perp-funding fail the same way. perp-guard runs, because it doesn't trade. Same account: `getPerpVoucherEligibility(0x4787…1394, 0xAF3E…560e)` returns `{"eligible":true,"grantAmount":"1000000000000000000000"}`, and `eth_call` of `USDso(0xed7993A74dAe1e6656B704A424DcD8711aAf4F72).mint(addr, 1000e18)` reverts.

## Evidence

`evidence/strategies-dryrun.txt`. The source of the message is `packages/perp-core/src/margin.ts` around line 122 (`preflight`).

## Environment

- Bot kit `somnia-chain/dreamdex-bot-kit` @ `2579866` (markets-sdk 0.31.0 as installed), Node 20.19.2
- Network: Somnia Tokyo testnet (Hideki, chain 50383)
- Wallet: `0xAF3E4FE0eB3dB2a6dEC0649C0Ce98518fF01560e`
