"use client";

// Mezo Passport's getConfig: RainbowKit + Mezo testnet + the Bitcoin wallets (Unisat, OKX, Xverse) that
// Passport turns into Mezo smart accounts. Injected EVM wallets also appear through EIP-6963 discovery.
// Imported from Passport's config module directly so its styled dropdown (and UI kit) stays out of the bundle.
import { getConfig, getDefaultWallets } from "@mezo-org/passport/dist/src/config";
import { metaMaskWallet, rabbyWallet } from "@rainbow-me/rainbowkit/wallets";

export const MEZO_TESTNET_ID = 31611;

const [bitcoin, ethereum] = getDefaultWallets("testnet");

export const wagmiConfig = getConfig({
  appName: "Flywheel",
  appDescription: "An AI autopilot for Mezo veBTC that shows its work on-chain.",
  mezoNetwork: "testnet",
  wallets: [bitcoin, { groupName: "Ethereum", wallets: [metaMaskWallet, rabbyWallet, ...ethereum.wallets] }],
  // "YOUR_PROJECT_ID" is RainbowKit's documented placeholder; set NEXT_PUBLIC_WC_PROJECT_ID for production.
  walletConnectProjectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID || "YOUR_PROJECT_ID",
  ssr: false,
});
