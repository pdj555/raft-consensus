package io.distributed.consensus.raft.core;

import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Tag;
import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;
import java.util.random.RandomGenerator;
import java.util.random.RandomGeneratorFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Default in-memory Raft node implementation featuring leader election and log replication.
 */
public final class DefaultRaftNode implements RaftNode, RaftEndpoint {

    private static final Logger LOGGER = LoggerFactory.getLogger(DefaultRaftNode.class);

    /**
     * Role of the node inside the cluster.
     */
    public enum Role {
        /** Regular follower state. */
        FOLLOWER,
        /** Candidate actively campaigning for leadership. */
        CANDIDATE,
        /** Current cluster leader responsible for log replication. */
        LEADER
    }

    private final RaftConfig config;
    private final StateMachine stateMachine;
    private final RaftTransport transport;
    private final ScheduledExecutorService scheduler;
    private final RandomGenerator random;
    private final AtomicInteger roleGauge;
    private final AtomicLong termGauge;
    private final AtomicLong commitGauge;
    private final CompletableFuture<Void> shutdownFuture = new CompletableFuture<>();

    private final RaftLog log = new RaftLog();
    private final Map<Long, CompletableFuture<ClientResponse>> clientResponses = new HashMap<>();
    private final Map<NodeId, Long> nextIndex = new HashMap<>();
    private final Map<NodeId, Long> matchIndex = new HashMap<>();

    private volatile Role role = Role.FOLLOWER;
    private volatile NodeId leaderId;
    private volatile long currentTerm;
    private volatile NodeId votedFor;
    private volatile int votesGranted;
    private volatile long commitIndex;
    private volatile long lastApplied;

    private volatile long electionDeadlineNanos;
    private volatile long heartbeatDeadlineNanos;
    private volatile boolean running;
    private ScheduledFuture<?> tickerTask;

    /**
     * Creates a new Raft node with the provided dependencies.
     *
     * @param config        immutable configuration
     * @param stateMachine  deterministic state machine applied on commit
     * @param transport     transport used to deliver outbound messages
     * @param scheduler     single-threaded scheduler backing the event loop
     * @param meterRegistry optional metrics registry, may be {@code null}
     */
    public DefaultRaftNode(final RaftConfig config, final StateMachine stateMachine, final RaftTransport transport,
                           final ScheduledExecutorService scheduler, final MeterRegistry meterRegistry) {
        this.config = Objects.requireNonNull(config, "config");
        this.stateMachine = Objects.requireNonNull(stateMachine, "stateMachine");
        this.transport = Objects.requireNonNull(transport, "transport");
        this.scheduler = Objects.requireNonNull(scheduler, "scheduler");
        this.random = RandomGeneratorFactory.of("L64X128MixRandom").create();
        matchIndex.put(config.localNodeId(), 0L);
        nextIndex.put(config.localNodeId(), 1L);
        if (meterRegistry != null) {
            final List<Tag> tags = List.of(Tag.of("node", config.localNodeId().value()));
            this.roleGauge = meterRegistry.gauge("raft_role", tags, new AtomicInteger(role.ordinal()));
            this.termGauge = meterRegistry.gauge("raft_term", tags, new AtomicLong(currentTerm));
            this.commitGauge = meterRegistry.gauge("raft_commit_index", tags, new AtomicLong(commitIndex));
        } else {
            this.roleGauge = null;
            this.termGauge = null;
            this.commitGauge = null;
        }
    }

    /**
     * Convenience factory using a managed single-threaded scheduler.
     *
     * @param config       immutable configuration
     * @param stateMachine deterministic state machine applied on commit
     * @param transport    transport used to deliver outbound messages
     * @param scheduler    scheduler backing the event loop
     * @return configured Raft node instance
     */
    public static DefaultRaftNode create(final RaftConfig config, final StateMachine stateMachine,
                                         final RaftTransport transport, final ScheduledExecutorService scheduler) {
        return new DefaultRaftNode(config, stateMachine, transport, scheduler, null);
    }

    /**
     * Creates a node backed by a dedicated virtual-thread scheduler.
     *
     * @param config       immutable configuration
     * @param stateMachine deterministic state machine applied on commit
     * @param transport    transport used to deliver outbound messages
     * @return configured Raft node instance
     */
    public static DefaultRaftNode create(final RaftConfig config, final StateMachine stateMachine,
                                         final RaftTransport transport) {
        final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor(
                Thread.ofVirtual().name("raft-" + config.localNodeId().value() + "-", 0).factory());
        return new DefaultRaftNode(config, stateMachine, transport, scheduler, null);
    }

    @Override
    public synchronized void start() {
        if (running) {
            return;
        }
        running = true;
        LOGGER.info("Starting Raft node {}", config.localNodeId());
        resetElectionTimer();
        heartbeatDeadlineNanos = now() + config.heartbeatInterval().toNanos();
        tickerTask = scheduler.scheduleAtFixedRate(this::onTick, 0L, config.tickInterval().toNanos(),
                TimeUnit.NANOSECONDS);
    }

    @Override
    public CompletableFuture<ClientResponse> apply(final byte[] command) {
        Objects.requireNonNull(command, "command");
        final byte[] payloadCopy = command.clone();
        final CompletableFuture<ClientResponse> future = new CompletableFuture<>();
        execute(() -> applyInternal(payloadCopy, future));
        return future;
    }

    @Override
    public CompletableFuture<Void> shutdown() {
        execute(this::shutdownInternal);
        return shutdownFuture;
    }

    @Override
    public void handleMessage(final RaftMessage message) {
        Objects.requireNonNull(message, "message");
        execute(() -> handleMessageInternal(message));
    }

    /**
     * Returns the node role for testing or observability purposes.
     *
     * @return current role
     */
    public Role role() {
        return role;
    }

    /**
     * Returns the last known leader identifier.
     *
     * @return leader identifier, may be {@code null}
     */
    public NodeId leaderId() {
        return leaderId;
    }

    /**
     * Returns the replicated commit index.
     *
     * @return commit index
     */
    public long commitIndex() {
        return commitIndex;
    }

    private void applyInternal(final byte[] command, final CompletableFuture<ClientResponse> future) {
        if (!running) {
            future.complete(ClientResponse.failure(leaderId));
            return;
        }
        if (role != Role.LEADER) {
            future.complete(ClientResponse.notLeader(leaderId));
            return;
        }
        final LogEntry entry = appendEntry(command);
        clientResponses.put(entry.index(), future);
        matchIndex.put(config.localNodeId(), log.lastIndex());
        nextIndex.put(config.localNodeId(), log.lastIndex() + 1);
        LOGGER.debug("Leader {} appended log entry index {} term {}", config.localNodeId(), entry.index(),
                entry.term());
        broadcastAppendEntries();
    }

    private void shutdownInternal() {
        if (!running) {
            shutdownFuture.complete(null);
            return;
        }
        running = false;
        LOGGER.info("Shutting down node {}", config.localNodeId());
        if (tickerTask != null) {
            tickerTask.cancel(false);
        }
        scheduler.shutdown();
        clientResponses.values().forEach(future -> future.complete(ClientResponse.failure(leaderId)));
        clientResponses.clear();
        shutdownFuture.complete(null);
    }

    private void handleMessageInternal(final RaftMessage message) {
        if (!running) {
            return;
        }
        if (message instanceof RequestVoteRequest request) {
            handleRequestVote(request);
        } else if (message instanceof RequestVoteResponse response) {
            handleRequestVoteResponse(response);
        } else if (message instanceof AppendEntriesRequest request) {
            handleAppendEntries(request);
        } else if (message instanceof AppendEntriesResponse response) {
            handleAppendEntriesResponse(response);
        } else {
            LOGGER.warn("Node {} received unsupported message {}", config.localNodeId(), message);
        }
    }

    private void handleRequestVote(final RequestVoteRequest request) {
        stepDownIfNeeded(request.term(), null);
        final boolean upToDate = isCandidateLogUpToDate(request.lastLogIndex(), request.lastLogTerm());
        final boolean termValid = request.term() == currentTerm;
        boolean voteGranted = false;
        if (termValid && upToDate && (votedFor == null || votedFor.equals(request.source()))) {
            votedFor = request.source();
            resetElectionTimer();
            voteGranted = true;
            LOGGER.debug("Node {} granted vote to {} for term {}", config.localNodeId(), request.source(),
                    currentTerm);
        }
        transport.send(new RequestVoteResponse(config.localNodeId(), request.source(), currentTerm, voteGranted));
    }

    private void handleRequestVoteResponse(final RequestVoteResponse response) {
        stepDownIfNeeded(response.term(), null);
        if (role != Role.CANDIDATE || response.term() != currentTerm) {
            return;
        }
        if (response.voteGranted()) {
            votesGranted++;
            LOGGER.debug("Candidate {} received vote from {} ({} votes)", config.localNodeId(), response.source(),
                    votesGranted);
            if (config.hasMajority(votesGranted)) {
                becomeLeader();
            }
        }
    }

    private void handleAppendEntries(final AppendEntriesRequest request) {
        stepDownIfNeeded(request.term(), request.source());
        if (request.term() < currentTerm) {
            transport.send(new AppendEntriesResponse(config.localNodeId(), request.source(), currentTerm, false,
                    log.lastIndex()));
            return;
        }
        leaderId = request.source();
        resetElectionTimer();
        boolean success = log.matches(request.prevLogIndex(), request.prevLogTerm());
        long matchIdx = Math.min(request.prevLogIndex(), log.lastIndex());
        if (success) {
            log.appendFrom(request.entries());
            matchIdx = log.lastIndex();
            if (request.leaderCommit() > commitIndex) {
                commitIndex = Math.min(request.leaderCommit(), log.lastIndex());
                updateCommitGauge();
                applyCommittedEntries();
            }
        }
        transport.send(new AppendEntriesResponse(config.localNodeId(), request.source(), currentTerm, success,
                matchIdx));
    }

    private void handleAppendEntriesResponse(final AppendEntriesResponse response) {
        stepDownIfNeeded(response.term(), null);
        if (role != Role.LEADER || response.term() != currentTerm) {
            return;
        }
        if (response.success()) {
            matchIndex.put(response.source(), response.matchIndex());
            nextIndex.put(response.source(), response.matchIndex() + 1);
            advanceCommitIndex();
        } else {
            final long currentNext = nextIndex.getOrDefault(response.source(), log.lastIndex() + 1);
            final long decremented = Math.max(1L, Math.min(currentNext - 1, response.matchIndex() + 1));
            nextIndex.put(response.source(), decremented);
            sendAppendEntries(response.source());
        }
    }

    private void advanceCommitIndex() {
        long newCommit = commitIndex;
        final long lastIndex = log.lastIndex();
        for (long index = lastIndex; index > commitIndex; index--) {
            if (log.termAt(index) != currentTerm) {
                continue;
            }
            int replicated = 1; // self
            for (final NodeId member : config.cluster()) {
                if (member.equals(config.localNodeId())) {
                    continue;
                }
                final long match = matchIndex.getOrDefault(member, 0L);
                if (match >= index) {
                    replicated++;
                }
            }
            if (config.hasMajority(replicated)) {
                newCommit = index;
                break;
            }
        }
        if (newCommit > commitIndex) {
            commitIndex = newCommit;
            updateCommitGauge();
            applyCommittedEntries();
        }
    }

    private void applyCommittedEntries() {
        while (lastApplied < commitIndex) {
            lastApplied++;
            final LogEntry entry = log.entryAt(lastApplied);
            byte[] output = null;
            if (!entry.isNoOp()) {
                try {
                    output = stateMachine.apply(entry.command());
                } catch (final Exception ex) {
                    LOGGER.error("State machine error applying entry {}", entry.index(), ex);
                    final CompletableFuture<ClientResponse> future = clientResponses.remove(entry.index());
                    if (future != null) {
                        future.complete(ClientResponse.failure(leaderId));
                    }
                    continue;
                }
            }
            final CompletableFuture<ClientResponse> future = clientResponses.remove(entry.index());
            if (future != null) {
                future.complete(ClientResponse.success(output));
            }
        }
    }

    private boolean isCandidateLogUpToDate(final long candidateIndex, final long candidateTerm) {
        final long localTerm = log.lastTerm();
        if (candidateTerm != localTerm) {
            return candidateTerm > localTerm;
        }
        return candidateIndex >= log.lastIndex();
    }

    private void startElection() {
        role = Role.CANDIDATE;
        updateRoleGauge();
        currentTerm++;
        updateTermGauge();
        votedFor = config.localNodeId();
        leaderId = null;
        votesGranted = 1;
        resetElectionTimer();
        LOGGER.info("Node {} starting election for term {}", config.localNodeId(), currentTerm);
        for (final NodeId member : config.cluster()) {
            if (member.equals(config.localNodeId())) {
                continue;
            }
            final RequestVoteRequest request = new RequestVoteRequest(config.localNodeId(), member, currentTerm,
                    log.lastIndex(), log.lastTerm());
            transport.send(request);
        }
        if (config.hasMajority(votesGranted)) {
            becomeLeader();
        }
    }

    private void becomeLeader() {
        role = Role.LEADER;
        updateRoleGauge();
        leaderId = config.localNodeId();
        votesGranted = 0;
        LOGGER.info("Node {} became leader for term {}", config.localNodeId(), currentTerm);
        final LogEntry noop = appendEntry(null);
        matchIndex.put(config.localNodeId(), noop.index());
        nextIndex.put(config.localNodeId(), noop.index() + 1);
        broadcastAppendEntries();
    }

    private void broadcastAppendEntries() {
        for (final NodeId member : config.cluster()) {
            if (member.equals(config.localNodeId())) {
                continue;
            }
            sendAppendEntries(member);
        }
        heartbeatDeadlineNanos = now() + config.heartbeatInterval().toNanos();
    }

    private void sendAppendEntries(final NodeId member) {
        final long nextIdx = nextIndex.getOrDefault(member, log.lastIndex() + 1);
        final long prevIndex = Math.max(0L, nextIdx - 1);
        final long prevTerm = log.termAt(prevIndex);
        final List<LogEntry> entries = log.entriesFrom(nextIdx);
        final AppendEntriesRequest request = new AppendEntriesRequest(config.localNodeId(), member, currentTerm,
                prevIndex, prevTerm, entries, commitIndex);
        transport.send(request);
    }

    private LogEntry appendEntry(final byte[] command) {
        final long index = log.lastIndex() + 1;
        final LogEntry entry = new LogEntry(index, currentTerm, command);
        log.appendFrom(List.of(entry));
        return entry;
    }

    private void resetElectionTimer() {
        final Duration timeout = config.randomElectionTimeout(random);
        electionDeadlineNanos = now() + timeout.toNanos();
    }

    private void onTick() {
        execute(this::tickInternal);
    }

    private void tickInternal() {
        if (!running) {
            return;
        }
        final long now = now();
        if (role == Role.LEADER) {
            if (now >= heartbeatDeadlineNanos) {
                broadcastAppendEntries();
            }
        } else {
            if (now >= electionDeadlineNanos) {
                startElection();
            }
        }
    }

    private void stepDownIfNeeded(final long term, final NodeId newLeader) {
        if (term > currentTerm) {
            currentTerm = term;
            updateTermGauge();
            votedFor = null;
            becomeFollower(newLeader);
        } else if (role == Role.CANDIDATE && term == currentTerm && newLeader != null) {
            becomeFollower(newLeader);
        }
    }

    private void becomeFollower(final NodeId newLeader) {
        role = Role.FOLLOWER;
        updateRoleGauge();
        leaderId = newLeader;
        votesGranted = 0;
        resetElectionTimer();
    }

    private long now() {
        return System.nanoTime();
    }

    private void updateRoleGauge() {
        if (roleGauge != null) {
            roleGauge.set(role.ordinal());
        }
    }

    private void updateTermGauge() {
        if (termGauge != null) {
            termGauge.set(currentTerm);
        }
    }

    private void updateCommitGauge() {
        if (commitGauge != null) {
            commitGauge.set(commitIndex);
        }
    }

    private void execute(final Runnable action) {
        if (scheduler.isShutdown()) {
            LOGGER.warn("Scheduler for node {} is shut down", config.localNodeId());
            return;
        }
        try {
            scheduler.execute(() -> {
                try {
                    action.run();
                } catch (final Exception ex) {
                    LOGGER.error("Unhandled exception in Raft node {}", config.localNodeId(), ex);
                }
            });
        } catch (final Exception ex) {
            LOGGER.error("Failed to schedule action for node {}", config.localNodeId(), ex);
        }
    }
}
