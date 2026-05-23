"use client";

import { useEffect, useState, type ReactNode } from "react";

export function LoadingGate({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const t1 = window.setTimeout(() => setFade(true), 900);
    const t2 = window.setTimeout(() => setReady(true), 1400);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  if (ready) return <>{children}</>;

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-bg transition-opacity duration-500 ${
        fade ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="grid-bg absolute inset-0 opacity-30" aria-hidden="true" />
      <p
        className="relative text-sm font-medium tracking-[0.35em] text-text-muted uppercase"
        style={{ fontFamily: "var(--font-syne)" }}
      >
        Raft Consensus
      </p>
      <p className="relative mt-6 text-[11px] tracking-widest text-text-muted/80 uppercase">
        loading
        <span className="loading-dots" aria-hidden="true">
          ...
        </span>
      </p>
      <div className="relative mt-10 h-px w-32 overflow-hidden bg-border">
        <div className="loading-bar h-full w-1/2 bg-accent/60" />
      </div>
    </div>
  );
}
