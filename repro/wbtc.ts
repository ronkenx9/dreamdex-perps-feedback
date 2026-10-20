import { SOMNIA_HIDEKI_TESTNET_ADDRESSES, SomniaMarkets } from "@somnia-chain/markets-sdk";
import { hidekiTestnet } from "@somnia-chain/markets-sdk/chains";
const exchange = new SomniaMarkets({ chain: hidekiTestnet, indexerUrl: "https://hideki-dev.smk.somnia.host/v1/graphql", addresses: SOMNIA_HIDEKI_TESTNET_ADDRESSES });
const client = exchange.client;
try { const perps = await client.listPerpMarkets({ baseSymbol: "WBTC", limit: 20 }); const one = await client.getPerpMarket(perps[0].id); console.log(one); } catch (e: any) { console.log("guide one-shot snippet ->", e.constructor.name + ":", e.message); }
await exchange.loadMarkets();
try { await exchange.fetchFundingRate("BTC/USDSO:USDSO"); } catch (e: any) { console.log("guide quick-start fetchFundingRate ->", e.constructor.name + ":", e.message); }
await client.stopLive(); process.exit(0);
