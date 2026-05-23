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
    <div className="sticky top-12 z-30 border-b border-border bg-bg/94 backdrop-blur-md">
      <div className="section-shell flex items-center gap-3 overflow-x-auto py-2 scrollbar-hide sm:gap-4">
        <span className="flex shrink-0 items-center gap-2 pr-1 text-[9px] uppercase tracking-[0.2em] text-live">
          <span className="h-1 w-1 rounded-full bg-live animate-pulse-live" />
          Live
        </span>
        {items(cluster, leader).map((item, i) => (
          <span key={item.label} className="flex shrink-0 items-center gap-3 sm:gap-4">
            {i > 0 && <span className="divider-v h-2.5" />}
            <span className="flex items-center gap-2 text-[9px] uppercase tracking-[0.18em] text-text-faint">
              {item.label}
              <span
                className={`metric-value text-[10px] normal-case tracking-normal ${
                  item.accent ? "text-accent-muted" : "text-text-muted"
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
