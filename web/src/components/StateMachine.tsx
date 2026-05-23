"use client";

import { useMemo, useState } from "react";
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
] as const;

const transitions = [
  { from: "follower", to: "candidate", trigger: "election timeout" },
  { from: "candidate", to: "leader", trigger: "majority votes" },
  { from: "candidate", to: "follower", trigger: "higher term discovered" },
  { from: "leader", to: "follower", trigger: "higher term in RPC" },
] as const;

type StateId = (typeof states)[number]["id"];

export function StateMachine() {
  const [active, setActive] = useState<StateId>("follower");

  const visibleTransitions = useMemo(
    () => transitions.filter((t) => t.from === active || t.to === active),
    [active],
  );

  return (
    <section id="protocol" className="section-anchor section-pad border-t border-border">
      <div className="section-shell">
        <SectionHeader
          label="Protocol"
          title="Raft state machine"
          description="One leader per term. Safety from §5.4 — append-only, election safety, log matching."
        />

        <div className="grid gap-3 lg:grid-cols-2">
          <div className="panel p-5" role="tablist" aria-label="Raft states">
            <p className="label-caps mb-4">States</p>
            <div className="flex flex-col gap-1.5">
              {states.map((state) => {
                const selected = active === state.id;
                return (
                  <button
                    key={state.id}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => setActive(state.id)}
                    className={`flex items-start gap-3 rounded border px-3.5 py-3 text-left transition-colors duration-200 ${
                      selected
                        ? "border-border-bright bg-surface-raised"
                        : "border-transparent hover:border-border hover:bg-bg-elevated"
                    }`}
                  >
                    <span
                      className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ background: state.color }}
                      aria-hidden="true"
                    />
                    <div>
                      <p className="text-[12px] font-medium text-text">{state.label}</p>
                      <p className="mt-1 text-[11px] leading-relaxed text-text-muted">
                        {state.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="panel p-5">
            <p className="label-caps mb-4">
              Transitions · <span className="text-text-faint">{active}</span>
            </p>
            <div className="space-y-2.5">
              {visibleTransitions.map((t) => (
                <div
                  key={`${t.from}-${t.to}`}
                  className="flex flex-wrap items-center gap-2 border-b border-border/60 pb-2.5 text-[11px] last:border-0 last:pb-0"
                >
                  <span className="rounded border border-border bg-bg-elevated px-2 py-0.5 capitalize text-text-muted">
                    {t.from}
                  </span>
                  <span className="text-text-faint" aria-hidden="true">
                    →
                  </span>
                  <span className="rounded border border-border bg-bg-elevated px-2 py-0.5 capitalize text-text-muted">
                    {t.to}
                  </span>
                  <span className="text-text-faint">{t.trigger}</span>
                </div>
              ))}
            </div>

            <div className="panel-inset mt-5 p-3.5 text-[11px] leading-relaxed text-text-muted">
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
