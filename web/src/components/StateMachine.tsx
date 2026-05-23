"use client";

import { useState } from "react";
import { SectionHeader } from "@/components/SectionHeader";

const states = [
  {
    id: "follower",
    label: "Follower",
    color: "var(--follower)",
    description: "Accepts AppendEntries, resets election timer on valid RPC.",
  },
  {
    id: "candidate",
    label: "Candidate",
    color: "var(--candidate)",
    description: "Increments term, votes for self, requests votes from peers.",
  },
  {
    id: "leader",
    label: "Leader",
    color: "var(--leader)",
    description: "Replicates log entries, advances commitIndex on majority.",
  },
];

const transitions = [
  { from: "follower", to: "candidate", trigger: "election timeout" },
  { from: "candidate", to: "leader", trigger: "majority votes" },
  { from: "candidate", to: "follower", trigger: "higher term discovered" },
  { from: "leader", to: "follower", trigger: "higher term in RPC" },
];

export function StateMachine() {
  const [active, setActive] = useState("follower");

  return (
    <section id="protocol" className="section-pad border-t border-border">
      <div className="section-shell">
        <SectionHeader
          label="Protocol"
          title="Raft state machine"
          description="At most one leader per term. Safety properties from §5.4 — append-only, election safety, log matching."
        />

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="panel p-6">
            <p className="label-caps mb-5">States</p>
            <div className="flex flex-col gap-2">
              {states.map((state) => (
                <button
                  key={state.id}
                  type="button"
                  onClick={() => setActive(state.id)}
                  className={`flex items-start gap-4 rounded-[10px] border px-4 py-3.5 text-left transition-all duration-200 ${
                    active === state.id
                      ? "border-border-bright bg-white/[0.025]"
                      : "border-transparent hover:border-border hover:bg-white/[0.015]"
                  }`}
                >
                  <span
                    className="mt-1 h-2 w-2 shrink-0 rounded-full"
                    style={{ background: state.color }}
                  />
                  <div>
                    <p className="text-[13px] font-medium text-text">{state.label}</p>
                    <p className="mt-1 text-[11px] leading-relaxed text-text-muted">
                      {state.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="panel p-6">
            <p className="label-caps mb-5">Transitions</p>
            <div className="space-y-3">
              {transitions.map((t) => (
                <div
                  key={`${t.from}-${t.to}`}
                  className="flex items-center gap-2.5 border-b border-border/60 pb-3 text-[11px] last:border-0 last:pb-0"
                >
                  <span className="rounded-md bg-white/[0.04] px-2 py-1 capitalize text-text-muted">
                    {t.from}
                  </span>
                  <span className="text-text-faint">→</span>
                  <span className="rounded-md bg-white/[0.04] px-2 py-1 capitalize text-text-muted">
                    {t.to}
                  </span>
                  <span className="ml-auto text-text-faint">{t.trigger}</span>
                </div>
              ))}
            </div>

            <div className="panel-inset mt-6 p-4 text-[11px] leading-relaxed text-text-muted">
              <span className="text-accent/80">$</span> mvn test -DskipITs=true
              <br />
              <span className="text-text-faint">RaftLogTest · DefaultRaftNodeClusterTest</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
