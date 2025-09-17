package io.distributed.consensus.raft.core;

import static org.assertj.core.api.Assertions.assertThat;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.function.BooleanSupplier;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

final class DefaultRaftNodeClusterTest {

    private final List<DefaultRaftNode> nodes = new ArrayList<>();

    @AfterEach
    void tearDown() {
        for (final DefaultRaftNode node : nodes) {
            if (node != null) {
                node.shutdown().orTimeout(5, TimeUnit.SECONDS).join();
            }
        }
    }

    @Test
    void electsLeaderAndReplicatesLogEntries() throws Exception {
        final NodeId n1 = new NodeId("n1");
        final NodeId n2 = new NodeId("n2");
        final NodeId n3 = new NodeId("n3");
        final Set<NodeId> cluster = Set.of(n1, n2, n3);

        final InMemoryTransport transport = new InMemoryTransport();

        final RecordingStateMachine sm1 = new RecordingStateMachine();
        final RecordingStateMachine sm2 = new RecordingStateMachine();
        final RecordingStateMachine sm3 = new RecordingStateMachine();

        final DefaultRaftNode node1 = createNode(n1, cluster, sm1, transport);
        final DefaultRaftNode node2 = createNode(n2, cluster, sm2, transport);
        final DefaultRaftNode node3 = createNode(n3, cluster, sm3, transport);
        nodes.addAll(List.of(node1, node2, node3));

        transport.register(n1, node1);
        transport.register(n2, node2);
        transport.register(n3, node3);

        node1.start();
        node2.start();
        node3.start();

        final DefaultRaftNode leader = awaitLeader(nodes, Duration.ofSeconds(5));
        assertThat(leader).isNotNull();
        assertThat(leader.role()).isEqualTo(DefaultRaftNode.Role.LEADER);

        final String command = "set=x";
        final CompletableFuture<ClientResponse> responseFuture = leader.apply(command.getBytes(StandardCharsets.UTF_8));
        final ClientResponse response = responseFuture.get(5, TimeUnit.SECONDS);
        assertThat(response.status()).isEqualTo(ClientResponse.Status.SUCCESS);
        assertThat(new String(response.output(), StandardCharsets.UTF_8)).isEqualTo(command);

        awaitCondition(() -> sm1.commands().size() == 1
                && sm2.commands().size() == 1
                && sm3.commands().size() == 1, Duration.ofSeconds(5));

        assertThat(sm1.commands()).containsExactly(command);
        assertThat(sm2.commands()).containsExactly(command);
        assertThat(sm3.commands()).containsExactly(command);
        awaitCondition(() -> nodes.stream().allMatch(node -> node.leaderId() != null), Duration.ofSeconds(2));
    }

    private static DefaultRaftNode createNode(final NodeId nodeId, final Set<NodeId> cluster,
                                              final StateMachine stateMachine, final InMemoryTransport transport) {
        final RaftConfig.Builder builder = RaftConfig.builder()
                .localNodeId(nodeId)
                .heartbeatInterval(Duration.ofMillis(40))
                .tickInterval(Duration.ofMillis(10))
                .electionTimeoutMin(Duration.ofMillis(120))
                .electionTimeoutMax(Duration.ofMillis(240));
        for (final NodeId member : cluster) {
            if (!member.equals(nodeId)) {
                builder.addClusterMember(member);
            }
        }
        final RaftConfig config = builder.build();
        final DefaultRaftNode node = DefaultRaftNode.create(config, stateMachine, transport);
        return node;
    }

    private static DefaultRaftNode awaitLeader(final List<DefaultRaftNode> nodes, final Duration timeout)
            throws InterruptedException {
        final long deadline = System.nanoTime() + timeout.toNanos();
        while (System.nanoTime() < deadline) {
            for (final DefaultRaftNode node : nodes) {
                if (node.role() == DefaultRaftNode.Role.LEADER) {
                    return node;
                }
            }
            Thread.sleep(20L);
        }
        throw new AssertionError("Leader was not elected within timeout");
    }

    private static void awaitCondition(final BooleanSupplier condition, final Duration timeout)
            throws InterruptedException {
        final long deadline = System.nanoTime() + timeout.toNanos();
        while (System.nanoTime() < deadline) {
            if (condition.getAsBoolean()) {
                return;
            }
            Thread.sleep(10L);
        }
        throw new AssertionError("Condition was not satisfied before timeout");
    }

    private static final class RecordingStateMachine implements StateMachine {

        private final List<String> commands = new ArrayList<>();

        @Override
        public synchronized byte[] apply(final byte[] command) {
            final String value = new String(command, StandardCharsets.UTF_8);
            commands.add(value);
            return command.clone();
        }

        synchronized List<String> commands() {
            return List.copyOf(commands);
        }
    }

    private static final class InMemoryTransport implements RaftTransport {

        private final Map<NodeId, RaftEndpoint> endpoints = new ConcurrentHashMap<>();

        void register(final NodeId nodeId, final RaftEndpoint endpoint) {
            endpoints.put(nodeId, endpoint);
        }

        @Override
        public void send(final RaftMessage message) {
            final RaftEndpoint endpoint = endpoints.get(message.destination());
            if (endpoint == null) {
                throw new IllegalStateException("No endpoint registered for " + message.destination());
            }
            endpoint.handleMessage(message);
        }
    }
}
