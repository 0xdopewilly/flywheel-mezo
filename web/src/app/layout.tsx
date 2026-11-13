import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "Flywheel", description: "Autopilot for Mezo veBTC" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
