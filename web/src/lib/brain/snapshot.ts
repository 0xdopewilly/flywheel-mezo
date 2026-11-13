import { formatUnits, type Address } from "viem";
import { MEZO, WEEK, epochStart, publicClient } from "@/lib/mezo/chain";
import { boostVoterAbi, erc20Abi, rewardAbi, veAbi, voterAbi } from "@/lib/mezo/abis";

export type TokenAmount = { token: Address; symbol: string; amount: number; usd: number };

export type GaugeSnapshot = {
  pool: Address;
  gauge: Address;
  label: string;
  bribe: Address;
  fees: Address;
  /** veBTC votes currently on the gauge (whole veBTC units). */
  votes: number;
  incentives: TokenAmount[];
  feesThisEpoch: TokenAmount[];
  feesLastEpoch: TokenAmount[];
  incentivesUsd: number;
  /** Fees projected for the full epoch: the larger of this epoch so far and last epoch. */
  feesUsdProjected: number;
  /** What the brain expects the gauge to pay its voters this epoch. */
  rewardUsd: number;
};

export type Prices = { btc: number; mezo: number; source: string; at: number };

export type MarketSnapshot = {
  chainId: number;
  block: string;
  at: number;
  epoch: number;
  epochEnds: number;
  voteClosesAt: number;
  prices: Prices;
  totalVotes: number;
  gauges: GaugeSnapshot[];
  boost: BoostMarket;
};

export type BoostMarket = {
  veBtcTotalUnboosted: number;
  veMezoTotal: number;
  /** Median USD of incentives a boost gauge pays per veMEZO vote this epoch, from a sample. */
  usdPerVeMezo: number;
  sampled: number;
};

const LABELS: Record<string, string> = {
  [MEZO.smusd.toLowerCase()]: "MUSD Savings Vault",
};

const STABLES = new Set(["MUSD", "mUSDC", "mUSDT", "USDC", "USDT", "mDAI", "bMUSD", "sMUSD"]);
const BTC_LIKE = new Set(["BTC", "tBTC", "mcbBTC", "mFBTC", "mSolvBTC", "mxSolvBTC", "mswBTC", "gtBTC", "mlvBTC"]);

let priceCache: Prices | null = null;

export async function getPrices(): Promise<Prices> {
  if (priceCache && Date.now() / 1000 - priceCache.at < 300) return priceCache;
  try {
    const r = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=mezo,bitcoin&vs_currencies=usd", {
      cache: "no-store",
      signal: AbortSignal.timeout(6000),
    });
    const j = (await r.json()) as { mezo?: { usd: number }; bitcoin?: { usd: number } };
    if (j.bitcoin?.usd && j.mezo?.usd) {
      priceCache = { btc: j.bitcoin.usd, mezo: j.mezo.usd, source: "CoinGecko (mainnet prices)", at: Math.floor(Date.now() / 1000) };
      return priceCache;
    }
  } catch {
    /* fall through */
  }
  return (priceCache ??= { btc: 68_000, mezo: 0.004, source: "fallback constants", at: Math.floor(Date.now() / 1000) });
}

function usdOf(symbol: string, amount: number, p: Prices) {
  if (STABLES.has(symbol)) return amount;
  if (BTC_LIKE.has(symbol)) return amount * p.btc;
  if (symbol === "MEZO") return amount * p.mezo;
  return 0;
}

const num = (v: bigint, d = 18) => Number(formatUnits(v, d));

export async function snapshotMarket(): Promise<MarketSnapshot> {
  const c = publicClient();
  const now = Math.floor(Date.now() / 1000);
  const epoch = epochStart(now);
  const prev = epoch - WEEK;
  const [block, prices, n] = await Promise.all([
    c.getBlockNumber(),
    getPrices(),
    c.readContract({ address: MEZO.poolsVoter, abi: voterAbi, functionName: "length" }),
  ]);

  const idx = Array.from({ length: Number(n) }, (_, i) => BigInt(i));
  const pools = (await c.multicall({
    contracts: idx.map((i) => ({ address: MEZO.poolsVoter, abi: voterAbi, functionName: "pools", args: [i] }) as const),
    allowFailure: false,
  })) as Address[];
  const gauges = (await c.multicall({
    contracts: pools.map((p) => ({ address: MEZO.poolsVoter, abi: voterAbi, functionName: "gauges", args: [p] }) as const),
    allowFailure: false,
  })) as Address[];
  const meta = await c.multicall({
    contracts: gauges.flatMap((g, i) => [
      { address: MEZO.poolsVoter, abi: voterAbi, functionName: "isAlive", args: [g] } as const,
      { address: MEZO.poolsVoter, abi: voterAbi, functionName: "gaugeToBribe", args: [g] } as const,
      { address: MEZO.poolsVoter, abi: voterAbi, functionName: "gaugeToFees", args: [g] } as const,
      { address: MEZO.poolsVoter, abi: voterAbi, functionName: "weights", args: [pools[i]] } as const,
      { address: pools[i], abi: erc20Abi, functionName: "symbol" } as const,
    ]),
    allowFailure: true,
  });

  type Row = { pool: Address; gauge: Address; alive: boolean; bribe: Address; fees: Address; votes: number; symbol: string };
  const rows: Row[] = pools.map((pool, i) => {
    const m = meta.slice(i * 5, i * 5 + 5);
    return {
      pool,
      gauge: gauges[i],
      alive: m[0].result === true,
      bribe: m[1].result as Address,
      fees: m[2].result as Address,
      votes: m[3].status === "success" ? num(m[3].result as bigint) : 0,
      symbol: m[4].status === "success" ? String(m[4].result) : "",
    };
  });
  const live = rows.filter((r) => r.alive);

  // reward token lists for every bribe and fee contract
  const rewardContracts = live.flatMap((r) => [r.bribe, r.fees]);
  const lens = await c.multicall({
    contracts: rewardContracts.map((a) => ({ address: a, abi: rewardAbi, functionName: "rewardsListLength" }) as const),
    allowFailure: true,
  });
  const tokenCalls = rewardContracts.flatMap((a, k) => {
    const L = lens[k].status === "success" ? Math.min(Number(lens[k].result), 12) : 0;
    return Array.from({ length: L }, (_, j) => ({ a, j }));
  });
  const tokenRes = await c.multicall({
    contracts: tokenCalls.map(({ a, j }) => ({ address: a, abi: rewardAbi, functionName: "rewards", args: [BigInt(j)] }) as const),
    allowFailure: true,
  });
  const tokensOf = new Map<string, Address[]>();
  tokenCalls.forEach(({ a }, k) => {
    if (tokenRes[k].status !== "success") return;
    const list = tokensOf.get(a) ?? [];
    list.push(tokenRes[k].result as Address);
    tokensOf.set(a, list);
  });

  const allTokens = [...new Set([...tokensOf.values()].flat().map((t) => t.toLowerCase()))] as Address[];
  const tokMeta = await c.multicall({
    contracts: allTokens.flatMap((t) => [
      { address: t, abi: erc20Abi, functionName: "symbol" } as const,
      { address: t, abi: erc20Abi, functionName: "decimals" } as const,
    ]),
    allowFailure: true,
  });
  const symbolOf = new Map<string, { symbol: string; decimals: number }>();
  allTokens.forEach((t, k) => {
    const s = tokMeta[k * 2];
    const d = tokMeta[k * 2 + 1];
    symbolOf.set(t, {
      symbol: s.status === "success" ? String(s.result) : t.slice(0, 6),
      decimals: d.status === "success" ? Number(d.result) : 18,
    });
  });

  const amountCalls = rewardContracts.flatMap((a) =>
    (tokensOf.get(a) ?? []).flatMap((t) => [
      { a, t, e: epoch },
      { a, t, e: prev },
    ]),
  );
  const amounts = await c.multicall({
    contracts: amountCalls.map(({ a, t, e }) => ({
      address: a,
      abi: rewardAbi,
      functionName: "tokenRewardsPerEpoch",
      args: [t, BigInt(e)],
    }) as const),
    allowFailure: true,
  });
  const amountOf = new Map<string, bigint>();
  amountCalls.forEach(({ a, t, e }, k) => {
    if (amounts[k].status === "success") amountOf.set(`${a}:${t}:${e}`.toLowerCase(), amounts[k].result as bigint);
  });

  const list = (a: Address, e: number): TokenAmount[] =>
    (tokensOf.get(a) ?? [])
      .map((t) => {
        const m = symbolOf.get(t.toLowerCase()) ?? { symbol: "?", decimals: 18 };
        const amount = num(amountOf.get(`${a}:${t}:${e}`.toLowerCase()) ?? 0n, m.decimals);
        return { token: t, symbol: m.symbol, amount, usd: usdOf(m.symbol, amount, prices) };
      })
      .filter((x) => x.amount > 0);

  const sumUsd = (xs: TokenAmount[]) => xs.reduce((s, x) => s + x.usd, 0);

  const out: GaugeSnapshot[] = live.map((r) => {
    const incentives = list(r.bribe, epoch);
    const feesThisEpoch = list(r.fees, epoch);
    const feesLastEpoch = list(r.fees, prev);
    const incentivesUsd = sumUsd(incentives);
    const feesUsdProjected = Math.max(sumUsd(feesThisEpoch), sumUsd(feesLastEpoch));
    return {
      pool: r.pool,
      gauge: r.gauge,
      label: LABELS[r.pool.toLowerCase()] ?? prettyLabel(r.symbol, r.pool),
      bribe: r.bribe,
      fees: r.fees,
      votes: r.votes,
      incentives,
      feesThisEpoch,
      feesLastEpoch,
      incentivesUsd,
      feesUsdProjected,
      rewardUsd: incentivesUsd + feesUsdProjected,
    };
  });

  return {
    chainId: 31611,
    block: block.toString(),
    at: now,
    epoch,
    epochEnds: epoch + WEEK,
    voteClosesAt: epoch + WEEK - 3600,
    prices,
    totalVotes: out.reduce((s, g) => s + g.votes, 0),
    gauges: out,
    boost: await boostMarket(prices, epoch),
  };
}

function prettyLabel(symbol: string, pool: Address) {
  if (!symbol) return `Pool ${pool.slice(0, 6)}…${pool.slice(-4)}`;
  return symbol.replace(/^(vAMM|sAMM)-/, "").replace(/-t$/, "").replace("/", " / ");
}

/** Samples recent boost gauges to price veMEZO votes in incentive dollars. */
async function boostMarket(prices: Prices, epoch: number): Promise<BoostMarket> {
  const c = publicClient();
  const [len, veBtcTotalUnboosted, veMezoTotal] = await Promise.all([
    c.readContract({ address: MEZO.boostVoter, abi: boostVoterAbi, functionName: "length" }),
    c.readContract({ address: MEZO.veBTC, abi: veAbi, functionName: "unboostedTotalVotingPower" }),
    c.readContract({ address: MEZO.veMEZO, abi: veAbi, functionName: "totalVotingPower" }),
  ]);
  const N = Number(len);
  const sample = Array.from({ length: Math.min(80, N) }, (_, k) => BigInt(N - 1 - k));
  const gs = (await c.multicall({
    contracts: sample.map((i) => ({ address: MEZO.boostVoter, abi: boostVoterAbi, functionName: "gauges", args: [i] }) as const),
    allowFailure: false,
  })) as Address[];
  const wb = await c.multicall({
    contracts: gs.flatMap((g) => [
      { address: MEZO.boostVoter, abi: boostVoterAbi, functionName: "weights", args: [g] } as const,
      { address: MEZO.boostVoter, abi: boostVoterAbi, functionName: "gaugeToBribe", args: [g] } as const,
    ]),
    allowFailure: true,
  });
  const tokens: [Address, string][] = [
    [MEZO.musd, "MUSD"],
    [MEZO.mezo, "MEZO"],
    [MEZO.btc, "BTC"],
  ];
  const bribeCalls = gs.flatMap((_, k) =>
    wb[k * 2 + 1].status === "success"
      ? tokens.map(([t, s]) => ({ k, s, b: wb[k * 2 + 1].result as Address, t }))
      : [],
  );
  const br = await c.multicall({
    contracts: bribeCalls.map(({ b, t }) => ({
      address: b,
      abi: rewardAbi,
      functionName: "tokenRewardsPerEpoch",
      args: [t, BigInt(epoch)],
    }) as const),
    allowFailure: true,
  });
  const usdByGauge = new Map<number, number>();
  bribeCalls.forEach(({ k, s }, j) => {
    if (br[j].status !== "success") return;
    usdByGauge.set(k, (usdByGauge.get(k) ?? 0) + usdOf(s, num(br[j].result as bigint), prices));
  });
  const rates: number[] = [];
  gs.forEach((_, k) => {
    const w = wb[k * 2].status === "success" ? num(wb[k * 2].result as bigint) : 0;
    const usd = usdByGauge.get(k) ?? 0;
    if (w > 0 && usd > 0) rates.push(usd / w);
  });
  rates.sort((a, b) => a - b);
  const median = rates.length ? rates[Math.floor(rates.length / 2)] : 0;
  return {
    veBtcTotalUnboosted: num(veBtcTotalUnboosted as bigint),
    veMezoTotal: num(veMezoTotal as bigint),
    usdPerVeMezo: median,
    sampled: rates.length,
  };
}

export type NftSnapshot = {
  tokenId: string;
  owner: Address;
  power: number;
  unboosted: number;
  boost: number;
  boostGauge: Address | null;
  boostVotes: number;
  lockEnd: number;
  permanent: boolean;
  lastVoted: number;
  votedThisEpoch: boolean;
  currentVotes: Record<string, number>;
  claimable: { contract: Address; kind: "incentive" | "fee"; pool: Address; token: Address; symbol: string; amount: number; usd: number }[];
};

export async function snapshotNft(tokenId: bigint, market: MarketSnapshot): Promise<NftSnapshot> {
  const c = publicClient();
  const [owner, power, unboosted, locked, lastVoted, boostGauge, boost] = await Promise.all([
    c.readContract({ address: MEZO.veBTC, abi: veAbi, functionName: "ownerOf", args: [tokenId] }),
    c.readContract({ address: MEZO.veBTC, abi: veAbi, functionName: "votingPowerOfNFT", args: [tokenId] }),
    c.readContract({ address: MEZO.veBTC, abi: veAbi, functionName: "unboostedVotingPowerOfNFT", args: [tokenId] }),
    c.readContract({ address: MEZO.veBTC, abi: veAbi, functionName: "locked", args: [tokenId] }),
    c.readContract({ address: MEZO.poolsVoter, abi: voterAbi, functionName: "lastVoted", args: [tokenId] }),
    c.readContract({ address: MEZO.boostVoter, abi: boostVoterAbi, functionName: "boostableTokenIdToGauge", args: [tokenId] }),
    c.readContract({ address: MEZO.boostVoter, abi: boostVoterAbi, functionName: "getBoost", args: [tokenId] }),
  ]);
  const hasGauge = boostGauge !== "0x0000000000000000000000000000000000000000";
  const boostVotes = hasGauge
    ? num((await c.readContract({ address: MEZO.boostVoter, abi: boostVoterAbi, functionName: "weights", args: [boostGauge] })) as bigint)
    : 0;

  const voteRes = await c.multicall({
    contracts: market.gauges.map((g) => ({ address: MEZO.poolsVoter, abi: voterAbi, functionName: "votes", args: [tokenId, g.pool] }) as const),
    allowFailure: true,
  });
  const currentVotes: Record<string, number> = {};
  market.gauges.forEach((g, i) => {
    const v = voteRes[i].status === "success" ? num(voteRes[i].result as bigint) : 0;
    if (v > 0) currentVotes[g.pool] = v;
  });

  // claimable: everything the reward contracts say this NFT has earned
  const earnCalls = market.gauges.flatMap((g) => [
    ...[...g.incentives, ...g.feesLastEpoch, ...g.feesThisEpoch].map((t) => t.token),
  ].filter((t, i, a) => a.indexOf(t) === i).flatMap((t) => [
    { contract: g.bribe, kind: "incentive" as const, pool: g.pool, token: t },
    { contract: g.fees, kind: "fee" as const, pool: g.pool, token: t },
  ]));
  const earned = await c.multicall({
    contracts: earnCalls.map((e) => ({ address: e.contract, abi: rewardAbi, functionName: "earned", args: [e.token, tokenId] }) as const),
    allowFailure: true,
  });
  const symbols = new Map<string, string>();
  market.gauges.forEach((g) =>
    [...g.incentives, ...g.feesLastEpoch, ...g.feesThisEpoch].forEach((t) => symbols.set(t.token.toLowerCase(), t.symbol)),
  );
  const claimable = earnCalls
    .map((e, i) => {
      const amount = earned[i].status === "success" ? num(earned[i].result as bigint) : 0;
      const symbol = symbols.get(e.token.toLowerCase()) ?? "?";
      return { ...e, symbol, amount, usd: usdOf(symbol, amount, market.prices) };
    })
    .filter((e) => e.amount > 0);

  const l = locked as unknown as readonly [bigint, bigint, boolean, bigint];
  const lv = Number(lastVoted);
  return {
    tokenId: tokenId.toString(),
    owner: owner as Address,
    power: num(power as bigint),
    unboosted: num(unboosted as bigint),
    boost: num(boost as bigint),
    boostGauge: hasGauge ? (boostGauge as Address) : null,
    boostVotes,
    lockEnd: Number(l[1]),
    permanent: Boolean(l[2]),
    lastVoted: lv,
    votedThisEpoch: lv >= market.epoch,
    currentVotes,
    claimable,
  };
}
