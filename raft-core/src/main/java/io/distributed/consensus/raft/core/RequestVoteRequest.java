package io.distributed.consensus.raft.core;

/**
 * RequestVote RPC issued by candidates to solicit leadership votes.
 */
public record RequestVoteRequest(NodeId source, NodeId destination, long term, long lastLogIndex,
                                 long lastLogTerm) implements RaftMessage {

    /**
     * Creates a request vote RPC.
     */
    public RequestVoteRequest {
        if (term < 0) {
            throw new IllegalArgumentException("Term must be non-negative");
        }
        if (lastLogIndex < 0) {
            throw new IllegalArgumentException("Last log index must be non-negative");
        }
        if (lastLogTerm < 0) {
            throw new IllegalArgumentException("Last log term must be non-negative");
        }
    }
}
