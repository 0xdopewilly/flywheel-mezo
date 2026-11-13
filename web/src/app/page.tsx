import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { Hero } from "@/components/landing/Hero";
import { LiveStrip } from "@/components/landing/LiveStrip";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { ShowsWork } from "@/components/landing/ShowsWork";
import { FinalCta, Trust } from "@/components/landing/Trust";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <LiveStrip />
        <HowItWorks />
        <ShowsWork />
        <Trust />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
