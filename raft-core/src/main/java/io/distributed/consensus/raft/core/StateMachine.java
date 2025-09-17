package io.distributed.consensus.raft.core;

/**
 * Deterministic replicated state machine applied once entries are committed.
 */
public interface StateMachine {

    /**
     * Applies the provided command to the state machine.
     *
     * @param command user command payload, never {@code null}
     * @return optional response payload, may be {@code null}
     */
    byte[] apply(byte[] command);
}
