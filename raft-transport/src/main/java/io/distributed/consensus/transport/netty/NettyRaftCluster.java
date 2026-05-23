package io.distributed.consensus.transport.netty;

import java.net.InetSocketAddress;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.function.Consumer;

import io.distributed.consensus.raft.core.DefaultRaftNode;
import io.distributed.consensus.raft.core.NodeId;
import io.distributed.consensus.raft.core.RaftConfig;
import io.distributed.consensus.raft.core.StateMachine;
import io.distributed.consensus.transport.codec.RaftInboundHandler;
import io.netty.channel.EventLoopGroup;
import io.netty.channel.nio.NioEventLoopGroup;

/**
 * Starts a multi-node Raft cluster over localhost TCP for tests and tooling.
 */
public final class NettyRaftCluster implements AutoCloseable {

    private final EventLoopGroup bossGroup = new NioEventLoopGroup(1);
    private final EventLoopGroup workerGroup = new NioEventLoopGroup();
    private final Map<NodeId, InetSocketAddress> topology = new ConcurrentHashMap<>();
    private final Map<NodeId, DefaultRaftNode> nodes = new LinkedHashMap<>();
    private final Map<NodeId, NettyRaftServer> servers = new LinkedHashMap<>();
    private final Map<NodeId, NettyRaftTransport> transports = new LinkedHashMap<>();
    private boolean started;

    /**
     * Creates an empty cluster launcher.
     *
     * @return cluster launcher
     */
    public static NettyRaftCluster create() {
        return new NettyRaftCluster();
    }

    /**
     * Registers a node and binds its TCP listener without starting Raft yet.
     *
     * @param nodeId      local node id
     * @param cluster     full cluster membership including this node
     * @param stateMachine state machine for the node
     * @param configurer  optional config overrides
     * @return configured but not started node
     * @throws IllegalStateException if the cluster has already started
     * @throws IllegalArgumentException if the node is already registered
     */
    public DefaultRaftNode addNode(final NodeId nodeId, final Set<NodeId> cluster, final StateMachine stateMachine,
                                   final Consumer<RaftConfig.Builder> configurer) {
        Objects.requireNonNull(nodeId, "nodeId");
        Objects.requireNonNull(cluster, "cluster");
        Objects.requireNonNull(stateMachine, "stateMachine");
        if (started) {
            throw new IllegalStateException("Cannot add nodes after cluster start");
        }
        if (nodes.containsKey(nodeId)) {
            throw new IllegalArgumentException("Node already registered: " + nodeId);
        }

        final RaftConfig.Builder builder = RaftConfig.builder().localNodeId(nodeId);
        for (final NodeId member : cluster) {
            if (!member.equals(nodeId)) {
                builder.addClusterMember(member);
            }
        }
        if (configurer != null) {
            configurer.accept(builder);
        }
        final RaftConfig config = builder.build();

        final NettyRaftTransport transport = new NettyRaftTransport(nodeId, topology, workerGroup);
        final DefaultRaftNode node = DefaultRaftNode.create(config, stateMachine, transport);
        final NettyRaftServer server = NettyRaftServer.bind(bossGroup, workerGroup, new RaftInboundHandler(node));

        topology.put(nodeId, server.localAddress());
        nodes.put(nodeId, node);
        servers.put(nodeId, server);
        transports.put(nodeId, transport);
        return node;
    }

    /**
     * Starts all registered Raft nodes.
     */
    public void startAll() {
        if (started) {
            return;
        }
        for (final DefaultRaftNode node : nodes.values()) {
            node.start();
        }
        started = true;
    }

    /**
     * Returns registered nodes in insertion order.
     *
     * @return live node list
     */
    public List<DefaultRaftNode> nodes() {
        return List.copyOf(nodes.values());
    }

    /**
     * Returns the bound address for a node.
     *
     * @param nodeId node identifier
     * @return listen address
     * @throws IllegalArgumentException if the node is unknown
     */
    public InetSocketAddress addressOf(final NodeId nodeId) {
        final InetSocketAddress address = topology.get(nodeId);
        if (address == null) {
            throw new IllegalArgumentException("Unknown node: " + nodeId);
        }
        return address;
    }

    @Override
    public void close() {
        final List<DefaultRaftNode> shutdownOrder = new ArrayList<>(nodes.values());
        for (final DefaultRaftNode node : shutdownOrder) {
            node.shutdown().orTimeout(5, TimeUnit.SECONDS).join();
        }
        for (final NettyRaftTransport transport : transports.values()) {
            transport.close();
        }
        for (final NettyRaftServer server : servers.values()) {
            server.close();
        }
        bossGroup.shutdownGracefully(0, 5, TimeUnit.SECONDS).awaitUninterruptibly(10, TimeUnit.SECONDS);
        workerGroup.shutdownGracefully(0, 5, TimeUnit.SECONDS).awaitUninterruptibly(10, TimeUnit.SECONDS);
        nodes.clear();
        servers.clear();
        transports.clear();
        topology.clear();
        started = false;
    }
}
