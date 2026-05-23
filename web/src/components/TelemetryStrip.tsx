"use client";

import { formatUptime, type ClusterSnapshot } from "@/lib/raft-simulation";

const hudItems = (cluster: ClusterSnapshot, leaderId: string | undefined) => [
  { label: "Output", value: `${cluster.opsPerSec.toLocaleString()} ops/s` },
  { label: "Term", value: String(cluster.term) },
  { label: "Commit", value: cluster.commitIndex.toLocaleString() },
  { label: "Lag", value: `${cluster.replicationLagMs} ms` },
  { label: "Leader", value: leaderId ?? "—", emphasis: true },
  { label: "Uptime", value: formatUptime(cluster.uptimeSec) },
];

export function TelemetryStrip({ cluster }: { cluster: ClusterSnapshot }) {
  const leader = cluster.nodes.find((n) => n.id === cluster.leaderId)?.id;

  return (
    <div className="sticky top-12 z-30 border-b border-border bg-bg">
      <div className="section-shell flex items-center gap-3 overflow-x-auto py-2.5 scrollbar-hide sm:gap-4">
        <span className="flex shrink-0 items-center gap-2 pr-2 label-caps text-text">
          <span className="h-1 w-1 bg-text animate-pulse-live" />
          Live
        </span>
        {hudItems(cluster, leader).map((item, i) => (
          <span key={item.label} className="flex shrink-0 items-center gap-3 sm:gap-4">
            {i > 0 && <span className="divider-v h-3" aria-hidden="true" />}
            <span className="flex items-center gap-2 label-caps">
              {item.label}
              <span
                className={`metric-value text-[11px] normal-case tracking-normal ${
                  item.emphasis ? "text-text" : "text-text-muted"
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
