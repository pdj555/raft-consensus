package io.distributed.consensus.raft.core;

/**
 * Abstraction used by {@link DefaultRaftNode} to deliver protocol messages to peers.
 */
@FunctionalInterface
public interface RaftTransport {

    /**
     * Sends an outbound message to the specified peer.
     *
     * @param message protocol message to deliver
     */
    void send(RaftMessage message);
}
