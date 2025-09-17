package io.distributed.consensus.raft.core;

import java.util.Objects;

/**
 * Immutable identifier for a node participating in the Raft cluster.
 */
public final class NodeId {

    private final String value;

    /**
     * Creates a new node identifier.
     *
     * @param value textual representation of the node id
     */
    public NodeId(final String value) {
        this.value = Objects.requireNonNull(value, "value");
    }

    /**
     * Returns the textual identifier.
     *
     * @return node id value
     */
    public String value() {
        return value;
    }

    @Override
    public String toString() {
        return value;
    }

    @Override
    public boolean equals(final Object obj) {
        if (this == obj) {
            return true;
        }
        if (!(obj instanceof NodeId nodeId)) {
            return false;
        }
        return value.equals(nodeId.value);
    }

    @Override
    public int hashCode() {
        return value.hashCode();
    }
}
