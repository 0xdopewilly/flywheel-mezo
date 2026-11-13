// Client-side shapes of the Flywheel API. Brain types are imported type-only, so no server code ships.
import type { PlanCore } from "@/lib/brain/plan";
import type { GaugeSnapshot, MarketSnapshot, NftSnapshot } from "@/lib/brain/snapshot";

export type { GaugeSnapshot, MarketSnapshot, NftSnapshot, PlanCore };

export type Narrative = { headline: string; why: string; model: string };

export type LivePlan = PlanCore & { narrative: Narrative; hash: `0x${string}` };

export type PlanResponse = {
  plan: LivePlan;
  nft: NftSnapshot;
  market: { epoch: number; voteClosesAt: number; epochEnds?: number; totalVotes: number; block: string; prices?: { btc: number; mezo: number; source: string } };
};

/** Policy as the contract stores it (bps), or as the brain reports it (percent). Either may arrive. */
export type PositionPolicy = {
  maxPoolShareBps?: number | string;
  boostShareBps?: number | string;
  minPools?: number | string;
  autoSave?: boolean;
  epochPullCap?: number | string;
  capPct?: number;
  boostSharePct?: number;
};

export type Position = {
  tokenId: string;
  power: number;
  boost: number;
  lockedBtc?: number;
  lockEnd: number;
  permanent: boolean;
  enrolled: boolean;
  live: boolean;
  policy?: PositionPolicy;
};

export type PositionsResponse = { positions: Position[] };

export type RunAction = { kind: "vote" | "harvest" | "compound" | "skip"; tx?: string; reason: string };

export type RunResponse = { actions: RunAction[]; plan?: unknown };

export type JournalVote = { pool?: string; label: string; pct: number; bps?: number; expectedUsd?: number; rewardUsd?: number; othersVotes?: number };

export type JournalEntry = {
  tokenId: string;
  epoch: number;
  planHash: string;
  tx: string;
  blockNumber: string | number;
  timestamp: number;
  plan: {
    headline: string;
    why: string;
    model: string;
    votes: JournalVote[];
    expectedUsd: number;
    baselines?: { allInTop: number; followCrowd: number; evenSplit: number };
    edgePct?: { vsTopPicks: number; vsCrowd: number; vsEven: number };
    boost?: { spendUsd: number; from: number; to: number; reason: string };
  };
};

export type JournalResponse = { entries: JournalEntry[] };

/** Policy as the UI edits it. */
export type UiPolicy = {
  /** 0.1 .. 1 */
  cap: number;
  minPools: number;
  /** 0 .. 1 */
  boostShare: number;
  autoSave: boolean;
  /** whole MUSD */
  pullCap: number;
};

export const DEFAULT_UI_POLICY: UiPolicy = { cap: 0.6, minPools: 2, boostShare: 0.3, autoSave: true, pullCap: 100 };

export const DEMO_TOKEN_ID = "1742";
