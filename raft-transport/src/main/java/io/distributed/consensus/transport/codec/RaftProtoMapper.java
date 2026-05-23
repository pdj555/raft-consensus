package io.distributed.consensus.transport.codec;

import java.util.ArrayList;
import java.util.List;

import io.distributed.consensus.raft.core.AppendEntriesRequest;
import io.distributed.consensus.raft.core.AppendEntriesResponse;
import io.distributed.consensus.raft.core.LogEntry;
import io.distributed.consensus.raft.core.NodeId;
import io.distributed.consensus.raft.core.RaftMessage;
import io.distributed.consensus.raft.core.RequestVoteRequest;
import io.distributed.consensus.raft.core.RequestVoteResponse;
import io.distributed.consensus.transport.proto.AppendEntriesRequestProto;
import io.distributed.consensus.transport.proto.AppendEntriesResponseProto;
import io.distributed.consensus.transport.proto.LogEntryProto;
import io.distributed.consensus.transport.proto.NodeIdProto;
import io.distributed.consensus.transport.proto.RaftEnvelope;
import io.distributed.consensus.transport.proto.RequestVoteRequestProto;
import io.distributed.consensus.transport.proto.RequestVoteResponseProto;

/**
 * Converts between core {@link RaftMessage} records and protobuf wire envelopes.
 */
public final class RaftProtoMapper {

    private RaftProtoMapper() {
    }

    /**
     * Serializes a Raft message to protobuf bytes.
     *
     * @param message domain message
     * @return encoded envelope bytes
     */
    public static byte[] toBytes(final RaftMessage message) {
        return toEnvelope(message).toByteArray();
    }

    /**
     * Parses protobuf bytes into a domain message.
     *
     * @param payload encoded envelope bytes
     * @return domain message
     * @throws IllegalArgumentException if the payload is not a valid envelope
     */
    public static RaftMessage fromBytes(final byte[] payload) {
        try {
            return fromEnvelope(RaftEnvelope.parseFrom(payload));
        } catch (com.google.protobuf.InvalidProtocolBufferException ex) {
            throw new IllegalArgumentException("Invalid Raft envelope", ex);
        }
    }

    private static RaftEnvelope toEnvelope(final RaftMessage message) {
        final RaftEnvelope.Builder builder = RaftEnvelope.newBuilder();
        switch (message) {
            case RequestVoteRequest request -> builder.setRequestVoteRequest(toProto(request));
            case RequestVoteResponse response -> builder.setRequestVoteResponse(toProto(response));
            case AppendEntriesRequest request -> builder.setAppendEntriesRequest(toProto(request));
            case AppendEntriesResponse response -> builder.setAppendEntriesResponse(toProto(response));
            default -> throw new IllegalArgumentException("Unsupported message type: " + message.getClass());
        }
        return builder.build();
    }

    private static RaftMessage fromEnvelope(final RaftEnvelope envelope) {
        return switch (envelope.getPayloadCase()) {
            case REQUEST_VOTE_REQUEST -> fromProto(envelope.getRequestVoteRequest());
            case REQUEST_VOTE_RESPONSE -> fromProto(envelope.getRequestVoteResponse());
            case APPEND_ENTRIES_REQUEST -> fromProto(envelope.getAppendEntriesRequest());
            case APPEND_ENTRIES_RESPONSE -> fromProto(envelope.getAppendEntriesResponse());
            case PAYLOAD_NOT_SET -> throw new IllegalArgumentException("Raft envelope payload is empty");
        };
    }

    private static NodeIdProto toProto(final NodeId nodeId) {
        return NodeIdProto.newBuilder().setValue(nodeId.value()).build();
    }

    private static NodeId fromProto(final NodeIdProto nodeId) {
        return new NodeId(nodeId.getValue());
    }

    private static RequestVoteRequestProto toProto(final RequestVoteRequest request) {
        return RequestVoteRequestProto.newBuilder()
                .setSource(toProto(request.source()))
                .setDestination(toProto(request.destination()))
                .setTerm(request.term())
                .setLastLogIndex(request.lastLogIndex())
                .setLastLogTerm(request.lastLogTerm())
                .build();
    }

    private static RequestVoteRequest fromProto(final RequestVoteRequestProto request) {
        return new RequestVoteRequest(
                fromProto(request.getSource()),
                fromProto(request.getDestination()),
                request.getTerm(),
                request.getLastLogIndex(),
                request.getLastLogTerm());
    }

    private static RequestVoteResponseProto toProto(final RequestVoteResponse response) {
        return RequestVoteResponseProto.newBuilder()
                .setSource(toProto(response.source()))
                .setDestination(toProto(response.destination()))
                .setTerm(response.term())
                .setVoteGranted(response.voteGranted())
                .build();
    }

    private static RequestVoteResponse fromProto(final RequestVoteResponseProto response) {
        return new RequestVoteResponse(
                fromProto(response.getSource()),
                fromProto(response.getDestination()),
                response.getTerm(),
                response.getVoteGranted());
    }

    private static AppendEntriesRequestProto toProto(final AppendEntriesRequest request) {
        final AppendEntriesRequestProto.Builder builder = AppendEntriesRequestProto.newBuilder()
                .setSource(toProto(request.source()))
                .setDestination(toProto(request.destination()))
                .setTerm(request.term())
                .setPrevLogIndex(request.prevLogIndex())
                .setPrevLogTerm(request.prevLogTerm())
                .setLeaderCommit(request.leaderCommit());
        for (final LogEntry entry : request.entries()) {
            builder.addEntries(toProto(entry));
        }
        return builder.build();
    }

    private static AppendEntriesRequest fromProto(final AppendEntriesRequestProto request) {
        final List<LogEntry> entries = new ArrayList<>(request.getEntriesCount());
        for (final LogEntryProto entry : request.getEntriesList()) {
            entries.add(fromProto(entry));
        }
        return new AppendEntriesRequest(
                fromProto(request.getSource()),
                fromProto(request.getDestination()),
                request.getTerm(),
                request.getPrevLogIndex(),
                request.getPrevLogTerm(),
                entries,
                request.getLeaderCommit());
    }

    private static AppendEntriesResponseProto toProto(final AppendEntriesResponse response) {
        return AppendEntriesResponseProto.newBuilder()
                .setSource(toProto(response.source()))
                .setDestination(toProto(response.destination()))
                .setTerm(response.term())
                .setSuccess(response.success())
                .setMatchIndex(response.matchIndex())
                .build();
    }

    private static AppendEntriesResponse fromProto(final AppendEntriesResponseProto response) {
        return new AppendEntriesResponse(
                fromProto(response.getSource()),
                fromProto(response.getDestination()),
                response.getTerm(),
                response.getSuccess(),
                response.getMatchIndex());
    }

    private static LogEntryProto toProto(final LogEntry entry) {
        final LogEntryProto.Builder builder = LogEntryProto.newBuilder()
                .setIndex(entry.index())
                .setTerm(entry.term());
        if (!entry.isNoOp()) {
            builder.setCommand(com.google.protobuf.ByteString.copyFrom(entry.command()));
        }
        return builder.build();
    }

    private static LogEntry fromProto(final LogEntryProto entry) {
        final byte[] command = entry.getCommand().isEmpty() ? null : entry.getCommand().toByteArray();
        return new LogEntry(entry.getIndex(), entry.getTerm(), command);
    }
}
