"use client";

import { useEffect, useState, type ReactNode } from "react";

export function LoadingGate({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<"loading" | "fading" | "done">("loading");

  useEffect(() => {
    const fade = window.setTimeout(() => setPhase("fading"), 500);
    const done = window.setTimeout(() => setPhase("done"), 950);
    return () => {
      window.clearTimeout(fade);
      window.clearTimeout(done);
    };
  }, []);

  return (
    <>
      {children}
      {phase !== "done" && (
        <div
          className={`loading-overlay fixed inset-0 z-[100] flex items-center justify-center bg-bg ${
            phase === "fading" ? "loading-overlay-out" : ""
          }`}
          aria-hidden={phase === "fading"}
        >
          <p className="text-[15px] tracking-[0.01em] text-text-muted">loading...</p>
        </div>
      )}
    </>
  );
}
