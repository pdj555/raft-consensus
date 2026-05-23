package io.distributed.consensus.transport.netty;

import io.distributed.consensus.raft.core.AppendEntriesRequest;
import io.distributed.consensus.raft.core.AppendEntriesResponse;
import io.distributed.consensus.raft.core.NodeId;
import io.distributed.consensus.raft.core.RequestVoteRequest;
import io.distributed.consensus.raft.core.RequestVoteResponse;
import io.distributed.consensus.transport.codec.RaftProtoMapper;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

final class RaftProtoMapperTest {

    private static final NodeId N1 = new NodeId("n1");
    private static final NodeId N2 = new NodeId("n2");

    @Test
    void roundTripsRequestVoteMessages() {
        final RequestVoteRequest request = new RequestVoteRequest(N1, N2, 7, 12, 6);
        final RequestVoteResponse response = new RequestVoteResponse(N2, N1, 7, true);

        assertThat(RaftProtoMapper.fromBytes(RaftProtoMapper.toBytes(request))).isEqualTo(request);
        assertThat(RaftProtoMapper.fromBytes(RaftProtoMapper.toBytes(response))).isEqualTo(response);
    }

    @Test
    void roundTripsAppendEntriesMessages() {
        final AppendEntriesRequest request = new AppendEntriesRequest(
                N1, N2, 3, 4, 2, java.util.List.of(new io.distributed.consensus.raft.core.LogEntry(5, 3, new byte[] {1})), 5);
        final AppendEntriesResponse response = new AppendEntriesResponse(N2, N1, 3, true, 5);

        assertThat(RaftProtoMapper.fromBytes(RaftProtoMapper.toBytes(request))).isEqualTo(request);
        assertThat(RaftProtoMapper.fromBytes(RaftProtoMapper.toBytes(response))).isEqualTo(response);
    }
}
