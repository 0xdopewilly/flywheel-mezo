"use client";

import dynamic from "next/dynamic";
import { Nav } from "@/components/site/Nav";
import { FlywheelMark } from "@/components/brand/FlywheelMark";

// Wallet libraries only load on the client, and only on /app.
const Dapp = dynamic(() => import("./Dapp"), {
  ssr: false,
  loading: () => (
    <>
      <Nav right={<span className="btn btn-ink btn-sm pointer-events-none opacity-60">Connect wallet</span>} />
      <div className="shell grid min-h-[60vh] place-items-center">
        <div className="flex flex-col items-center gap-4 text-muted">
          <FlywheelMark size={44} spinning className="text-ink" />
          <p className="text-[14px]">Starting the app…</p>
        </div>
      </div>
    </>
  ),
});

export function AppEntry() {
  return <Dapp />;
}
