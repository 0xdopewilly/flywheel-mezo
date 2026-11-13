import { createPublicClient, defineChain, http, type Address } from "viem";

export const mezoTestnet = defineChain({
  id: 31611,
  name: "Mezo Testnet",
  nativeCurrency: { name: "Bitcoin", symbol: "BTC", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.test.mezo.org"], webSocket: ["wss://rpc-ws.test.mezo.org"] } },
  blockExplorers: { default: { name: "Mezo Explorer", url: "https://explorer.test.mezo.org" } },
  contracts: { multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" } },
  testnet: true,
});

/** Mezo testnet contracts (proxies). Checked on-chain 2026-11-13: veBTC.voter() and veBTC.booster(). */
export const MEZO = {
  veBTC: "0x38E35d92E6Bfc6787272A62345856B13eA12130a",
  veMEZO: "0xaCE816CA2bcc9b12C59799dcC5A959Fb9b98111b",
  poolsVoter: "0x263F1Fd5fB7F866881e1B6cD7d5d6c40Fd985F0D",
  boostVoter: "0x21d7bDF5a5929AD179F8cA0c9014A0B62ae6Bfd1",
  boostGaugeFactory: "0x2c015840D034fE74BEA8C62Dd00A11e3aa338aD5",
  musd: "0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503",
  smusd: "0x6f461c68B2c5492C0F5CCEc5a264d692aA7A8e16",
  mezo: "0x7B7c000000000000000000000000000000000001",
  btc: "0x7b7C000000000000000000000000000000000000",
  router: "0x9a1ff7FE3a0F69959A3fBa1F1e5ee18e1A9CD7E9",
  poolMusdBtc: "0xd16A5Df82120ED8D626a1a15232bFcE2366d6AA9",
} as const satisfies Record<string, Address>;

export const PILOT_ADDRESS = (process.env.NEXT_PUBLIC_PILOT_ADDRESS ?? "") as Address | "";

export const EXPLORER = mezoTestnet.blockExplorers.default.url;
export const txUrl = (hash: string) => `${EXPLORER}/tx/${hash}`;
export const addrUrl = (a: string) => `${EXPLORER}/address/${a}`;

export const WEEK = 7 * 24 * 3600;
export const epochStart = (t: number) => t - (t % WEEK);
export const epochVoteEnd = (t: number) => epochStart(t) + WEEK - 3600;

export function publicClient() {
  return createPublicClient({
    chain: mezoTestnet,
    transport: http(process.env.MEZO_RPC_URL ?? "https://rpc.test.mezo.org", {
      batch: { batchSize: 200, wait: 8 },
      retryCount: 3,
      timeout: 20_000,
    }),
  });
}
