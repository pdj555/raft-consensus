"use client";

import {
  formatUptime,
  type ClusterSnapshot,
} from "@/lib/raft-simulation";

export function TelemetryStrip({ cluster }: { cluster: ClusterSnapshot }) {
  const leader = cluster.nodes.find((n) => n.id === cluster.leaderId);

  return (
    <div className="border-b border-border bg-surface/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-6 py-2.5 text-[10px] uppercase tracking-widest text-text-muted">
        <span className="flex items-center gap-2 text-live">
          <span className="h-1.5 w-1.5 rounded-full bg-live animate-pulse-live" />
          Live
        </span>
        <Item label="Output" value={`${cluster.opsPerSec} ops/s`} />
        <Item label="Term" value={String(cluster.term)} />
        <Item label="Commit" value={cluster.commitIndex.toLocaleString()} />
        <Item label="Lag" value={`${cluster.replicationLagMs}ms`} />
        <Item label="Leader" value={leader?.id ?? "—"} accent />
        <Item label="Uptime" value={formatUptime(cluster.uptimeSec)} />
      </div>
    </div>
  );
}

function Item({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <span className="flex items-center gap-2">
      <span>{label}</span>
      <span
        className={`metric-value normal-case tracking-normal ${
          accent ? "text-accent" : "text-text"
        }`}
      >
        {value}
      </span>
    </span>
  );
}
