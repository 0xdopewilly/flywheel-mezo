"use client";

import "@rainbow-me/rainbowkit/styles.css";
import { RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit";
import { useThemeMode } from "@/components/site/ThemeToggle";
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

const light = lightTheme({ accentColor: "#7C3AED", accentColorForeground: "#ffffff", borderRadius: "small", fontStack: "system", overlayBlur: "small" });
light.colors.modalBorder = "rgba(124,58,237,0.25)";
light.colors.modalBackdrop = "rgba(26,16,48,0.45)";
light.fonts.body = "var(--font-inter), ui-sans-serif, system-ui, sans-serif";

export default function Dapp() {
  const mode = useThemeMode();
  return (
    <WagmiProvider config={wagmiConfig}>
      <RainbowKitProvider theme={mode === "light" ? light : theme} initialChain={MEZO_TESTNET_ID} appInfo={{ appName: "Flywheel" }} modalSize="compact">
        <AppScreen />
      </RainbowKitProvider>
    </WagmiProvider>
  );
}
