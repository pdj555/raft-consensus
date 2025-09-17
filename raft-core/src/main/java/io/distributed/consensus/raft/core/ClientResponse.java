package io.distributed.consensus.raft.core;

import java.util.Arrays;
import java.util.Objects;

/**
 * Result for a client command submitted to the Raft cluster.
 */
public final class ClientResponse {

    /** Response status codes. */
    public enum Status {
        /** Command successfully committed and applied. */
        SUCCESS,
        /**
         * Node is not the cluster leader. The caller should redirect the request to the provided
         * leader hint when available.
         */
        NOT_LEADER,
        /** Failure occurred during replication or shutdown. */
        FAILURE
    }

    private final Status status;
    private final byte[] output;
    private final NodeId leaderHint;

    private ClientResponse(final Status status, final byte[] output, final NodeId leaderHint) {
        this.status = Objects.requireNonNull(status, "status");
        this.output = output == null ? null : output.clone();
        this.leaderHint = leaderHint;
    }

    /**
     * Creates a successful response.
     *
     * @param output state machine output payload
     * @return success response
     */
    public static ClientResponse success(final byte[] output) {
        return new ClientResponse(Status.SUCCESS, output, null);
    }

    /**
     * Creates a redirection response that informs the caller which node is likely the leader.
     *
     * @param leaderHint identifier of the known leader, may be {@code null}
     * @return not-leader response
     */
    public static ClientResponse notLeader(final NodeId leaderHint) {
        return new ClientResponse(Status.NOT_LEADER, null, leaderHint);
    }

    /**
     * Creates a failure response.
     *
     * @param leaderHint best-effort leader hint, may be {@code null}
     * @return failure response
     */
    public static ClientResponse failure(final NodeId leaderHint) {
        return new ClientResponse(Status.FAILURE, null, leaderHint);
    }

    /**
     * Returns the response status.
     *
     * @return status enum
     */
    public Status status() {
        return status;
    }

    /**
     * Returns the optional state machine output payload.
     *
     * @return response payload, or {@code null}
     */
    public byte[] output() {
        return output == null ? null : output.clone();
    }

    /**
     * Returns the best-effort leader hint included in redirection responses.
     *
     * @return leader identifier, may be {@code null}
     */
    public NodeId leaderHint() {
        return leaderHint;
    }

    @Override
    public String toString() {
        return "ClientResponse{" +
                "status=" + status +
                ", output=" + (output == null ? "null" : output.length + " bytes") +
                ", leaderHint=" + leaderHint +
                '}';
    }

    @Override
    public boolean equals(final Object obj) {
        if (this == obj) {
            return true;
        }
        if (!(obj instanceof ClientResponse other)) {
            return false;
        }
        return status == other.status
                && Arrays.equals(output, other.output)
                && Objects.equals(leaderHint, other.leaderHint);
    }

    @Override
    public int hashCode() {
        int result = Objects.hash(status, leaderHint);
        result = 31 * result + Arrays.hashCode(output);
        return result;
    }
}
