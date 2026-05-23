"use client";

import { formatUptime, type ClusterSnapshot } from "@/lib/raft-simulation";

const items = (cluster: ClusterSnapshot, leaderId: string | undefined) => [
  { label: "Output", value: `${cluster.opsPerSec.toLocaleString()} ops/s` },
  { label: "Term", value: String(cluster.term) },
  { label: "Commit", value: cluster.commitIndex.toLocaleString() },
  { label: "Lag", value: `${cluster.replicationLagMs} ms` },
  { label: "Leader", value: leaderId ?? "—", accent: true },
  { label: "Uptime", value: formatUptime(cluster.uptimeSec) },
];

export function TelemetryStrip({ cluster }: { cluster: ClusterSnapshot }) {
  const leader = cluster.nodes.find((n) => n.id === cluster.leaderId)?.id;

  return (
    <div className="sticky top-[3.25rem] z-30 border-b border-border bg-bg/85 backdrop-blur-xl">
      <div className="section-shell flex items-center gap-4 overflow-x-auto py-2.5 scrollbar-hide">
        <span className="flex shrink-0 items-center gap-2 pr-2 text-[10px] uppercase tracking-[0.18em] text-live">
          <span className="h-1 w-1 rounded-full bg-live animate-pulse-live" />
          Live
        </span>
        {items(cluster, leader).map((item, i) => (
          <span key={item.label} className="flex shrink-0 items-center gap-4">
            {i > 0 && <span className="divider-v h-3" />}
            <span className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-text-faint">
              {item.label}
              <span
                className={`metric-value text-[11px] normal-case tracking-normal ${
                  item.accent ? "text-accent" : "text-text"
                }`}
              >
                {item.value}
              </span>
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
