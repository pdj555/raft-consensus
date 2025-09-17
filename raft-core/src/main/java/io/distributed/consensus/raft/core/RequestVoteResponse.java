package io.distributed.consensus.raft.core;

/**
 * Response to a {@link RequestVoteRequest} RPC.
 */
public record RequestVoteResponse(NodeId source, NodeId destination, long term, boolean voteGranted)
        implements RaftMessage {

    /**
     * Creates a request vote response.
     */
    public RequestVoteResponse {
        if (term < 0) {
            throw new IllegalArgumentException("Term must be non-negative");
        }
    }
}
