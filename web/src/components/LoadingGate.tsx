"use client";

import { useEffect, useState, type ReactNode } from "react";

export function LoadingGate({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<"loading" | "fading" | "done">("loading");

  useEffect(() => {
    const fade = window.setTimeout(() => setPhase("fading"), 400);
    const done = window.setTimeout(() => setPhase("done"), 850);
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
          className={`loading-overlay fixed inset-0 z-[100] flex flex-col items-center justify-center bg-bg ${
            phase === "fading" ? "loading-overlay-out" : ""
          }`}
          aria-hidden={phase === "fading"}
        >
          <p className="font-display text-[10px] font-medium tracking-[0.34em] text-text-muted uppercase">
            Raft
          </p>
          <div className="relative mt-6 h-px w-24 overflow-hidden bg-border">
            <span className="loading-scan absolute inset-y-0 w-1/2 bg-accent/40" />
          </div>
        </div>
      )}
    </>
  );
}
