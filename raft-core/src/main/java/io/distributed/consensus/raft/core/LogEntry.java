package io.distributed.consensus.raft.core;

import java.util.Arrays;
import java.util.Objects;

/**
 * Immutable log entry replicated through the Raft protocol.
 */
public final class LogEntry {

    private final long index;
    private final long term;
    private final byte[] command;

    /**
     * Creates a new log entry.
     *
     * @param index    sequential log index starting at 1
     * @param term     Raft term during which the entry was created
     * @param command  state machine command payload, {@code null} represents a no-op
     */
    public LogEntry(final long index, final long term, final byte[] command) {
        if (index <= 0) {
            throw new IllegalArgumentException("Index must be positive");
        }
        if (term < 0) {
            throw new IllegalArgumentException("Term must be non-negative");
        }
        this.index = index;
        this.term = term;
        this.command = command == null ? null : command.clone();
    }

    /**
     * Returns the log index.
     *
     * @return log index
     */
    public long index() {
        return index;
    }

    /**
     * Returns the term associated with this entry.
     *
     * @return term number
     */
    public long term() {
        return term;
    }

    /**
     * Returns the command payload.
     *
     * @return command bytes or {@code null} for a no-op
     */
    public byte[] command() {
        return command == null ? null : command.clone();
    }

    /**
     * Returns whether the entry is a no-operation marker.
     *
     * @return {@code true} when no command payload exists
     */
    public boolean isNoOp() {
        return command == null;
    }

    @Override
    public boolean equals(final Object obj) {
        if (this == obj) {
            return true;
        }
        if (!(obj instanceof LogEntry other)) {
            return false;
        }
        return index == other.index && term == other.term && Arrays.equals(command, other.command);
    }

    @Override
    public int hashCode() {
        int result = Objects.hash(index, term);
        result = 31 * result + Arrays.hashCode(command);
        return result;
    }

    @Override
    public String toString() {
        return "LogEntry{" +
                "index=" + index +
                ", term=" + term +
                ", command=" + (command == null ? "<noop>" : (command.length + " bytes")) +
                '}';
    }
}
