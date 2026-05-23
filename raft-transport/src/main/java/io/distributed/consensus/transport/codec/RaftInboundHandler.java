package io.distributed.consensus.transport.codec;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.distributed.consensus.raft.core.RaftEndpoint;
import io.distributed.consensus.raft.core.RaftMessage;
import io.netty.channel.ChannelHandler;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.SimpleChannelInboundHandler;

/**
 * Delivers inbound {@link RaftMessage} instances to a {@link RaftEndpoint}.
 */
@ChannelHandler.Sharable
public final class RaftInboundHandler extends SimpleChannelInboundHandler<RaftMessage> {

    private static final Logger LOGGER = LoggerFactory.getLogger(RaftInboundHandler.class);

    private final RaftEndpoint endpoint;

    /**
     * Creates a handler for the supplied endpoint.
     *
     * @param endpoint node receiving inbound RPCs
     */
    public RaftInboundHandler(final RaftEndpoint endpoint) {
        this.endpoint = endpoint;
    }

    @Override
    protected void channelRead0(final ChannelHandlerContext ctx, final RaftMessage message) {
        endpoint.handleMessage(message);
    }

    @Override
    public void exceptionCaught(final ChannelHandlerContext ctx, final Throwable cause) {
        LOGGER.warn("Raft channel error from {}", ctx.channel().remoteAddress(), cause);
        ctx.close();
    }
}
