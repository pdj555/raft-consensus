package io.distributed.consensus.raft.core;

import java.time.Duration;
import java.util.Collections;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;
import java.util.random.RandomGenerator;

/**
 * Immutable configuration for a Raft node.
 */
public final class RaftConfig {

    private final NodeId localNodeId;
    private final Set<NodeId> cluster;
    private final Duration heartbeatInterval;
    private final Duration tickInterval;
    private final Duration electionTimeoutMin;
    private final Duration electionTimeoutMax;
    private final int quorumSize;

    private RaftConfig(final Builder builder) {
        this.localNodeId = Objects.requireNonNull(builder.localNodeId, "localNodeId");
        this.cluster = Collections.unmodifiableSet(new HashSet<>(builder.cluster));
        this.heartbeatInterval = Objects.requireNonNull(builder.heartbeatInterval, "heartbeatInterval");
        this.tickInterval = Objects.requireNonNull(builder.tickInterval, "tickInterval");
        this.electionTimeoutMin = Objects.requireNonNull(builder.electionTimeoutMin, "electionTimeoutMin");
        this.electionTimeoutMax = Objects.requireNonNull(builder.electionTimeoutMax, "electionTimeoutMax");
        if (!cluster.contains(localNodeId)) {
            throw new IllegalArgumentException("Cluster must include the local node id");
        }
        if (cluster.size() < 3) {
            throw new IllegalArgumentException("Cluster must contain at least three nodes for fault tolerance");
        }
        if (!electionTimeoutMax.minus(electionTimeoutMin).isPositive()) {
            throw new IllegalArgumentException("Election timeout max must be greater than min");
        }
        if (!heartbeatInterval.minus(tickInterval).isPositive() && !heartbeatInterval.equals(tickInterval)) {
            throw new IllegalArgumentException("Heartbeat interval must be >= tick interval");
        }
        if (!electionTimeoutMin.minus(heartbeatInterval).isPositive()) {
            throw new IllegalArgumentException("Election timeout must be greater than heartbeat interval");
        }
        if (tickInterval.isZero() || tickInterval.isNegative()) {
            throw new IllegalArgumentException("Tick interval must be positive");
        }
        this.quorumSize = (cluster.size() / 2) + 1;
    }

    /**
     * Returns a builder for the configuration.
     *
     * @return builder
     */
    public static Builder builder() {
        return new Builder();
    }

    /**
     * Returns the identifier of the local node.
     *
     * @return node identifier
     */
    public NodeId localNodeId() {
        return localNodeId;
    }

    /**
     * Returns the set of cluster members.
     *
     * @return immutable cluster view
     */
    public Set<NodeId> cluster() {
        return cluster;
    }

    /**
     * Returns the heartbeat interval used by leaders.
     *
     * @return heartbeat interval
     */
    public Duration heartbeatInterval() {
        return heartbeatInterval;
    }

    /**
     * Returns the scheduler tick interval.
     *
     * @return tick interval
     */
    public Duration tickInterval() {
        return tickInterval;
    }

    /**
     * Returns the minimum election timeout.
     *
     * @return minimum election timeout
     */
    public Duration electionTimeoutMin() {
        return electionTimeoutMin;
    }

    /**
     * Returns the maximum election timeout.
     *
     * @return maximum election timeout
     */
    public Duration electionTimeoutMax() {
        return electionTimeoutMax;
    }

    /**
     * Randomizes a new election timeout.
     *
     * @param random random generator used to select a timeout
     * @return randomized election timeout
     */
    public Duration randomElectionTimeout(final RandomGenerator random) {
        final long min = electionTimeoutMin.toNanos();
        final long max = electionTimeoutMax.toNanos();
        final long bound = Math.max(1L, max - min);
        return Duration.ofNanos(min + random.nextLong(bound));
    }

    /**
     * Returns the size of the cluster quorum.
     *
     * @return majority size
     */
    public int quorumSize() {
        return quorumSize;
    }

    /**
     * Computes whether the provided vote count represents a majority.
     *
     * @param votes number of affirmative votes
     * @return {@code true} if the count is at least the quorum size
     */
    public boolean hasMajority(final int votes) {
        return votes >= quorumSize;
    }

    /**
     * Builder for {@link RaftConfig}.
     */
    public static final class Builder {

        private NodeId localNodeId;
        private final Set<NodeId> cluster = new HashSet<>();
        private Duration heartbeatInterval = Duration.ofMillis(50);
        private Duration tickInterval = Duration.ofMillis(10);
        private Duration electionTimeoutMin = Duration.ofMillis(150);
        private Duration electionTimeoutMax = Duration.ofMillis(300);

        private Builder() {
        }

        /**
         * Sets the local node identifier.
         *
         * @param nodeId node identifier
         * @return this builder
         */
        public Builder localNodeId(final NodeId nodeId) {
            this.localNodeId = Objects.requireNonNull(nodeId, "nodeId");
            this.cluster.add(nodeId);
            return this;
        }

        /**
         * Adds a cluster member.
         *
         * @param nodeId node identifier
         * @return this builder
         */
        public Builder addClusterMember(final NodeId nodeId) {
            this.cluster.add(Objects.requireNonNull(nodeId, "nodeId"));
            return this;
        }

        /**
         * Sets the heartbeat interval for leaders.
         *
         * @param interval heartbeat interval
         * @return this builder
         */
        public Builder heartbeatInterval(final Duration interval) {
            this.heartbeatInterval = Objects.requireNonNull(interval, "interval");
            return this;
        }

        /**
         * Sets the tick interval used for scheduling.
         *
         * @param interval tick interval
         * @return this builder
         */
        public Builder tickInterval(final Duration interval) {
            this.tickInterval = Objects.requireNonNull(interval, "interval");
            return this;
        }

        /**
         * Sets the minimum election timeout.
         *
         * @param timeout minimum timeout
         * @return this builder
         */
        public Builder electionTimeoutMin(final Duration timeout) {
            this.electionTimeoutMin = Objects.requireNonNull(timeout, "timeout");
            return this;
        }

        /**
         * Sets the maximum election timeout.
         *
         * @param timeout maximum timeout
         * @return this builder
         */
        public Builder electionTimeoutMax(final Duration timeout) {
            this.electionTimeoutMax = Objects.requireNonNull(timeout, "timeout");
            return this;
        }

        /**
         * Builds the configuration instance.
         *
         * @return immutable configuration
         */
        public RaftConfig build() {
            return new RaftConfig(this);
        }
    }
}
