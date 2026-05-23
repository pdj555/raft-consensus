package io.distributed.consensus.transport.netty;

import java.net.InetSocketAddress;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;

import io.distributed.consensus.raft.core.NodeId;
import io.distributed.consensus.raft.core.RaftMessage;
import io.distributed.consensus.raft.core.RaftTransport;
import io.distributed.consensus.transport.codec.RaftMessageDecoder;
import io.distributed.consensus.transport.codec.RaftMessageEncoder;
import io.netty.bootstrap.Bootstrap;
import io.netty.channel.Channel;
import io.netty.channel.ChannelFuture;
import io.netty.channel.ChannelInitializer;
import io.netty.channel.ChannelOption;
import io.netty.channel.EventLoopGroup;
import io.netty.channel.socket.SocketChannel;
import io.netty.channel.socket.nio.NioSocketChannel;
import io.netty.handler.codec.LengthFieldBasedFrameDecoder;
import io.netty.handler.codec.LengthFieldPrepender;

/**
 * Netty-backed {@link RaftTransport} using persistent TCP channels to peers.
 */
public final class NettyRaftTransport implements RaftTransport {

    private final NodeId localNodeId;
    private final Map<NodeId, InetSocketAddress> topology;
    private final EventLoopGroup workerGroup;
    private final Map<NodeId, Channel> channels = new ConcurrentHashMap<>();

    /**
     * Creates a transport for the local node.
     *
     * @param localNodeId local node identifier
     * @param topology    peer address map
     * @param workerGroup shared worker event loop group
     */
    public NettyRaftTransport(final NodeId localNodeId, final Map<NodeId, InetSocketAddress> topology,
                              final EventLoopGroup workerGroup) {
        this.localNodeId = Objects.requireNonNull(localNodeId, "localNodeId");
        this.topology = Objects.requireNonNull(topology, "topology");
        this.workerGroup = Objects.requireNonNull(workerGroup, "workerGroup");
    }

    @Override
    public void send(final RaftMessage message) {
        if (message.destination().equals(localNodeId)) {
            throw new IllegalArgumentException("Cannot send Raft message to local node via transport");
        }
        final Channel channel = channelFor(message.destination());
        channel.writeAndFlush(message);
    }

    /**
     * Closes all outbound peer channels.
     */
    public void close() {
        for (final Channel channel : channels.values()) {
            channel.close().awaitUninterruptibly();
        }
        channels.clear();
    }

    private Channel channelFor(final NodeId destination) {
        return channels.computeIfAbsent(destination, this::connect);
    }

    private Channel connect(final NodeId destination) {
        final InetSocketAddress address = topology.get(destination);
        if (address == null) {
            throw new IllegalStateException("No address registered for peer " + destination);
        }
        final Bootstrap bootstrap = new Bootstrap()
                .group(workerGroup)
                .channel(NioSocketChannel.class)
                .option(ChannelOption.TCP_NODELAY, true)
                .handler(new ChannelInitializer<SocketChannel>() {
                    @Override
                    protected void initChannel(final SocketChannel channel) {
                        channel.pipeline()
                                .addLast(new LengthFieldBasedFrameDecoder(Integer.MAX_VALUE, 0, 4, 0, 4))
                                .addLast(new LengthFieldPrepender(4))
                                .addLast(new RaftMessageDecoder())
                                .addLast(new RaftMessageEncoder());
                    }
                });
        final ChannelFuture connectFuture = bootstrap.connect(address).awaitUninterruptibly();
        if (!connectFuture.isSuccess()) {
            channels.remove(destination);
            throw new IllegalStateException("Failed to connect to peer " + destination, connectFuture.cause());
        }
        return connectFuture.channel();
    }
}
