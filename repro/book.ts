import { SOMNIA_HIDEKI_TESTNET_ADDRESSES, SomniaMarkets } from "@somnia-chain/markets-sdk";
import { hidekiTestnet } from "@somnia-chain/markets-sdk/chains";
import { formatUnits } from "viem";
const mk = new SomniaMarkets({ chain: hidekiTestnet, indexerUrl: "https://hideki-dev.smk.somnia.host/v1/graphql", addresses: SOMNIA_HIDEKI_TESTNET_ADDRESSES });
const c = mk.client; await mk.loadMarkets();
const perps = await c.listPerpMarkets();
const f = (x: any) => x == null ? "none" : Number(formatUnits(BigInt(x), 18)).toFixed(4);
for (let i = 0; i < 4; i++) {
  for (const sym of ["BTC", "ETH", "SOL"]) {
    const m = perps.find((p: any) => p.baseSymbol === sym)!;
    const [ob, tops, fob, ob1] = await Promise.all([c.getSpotOrderBook(m.poolAddress as any), c.getBookTops([m.id]), mk.fetchOrderBook(`${sym}/USDso:USDso`, 1), c.getSpotOrderBook(m.poolAddress as any, { depth: 1 } as any)]);
    const t = tops[m.id];
    console.log(new Date().toISOString(), sym, "getSpotOrderBook bid/ask", f(ob.bids[0]?.price), f(ob.asks[0]?.price), "blk", ob.blockNumber, "| getBookTops", f(t?.bestBid), f(t?.bestAsk), "| fetchOrderBook(1)", fob.bids[0]?.[0], fob.asks[0]?.[0], "blk", fob.blockNumber, "| nAsks", ob.asks.length, "nBids", ob.bids.length);
  }
  await new Promise(r => setTimeout(r, 3000));
}
await c.stopLive(); process.exit(0);
