package io.distributed.consensus.raft.core;

import java.util.concurrent.CompletableFuture;

/**
 * Public API for interacting with a Raft node.
 */
public interface RaftNode {

    /**
     * Starts the node's internal event loop.
     */
    void start();

    /**
     * Submits a command for replication through the cluster.
     *
     * @param command state machine command payload
     * @return asynchronous response completed when the command commits
     */
    CompletableFuture<ClientResponse> apply(byte[] command);

    /**
     * Initiates a graceful shutdown.
     *
     * @return completion stage resolved when shutdown finishes
     */
    CompletableFuture<Void> shutdown();
}
