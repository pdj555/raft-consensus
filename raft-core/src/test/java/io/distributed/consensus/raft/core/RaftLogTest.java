package io.distributed.consensus.raft.core;

import static org.assertj.core.api.Assertions.assertThat;

import java.nio.charset.StandardCharsets;
import java.util.List;
import org.junit.jupiter.api.Test;

final class RaftLogTest {

    @Test
    void replacesConflictingEntries() {
        final RaftLog log = new RaftLog();
        log.appendFrom(List.of(
                new LogEntry(1, 1, "one".getBytes(StandardCharsets.UTF_8)),
                new LogEntry(2, 1, "two".getBytes(StandardCharsets.UTF_8))));
        assertThat(log.lastIndex()).isEqualTo(2);
        assertThat(log.matches(2, 1)).isTrue();

        log.appendFrom(List.of(
                new LogEntry(2, 2, "two-alt".getBytes(StandardCharsets.UTF_8)),
                new LogEntry(3, 2, "three".getBytes(StandardCharsets.UTF_8))));

        assertThat(log.lastIndex()).isEqualTo(3);
        assertThat(log.matches(2, 2)).isTrue();
        assertThat(log.matches(3, 2)).isTrue();
        assertThat(new String(log.entryAt(2).command(), StandardCharsets.UTF_8)).isEqualTo("two-alt");
        assertThat(new String(log.entryAt(3).command(), StandardCharsets.UTF_8)).isEqualTo("three");
    }
}
