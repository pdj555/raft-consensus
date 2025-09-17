package io.distributed.consensus.raft.core;

import java.util.List;

/**
 * AppendEntries RPC used for log replication and heartbeats.
 */
public record AppendEntriesRequest(NodeId source, NodeId destination, long term, long prevLogIndex,
                                   long prevLogTerm, List<LogEntry> entries, long leaderCommit)
        implements RaftMessage {

    /**
     * Creates a new append entries request.
     */
    public AppendEntriesRequest {
        if (term < 0) {
            throw new IllegalArgumentException("Term must be non-negative");
        }
        if (prevLogIndex < 0) {
            throw new IllegalArgumentException("Previous log index must be non-negative");
        }
        if (prevLogTerm < 0) {
            throw new IllegalArgumentException("Previous log term must be non-negative");
        }
        if (leaderCommit < 0) {
            throw new IllegalArgumentException("Leader commit index must be non-negative");
        }
        entries = List.copyOf(entries);
    }
}
