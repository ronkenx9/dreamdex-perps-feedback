import { createPublicClient, http, parseAbi, decodeErrorResult } from "viem";
import { hidekiTestnet } from "@somnia-chain/markets-sdk/chains";
const pc = createPublicClient({ chain: hidekiTestnet, transport: http() });
const pool = "0x4181dd08e73bbcdd1ba3e615a18f6abd941b94c0";
const from = "0x1E3eDE6E34143efb8FbC16f1659e1a0b790FDB45";
const abi = parseAbi(["function placeOrder(bool isBid, uint64 userData, uint256 price, uint256 quantity, uint64 expireTimestampNs, uint8 orderType, uint8 selfMatchingOption, address builder, uint96 builderFeeBpsTimes1k) payable returns (bool success, uint128 orderId)"]);
const cases: [string, bigint, bigint][] = [["valid: qty 13000 (min), price 70000.0", 70000n * 10n**18n, 13000n], ["off-lot qty 13001", 70000n * 10n**18n, 13001n], ["below-min qty 1000", 70000n * 10n**18n, 1000n], ["off-tick price 70000.05", 70000050000000000000000n, 13000n], ["quantity 0", 70000n * 10n**18n, 0n]];
for (const [label, price, qty] of cases) {
  try {
    const r = await pc.simulateContract({ address: pool, abi, functionName: "placeOrder", args: [true, 0n, price, qty, 18446744073709551615n, 0, 0, "0x0000000000000000000000000000000000000000", 0n], account: from, gas: 10_000_000n });
    console.log(`eth_call placeOrder ${label}: OK result=${r.result}`);
  } catch (e: any) { const sig = e?.cause?.data ?? e?.cause?.cause?.data; console.log(`eth_call placeOrder ${label}: REVERT ${e.shortMessage?.split("\n")[0]} ${e?.cause?.reason ?? ""} ${e?.cause?.signature ?? ""} raw=${JSON.stringify(e?.cause?.raw ?? e?.cause?.data ?? "").slice(0,80)}`); }
}
console.log("block", await pc.getBlockNumber());
