"use client";

import { useEffect, useMemo, useState } from "react";
import { SectionHeader } from "@/components/SectionHeader";
import { Sparkline } from "@/components/Sparkline";
import { TelemetryStrip } from "@/components/TelemetryStrip";
import {
  createInitialCluster,
  formatUptime,
  roleColor,
  tickCluster,
  type ClusterNode,
  type ClusterSnapshot,
  type NodeRole,
} from "@/lib/raft-simulation";

function MetricCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-4 py-3.5">
      <p className="label-caps">{label}</p>
      <p className="metric-value mt-1.5 text-xl font-medium text-text">{value}</p>
    </div>
  );
}

function RoleBadge({ role }: { role: NodeRole }) {
  const color = roleColor(role);
  return (
    <span
      className="inline-flex items-center rounded px-2 py-0.5 text-[9px] uppercase tracking-[0.14em]"
      style={{
        color,
        background: `color-mix(in srgb, ${color} 10%, transparent)`,
        border: `1px solid color-mix(in srgb, ${color} 22%, transparent)`,
      }}
    >
      {role}
    </span>
  );
}

function nodeCoords(node: ClusterNode) {
  return {
    x: 120 + ((node.lng + 180) / 360) * 560,
    y: 80 + ((90 - node.lat) / 180) * 290,
  };
}

function TopologyMap({
  nodes,
  leaderId,
  selectedId,
  onSelect,
  pulseKey,
}: {
  nodes: ClusterNode[];
  leaderId: string | null;
  selectedId: string | null;
  onSelect: (id: string) => void;
  pulseKey: number;
}) {
  const leader = nodes.find((n) => n.id === leaderId);

  return (
    <div className="relative min-h-[300px] lg:min-h-[380px]">
      <svg viewBox="0 0 800 450" className="h-full w-full" aria-hidden="true">
        <defs>
          <pattern id="topo-dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.35" fill="rgba(255,255,255,0.045)" />
          </pattern>
        </defs>
        <rect width="800" height="450" fill="url(#topo-dots)" />
      </svg>

      <svg viewBox="0 0 800 450" className="absolute inset-0 h-full w-full">
        {leader &&
          nodes
            .filter((n) => n.id !== leader.id)
            .map((follower) => {
              const a = nodeCoords(leader);
              const b = nodeCoords(follower);
              return (
                <g key={`pulse-${follower.id}-${pulseKey}`}>
                  <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="rgba(196,146,40,0.07)" strokeWidth="0.75" />
                  <circle r="2" fill="var(--leader)" opacity="0.75">
                    <animateMotion dur="2s" repeatCount="1" path={`M ${a.x} ${a.y} L ${b.x} ${b.y}`} />
                    <animate attributeName="opacity" values="0;0.9;0.9;0" dur="2s" repeatCount="1" />
                  </circle>
                </g>
              );
            })}

        {nodes.map((node, i) =>
          nodes.slice(i + 1).map((other) => {
            const a = nodeCoords(node);
            const b = nodeCoords(other);
            const linked = node.id === leaderId || other.id === leaderId;
            return (
              <line
                key={`${node.id}-${other.id}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={linked ? "rgba(196,146,40,0.1)" : "rgba(74,136,184,0.04)"}
                strokeWidth={linked ? 1 : 0.5}
              />
            );
          }),
        )}

        {nodes.map((node) => {
          const { x, y } = nodeCoords(node);
          const isLeader = node.id === leaderId;
          const isSelected = node.id === selectedId;
          const color = roleColor(node.role);
          return (
            <g
              key={node.id}
              className="cursor-pointer outline-none focus-visible:opacity-100"
              onClick={() => onSelect(node.id)}
              role="button"
              tabIndex={0}
              aria-label={`Select ${node.id}`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onSelect(node.id);
              }}
            >
              {(isLeader || isSelected) && (
                <circle
                  cx={x}
                  cy={y}
                  r={isSelected ? 16 : 14}
                  fill="none"
                  stroke={isSelected ? "var(--accent)" : color}
                  strokeOpacity="0.45"
                  strokeWidth="1"
                />
              )}
              <circle cx={x} cy={y} r="5" fill={color} />
              <text
                x={x}
                y={y + 18}
                textAnchor="middle"
                fill={isSelected ? "var(--accent-muted)" : "rgba(210,210,218,0.42)"}
                fontSize="8.5"
                fontFamily="monospace"
              >
                {node.id}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="absolute bottom-4 left-4 flex gap-4 text-[9px] uppercase tracking-[0.12em] text-text-faint">
        {(["leader", "follower", "candidate"] as NodeRole[]).map((role) => (
          <span key={role} className="flex items-center gap-1.5">
            <span className="h-1 w-1 rounded-full" style={{ background: roleColor(role) }} />
            {role}
          </span>
        ))}
      </div>
    </div>
  );
}

function NodeDetail({ node, isLeader }: { node: ClusterNode; isLeader: boolean }) {
  const syncPct = Math.round((node.matchIndex / Math.max(node.logIndex, 1)) * 100);

  return (
    <div className="panel-inset p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="label-caps">Selected</p>
          <p className="mt-1 font-display text-lg font-semibold tracking-[-0.02em] text-text">
            {node.id}
          </p>
          <p className="mt-0.5 text-[11px] text-text-muted">{node.region}</p>
        </div>
        <RoleBadge role={node.role} />
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 text-[11px]">
        {[
          ["Term", node.term],
          ["Log", node.logIndex.toLocaleString()],
          ["Match", node.matchIndex.toLocaleString()],
          ["Heartbeat", `${node.lastHeartbeatMs} ms`],
        ].map(([k, v]) => (
          <div key={k}>
            <dt className="text-text-faint">{k}</dt>
            <dd className="metric-value mt-0.5 text-text">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-5">
        <div className="mb-1.5 flex justify-between text-[10px] text-text-faint">
          <span>Replication sync</span>
          <span className="metric-value text-text">{syncPct}%</span>
        </div>
        <div className="h-px overflow-hidden bg-border">
          <div
            className="h-full transition-all duration-700 ease-out"
            style={{
              width: `${syncPct}%`,
              background: isLeader ? "var(--leader)" : "var(--follower)",
            }}
          />
        </div>
      </div>
    </div>
  );
}

function EventFeed({ events }: { events: ClusterSnapshot["recentEvents"] }) {
  return (
    <div className="panel-inset flex min-h-[220px] flex-col overflow-hidden lg:min-h-0 lg:flex-1">
      <div className="border-b border-border px-4 py-3">
        <p className="label-caps">Events</p>
      </div>
      <div className="scrollbar-hide flex-1 overflow-y-auto">
        {events.map((event, i) => (
          <div
            key={event.id}
            className={`border-b border-border/60 px-4 py-2.5 text-[11px] leading-relaxed last:border-0 ${
              i === 0 ? "event-flash" : ""
            }`}
          >
            <span className="text-text-faint">
              {new Date(event.ts).toLocaleTimeString("en-US", { hour12: false })}
            </span>
            <span className="ml-3 text-text-muted">{event.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function NodeCard({
  node,
  isLeader,
  isSelected,
  onSelect,
}: {
  node: ClusterNode;
  isLeader: boolean;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`panel-inset w-full p-3.5 text-left transition-colors duration-200 hover:border-border-bright focus-visible:border-border-bright ${
        isSelected ? "border-accent/15 bg-accent-dim" : ""
      } ${isLeader ? "border-leader/15" : ""}`}
      aria-pressed={isSelected}
      aria-label={`Select ${node.id}, ${node.role}`}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-medium text-text">{node.id}</p>
        <RoleBadge role={node.role} />
      </div>
      <p className="mt-1 text-[10px] text-text-faint">{node.region}</p>
      <div className="mt-3 flex justify-between text-[10px]">
        <span className="text-text-faint">
          log <span className="metric-value text-text-muted">{node.logIndex.toLocaleString()}</span>
        </span>
        <span className="text-text-faint">
          match{" "}
          <span className="metric-value text-text-muted">{node.matchIndex.toLocaleString()}</span>
        </span>
      </div>
    </button>
  );
}

export function LiveCluster() {
  const [cluster, setCluster] = useState<ClusterSnapshot>(() => createInitialCluster());
  const [selectedId, setSelectedId] = useState("node-1");
  const [pulseKey, setPulseKey] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setCluster((prev) => tickCluster(prev));
      setPulseKey((k) => k + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  const selectedNode = useMemo(
    () => cluster.nodes.find((n) => n.id === selectedId) ?? cluster.nodes[0],
    [cluster.nodes, selectedId],
  );

  return (
    <section id="cluster" className="section-anchor border-b border-border bg-bg">
      <TelemetryStrip cluster={cluster} />

      <div className="section-shell section-pad-tight">
        <SectionHeader
          label="Live cluster"
          title="Five-node replication"
          description="Simulated leader election, log replication, and commit advancement."
        />

        <div className="dashboard-shell">
          <div className="grid divide-y divide-border sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-y-0">
            <MetricCell label="Term" value={String(cluster.term)} />
            <MetricCell label="Commit index" value={cluster.commitIndex.toLocaleString()} />
            <MetricCell label="Last applied" value={cluster.lastApplied.toLocaleString()} />
            <MetricCell label="Uptime" value={formatUptime(cluster.uptimeSec)} />
          </div>

          <div className="grid divide-y divide-border lg:grid-cols-2 lg:divide-x lg:divide-y-0">
            <Sparkline
              label="Throughput"
              data={cluster.opsHistory}
              color="var(--accent)"
              value={cluster.opsPerSec.toLocaleString()}
              unit="ops/s"
              min={500}
              max={1300}
            />
            <Sparkline
              label="Replication lag"
              data={cluster.lagHistory}
              color="var(--leader)"
              value={String(cluster.replicationLagMs)}
              unit="ms"
              min={0}
              max={140}
            />
          </div>

          <div className="grid divide-y divide-border lg:grid-cols-12 lg:divide-x lg:divide-y-0">
            <div className="p-4 lg:col-span-7">
              <p className="label-caps mb-3 px-1">Topology</p>
              <TopologyMap
                nodes={cluster.nodes}
                leaderId={cluster.leaderId}
                selectedId={selectedId}
                onSelect={setSelectedId}
                pulseKey={pulseKey}
              />
            </div>
            <div className="flex flex-col gap-3 p-4 lg:col-span-5">
              <NodeDetail node={selectedNode} isLeader={selectedNode.id === cluster.leaderId} />
              <EventFeed events={cluster.recentEvents} />
            </div>
          </div>

          <div className="grid gap-px border-t border-border bg-border sm:grid-cols-2 lg:grid-cols-5">
            {cluster.nodes.map((node) => (
              <div key={node.id} className="bg-surface">
                <NodeCard
                  node={node}
                  isLeader={node.id === cluster.leaderId}
                  isSelected={node.id === selectedId}
                  onSelect={() => setSelectedId(node.id)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
