package io.distributed.consensus.raft.core;

/**
 * Receives Raft protocol messages from remote nodes.
 */
public interface RaftEndpoint {

    /**
     * Handles an inbound protocol message.
     *
     * @param message message received from a peer
     */
    void handleMessage(RaftMessage message);
}
