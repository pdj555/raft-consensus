"use client";

import { useEffect, useState, type ReactNode } from "react";

export function LoadingGate({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<"loading" | "fading" | "done">("loading");

  useEffect(() => {
    const fade = window.setTimeout(() => setPhase("fading"), 600);
    const done = window.setTimeout(() => setPhase("done"), 1100);
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
          <div className="text-center">
            <p className="font-display text-[11px] font-medium tracking-[0.32em] text-text-muted uppercase">
              Raft Consensus
            </p>
            <p className="mt-4 text-[10px] tracking-[0.24em] text-text-faint uppercase">loading</p>
          </div>
        </div>
      )}
    </>
  );
}
