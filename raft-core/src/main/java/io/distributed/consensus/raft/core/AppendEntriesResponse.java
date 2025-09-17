package io.distributed.consensus.raft.core;

/**
 * Response to an {@link AppendEntriesRequest} RPC.
 */
public record AppendEntriesResponse(NodeId source, NodeId destination, long term, boolean success,
                                    long matchIndex) implements RaftMessage {

    /**
     * Creates a response object.
     */
    public AppendEntriesResponse {
        if (term < 0) {
            throw new IllegalArgumentException("Term must be non-negative");
        }
        if (matchIndex < 0) {
            throw new IllegalArgumentException("Match index must be non-negative");
        }
    }
}
