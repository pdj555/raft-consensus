export type NodeRole = "leader" | "follower" | "candidate";

export type ClusterNode = {
  id: string;
  role: NodeRole;
  term: number;
  logIndex: number;
  matchIndex: number;
  region: string;
  lat: number;
  lng: number;
  lastHeartbeatMs: number;
};

export type ClusterSnapshot = {
  nodes: ClusterNode[];
  term: number;
  commitIndex: number;
  lastApplied: number;
  opsPerSec: number;
  replicationLagMs: number;
  uptimeSec: number;
  leaderId: string | null;
  recentEvents: LogEvent[];
  opsHistory: number[];
  lagHistory: number[];
};

export type LogEvent = {
  id: number;
  ts: number;
  message: string;
  level: "info" | "warn" | "success";
};

const REGIONS = [
  { id: "us-east", label: "US East", lat: 38.9, lng: -77.0 },
  { id: "us-west", label: "US West", lat: 37.7, lng: -122.4 },
  { id: "eu-west", label: "EU West", lat: 51.5, lng: -0.1 },
  { id: "eu-north", label: "EU North", lat: 59.3, lng: 18.1 },
  { id: "ap-south", label: "AP South", lat: 19.1, lng: 72.9 },
];

let eventCounter = 0;

function pushEvent(
  events: LogEvent[],
  message: string,
  level: LogEvent["level"] = "info",
): LogEvent[] {
  const next = [
    { id: ++eventCounter, ts: Date.now(), message, level },
    ...events,
  ];
  return next.slice(0, 12);
}

export function createInitialCluster(): ClusterSnapshot {
  const nodes: ClusterNode[] = REGIONS.map((r, i) => ({
    id: `node-${i + 1}`,
    role: i === 0 ? "leader" : "follower",
    term: 42,
    logIndex: 12847,
    matchIndex: 12847 - i * 2,
    region: r.label,
    lat: r.lat,
    lng: r.lng,
    lastHeartbeatMs: 12 + i * 8,
  }));

  return {
    nodes,
    term: 42,
    commitIndex: 12847,
    lastApplied: 12845,
    opsPerSec: 847,
    replicationLagMs: 23,
    uptimeSec: 86400 + 3600 * 14,
    leaderId: "node-1",
    opsHistory: Array.from({ length: 48 }, () => 820 + Math.floor(Math.random() * 120)),
    lagHistory: Array.from({ length: 48 }, () => 15 + Math.floor(Math.random() * 25)),
    recentEvents: [
      {
        id: ++eventCounter,
        ts: Date.now(),
        message: "Cluster initialized — 5 nodes online",
        level: "success",
      },
    ],
  };
}

export function tickCluster(prev: ClusterSnapshot): ClusterSnapshot {
  const roll = Math.random();
  let { nodes, term, commitIndex, lastApplied, opsPerSec, replicationLagMs, recentEvents, leaderId } =
    prev;

  opsPerSec = Math.max(620, Math.min(1200, opsPerSec + Math.floor((Math.random() - 0.5) * 80)));
  replicationLagMs = Math.max(8, Math.min(120, replicationLagMs + Math.floor((Math.random() - 0.5) * 20)));
  commitIndex += Math.random() > 0.3 ? 1 : 0;
  lastApplied = Math.min(commitIndex, lastApplied + (Math.random() > 0.5 ? 1 : 0));

  nodes = nodes.map((n) => ({
    ...n,
    logIndex: commitIndex,
    matchIndex: Math.max(0, commitIndex - Math.floor(Math.random() * 4)),
    lastHeartbeatMs: Math.max(4, n.lastHeartbeatMs + Math.floor((Math.random() - 0.5) * 6)),
  }));

  if (roll < 0.02) {
    term += 1;
    const candidateIdx = Math.floor(Math.random() * nodes.length);
    leaderId = nodes[candidateIdx].id;
    nodes = nodes.map((n, i) => ({
      ...n,
      term,
      role: i === candidateIdx ? "leader" : "follower",
    }));
    recentEvents = pushEvent(
      recentEvents,
      `Election complete — ${leaderId} elected leader (term ${term})`,
      "warn",
    );
  } else if (roll < 0.05) {
    const candidateIdx = Math.floor(Math.random() * nodes.length);
    nodes = nodes.map((n, i) => ({
      ...n,
      role: i === candidateIdx ? "candidate" : n.role === "leader" ? "follower" : n.role,
    }));
    leaderId = null;
    recentEvents = pushEvent(
      recentEvents,
      `${nodes[candidateIdx].id} started candidacy (term ${term + 1})`,
      "warn",
    );
  } else if (roll < 0.15) {
    recentEvents = pushEvent(
      recentEvents,
      `AppendEntries replicated to ${3 + Math.floor(Math.random() * 2)}/5 nodes`,
      "info",
    );
  }

  return {
    nodes,
    term,
    commitIndex,
    lastApplied,
    opsPerSec,
    replicationLagMs,
    uptimeSec: prev.uptimeSec + 1,
    leaderId,
    opsHistory: [...prev.opsHistory.slice(-47), opsPerSec],
    lagHistory: [...prev.lagHistory.slice(-47), replicationLagMs],
    recentEvents,
  };
}

export function formatUptime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function roleColor(role: NodeRole): string {
  switch (role) {
    case "leader":
      return "var(--leader)";
    case "candidate":
      return "var(--candidate)";
    default:
      return "var(--follower)";
  }
}
