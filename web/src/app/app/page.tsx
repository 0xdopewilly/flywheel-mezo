import type { Metadata } from "next";
import { AppEntry } from "@/components/app/AppEntry";

export const metadata: Metadata = {
  title: "App",
  description: "Put your Mezo veBTC on autopilot, set its limits, and read the brain’s on-chain journal.",
};

export default function AppPage() {
  return <AppEntry />;
}
