// Dev helper: claim a test veBTC for an address (default: a fresh random one).
// NODE_OPTIONS=--conditions=react-server npx tsx --tsconfig tsconfig.json scripts/try-faucet.ts [address]
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { claimTestVeBTC, faucetStock } from "../src/lib/brain/faucet";

async function main() {
  const to = (process.argv[2] ?? privateKeyToAccount(generatePrivateKey()).address) as `0x${string}`;
  console.log("stock before", await faucetStock());
  const t0 = Date.now();
  console.log("claim for", to, await claimTestVeBTC(to), "ms", Date.now() - t0);
  console.log("stock after", await faucetStock());
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
