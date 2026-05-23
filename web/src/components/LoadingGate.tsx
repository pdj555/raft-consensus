"use client";

import { useEffect, useState, type ReactNode } from "react";

export function LoadingGate({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setReady(true), 1100);
    return () => window.clearTimeout(id);
  }, []);

  if (ready) return <>{children}</>;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-bg transition-opacity duration-700 ${
        ready ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="text-center">
        <p className="font-display text-[11px] font-medium tracking-[0.32em] text-text-muted uppercase">
          Raft Consensus
        </p>
        <p className="mt-4 text-[10px] tracking-[0.24em] text-text-faint uppercase">loading</p>
      </div>
    </div>
  );
}
