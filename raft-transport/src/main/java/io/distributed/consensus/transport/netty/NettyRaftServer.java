package io.distributed.consensus.transport.netty;

import java.net.InetSocketAddress;
import java.util.Objects;
import java.util.concurrent.TimeUnit;

import io.distributed.consensus.transport.codec.RaftInboundHandler;
import io.distributed.consensus.transport.codec.RaftMessageDecoder;
import io.distributed.consensus.transport.codec.RaftMessageEncoder;
import io.netty.bootstrap.ServerBootstrap;
import io.netty.channel.Channel;
import io.netty.channel.ChannelFuture;
import io.netty.channel.ChannelInitializer;
import io.netty.channel.ChannelOption;
import io.netty.channel.EventLoopGroup;
import io.netty.channel.socket.SocketChannel;
import io.netty.channel.socket.nio.NioServerSocketChannel;
import io.netty.handler.codec.LengthFieldBasedFrameDecoder;
import io.netty.handler.codec.LengthFieldPrepender;

/**
 * Netty TCP server accepting length-prefixed Raft RPC frames.
 */
public final class NettyRaftServer implements AutoCloseable {

    private final Channel serverChannel;

    private NettyRaftServer(final Channel serverChannel) {
        this.serverChannel = serverChannel;
    }

    /**
     * Binds a Raft server on an ephemeral localhost port.
     *
     * @param bossGroup   boss event loop group
     * @param workerGroup worker event loop group
     * @param handler     inbound message handler
     * @return bound server
     * @throws IllegalStateException if binding fails
     */
    public static NettyRaftServer bind(final EventLoopGroup bossGroup, final EventLoopGroup workerGroup,
                                       final RaftInboundHandler handler) {
        Objects.requireNonNull(bossGroup, "bossGroup");
        Objects.requireNonNull(workerGroup, "workerGroup");
        Objects.requireNonNull(handler, "handler");
        final ServerBootstrap bootstrap = new ServerBootstrap()
                .group(bossGroup, workerGroup)
                .channel(NioServerSocketChannel.class)
                .childOption(ChannelOption.TCP_NODELAY, true)
                .childHandler(new ChannelInitializer<SocketChannel>() {
                    @Override
                    protected void initChannel(final SocketChannel channel) {
                        channel.pipeline()
                                .addLast(new LengthFieldBasedFrameDecoder(Integer.MAX_VALUE, 0, 4, 0, 4))
                                .addLast(new LengthFieldPrepender(4))
                                .addLast(new RaftMessageDecoder())
                                .addLast(new RaftMessageEncoder())
                                .addLast(handler);
                    }
                });
        final ChannelFuture bindFuture = bootstrap.bind(new InetSocketAddress("127.0.0.1", 0)).awaitUninterruptibly();
        if (!bindFuture.isSuccess()) {
            throw new IllegalStateException("Failed to bind Raft server", bindFuture.cause());
        }
        return new NettyRaftServer(bindFuture.channel());
    }

    /**
     * Returns the bound listen address.
     *
     * @return local socket address
     */
    public InetSocketAddress localAddress() {
        return (InetSocketAddress) serverChannel.localAddress();
    }

    @Override
    public void close() {
        serverChannel.close().awaitUninterruptibly(5, TimeUnit.SECONDS);
    }
}
