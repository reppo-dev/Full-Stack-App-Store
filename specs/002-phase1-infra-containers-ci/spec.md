# Feature Specification: Phase 1 — Development Infrastructure, Containerization & CI Foundation

**Feature Branch**: `002-phase1-infra-containers-ci`  
**Created**: 2026-09-15  
**Status**: Draft  
**Input**: User prompt requesting formal Phase 1 specification for Development Infrastructure, Containerization & CI Foundation based on project constitution, current/target architecture docs, modernization roadmap, and Phase 0 learnings.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Reproducible Local Infrastructure via Docker Compose (Priority: P1)

As a full-stack software engineer joining the DashStack project,  
I want to launch the complete local runtime ecosystem (PostgreSQL 16, Redis 7, Go backend, Next.js frontend) with a single declarative command,  
So that I can start developing immediately without manually installing databases, configuring local system daemons, or experiencing environment drift.

**Why this priority**: Eliminates host-specific configuration differences, establishes parity between team members, and forms the bedrock for isolated integration testing and containerized verification.

**Independent Test**: Execute `docker compose up -d` on a clean developer machine. PostgreSQL and Redis initialize, backend connects to PostgreSQL, frontend serves storefront, and persistent data survives container restarts (`docker compose down && docker compose up -d`).

**Acceptance Scenarios**:
1. **Given** a cloned repository with valid `.env` copied from `.env.example`, **When** the developer runs `docker compose up -d`, **Then** PostgreSQL 16 and Redis 7 start, pass their healthchecks, and the backend and frontend services become accessible at their configured ports.
2. **Given** running containers with data written to PostgreSQL, **When** the developer executes `docker compose down` and subsequently `docker compose up -d`, **Then** database records persist intact via named Docker volumes.
3. **Given** a freshly cloned repository, **When** inspecting `docker-compose.yml`, **Then** zero raw secrets or production credentials are hardcoded; all configuration values reference environment variables.

---

### User Story 2 - Production-Grade Multi-Stage Containerization (Priority: P1)

As a DevOps engineer and security auditor,  
I want multi-stage, non-root Dockerfiles for both backend and frontend applications,  
So that our deployment artifacts are lightweight, devoid of unnecessary build tools or source code, and protected against container breakout vulnerabilities.

**Why this priority**: Minimizes attack surfaces, guarantees deterministic runtime images across developer laptops and CI runners, and fulfills constitutional security standards (Principle XXIII).

**Independent Test**: Execute `docker build -t dashstack-backend backend/` and `docker build -t dashstack-frontend frontend/`. Both builds succeed, produce minimal runtime layers, and execute as a non-privileged system user (`UID > 1000`).

**Acceptance Scenarios**:
1. **Given** `backend/Dockerfile`, **When** the image is built, **Then** a multi-stage process compiles the Go binary in a builder stage and copies only the compiled binary and required certificates to a minimal runtime base (e.g. Alpine or Distroless), running as non-root.
2. **Given** `frontend/Dockerfile`, **When** the image is built, **Then** Next.js utilizes standalone output mode, packages only production runtime assets without development toolchains, and executes under a non-root system user.
3. **Given** the built frontend container image, **When** scanning client-side public bundles, **Then** zero backend server secrets (e.g. database credentials, JWT secret keys, storage private keys) are exposed in the client filesystem or bundle.

---

### User Story 3 - Versioned Database Migration Foundation with Goose (Priority: P1)

As a backend database engineer,  
I want an independent, versioned SQL migration system using Goose,  
So that database schema changes are explicitly tracked in source control, deterministic, reversible, and completely decoupled from ORM runtime auto-sync.

**Why this priority**: GORM's `AutoMigrate` is non-deterministic, lacks rollback capabilities, cannot manage complex indexing or views, and violates Constitution Principle I & Principle XXXV. An independent SQL migration system is mandatory before executing schema evolutions in subsequent phases.

**Independent Test**: Execute migration CLI commands to apply up-migrations, inspect database table structure, execute down-migrations, and re-apply up-migrations. Database state transitions predictably with zero manual SQL intervention.

**Acceptance Scenarios**:
1. **Given** an empty PostgreSQL database and the migration tooling, **When** running the up-migration command (`make migrate-up`), **Then** versioned SQL migration files are executed sequentially, creating the baseline schema tables and recording applied versions in a tracking table.
2. **Given** applied migrations, **When** running the down-migration command (`make migrate-down`), **Then** the most recent migration is safely rolled back in accordance with its `.down.sql` script.
3. **Given** the requirement for a new schema change, **When** running the migration creation command (`make migrate-create name=...`), **Then** a timestamped or sequential migration pair (`.up.sql` and `.down.sql`) is created in the designated migrations directory.

---

### User Story 4 - Unified Developer Workflows via Root Makefile (Priority: P2)

As a software engineer working across multiple components,  
I want a centralized, discoverable `Makefile` at the repository root,  
So that I can run builds, tests, linting, formatting, migrations, and container orchestration using standardized, memorable commands without memorizing multi-step shell syntax.

**Why this priority**: Reduces onboarding friction, eliminates oral history, standardizes development workflows across Windows/Linux/macOS, and ensures local commands match CI pipeline steps 1:1 (Constitution Principle XXV).

**Independent Test**: Running `make help` lists all available lifecycle targets with concise documentation. Running targets (`make dev`, `make test`, `make lint`, `make format`, `make build`, `make docker-up`, `make docker-down`) invokes their respective toolchains predictably.

**Acceptance Scenarios**:
1. **Given** the root directory, **When** running `make help` or `make`, **Then** the developer sees a formatted list of all lifecycle targets with descriptions.
2. **Given** modified source code with formatting inconsistencies, **When** running `make format`, **Then** Go files are formatted via `gofmt` and frontend files are formatted via the project formatter.
3. **Given** clean working state, **When** running `make test`, **Then** all backend unit/integration tests and frontend test suites execute and report exit status.

---

### User Story 5 - Automated Continuous Integration Pipeline (Priority: P2)

As a technical lead and code reviewer,  
I want an automated GitHub Actions CI pipeline executing on every pull request and push to mainline branches,  
So that code formatting, static type correctness, tests, and container builds are verified automatically before any code can be merged into production.

**Why this priority**: Enforces continuous verification, guarantees that no broken builds or failing tests reach the main branch, and provides fast diagnostic feedback to developers (Constitution Principle XXVI).

**Independent Test**: Open a Pull Request or run the workflow locally via workflow simulation. The pipeline triggers automatically, executes backend checks, frontend checks, and Docker build checks, reporting clear pass/fail status.

**Acceptance Scenarios**:
1. **Given** a Pull Request against `main`, **When** the workflow triggers, **Then** it validates:
   - Backend: formatting check (`gofmt`), compilation (`go build ./...`), and automated test suite (`go test ./...`).
   - Frontend: frozen dependency installation (`pnpm install --frozen-lockfile`), static type checking (`tsc --noEmit`), linting (`pnpm lint`), and production build (`pnpm build`).
   - Containerization: Docker multi-stage build validation for backend and frontend Dockerfiles.
2. **Given** a Pull Request introducing a compilation error or test regression, **When** the CI pipeline runs, **Then** the workflow immediately halts with a failure status and points to the exact error in the log output.

---

### User Story 6 - Operational Health Checks & Readiness Probes (Priority: P3)

As a DevOps engineer managing container lifecycles,  
I want standardized health and readiness endpoints on the backend service,  
So that container orchestrators (Docker Compose, reverse proxies, and future load balancers) can determine when the process is alive and when dependencies (PostgreSQL) are ready to accept traffic.

**Why this priority**: Prevents premature traffic routing during cold starts and ensures dependent services only start communicating when the backend is fully initialized (Constitution Principle XXX).

**Independent Test**: Query `GET /health/live` when the server process is running $\rightarrow$ returns HTTP 200 `{"status": "UP"}`. Query `GET /health/ready` when PostgreSQL is connected $\rightarrow$ returns HTTP 200 `{"status": "READY", "database": "UP"}`; when PostgreSQL is disconnected $\rightarrow$ returns HTTP 503 `{"status": "DOWN", "database": "DOWN"}`.

**Acceptance Scenarios**:
1. **Given** the running backend server, **When** a client or orchestrator calls `GET /health/live`, **Then** the server responds with HTTP 200 and process status.
2. **Given** the running backend server with an active database connection, **When** a client or orchestrator calls `GET /health/ready`, **Then** the server pings the database and returns HTTP 200.
3. **Given** the database container is stopped or unreachable, **When** calling `GET /health/ready`, **Then** the server returns HTTP 503 Service Unavailable, preventing orchestrators from routing user traffic to the unready instance.

---

### Edge Cases

- **Slow PostgreSQL Startup on Cold Boot**: When running `docker compose up`, the database container may take 5–10 seconds to initialize schemas and accept sockets. The backend container must utilize Docker Compose healthcheck dependencies (`depends_on: { postgres: { condition: service_healthy } }`) and retry database connections with exponential backoff on startup rather than crashing immediately.
- **Redis Transient Downtime**: Because Redis in Phase 1 is strictly an infrastructure foundation (no business entities reside in Redis), transient Redis downtime must NOT crash the backend process or prevent database operations.
- **Cross-Platform Makefile Execution**: Windows developers without GNU Make or bash may experience command failures if targets rely on bash-specific syntax. Makefile targets must use portable commands or provide documented PowerShell equivalents.
- **Migration Rollback on Partial Failures**: If a complex migration fails midway, PostgreSQL DDL transactions must roll back cleanly (`BEGIN ... COMMIT`) to prevent leaving the database in an inconsistent intermediate state.
- **Next.js Standalone Build Missing Assets**: Next.js standalone output does not automatically copy `public/` or `.next/static/` folders into the standalone folder; the frontend Dockerfile must explicitly copy these assets into the runner stage.

---

## Requirements *(mandatory)*

### Functional Requirements

#### Containerization & Orchestration
- **FR-001**: System MUST provide a multi-stage `backend/Dockerfile` using an official Go builder image and a minimal, non-root runtime image (Alpine or Distroless) with explicit non-root user (`UID > 1000`).
- **FR-002**: System MUST provide a multi-stage `frontend/Dockerfile` targeting Next.js standalone output mode, running under a non-root system user.
- **FR-003**: System MUST provide a root `docker-compose.yml` defining services for `postgres` (version 16-alpine), `redis` (version 7-alpine), `backend`, and `frontend`.
- **FR-004**: System MUST configure persistent volume storage for PostgreSQL data (`postgres_data`) so database state persists across container restarts.
- **FR-005**: Docker Compose configuration MUST resolve all ports, database credentials, and service URLs strictly from environment variables (`.env`) with zero hardcoded credentials.
- **FR-006**: System MUST declare container healthchecks for PostgreSQL (`pg_isready`), Redis (`redis-cli ping`), and backend (`/health/live`), with explicit startup dependencies (`service_healthy`).

#### Database Migration Tooling
- **FR-007**: System MUST establish an independent database migration structure using [Goose](https://github.com/pressly/goose) in directory `backend/db/migrations/`.
- **FR-008**: System MUST codify an initial baseline migration (`00001_initial_schema.sql` with `.up.sql` and `.down.sql` or Goose SQL format) capturing the existing database schema without modifying business column definitions.
- **FR-009**: Database migration commands MUST be executable via root Makefile targets (`make migrate-up`, `make migrate-down`, `make migrate-status`, `make migrate-create`).
- **FR-010**: All SQL migrations MUST execute within atomic database transactions to guarantee rollbacks on failure.
- **FR-011**: Existing GORM `AutoMigrate` MUST NOT be extended to new entities and must be marked as transitional until full migration to SQLC in Phase 2.

#### Developer Tooling & Makefile
- **FR-012**: System MUST provide a root `Makefile` documenting and executing standard development targets:
  - `make dev`: Launches local development environments.
  - `make test`: Runs backend tests (`go test ./...`) and frontend verification.
  - `make lint`: Runs backend and frontend linters.
  - `make format`: Auto-formats Go code (`gofmt`) and frontend code.
  - `make build`: Compiles Go backend binary and builds frontend Next.js production bundle.
  - `make docker-up`: Starts Docker Compose stack in detached mode.
  - `make docker-down`: Stops Docker Compose stack gracefully.
  - `make migrate-up` / `make migrate-down`: Applies/reverts database migrations.
  - `make help`: Prints formatted list of all available commands.
- **FR-013**: System MUST provide updated `.env.example` templates in root, backend, and frontend documenting all infrastructure configuration keys (including `REDIS_HOST`, `REDIS_PORT`, `POSTGRES_DB`, etc.).
- **FR-014**: System MUST provide a Developer Setup and Quickstart guide in `specs/002-phase1-infra-containers-ci/quickstart.md` and update project `README.md` detailing step-by-step local bootstrap.

#### Continuous Integration (CI)
- **FR-015**: System MUST provide a GitHub Actions workflow `.github/workflows/ci.yml` triggered on pull requests and pushes targeting the main branch.
- **FR-016**: The CI pipeline MUST execute:
  1. Backend Gate: formatting check (`gofmt -l`), package compilation (`go build ./...`), and automated test suite execution (`go test -v ./...`).
  2. Frontend Gate: frozen lockfile installation (`pnpm install --frozen-lockfile`), static typechecking (`pnpm exec tsc --noEmit`), linting (`pnpm lint`), and production build (`pnpm build`).
  3. Containerization Gate: multi-stage build validation for backend and frontend Dockerfiles.
- **FR-017**: The CI pipeline MUST reuse standardized Makefile commands or scripts to prevent drift between local development and CI execution.
#### Continuous Integration & Deployment Boundary
- **FR-015**: System MUST provide a GitHub Actions workflow `.github/workflows/ci.yml` triggered on pull requests and pushes targeting the main branch.
- **FR-016**: The CI pipeline MUST execute:
  1. Backend Gate: formatting check (`gofmt -l`), package compilation (`go build ./...`), and automated test suite execution (`go test -v ./...`).
  2. Frontend Gate: frozen lockfile installation (`pnpm install --frozen-lockfile`), static typechecking (`pnpm exec tsc --noEmit`), linting (`pnpm lint`), and production build (`pnpm build`).
  3. Containerization Gate: multi-stage build validation for backend and frontend Dockerfiles.
- **FR-017**: The CI pipeline MUST reuse standardized Makefile commands or scripts to prevent drift between local development and CI execution.
- **FR-018**: System MUST bound Phase 1 CI automation strictly to build and test validation. Automated production continuous delivery (CD) is deferred to Phase 5; the initial production deployment target is designated as Single Cloud VM / VPS with Docker Compose and an Nginx or Caddy reverse proxy.

#### Operational Health & Resilience
- **FR-019**: Backend MUST expose an unauthenticated liveness endpoint `GET /health/live` returning HTTP 200 when the HTTP process is responsive.
- **FR-020**: Backend MUST expose a readiness endpoint `GET /health/ready` verifying that PostgreSQL connectivity is active, returning HTTP 200 when healthy and HTTP 503 when the database is unreachable.
- **FR-021**: Redis client initialization in backend MUST be non-blocking and resilient: failure to reach Redis at startup MUST log an informative warning and permit the application to continue running.

---

### Key Entities

- **Container Services Configuration**: Declarative service specifications for `postgres`, `redis`, `backend`, and `frontend`, mapping port allocations, environment variables, network bridges, and persistent volume mount points.
- **Database Migration Asset**: Sequential, version-stamped SQL scripts containing paired forward (`-- +goose Up`) and rollback (`-- +goose Down`) transactional DDL statements covering the full baseline of all 12 existing entities, tracked via the `goose_db_version` schema table.
- **Infrastructure Environment Template**: Version-controlled key-value configurations documenting all runtime parameters (database hosts, ports, pool sizes, Redis endpoints, JWT secrets, public URLs) with development defaults.
- **CI Workflow Pipeline**: Deterministic multi-job GitHub Actions workflow orchestrating dependency caching, static analysis, unit testing, container build validation, and exit code verification.
- **Operational Health Record**: Lightweight structured JSON diagnostic payload describing process uptime, database connection readiness, and service operational status.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new developer can execute a single command (`docker compose up -d` or `make docker-up`) and have the entire stack (database, cache, backend, frontend) healthy and operational in under **3 minutes** from fresh clone.
- **SC-002**: Backend Docker image size is reduced to under **50 MB** (via multi-stage scratch/alpine build) and runs with a non-zero, non-root UID.
- **SC-003**: Frontend Docker image runs with standalone output and contains **0 server-side secrets** in client-exposed layers.
- **SC-004**: Database migrations execute deterministically: `make migrate-up` brings a completely empty PostgreSQL database to current schema version in under **10 seconds**, and `make migrate-down` rolls back cleanly without leaving orphan locks or dangling objects.
- **SC-005**: Automated GitHub Actions CI workflow completes full validation (backend checks, frontend checks, container builds) in under **6 minutes** on standard GitHub runners.
- **SC-006**: 100% of pull requests must pass the automated CI pipeline before merge eligibility; broken code is prevented from reaching mainline branches.
- **SC-007**: `GET /health/live` and `GET /health/ready` respond in under **20 ms** under normal local execution conditions.
- **SC-008**: Data written to PostgreSQL container survives full teardown and recreate (`docker compose down && docker compose up -d`) with **0% data loss**.

---

## Assumptions & Scope Boundaries

### Assumptions
- Developer machines have Docker Desktop or Docker Engine (v24+) and Docker Compose (v2+) installed.
- Developers have Go (1.24+) and Node.js (20+) / pnpm (9+) available for local non-containerized workflows.
- PostgreSQL 16 Alpine and Redis 7 Alpine are selected as official LTS container baselines.
- Goose is selected as the independent migration engine due to its native Go single-binary execution, pure SQL file format, and compatibility with future SQLC workflows.
- CI pipeline utilizes GitHub Actions hosted runners (`ubuntu-latest`).
- **Initial Production Hosting Architecture**: Single Cloud VM / VPS running Docker Compose behind an Nginx or Caddy reverse proxy. This represents the architectural model to support future horizontal scaling of stateless backend instances, but does NOT imply any guaranteed user capacity (throughput, concurrent users, and load capacity will be measured via empirical benchmarks in a dedicated performance phase).

### Scope Exclusions (Strictly Deferred to Future Phases)
- **NO Full GORM Removal or SQLC Query Generation**: Setting up SQLC queries and replacing GORM repository methods is deferred to Phase 2.
- **NO Clean Architecture Directory Migration**: Moving controllers into use-case layers (`internal/usecase`) is deferred to Phase 2.
- **NO Redis Business Caching or Rate Limiting**: Caching product catalogs and distributed rate limiting are deferred to Phase 2 & Phase 3.
- **NO Multi-Device Sessions or Refresh Tokens**: The `user_sessions` PostgreSQL schema and opaque token engine belong strictly to Phase 3.
- **NO Production Deployment Pipeline**: Continuous Delivery (CD) automation and production deployment triggers are deferred to Phase 5 (Deployment & Hardening).
- **NO Kubernetes or Microservices Orchestration**: Out of scope per constitution principles.

---

## Resolved Clarifications

### Clarification 1: Production Deployment Architecture & CI/CD Boundary
- **Decision**: The initial production deployment target is codified as **Single Cloud VM / VPS + Docker Compose + Reverse Proxy (Nginx or Caddy)**.
- **Rationale**: Keeps infrastructure simple and reproducible, reuses Phase 1 containerization, allows running multiple stateless backend instances behind the proxy, and avoids Kubernetes complexity. No speculative capacity claims are made; empirical load testing is deferred.
- **Boundary**: Phase 1 implements Continuous Integration (CI) in GitHub Actions; automated deployment (CD) is deferred to Phase 5.

### Clarification 2: Database Migration Baseline Scope
- **Decision**: Codify the complete current schema of all 12 active models (`User`, `Category`, `Tag`, `Role`, `Product`, `Permission`, `Order`, `OrderItem`, `Color`, `Favorite`, `Label`, `Message` and their 4 join tables) as baseline migration `00001_initial_schema.sql`.
- **Methodology**: Schema definitions must be extracted with 100% fidelity to the actual GORM-generated PostgreSQL schema (columns, types, constraints, default values, foreign keys, indexes).
- **Invariants**: Runnable on a completely empty PostgreSQL database; paired with an atomic rollback `.down.sql`; Goose is established as the sole source of truth for future schema evolution. AutoMigrate remains transitional and will be decoupled safely. Zero business schema changes are introduced.
