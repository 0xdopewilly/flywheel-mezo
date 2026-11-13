"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

function Avatar({ address }: { address: string }) {
  // a deterministic two-tone disc from the address, in brand tints
  const n = parseInt(address.slice(2, 8), 16);
  const tints = ["#F8ECD4", "#EFF3DB", "#FAE2DF", "#AEDFFF"];
  const a = tints[n % 4];
  const b = tints[(n >> 3) % 4] === a ? tints[(n % 4 + 1) % 4] : tints[(n >> 3) % 4];
  return (
    <span
      className="h-6 w-6 shrink-0 rounded-full"
      style={{ background: `conic-gradient(from ${n % 360}deg, ${a} 0 50%, ${b} 50% 100%)`, boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.08)" }}
      aria-hidden
    />
  );
}

export function ConnectPill({ size = "sm" }: { size?: "sm" | "lg" }) {
  return (
    <ConnectButton.Custom>
      {({ account, chain, openConnectModal, openAccountModal, openChainModal, mounted }) => {
        const cls = size === "sm" ? "btn btn-sm ml-1" : "btn";
        if (!mounted) return <span className={`${cls} btn-ink opacity-0`}>Connect wallet</span>;
        if (!account || !chain)
          return (
            <button type="button" onClick={openConnectModal} className={`${cls} btn-ink`}>
              Connect wallet
            </button>
          );
        if (chain.unsupported)
          return (
            <button type="button" onClick={openChainModal} className={`${cls} bg-red text-[#fff]`}>
              Switch to Mezo testnet
            </button>
          );
        return (
          <button type="button" onClick={openAccountModal} className={`${cls} btn-white gap-2 pl-1.5 shadow-[0_1px_0_rgba(0,0,0,0.05)]`}>
            <Avatar address={account.address} />
            <span className="tnum">{account.displayName}</span>
          </button>
        );
      }}
    </ConnectButton.Custom>
  );
}
