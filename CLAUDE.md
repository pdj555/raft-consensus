# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project

Modular Raft consensus implementation in Java 21. Algorithm (`raft-core`), Netty transport (`raft-transport`), memory-mapped storage (`raft-storage`), CLI/stress tools (`raft-cli`), integration tests (`raft-integtest`).

## Commands

```bash
mvn clean verify              # full build + unit tests (skips ITs in CI via -DskipITs)
mvn test -DskipITs=true       # fast unit pass
mvn checkstyle:check
mvn spotbugs:check
```

CI (`.github/workflows/ci.yml`): `mvn -B clean test -DskipITs=true` on Java 21.

## Design constraints

- `raft-core` must stay free of I/O — no sockets, no disk in core packages.
- Follow existing module boundaries; see `docs/design.md` and `docs/constitution.md`.
- Prefer JUnit 5 + AssertJ patterns already in the repo.
- Do not bump Maven plugin or dependency versions without explicit approval.

## When changing behavior

- Update or add tests in the owning module before claiming done.
- Integration tests live in `raft-integtest`; keep them out of the default fast CI path unless necessary.
