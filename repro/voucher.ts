import { SOMNIA_HIDEKI_TESTNET_ADDRESSES, SomniaMarkets } from "@somnia-chain/markets-sdk";
import { hidekiTestnet } from "@somnia-chain/markets-sdk/chains";
import { parseAbi } from "viem";
const mk = new SomniaMarkets({ chain: hidekiTestnet, indexerUrl: "https://hideki-dev.smk.somnia.host/v1/graphql", addresses: SOMNIA_HIDEKI_TESTNET_ADDRESSES });
const c = mk.client; const pc = c.getViemClient();
const ser = (v: any) => JSON.stringify(v, (_k, x) => (typeof x === "bigint" ? x.toString() : x));
const perps: any[] = await c.listPerpMarkets();
const eth = perps.find(m => m.baseSymbol === "ETH"); const mb = eth.marginBank;
const btcm = perps.find(m => m.baseSymbol === "BTC"); const holders = [...(await c.getPerpSideHolders({ marginBank: mb, pool: eth.poolAddress, isLong: true })).holders, ...(await c.getPerpSideHolders({ marginBank: mb, pool: btcm.poolAddress, isLong: false })).holders]; console.log("holders", holders.length);
let found: any = null;
for (const h of holders.slice(0, 400)) { const v: any = await c.getPerpVoucher(mb, h); if (v?.claimed && v.floor > 0n && v.expiresAt > BigInt(Math.floor(Date.now()/1000))) { found = h; console.log("voucher account", h, ser(v)); break; } }
const bankAbi = parseAbi(["function isVoucherMarketAllowed(address) view returns (bool)"]);
for (const sym of ["ZEC", "ZRO", "PUMP", "LIT", "VVV", "1000PEPE", "BTC"]) {
  const m = perps.find(p => p.baseSymbol === sym);
  const allowed = await pc.readContract({ address: mb, abi: bankAbi, functionName: "isVoucherMarketAllowed", args: [m.poolAddress] });
  let max: any = null;
  if (found) { const mark = (await c.getPerpState(m.poolAddress)).markPrice; const tick = BigInt(m.tickSize); max = await c.getMaxPerpOrderSize({ pool: m.poolAddress, marginBank: mb, account: found, isBid: true, price: (mark / tick) * tick }); }
  console.log(sym, "pool", m.poolAddress, "MarginBank.isVoucherMarketAllowed =", allowed, found ? `| getMaxPerpOrderSize(voucher acct) limitedBy=${max.limitedBy} placeable=${max.placeable} maxQuantity=${max.maxQuantity}` : "");
}
console.log("block", await pc.getBlockNumber());
await c.stopLive(); process.exit(0);
