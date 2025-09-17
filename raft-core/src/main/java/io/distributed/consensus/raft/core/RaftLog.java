package io.distributed.consensus.raft.core;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * In-memory log storage used by the default Raft implementation.
 */
final class RaftLog {

    private final List<LogEntry> entries = new ArrayList<>();

    RaftLog() {
        // Index 0 is an empty sentinel that simplifies arithmetic.
        entries.add(null);
    }

    long lastIndex() {
        return entries.size() - 1L;
    }

    long lastTerm() {
        if (entries.size() <= 1) {
            return 0L;
        }
        return entries.get(entries.size() - 1).term();
    }

    boolean hasEntry(final long index) {
        return index >= 0 && index < entries.size();
    }

    long termAt(final long index) {
        if (index == 0) {
            return 0L;
        }
        if (!hasEntry(index)) {
            throw new IllegalArgumentException("Missing log entry at index " + index);
        }
        final LogEntry entry = entries.get((int) index);
        return entry == null ? 0L : entry.term();
    }

    boolean matches(final long index, final long term) {
        if (index == 0) {
            return term == 0L;
        }
        if (!hasEntry(index)) {
            return false;
        }
        final LogEntry entry = entries.get((int) index);
        return entry != null && entry.term() == term;
    }

    void appendFrom(final List<LogEntry> newEntries) {
        for (final LogEntry entry : newEntries) {
            ensureSequential(entry);
            if (!hasEntry(entry.index())) {
                entries.add(entry);
                continue;
            }
            final LogEntry existing = entries.get((int) entry.index());
            if (existing != null && existing.term() == entry.term()) {
                continue;
            }
            truncate(entry.index() - 1);
            entries.add(entry);
        }
    }

    List<LogEntry> entriesFrom(final long startIndex) {
        if (startIndex >= entries.size()) {
            return List.of();
        }
        return Collections.unmodifiableList(new ArrayList<>(entries.subList((int) startIndex, entries.size())));
    }

    LogEntry entryAt(final long index) {
        if (!hasEntry(index)) {
            throw new IllegalArgumentException("Missing log entry at index " + index);
        }
        final LogEntry entry = entries.get((int) index);
        if (entry == null) {
            throw new IllegalStateException("Index 0 is reserved for sentinel usage");
        }
        return entry;
    }

    void truncate(final long lastIndexToKeep) {
        final int size = entries.size();
        final int targetSize = (int) Math.max(1L, lastIndexToKeep + 1);
        for (int i = size - 1; i >= targetSize; i--) {
            entries.remove(i);
        }
    }

    private void ensureSequential(final LogEntry entry) {
        final long expectedIndex = entries.size();
        if (entry.index() > expectedIndex) {
            throw new IllegalArgumentException("Gap detected while appending log entry " + entry.index());
        }
    }
}
