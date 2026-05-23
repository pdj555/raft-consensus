package io.distributed.consensus.transport.codec;

import io.distributed.consensus.raft.core.RaftMessage;
import io.netty.buffer.ByteBuf;
import io.netty.channel.ChannelHandlerContext;
import io.netty.handler.codec.MessageToByteEncoder;

/**
 * Encodes {@link RaftMessage} instances to length-prefixed protobuf payloads.
 */
public final class RaftMessageEncoder extends MessageToByteEncoder<RaftMessage> {

    @Override
    protected void encode(final ChannelHandlerContext ctx, final RaftMessage message, final ByteBuf out) {
        final byte[] payload = RaftProtoMapper.toBytes(message);
        out.writeBytes(payload);
    }
}
