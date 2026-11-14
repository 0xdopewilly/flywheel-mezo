"use client";

// Mezo Passport's getConfig: RainbowKit + wagmi preconfigured for Mezo testnet (chain, RPC transports, WalletConnect).
// Flywheel's flows are plain EVM transactions, so the picker offers EVM wallets only (OKX, MetaMask, Rabby, any
// EIP-6963 injected wallet, WalletConnect). Passport's Bitcoin-wallet smart accounts need a Bitcoin *testnet* wallet and
// hung for wallets on Bitcoin mainnet addresses, so they are left out until that path is supported end to end.
import { getConfig, getDefaultWallets } from "@mezo-org/passport/dist/src/config";
import { metaMaskWallet, okxWallet, rabbyWallet } from "@rainbow-me/rainbowkit/wallets";

export const MEZO_TESTNET_ID = 31611;

const [, ethereum] = getDefaultWallets("testnet");

export const wagmiConfig = getConfig({
  appName: "Flywheel",
  appDescription: "An AI autopilot for Mezo veBTC that shows its work on-chain.",
  mezoNetwork: "testnet",
  wallets: [{ groupName: "EVM wallets", wallets: [okxWallet, metaMaskWallet, rabbyWallet, ...ethereum.wallets] }],
  // "YOUR_PROJECT_ID" is RainbowKit's documented placeholder; set NEXT_PUBLIC_WC_PROJECT_ID for production.
  walletConnectProjectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID || "YOUR_PROJECT_ID",
  ssr: false,
});
