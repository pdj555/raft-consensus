package io.distributed.consensus.raft.core;

/**
 * Base marker interface for all Raft protocol messages.
 */
public sealed interface RaftMessage permits AppendEntriesRequest, AppendEntriesResponse,
        RequestVoteRequest, RequestVoteResponse {

    /**
     * Returns the message source.
     *
     * @return source node identifier
     */
    NodeId source();

    /**
     * Returns the destination node identifier.
     *
     * @return destination node identifier
     */
    NodeId destination();
}
