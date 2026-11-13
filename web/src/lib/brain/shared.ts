import "server-only";
import { unstable_cache } from "next/cache";
import { snapshotMarket, snapshotNft } from "./snapshot";

/**
 * Chain snapshots shared across every server instance through Vercel's data cache: a cold instance serves the
 * cached copy instantly and refreshes it in the background, instead of re-reading 17 gauges and 80 boost gauges.
 * The keeper never uses these; it always reads fresh before it acts.
 */
export const sharedMarket = unstable_cache(() => snapshotMarket(), ["fw-market-v3"], { revalidate: 45, tags: ["market"] });

export const sharedNft = unstable_cache(async (tokenId: string) => snapshotNft(BigInt(tokenId), await sharedMarket()), ["fw-nft-v3"], {
  revalidate: 45,
  tags: ["nft"],
});
