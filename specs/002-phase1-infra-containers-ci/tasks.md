# Implementation Tasks: Phase 1 — Development Infrastructure, Containerization & CI Foundation

**Feature**: [Phase 1 Specification](spec.md) | [Implementation Plan](plan.md) | [Data Model](data-model.md) | [Infrastructure Contracts](contracts/infrastructure.md)  
**Branch**: `002-phase1-infra-containers-ci`  
**Date**: 2026-09-15  
**Status**: Ready for Execution (Dependency-Aligned)  

---

## Phase 1: Setup (Shared Infrastructure & Environment Baseline)

**Purpose**: Establish configuration templates, ignore rules, and container build exclusion context.

- [X] T001 Create template configuration [`.env.example`](file:///g:/react/next-go/Full-Stack-App-Store/.env.example) documenting POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_PORT, REDIS_PORT, BACKEND_PORT, FRONTEND_PORT, and NEXT_PUBLIC_API_URL with development defaults
- [X] T002 [P] Update template configuration [`backend/.env.example`](file:///g:/react/next-go/Full-Stack-App-Store/backend/.env.example) documenting REDIS_HOST, REDIS_PORT, and PostgreSQL connection keys
- [X] T003 [P] Update template configuration [`frontend/.env.example`](file:///g:/react/next-go/Full-Stack-App-Store/frontend/.env.example) documenting NEXT_PUBLIC_API_URL and object storage keys
- [X] T004 [P] Create [`backend/.dockerignore`](file:///g:/react/next-go/Full-Stack-App-Store/backend/.dockerignore) excluding `.git`, `tmp/`, `uploads/*`, `!uploads/.gitkeep`, `.env*`, `*.exe`, and `*.test` from Docker build context
- [X] T005 [P] Create [`frontend/.dockerignore`](file:///g:/react/next-go/Full-Stack-App-Store/frontend/.dockerignore) excluding `.git`, `node_modules/`, `.next/`, `.env*`, and `*.log` from Docker build context

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core tooling, migration dependencies, and framework prerequisites that MUST be complete before user stories execute.

- [X] T006 Add Goose migration package dependency `github.com/pressly/goose/v3` to [`backend/go.mod`](file:///g:/react/next-go/Full-Stack-App-Store/backend/go.mod) via `go get github.com/pressly/goose/v3`
- [X] T007 [P] Create migration conventions and CLI instructions guide in [`backend/db/migrations/README.md`](file:///g:/react/next-go/Full-Stack-App-Store/backend/db/migrations/README.md)
- [X] T008 [P] Configure Next.js standalone build mode by enabling `output: "standalone"` in [`frontend/next.config.ts`](file:///g:/react/next-go/Full-Stack-App-Store/frontend/next.config.ts)

**Checkpoint**: Core dependencies, ignore rules, and framework settings configured. Application-level prerequisites can now be built.

---

## Phase 3: User Story 6 — Operational Health Checks & Readiness Probes (Priority: P3 → Containerization Prerequisite)

**Goal**: Implement standardized operational health endpoints on Go backend (`GET /health/live` and `GET /health/ready`), allowing container orchestrators, Docker Compose, and reverse proxies to monitor process liveness and database connection readiness deterministically.

**Independent Test**: Query `GET /health/live` when server is running -> HTTP 200 `{"status": "UP"}` with zero database dependency. Query `GET /health/ready` when PostgreSQL is connected -> HTTP 200 `{"status": "READY", "components": {"database": "UP"}}`; when disconnected -> HTTP 503 `{"status": "DOWN", "error": "..."}`.

### Tests for User Story 6 (TDD Verification)
- [X] T009 [P] [US6] Add automated Fiber test cases in [`backend/routes/routes_test.go`](file:///g:/react/next-go/Full-Stack-App-Store/backend/routes/routes_test.go) asserting: (1) `/health/live` returns HTTP 200 `{"status": "UP"}` with zero database dependency, and (2) `/health/ready` returns HTTP 200 READY when database is connected and HTTP 503 DOWN when database is disconnected

### Implementation for User Story 6
- [X] T010 [P] [US6] Create [`backend/controllers/healthController.go`](file:///g:/react/next-go/Full-Stack-App-Store/backend/controllers/healthController.go) implementing `HealthLive(c *fiber.Ctx) error` returning JSON status UP and `HealthReady(c *fiber.Ctx) error` pinging `databases.DB` returning JSON status READY (or 503 DOWN on ping failure)
- [X] T011 [US6] Mount public unauthenticated routes `GET /health/live` and `GET /health/ready` in [`backend/routes/routes.go`](file:///g:/react/next-go/Full-Stack-App-Store/backend/routes/routes.go)
- [X] T012 [US6] Implement non-blocking Redis connection helper with graceful startup degradation (logs warning on connection failure without crashing backend process) in [`backend/databases/redis.go`](file:///g:/react/next-go/Full-Stack-App-Store/backend/databases/redis.go) and initialize in [`backend/main.go`](file:///g:/react/next-go/Full-Stack-App-Store/backend/main.go)
- [X] T013 [US6] Verify health endpoints behaviorally via `go test -v ./routes` in `backend/` ensuring deterministic HTTP status codes (200 UP for liveness, 200 READY / 503 DOWN for readiness) and valid JSON responses

**Checkpoint**: At this point, User Story 6 is complete. The backend exposes verified `/health/live` and `/health/ready` endpoints, enabling Docker container healthchecks.

---

## Phase 4: User Story 2 — Production-Grade Multi-Stage Containerization (Priority: P1)

**Goal**: Provide multi-stage, non-root Dockerfiles for both Go backend and Next.js frontend, ensuring minimal runtime images (<50 MB backend, <200 MB frontend) and zero leaked secrets in client bundles.

**Independent Test**: Execute `docker build -t dashstack-backend backend/` and `docker build -t dashstack-frontend frontend/`. Both builds succeed, run under unprivileged non-root users (`UID > 1000`), and reveal zero server secrets in public layers.

### Implementation for User Story 2
- [X] T014 [P] [US2] Author multi-stage, non-root [`backend/Dockerfile`](file:///g:/react/next-go/Full-Stack-App-Store/backend/Dockerfile) with Go builder stage (`CGO_ENABLED=0`, static build) and minimal Alpine runtime stage with unprivileged user `appuser:appgroup` (`UID 10001`, `GID 10001`), ca-certificates, and tzdata
- [X] T015 [P] [US2] Author multi-stage, non-root [`frontend/Dockerfile`](file:///g:/react/next-go/Full-Stack-App-Store/frontend/Dockerfile) with Node 22 Alpine deps and builder stages using `pnpm`, and runner stage copying `.next/standalone`, `.next/static`, and `public/` directories under unprivileged user `nextjs:nodejs` (`UID 1001`, `GID 1001`)
- [X] T016 [US2] Verify backend container multi-stage build and non-root execution via `docker build -t dashstack-backend backend/` and confirm image size is under 50 MB
- [X] T017 [US2] Verify frontend container multi-stage build and standalone packaging via `docker build -t dashstack-frontend frontend/` and audit client layers for zero backend secret exposure

**Checkpoint**: At this point, User Story 2 is complete. Backend and frontend container images compile cleanly, package non-root runtimes, and are ready for Compose orchestration.

---

## Phase 5: User Story 3 — Versioned Database Migration Foundation with Goose (Priority: P1)

**Goal**: Establish an independent, versioned SQL migration system using Goose, codifying the complete 12-entity existing schema and 4 join tables as baseline migration `00001_initial_schema.sql` in strict topological dependency order with atomic rollback capabilities.

**Independent Test**: Execute Goose migration against a fresh PostgreSQL database (`make migrate-up`), inspect tables and constraints, execute rollback (`make migrate-down`), and verify complete, idempotent cleanup without dangling objects.

### Implementation for User Story 3
- [X] T018 [US3] Create baseline SQL migration file [`backend/db/migrations/00001_initial_schema.sql`](file:///g:/react/next-go/Full-Stack-App-Store/backend/db/migrations/00001_initial_schema.sql) with `-- +goose Up` and `-- +goose Down` transactional annotations
- [X] T019 [US3] Codify Identity & Access domain DDL in [`backend/db/migrations/00001_initial_schema.sql`](file:///g:/react/next-go/Full-Stack-App-Store/backend/db/migrations/00001_initial_schema.sql) in topological order: `roles` (name VARCHAR(100) NOT NULL), `permissions` (name VARCHAR(100) NOT NULL), `role_permission` (PRIMARY KEY (role_id, permission_id), CASCADE FKs), and `users` (user_name VARCHAR(50) NOT NULL UNIQUE, email VARCHAR(255) NOT NULL UNIQUE, password VARCHAR(255) NOT NULL, role_id BIGINT DEFAULT 1 REFERENCES roles(id) ON DELETE SET DEFAULT, first_name VARCHAR(50), last_name VARCHAR(50), phone_number VARCHAR(20), date_of_birth TIMESTAMPTZ, deleted_at index)
- [X] T020 [US3] Codify Product Catalog domain DDL in [`backend/db/migrations/00001_initial_schema.sql`](file:///g:/react/next-go/Full-Stack-App-Store/backend/db/migrations/00001_initial_schema.sql) in topological order: `categories` (name VARCHAR(120) NOT NULL, slug VARCHAR(120) UNIQUE, parent_id BIGINT REFERENCES categories(id) ON DELETE SET NULL), `tags` (name VARCHAR(100), slug VARCHAR(100)), `colors` (name VARCHAR(50) NOT NULL, code VARCHAR(7)), `products` (title VARCHAR(200) NOT NULL, slug VARCHAR(200) UNIQUE, price DECIMAL(10,2) NOT NULL, stock INT, rating DOUBLE PRECISION DEFAULT 0.0, images JSONB DEFAULT '[]'::jsonb, colors JSONB DEFAULT '[]'::jsonb, attributes JSONB DEFAULT '{}'::jsonb, category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL, sku VARCHAR(100) UNIQUE, is_active BOOLEAN DEFAULT TRUE), `product_tags` (CASCADE FKs), `product_colors` (CASCADE FKs), and `favorites` (user_id BIGINT REFERENCES users(id) ON DELETE CASCADE, product_id BIGINT REFERENCES products(id) ON DELETE CASCADE, CONSTRAINT idx_user_product UNIQUE (user_id, product_id))
- [X] T021 [US3] Codify Orders & Commerce domain DDL in [`backend/db/migrations/00001_initial_schema.sql`](file:///g:/react/next-go/Full-Stack-App-Store/backend/db/migrations/00001_initial_schema.sql) in topological order: `orders` (first_name VARCHAR(100), last_name VARCHAR(100), email VARCHAR(255), deleted_at index), and `order_items` (order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE, product_title VARCHAR(200), price REAL NOT NULL, quantity BIGINT NOT NULL DEFAULT 1)
- [X] T022 [US3] Codify Support & Messaging domain DDL in [`backend/db/migrations/00001_initial_schema.sql`](file:///g:/react/next-go/Full-Stack-App-Store/backend/db/migrations/00001_initial_schema.sql) in topological order: `labels` (user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE, name VARCHAR(100) NOT NULL, color_code VARCHAR(7) DEFAULT '#808080', CONSTRAINT idx_user_label UNIQUE (user_id, name)), `messages` (sender_id BIGINT REFERENCES users(id) ON DELETE SET NULL, recipient_id BIGINT REFERENCES users(id) ON DELETE SET NULL, subject VARCHAR(200), snippet TEXT, body TEXT, is_read BOOLEAN DEFAULT FALSE, is_starred BOOLEAN DEFAULT FALSE, is_important BOOLEAN DEFAULT FALSE, is_trashed BOOLEAN DEFAULT FALSE, is_draft BOOLEAN DEFAULT FALSE), and `message_labels` (CASCADE FKs)
- [X] T023 [US3] Codify atomic reverse-dependency down-migration block in [`backend/db/migrations/00001_initial_schema.sql`](file:///g:/react/next-go/Full-Stack-App-Store/backend/db/migrations/00001_initial_schema.sql): `DROP TABLE IF EXISTS message_labels, messages, labels, order_items, orders, favorites, product_colors, colors, product_tags, products, tags, categories, role_permission, users, permissions, roles CASCADE;`
- [X] T024 [US3] Document transitional status of GORM AutoMigrate and reference Goose as single source of truth for schema evolution in [`backend/databases/conected.go`](file:///g:/react/next-go/Full-Stack-App-Store/backend/databases/conected.go)

**Checkpoint**: At this point, User Story 3 is complete. The database migration baseline is versioned, atomic, and reversible.

---

## Phase 6: User Story 1 — Reproducible Local Infrastructure via Docker Compose (Priority: P1) 🎯 MVP

**Goal**: Launch the complete local runtime ecosystem (PostgreSQL 16, Redis 7, Go backend, Next.js frontend) with a single declarative command, ensuring persistent database storage across restarts, healthy startup sequencing, and zero hardcoded credentials.

**Independent Test**: Execute `docker compose config` to validate schema, then execute `docker compose up -d` on a clean developer machine. Confirm PostgreSQL and Redis pass healthchecks, backend and frontend become accessible on configured ports, and persistent data survives `docker compose down && docker compose up -d`.

### Implementation for User Story 1
- [X] T025 [US1] Create root [`docker-compose.yml`](file:///g:/react/next-go/Full-Stack-App-Store/docker-compose.yml) declaring services for `postgres`, `redis`, `backend`, and `frontend` on a dedicated bridge network `dashstack-network`
- [X] T026 [US1] Configure `postgres` service with `image: postgres:16-alpine`, environment variables `${POSTGRES_USER}`, `${POSTGRES_PASSWORD}`, `${POSTGRES_DB}`, named persistent volume `postgres_data:/var/lib/postgresql/data`, and healthcheck `test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-postgres} -d ${POSTGRES_DB:-postgres}"]` in [`docker-compose.yml`](file:///g:/react/next-go/Full-Stack-App-Store/docker-compose.yml)
- [X] T027 [US1] Configure `redis` service with `image: redis:7-alpine`, ephemeral storage, port mapping `${REDIS_PORT:-6379}:6379`, and healthcheck `test: ["CMD", "redis-cli", "ping"]` in [`docker-compose.yml`](file:///g:/react/next-go/Full-Stack-App-Store/docker-compose.yml)
- [X] T028 [US1] Configure `backend` service with `build: { context: ./backend, dockerfile: Dockerfile }`, environment variables, port mapping `${PORT:-8000}:8000`, healthcheck `test: ["CMD-SHELL", "wget -qO- http://localhost:8000/health/live || exit 1"]`, and dependencies `depends_on: { postgres: { condition: service_healthy }, redis: { condition: service_healthy } }` in [`docker-compose.yml`](file:///g:/react/next-go/Full-Stack-App-Store/docker-compose.yml)
- [X] T029 [US1] Configure `frontend` service with `build: { context: ./frontend, dockerfile: Dockerfile }`, environment variable `NEXT_PUBLIC_API_URL`, port mapping `${FRONTEND_PORT:-3000}:3000`, healthcheck `test: ["CMD-SHELL", "wget -qO- http://localhost:3000 || exit 1"]`, and dependency `depends_on: { backend: { condition: service_started } }` in [`docker-compose.yml`](file:///g:/react/next-go/Full-Stack-App-Store/docker-compose.yml)
- [X] T030 [US1] Validate declarative Compose configuration syntax and environment variable resolution via `docker compose config`

**Checkpoint**: At this point, User Story 1 orchestration is declarative, reproducible, and operational with healthy service sequencing.

---

## Phase 7: User Story 4 — Unified Developer Workflows via Root Makefile (Priority: P2)

**Goal**: Provide a centralized, discoverable `Makefile` at the repository root standardizing builds, tests, linting, formatting, migrations, and container orchestration across platforms, acting as single source of truth for local and CI workflows.

**Independent Test**: Running `make help` displays formatted command manual. Running individual lifecycle targets (`make dev`, `make test`, `make lint`, `make format`, `make build`, `make docker-up`, `make docker-down`, `make migrate-up`, `make migrate-down`, `make ci`) invokes their respective toolchains predictably.

### Implementation for User Story 4
- [X] T031 [US4] Create root [`Makefile`](file:///g:/react/next-go/Full-Stack-App-Store/Makefile) with default `help` target displaying formatted target table with descriptions
- [X] T032 [US4] Implement code quality targets `lint`, `format`, and `test` in [`Makefile`](file:///g:/react/next-go/Full-Stack-App-Store/Makefile) running `gofmt -l .` / `go test -v ./...` in `backend/` and `pnpm lint` in `frontend/`
- [X] T033 [US4] Implement build and development targets `build` and `dev` in [`Makefile`](file:///g:/react/next-go/Full-Stack-App-Store/Makefile) executing Go binary compilation and Next.js development/build tasks
- [X] T034 [US4] Implement container management targets `docker-up` and `docker-down` in [`Makefile`](file:///g:/react/next-go/Full-Stack-App-Store/Makefile) wrapping `docker compose up -d` and `docker compose down`
- [X] T035 [US4] Implement database migration targets `migrate-up`, `migrate-down`, `migrate-status`, and `migrate-create` in [`Makefile`](file:///g:/react/next-go/Full-Stack-App-Store/Makefile) wrapping Goose CLI with environment DSN resolution
- [X] T036 [US4] Implement pre-flight aggregate target `make ci` in [`Makefile`](file:///g:/react/next-go/Full-Stack-App-Store/Makefile) as canonical source of truth executing format validation, build verification, test suites, and Dockerfile build checks

**Checkpoint**: At this point, User Story 4 is complete. Developer lifecycle commands are standardized, discoverable, and aligned with CI.

---

## Phase 8: User Story 5 — Automated Continuous Integration Pipeline (Priority: P2)

**Goal**: Implement an automated GitHub Actions CI pipeline executing on pull requests and pushes to `main`, validating backend formatting/compilation/tests, frontend dependencies/types/build, and container multi-stage image builds, executing dependent build steps only after code gates pass.

**Independent Test**: Trigger or inspect `.github/workflows/ci.yml`. Workflow triggers on push/PR to main, validates `backend-ci`, `frontend-ci`, and `docker-build-ci` jobs, and fails if any lint error, compilation defect, or broken test is present.

### Implementation for User Story 5
- [X] T037 [US5] Create GitHub Actions CI workflow [`.github/workflows/ci.yml`](file:///g:/react/next-go/Full-Stack-App-Store/.github/workflows/ci.yml) triggered on `push` to `main` and `pull_request` targeting `main`
- [X] T038 [US5] Implement `backend-ci` job in [`.github/workflows/ci.yml`](file:///g:/react/next-go/Full-Stack-App-Store/.github/workflows/ci.yml) with Go 1.25/1.26 setup, module cache, formatting check (`gofmt -l .`), compilation check (`go build ./...`), and test execution (`go test -v ./...`)
- [X] T039 [US5] Implement `frontend-ci` job in [`.github/workflows/ci.yml`](file:///g:/react/next-go/Full-Stack-App-Store/.github/workflows/ci.yml) with Node 22 and pnpm 10 setup, pnpm store caching, frozen install (`pnpm install --frozen-lockfile`), static typecheck (`pnpm exec tsc --noEmit`), linting (`pnpm lint`), and production build (`pnpm build`)
- [X] T040 [US5] Implement `docker-build-ci` job in [`.github/workflows/ci.yml`](file:///g:/react/next-go/Full-Stack-App-Store/.github/workflows/ci.yml) with `needs: [backend-ci, frontend-ci]`, configuring Docker Buildx and executing multi-stage build validation for `backend/Dockerfile` and `frontend/Dockerfile`

**Checkpoint**: At this point, User Story 5 is complete. CI verification gates are codified, automated, and prevent container build execution when source code checks fail.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Documentation updates, developer onboarding guide, and full verification against quickstart.

- [X] T041 [P] Update Developer Setup & Quickstart guide in [`specs/002-phase1-infra-containers-ci/quickstart.md`](file:///g:/react/next-go/Full-Stack-App-Store/specs/002-phase1-infra-containers-ci/quickstart.md) detailing step-by-step local bootstrap with Docker Compose and Makefile commands
- [X] T042 [P] Update project root [`README.md`](file:///g:/react/next-go/Full-Stack-App-Store/README.md) documenting Docker Compose setup, Makefile targets, environment keys, and architectural scope boundaries
- [X] T043 Execute end-to-end quickstart validation per [`specs/002-phase1-infra-containers-ci/quickstart.md`](file:///g:/react/next-go/Full-Stack-App-Store/specs/002-phase1-infra-containers-ci/quickstart.md) and verify all success criteria SC-001 through SC-008

---

## Dependencies & Execution Order

### Strict Linear Execution Order

To eliminate all circular dependencies, tasks execute in this exact sequence:

```
[Phase 1: Setup (.env.example, .dockerignore)]
                     │
                     ▼
[Phase 2: Foundational (Goose dep, standalone Next.js)]
                     │
                     ▼
[Phase 3: US6 Health Checks (/health/live, /health/ready)] ──► Required for Dockerfile healthcheck
                     │
                     ▼
[Phase 4: US2 Containerization (backend/Dockerfile, frontend/Dockerfile)] ──► Required for Compose
                     │
                     ▼
[Phase 5: US3 Database Migrations (00001_initial_schema.sql)] ──► Baseline schema
                     │
                     ▼
[Phase 6: US1 Docker Compose (docker-compose.yml, volume persistence)] ──► Full local stack
                     │
                     ▼
[Phase 7: US4 Makefile (make help, dev, test, docker-up, migrate-up, ci)] ──► Canonical CLI
                     │
                     ▼
[Phase 8: US5 GitHub Actions CI (backend-ci, frontend-ci, docker-build-ci)] ──► Automated gate
                     │
                     ▼
[Phase 9: Polish & Verification (quickstart.md, README.md, end-to-end validation)]
```

### User Story Inter-Dependencies

- **US6 (Health Checks)**: Has ZERO dependencies on Docker or Compose. Implemented directly in Go HTTP layer.
- **US2 (Dockerfiles)**: Depends on US6 (backend health probe exists for build/verification) and Phase 2 (standalone Next.js mode).
- **US3 (Goose Migrations)**: Independent SQL DDL files. Can be authored in parallel with US2.
- **US1 (Docker Compose)**: Depends on US2 (`backend/Dockerfile`, `frontend/Dockerfile`) and US6 (`/health/live`). Healthcheck dependencies (`service_healthy`) ensure PostgreSQL and Redis are fully ready before backend starts.
- **US4 (Root Makefile)**: Depends on US1 (compose commands), US3 (goose commands), and US2 (build commands). Acts as single source of truth for CLI.
- **US5 (GitHub Actions CI)**: `docker-build-ci` explicitly depends on `needs: [backend-ci, frontend-ci]`. Uses identical commands as Makefile.

---

## Implementation Strategy

### MVP First (Core Development Stack: US6 → US2 → US3 → US1)

1. Complete **Phase 1: Setup** (configuration templates and `.dockerignore` files).
2. Complete **Phase 2: Foundational** (Goose dependency and Next.js standalone setting).
3. Complete **Phase 3 (US6): Health Probes** (`/health/live` and `/health/ready`).
4. Complete **Phase 4 (US2): Dockerfiles** (`backend/Dockerfile` and `frontend/Dockerfile`).
5. Complete **Phase 5 (US3): Goose Migrations** (`00001_initial_schema.sql`).
6. Complete **Phase 6 (US1): Docker Compose** (`docker-compose.yml` and orchestration).
7. **STOP and VALIDATE (MVP Checkpoint)**: Run `docker compose up -d` and confirm full stack starts up and healthchecks pass.

### Incremental Delivery

1. **Increment 1 (MVP)**: Working multi-stage containers running locally via Docker Compose (US6 + US2 + US3 + US1).
2. **Increment 2**: Unified developer experience with standardized `Makefile` targets (US4).
3. **Increment 3**: Automated GitHub Actions CI verification pipeline (US5).
4. **Increment 4**: Polished documentation, onboarding manual, and quickstart validation (Phase 9).
