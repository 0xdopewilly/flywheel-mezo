"use client";

import { useCallback, useState } from "react";
import { useConfig } from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";
import { BaseError, ContractFunctionRevertedError, type Hash } from "viem";
import { MEZO_TESTNET_ID } from "./wagmi";

export type TxState = { status: "idle" | "signing" | "mining" | "done" | "error"; hash?: Hash; error?: string };

const REVERTS: Record<string, string> = {
  NotApproved: "Approve the veBTC for Flywheel first.",
  NotNftOwner: "This wallet does not own that veBTC.",
  NotEnrolled: "This veBTC is not on autopilot.",
  BadPolicy: "The contract does not accept those limits.",
  OwnerChanged: "The veBTC changed hands since it was enrolled.",
};

export function friendlyError(e: unknown): string {
  if (e instanceof BaseError) {
    if (e.walk((x) => (x as { name?: string }).name === "UserRejectedRequestError")) return "You cancelled in your wallet.";
    const rev = e.walk((x) => x instanceof ContractFunctionRevertedError) as ContractFunctionRevertedError | null;
    const name = rev?.data?.errorName;
    if (name && REVERTS[name]) return REVERTS[name];
    if (name) return `The contract said no (${name}).`;
    return e.shortMessage.slice(0, 180);
  }
  const msg = e instanceof Error ? e.message : String(e);
  if (/user rejected|denied|rejected the request/i.test(msg)) return "You cancelled in your wallet.";
  return msg.slice(0, 180);
}

/** Sign, then wait for Mezo to include it. `run` returns true once the receipt says success. */
export function useTx() {
  const config = useConfig();
  const [state, setState] = useState<TxState>({ status: "idle" });

  const run = useCallback(
    async (write: () => Promise<Hash>) => {
      setState({ status: "signing" });
      let hash: Hash | undefined;
      try {
        hash = await write();
        setState({ status: "mining", hash });
        const receipt = await waitForTransactionReceipt(config, { hash, chainId: MEZO_TESTNET_ID, timeout: 120_000 });
        if (receipt.status !== "success") throw new Error("The transaction reverted on Mezo.");
        setState({ status: "done", hash });
        return true;
      } catch (e) {
        setState({ status: "error", hash, error: friendlyError(e) });
        return false;
      }
    },
    [config],
  );

  const reset = useCallback(() => setState({ status: "idle" }), []);
  return { state, run, reset };
}
