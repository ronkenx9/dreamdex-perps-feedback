import { SOMNIA_HIDEKI_TESTNET_ADDRESSES, SomniaMarkets } from "@somnia-chain/markets-sdk";
import { hidekiTestnet } from "@somnia-chain/markets-sdk/chains";
import { formatUnits, parseAbi } from "viem";
const mk = new SomniaMarkets({ chain: hidekiTestnet, indexerUrl: "https://hideki-dev.smk.somnia.host/v1/graphql", addresses: SOMNIA_HIDEKI_TESTNET_ADDRESSES });
const c = mk.client; const pc = c.getViemClient();
const acc = "0xAF3E4FE0eB3dB2a6dEC0649C0Ce98518fF01560e" as const;
const perps: any[] = await c.listPerpMarkets();
const rows: any[] = [];
const abi = parseAbi(["function getOrderBookParameters() view returns (uint256,uint256,uint256)"]);
for (const m of perps) {
  const rp: any = await c.getPerpRiskParams(m.poolAddress);
  const lev: any = await c.getPerpLeverage({ marginBank: m.marginBank, account: acc, pool: m.poolAddress });
  let obp: any = null; try { obp = await pc.readContract({ address: m.poolAddress, abi, functionName: "getOrderBookParameters" }); } catch (e: any) { obp = "ERR " + e.shortMessage; }
  const d = m.baseDecimals;
  rows.push({ sym: m.baseSymbol, dec: d, tick: formatUnits(BigInt(m.tickSize), 18), lot: formatUnits(BigInt(m.lotSize), d), min: formatUnits(BigInt(m.minQuantity), d),
    obp: Array.isArray(obp) ? `${formatUnits(obp[0],18)}/${formatUnits(obp[1],d)}/${formatUnits(obp[2],d)}` : obp,
    imBps: String(rp.initialMarginBps), mmBps: String(rp.maintenanceMarginBps), maxLevX: lev.protocolMaxLeverageX, mktMaxLevBps: String(lev.marketMaxLeverageBps),
    maxOI: formatUnits(rp.maxOpenInterest, d), maxPos: formatUnits(rp.maxPositionSize, d), posOverOI: Number(rp.maxPositionSize * 10000n / (rp.maxOpenInterest || 1n)) / 10000,
    voucher: lev.voucherMarketAllowed, voucherCapX: lev.voucherLeverageCapX });
}
console.table(rows);
await c.stopLive(); process.exit(0);
