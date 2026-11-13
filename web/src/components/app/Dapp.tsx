"use client";

import "@rainbow-me/rainbowkit/styles.css";
import { RainbowKitProvider, lightTheme } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { wagmiConfig, MEZO_TESTNET_ID } from "./wagmi";
import { AppScreen } from "./AppScreen";

const theme = lightTheme({ accentColor: "#171717", accentColorForeground: "#ffffff", borderRadius: "large", fontStack: "system", overlayBlur: "small" });
theme.colors.modalBackground = "#ffffff";
theme.colors.profileForeground = "#ffffff";
theme.colors.modalBackdrop = "rgba(23,23,23,0.35)";
theme.fonts.body = "var(--font-instrument-sans), ui-sans-serif, system-ui, sans-serif";

export default function Dapp() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <RainbowKitProvider theme={theme} initialChain={MEZO_TESTNET_ID} appInfo={{ appName: "Flywheel" }} modalSize="compact">
        <AppScreen />
      </RainbowKitProvider>
    </WagmiProvider>
  );
}
