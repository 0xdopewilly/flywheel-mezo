import Link from "next/link";
import { Nav, Arrow } from "@/components/site/Nav";
import { FlywheelMark } from "@/components/brand/FlywheelMark";

export default function NotFound() {
  return (
    <>
      <Nav />
      <main className="shell grid min-h-[70vh] place-items-center text-center">
        <div className="flex flex-col items-center">
          <FlywheelMark size={56} spinning className="text-ink [&_.fw-spin]:[animation-duration:4s]" />
          <h1 className="display mt-8 text-[clamp(40px,6vw,76px)]">
            This page <span className="serif-accent energy-text">spun off.</span>
          </h1>
          <p className="mt-4 text-[17px] text-ink/70">There is nothing at this address.</p>
          <Link href="/" className="btn btn-ink mt-8">
            Back to Flywheel <Arrow />
          </Link>
        </div>
      </main>
    </>
  );
}
