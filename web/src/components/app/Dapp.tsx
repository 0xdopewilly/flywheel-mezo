"use client";

import "@rainbow-me/rainbowkit/styles.css";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { wagmiConfig, MEZO_TESTNET_ID } from "./wagmi";
import { AppScreen } from "./AppScreen";

const theme = darkTheme({ accentColor: "#8B5CF6", accentColorForeground: "#ffffff", borderRadius: "small", fontStack: "system", overlayBlur: "small" });
theme.colors.modalBackground = "#120a1f";
theme.colors.modalBorder = "rgba(167,139,250,0.3)";
theme.colors.profileForeground = "#120a1f";
theme.colors.modalBackdrop = "rgba(4,2,8,0.72)";
theme.colors.connectButtonBackground = "#120a1f";
theme.fonts.body = "var(--font-inter), ui-sans-serif, system-ui, sans-serif";

export default function Dapp() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <RainbowKitProvider theme={theme} initialChain={MEZO_TESTNET_ID} appInfo={{ appName: "Flywheel" }} modalSize="compact">
        <AppScreen />
      </RainbowKitProvider>
    </WagmiProvider>
  );
}
