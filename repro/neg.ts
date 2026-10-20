import { SOMNIA_HIDEKI_TESTNET_ADDRESSES, SomniaMarkets } from "@somnia-chain/markets-sdk";
import { hidekiTestnet } from "@somnia-chain/markets-sdk/chains";
import { parseUnits } from "viem";
const mk = new SomniaMarkets({ chain: hidekiTestnet, indexerUrl: "https://hideki-dev.smk.somnia.host/v1/graphql", addresses: SOMNIA_HIDEKI_TESTNET_ADDRESSES });
const c = mk.client;
const ser = (v: any) => JSON.stringify(v, (_k, x) => (typeof x === "bigint" ? x.toString() + "n" : x), 1);
const perps: any[] = await c.listPerpMarkets(); const btc = perps.find(m => m.baseSymbol === "BTC");
const funded = "0x1E3eDE6E34143efb8FbC16f1659e1a0b790FDB45"; // an existing funded account (read-only)
const price = parseUnits("81000", 18);
for (const q of [-13000n, 0n, 13001n, 1000n]) {
  const r: any = await c.previewPerpOrderMargin({ pool: btc.poolAddress, marginBank: btc.marginBank, account: funded, isBid: true, quantity: q, price } as any);
  console.log(`request: client.previewPerpOrderMargin({ pool: ${btc.poolAddress}, marginBank: ${btc.marginBank}, account: ${funded}, isBid: true, quantity: ${q}n, price: ${price}n })`);
  console.log("response:", JSON.stringify({ asOfBlock: r.asOfBlock, increasingQuantity: r.increasingQuantity, lockAmount: r.lockAmount, initialMarginPortion: r.initialMarginPortion, hasCollateralForLock: r.hasCollateralForLock, meetsInitialMargin: r.meetsInitialMargin, sufficient: r.sufficient }, (_k, x) => typeof x === "bigint" ? x.toString() + "n" : x));
}
try { await c.getMaxPerpOrderSize({ pool: btc.poolAddress, marginBank: btc.marginBank, account: funded, isBid: true, price: -1n }); } catch (e: any) { console.log("getMaxPerpOrderSize price -1n =>", e.constructor.name, e.message); }
try { await c.getMaxPerpOrderSize({ pool: btc.poolAddress, marginBank: btc.marginBank, account: funded, isBid: true, price: 0n }); } catch (e: any) { console.log("getMaxPerpOrderSize price 0n =>", e.constructor.name, e.message); }
try { const r: any = await c.previewPerpOrderMargin({ pool: btc.poolAddress, marginBank: btc.marginBank, account: funded, isBid: true, quantity: 13000n, price: 0n } as any); console.log("previewPerpOrderMargin price 0n =>", "sufficient", r.sufficient, "lockAmount", r.lockAmount); } catch (e: any) { console.log("previewPerpOrderMargin price 0n =>", e.constructor.name, e.message); }
{ const r: any = await c.previewPerpOrderMargin({ pool: btc.poolAddress, marginBank: btc.marginBank, account: funded, isBid: true, quantity: 13000n, price: 81000050000000000000000n } as any); console.log("previewPerpOrderMargin off-tick price 81000.05 (tick 0.1), qty 13000n =>", "sufficient", r.sufficient, "lockAmount", r.lockAmount); }
const sdkv = JSON.parse((await import("fs")).readFileSync("node_modules/@somnia-chain/markets-sdk/package.json", "utf8")).version; console.log("sdk", sdkv);
await c.stopLive(); process.exit(0);
