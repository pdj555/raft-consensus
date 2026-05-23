"use client";

import { useState } from "react";

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
    <section id="protocol" className="border-t border-border py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 max-w-2xl">
          <p className="label-caps mb-2">Protocol</p>
          <h2
            className="text-3xl font-bold tracking-tight text-text sm:text-4xl"
            style={{ fontFamily: "var(--font-syne)" }}
          >
            Raft state machine
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-text-muted">
            At most one leader per term. Safety properties from §5.4 — leader
            append-only, election safety, log matching, leader completeness.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="panel rounded p-6">
            <p className="label-caps mb-6">States</p>
            <div className="flex flex-col gap-3">
              {states.map((state) => (
                <button
                  key={state.id}
                  type="button"
                  onClick={() => setActive(state.id)}
                  className={`flex items-start gap-4 rounded border p-4 text-left transition-all ${
                    active === state.id
                      ? "border-border-bright bg-white/[0.03]"
                      : "border-transparent hover:border-border hover:bg-white/[0.02]"
                  }`}
                >
                  <span
                    className="mt-1 h-3 w-3 shrink-0 rounded-full"
                    style={{ background: state.color }}
                  />
                  <div>
                    <p className="text-sm font-medium text-text">{state.label}</p>
                    <p className="mt-1 text-xs leading-relaxed text-text-muted">
                      {state.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="panel rounded p-6">
            <p className="label-caps mb-6">Transitions</p>
            <div className="space-y-4">
              {transitions.map((t) => (
                <div
                  key={`${t.from}-${t.to}-${t.trigger}`}
                  className="flex items-center gap-3 text-xs"
                >
                  <span
                    className="rounded px-2 py-1 capitalize"
                    style={{
                      color: states.find((s) => s.id === t.from)?.color,
                      background: "rgba(255,255,255,0.04)",
                    }}
                  >
                    {t.from}
                  </span>
                  <span className="text-text-muted">→</span>
                  <span
                    className="rounded px-2 py-1 capitalize"
                    style={{
                      color: states.find((s) => s.id === t.to)?.color,
                      background: "rgba(255,255,255,0.04)",
                    }}
                  >
                    {t.to}
                  </span>
                  <span className="ml-auto text-text-muted">{t.trigger}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded border border-border bg-bg p-4 font-mono text-[11px] leading-relaxed text-text-muted">
              <span className="text-accent">$</span> mvn test -DskipITs=true
              <br />
              <span className="text-text-muted/60">
                Running RaftLogTest, DefaultRaftNodeClusterTest...
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
