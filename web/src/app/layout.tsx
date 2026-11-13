import type { Metadata, Viewport } from "next";
import { Inter, Rajdhani } from "next/font/google";
import { RootProviders } from "@/components/site/RootProviders";
import "./globals.css";

const sans = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const serif = Rajdhani({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-rajdhani", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Flywheel · Your veBTC, on autopilot", template: "%s · Flywheel" },
  description:
    "Flywheel votes, harvests and compounds your Mezo veBTC every epoch, within limits you set, and publishes its reasoning on-chain with every vote.",
  openGraph: {
    title: "Flywheel · Your veBTC, on autopilot",
    description: "An AI autopilot for Mezo veBTC that shows its work on-chain.",
    type: "website",
  },
};

export const viewport: Viewport = { themeColor: "#07040D", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body className="min-h-dvh">
        <RootProviders>{children}</RootProviders>
      </body>
    </html>
  );
}
