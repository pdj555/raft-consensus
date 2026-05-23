"use client";

import { useEffect, useMemo, useState } from "react";
import {
  createInitialCluster,
  formatUptime,
  roleColor,
  tickCluster,
  type ClusterNode,
  type ClusterSnapshot,
  type NodeRole,
} from "@/lib/raft-simulation";
import { Sparkline } from "@/components/Sparkline";
import { TelemetryStrip } from "@/components/TelemetryStrip";

function MetricCell({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="panel px-4 py-3">
      <p className="label-caps">{label}</p>
      <p className="metric-value mt-1 text-xl font-semibold text-text">
        {value}
        {unit && (
          <span className="ml-1 text-xs font-normal text-text-muted">{unit}</span>
        )}
      </p>
    </div>
  );
}

function RoleBadge({ role }: { role: NodeRole }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[10px] uppercase tracking-widest"
      style={{
        color: roleColor(role),
        background: `color-mix(in srgb, ${roleColor(role)} 12%, transparent)`,
        border: `1px solid color-mix(in srgb, ${roleColor(role)} 30%, transparent)`,
      }}
    >
      <span className="h-1 w-1 rounded-full" style={{ background: roleColor(role) }} />
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
    <div className="panel relative min-h-[320px] overflow-hidden rounded lg:min-h-[420px]">
      <div className="absolute inset-x-0 top-0 flex items-center justify-between border-b border-border px-4 py-3">
        <p className="label-caps">Node topology</p>
        <p className="text-[10px] text-text-muted">Click a node for detail</p>
      </div>

      <div className="absolute inset-0 top-12 opacity-30">
        <svg viewBox="0 0 800 450" className="h-full w-full" aria-hidden="true">
          <defs>
            <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.5" fill="rgba(255,255,255,0.15)" />
            </pattern>
          </defs>
          <rect width="800" height="450" fill="url(#dots)" />
        </svg>
      </div>

      <svg viewBox="0 0 800 450" className="relative mt-12 h-[calc(100%-3rem)] w-full">
        {leader &&
          nodes
            .filter((n) => n.id !== leader.id)
            .map((follower) => {
              const a = nodeCoords(leader);
              const b = nodeCoords(follower);
              return (
                <g key={`pulse-${leader.id}-${follower.id}-${pulseKey}`}>
                  <line
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    stroke="rgba(255,176,32,0.12)"
                    strokeWidth="1"
                  />
                  <circle r="3" fill="var(--leader)">
                    <animateMotion
                      dur="1.8s"
                      repeatCount="1"
                      path={`M ${a.x} ${a.y} L ${b.x} ${b.y}`}
                    />
                    <animate
                      attributeName="opacity"
                      values="0;1;1;0"
                      dur="1.8s"
                      repeatCount="1"
                    />
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
                stroke={linked ? "rgba(255,176,32,0.2)" : "rgba(74,158,255,0.06)"}
                strokeWidth={linked ? 1.2 : 0.5}
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
              className="cursor-pointer"
              onClick={() => onSelect(node.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onSelect(node.id);
              }}
            >
              {(isLeader || isSelected) && (
                <circle
                  cx={x}
                  cy={y}
                  r={isSelected ? 22 : 18}
                  fill="none"
                  stroke={isSelected ? "var(--accent)" : color}
                  strokeOpacity="0.35"
                >
                  {isLeader && (
                    <animate attributeName="r" values="14;22;14" dur="3s" repeatCount="indefinite" />
                  )}
                </circle>
              )}
              <circle cx={x} cy={y} r="7" fill={color} />
              <text
                x={x}
                y={y + 22}
                textAnchor="middle"
                fill={isSelected ? "var(--accent)" : "rgba(240,240,245,0.6)"}
                fontSize="9"
                fontFamily="monospace"
              >
                {node.id}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="absolute bottom-3 left-3 flex gap-3 text-[10px]">
        {(["leader", "follower", "candidate"] as NodeRole[]).map((role) => (
          <span key={role} className="flex items-center gap-1.5 text-text-muted">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: roleColor(role) }} />
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
    <div className="panel-raised rounded p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="label-caps">Selected node</p>
          <p className="mt-1 text-lg font-semibold text-text">{node.id}</p>
          <p className="text-[11px] text-text-muted">{node.region}</p>
        </div>
        <RoleBadge role={node.role} />
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-3 text-[11px]">
        {[
          ["Term", node.term],
          ["Log index", node.logIndex.toLocaleString()],
          ["Match index", node.matchIndex.toLocaleString()],
          ["Heartbeat", `${node.lastHeartbeatMs}ms`],
          ["Sync", `${syncPct}%`],
          ["Status", isLeader ? "Primary" : "Replica"],
        ].map(([k, v]) => (
          <div key={k}>
            <dt className="text-text-muted">{k}</dt>
            <dd className="metric-value mt-0.5 text-text">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-4 h-1 overflow-hidden rounded-full bg-border">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${syncPct}%`,
            background: isLeader ? "var(--leader)" : "var(--follower)",
          }}
        />
      </div>
    </div>
  );
}

function EventFeed({ events }: { events: ClusterSnapshot["recentEvents"] }) {
  return (
    <div className="panel flex max-h-[420px] flex-col overflow-hidden rounded lg:max-h-none lg:min-h-[420px]">
      <div className="border-b border-border px-4 py-3">
        <p className="label-caps">Event stream</p>
      </div>
      <div className="scrollbar-hide flex-1 overflow-y-auto">
        {events.map((event, i) => (
          <div
            key={event.id}
            className={`border-b border-border/50 px-4 py-2.5 text-[11px] leading-relaxed last:border-0 ${
              i === 0 ? "event-flash" : ""
            }`}
          >
            <span
              className="mr-2 inline-block h-1 w-1 rounded-full align-middle"
              style={{
                background:
                  event.level === "success"
                    ? "var(--live)"
                    : event.level === "warn"
                      ? "var(--candidate)"
                      : "var(--follower)",
              }}
            />
            <span className="text-text-muted">
              {new Date(event.ts).toLocaleTimeString("en-US", { hour12: false })}
            </span>
            <span className="ml-2 text-text">{event.message}</span>
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
      className={`panel-raised relative w-full overflow-hidden rounded p-4 text-left transition-all duration-300 hover:border-border-bright ${
        isLeader ? "ring-1 ring-leader/30" : ""
      } ${isSelected ? "ring-1 ring-accent/40 border-accent/30" : ""}`}
    >
      {isLeader && (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent, ${roleColor("leader")}, transparent)`,
          }}
        />
      )}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium text-text">{node.id}</p>
          <p className="mt-0.5 text-[10px] text-text-muted">{node.region}</p>
        </div>
        <RoleBadge role={node.role} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-[10px]">
        <div>
          <span className="text-text-muted">log</span>
          <p className="metric-value text-text">{node.logIndex.toLocaleString()}</p>
        </div>
        <div>
          <span className="text-text-muted">match</span>
          <p className="metric-value text-text">{node.matchIndex.toLocaleString()}</p>
        </div>
      </div>
    </button>
  );
}

export function LiveCluster() {
  const [cluster, setCluster] = useState<ClusterSnapshot>(() => createInitialCluster());
  const [selectedId, setSelectedId] = useState<string>("node-1");
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
    <section id="cluster" className="relative">
      <TelemetryStrip cluster={cluster} />

      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="label-caps mb-2">Live cluster</p>
            <h2
              className="text-3xl font-bold tracking-tight text-text sm:text-4xl"
              style={{ fontFamily: "var(--font-syne)" }}
            >
              Five-node replication
            </h2>
            <p className="mt-3 max-w-xl text-xs leading-relaxed text-text-muted">
              Simulated Raft cluster — leader election, AppendEntries replication, and
              commit index advancement in real time.
            </p>
          </div>
          <p className="label-caps metric-value text-text-muted">
            Seed {cluster.term}-{cluster.commitIndex}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCell label="Term" value={String(cluster.term)} />
          <MetricCell label="Commit index" value={cluster.commitIndex.toLocaleString()} />
          <MetricCell label="Last applied" value={cluster.lastApplied.toLocaleString()} />
          <MetricCell
            label="Uptime"
            value={formatUptime(cluster.uptimeSec)}
          />
        </div>

        <div className="mt-3 grid gap-3 lg:grid-cols-2">
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

        <div className="mt-3 grid gap-3 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <TopologyMap
              nodes={cluster.nodes}
              leaderId={cluster.leaderId}
              selectedId={selectedId}
              onSelect={setSelectedId}
              pulseKey={pulseKey}
            />
          </div>
          <div className="flex flex-col gap-3 lg:col-span-5">
            <NodeDetail node={selectedNode} isLeader={selectedNode.id === cluster.leaderId} />
            <EventFeed events={cluster.recentEvents} />
          </div>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {cluster.nodes.map((node) => (
            <NodeCard
              key={node.id}
              node={node}
              isLeader={node.id === cluster.leaderId}
              isSelected={node.id === selectedId}
              onSelect={() => setSelectedId(node.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
