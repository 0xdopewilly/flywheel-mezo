import type { Metadata, Viewport } from "next";
import { Instrument_Sans, Instrument_Serif } from "next/font/google";
import { RootProviders } from "@/components/site/RootProviders";
import "./globals.css";

const sans = Instrument_Sans({ subsets: ["latin"], variable: "--font-instrument-sans", display: "swap" });
const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Flywheel · Your veBTC, on autopilot", template: "%s · Flywheel" },
  description:
    "Flywheel votes, harvests and compounds your Mezo veBTC every epoch, within limits you set, and publishes its reasoning on-chain before it touches anything.",
  openGraph: {
    title: "Flywheel · Your veBTC, on autopilot",
    description: "An AI autopilot for Mezo veBTC that shows its work on-chain.",
    type: "website",
  },
};

export const viewport: Viewport = { themeColor: "#F4F0ED", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body className="min-h-dvh">
        <RootProviders>{children}</RootProviders>
      </body>
    </html>
  );
}
