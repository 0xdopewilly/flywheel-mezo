"use client";

import { useEffect } from "react";
import { Nav } from "@/components/site/Nav";
import { FlywheelMark } from "@/components/brand/FlywheelMark";

/** A failed chunk after a redeploy, or a render bug: say so plainly and offer a clean reload. */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  const stale = /chunk|loading css|dynamically imported/i.test(error.message);
  return (
    <>
      <Nav />
      <main className="shell grid min-h-[70vh] place-items-center text-center">
        <div className="flex flex-col items-center">
          <FlywheelMark size={56} spinning className="text-ink [&_.fw-spin]:[animation-duration:4s]" />
          <h1 className="display mt-8 text-[clamp(40px,6vw,76px)]">
            The flywheel <span className="serif-accent energy-text">slipped.</span>
          </h1>
          <p className="pretty mt-4 max-w-[480px] text-[17px] text-ink/70">
            {stale ? "Flywheel was just updated. A fresh load picks up the new version." : "Something on this page failed to draw. Your veBTC and limits are untouched."}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button type="button" className="btn btn-ink" onClick={() => (stale ? window.location.reload() : reset())}>
              {stale ? "Reload" : "Try again"}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => window.location.reload()}>
              Reload the page
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
