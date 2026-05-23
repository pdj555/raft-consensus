package io.distributed.consensus.transport.codec;

import java.util.List;

import io.netty.buffer.ByteBuf;
import io.netty.channel.ChannelHandlerContext;
import io.netty.handler.codec.MessageToMessageDecoder;

/**
 * Decodes length-delimited protobuf payloads into {@link io.distributed.consensus.raft.core.RaftMessage} instances.
 */
public final class RaftMessageDecoder extends MessageToMessageDecoder<ByteBuf> {

    @Override
    protected void decode(final ChannelHandlerContext ctx, final ByteBuf buffer, final List<Object> out) {
        final byte[] payload = new byte[buffer.readableBytes()];
        buffer.readBytes(payload);
        out.add(RaftProtoMapper.fromBytes(payload));
    }
}
