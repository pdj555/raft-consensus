package io.distributed.consensus.transport.netty;

import static org.assertj.core.api.Assertions.assertThat;

import io.distributed.consensus.raft.core.DefaultRaftNode;
import io.distributed.consensus.raft.core.NodeId;
import io.distributed.consensus.raft.core.StateMachine;
import java.time.Duration;
import java.util.Set;
import org.junit.jupiter.api.Test;

final class NettyRaftClusterTest {

    @Test
    void electsSingleLeaderOverTcp() throws Exception {
        final NodeId n1 = new NodeId("n1");
        final NodeId n2 = new NodeId("n2");
        final NodeId n3 = new NodeId("n3");
        final Set<NodeId> cluster = Set.of(n1, n2, n3);

        try (NettyRaftCluster clusterLauncher = NettyRaftCluster.create()) {
            clusterLauncher.addNode(n1, cluster, noopStateMachine(), fastElectionConfig());
            clusterLauncher.addNode(n2, cluster, noopStateMachine(), fastElectionConfig());
            clusterLauncher.addNode(n3, cluster, noopStateMachine(), fastElectionConfig());
            clusterLauncher.startAll();

            final DefaultRaftNode leader = awaitLeader(clusterLauncher, Duration.ofSeconds(10));
            assertThat(leader.role()).isEqualTo(DefaultRaftNode.Role.LEADER);
            assertThat(clusterLauncher.nodes().stream().filter(node -> node.role() == DefaultRaftNode.Role.LEADER))
                    .hasSize(1);
        }
    }

    private static StateMachine noopStateMachine() {
        return command -> command.clone();
    }

    private static java.util.function.Consumer<io.distributed.consensus.raft.core.RaftConfig.Builder> fastElectionConfig() {
        return builder -> builder
                .heartbeatInterval(Duration.ofMillis(40))
                .tickInterval(Duration.ofMillis(10))
                .electionTimeoutMin(Duration.ofMillis(120))
                .electionTimeoutMax(Duration.ofMillis(240));
    }

    private static DefaultRaftNode awaitLeader(final NettyRaftCluster cluster, final Duration timeout)
            throws InterruptedException {
        final long deadline = System.nanoTime() + timeout.toNanos();
        while (System.nanoTime() < deadline) {
            for (final DefaultRaftNode node : cluster.nodes()) {
                if (node.role() == DefaultRaftNode.Role.LEADER) {
                    return node;
                }
            }
            Thread.sleep(20L);
        }
        throw new AssertionError("Leader was not elected within timeout");
    }
}
