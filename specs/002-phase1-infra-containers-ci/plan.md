# Implementation Plan: Phase 1 — Development Infrastructure, Containerization & CI Foundation

**Branch**: `002-phase1-infra-containers-ci` | **Date**: 2026-09-15 | **Spec**: [Phase 1 Specification](spec.md)  
**Input**: Feature specification from `specs/002-phase1-infra-containers-ci/spec.md`  

---

## Summary

Phase 1 establishes a standardized, reproducible, and verifiable development and continuous integration foundation for DashStack. It provides multi-stage, non-root Dockerfiles for Go backend and Next.js frontend, an orchestrated local stack via Docker Compose (PostgreSQL 16, Redis 7, backend, frontend), an independent versioned SQL database migration system using Goose codifying the complete 12-table current schema, a root `Makefile` standardizing developer lifecycle commands, operational health check probes (`/health/live`, `/health/ready`), and an automated GitHub Actions CI pipeline.

---

## Technical Context

**Language/Version**:
- Backend: Go 1.25+ / 1.26 (Alpine base)
- Frontend: TypeScript 5.9+, Node.js 22 (Alpine base), pnpm 10.33+

**Primary Dependencies**:
- Backend: Fiber v2.52+, GORM v1.31+ (transitional), `godotenv` v1.5+, `golang-jwt/jwt` v3.2+, Goose v3+ (migrations)
- Frontend: Next.js 16.1.6 (Turbopack, standalone output), React 19.2.3, Tailwind CSS v4, Axios 1.13.6
- Infrastructure: PostgreSQL 16 Alpine, Redis 7 Alpine, Docker 24+, Docker Compose v2+

**Storage**:
- Primary System of Record: PostgreSQL 16 (persistent volume `postgres_data`)
- Caching / Infrastructure Foundation: Redis 7 (ephemeral in Phase 1)

**Testing**:
- Backend: Go native test suite (`go test -v ./...`)
- Frontend: TypeScript static typecheck (`tsc --noEmit`), Next.js build validation (`pnpm build`)
- Integration: Docker multi-stage build validation and migration forward/rollback validation

**Target Platform**:
- Local Development: Linux / macOS / Windows (Docker Desktop / WSL2)
- CI: GitHub Actions (`ubuntu-latest`)
- Initial Production Architecture Target: Single Cloud VM / VPS with Docker Compose and Reverse Proxy (Nginx / Caddy)

**Project Type**: Monorepo Web Application (Go Fiber API Backend + Next.js Frontend)

**Constraints**:
- Backend image size < 50 MB; frontend image size < 200 MB; non-root user execution (`UID > 1000`).
- No server-side secrets leaked in client image.
- Goose baseline migration runnable on completely empty database with clean rollback.
- Health checks response time < 20 ms.
- Zero premature architectural overhauls (No GORM removal, no Clean Architecture folder moves, no full RBAC, no K8s).

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

- **Principle I (Backend Layering & SQL-First)**: PASS. GORM is not extended to new modules. Goose is introduced as the independent, raw-SQL migration mechanism.
- **Principle XXIII (Production-Grade Containerization)**: PASS. Multi-stage builds, non-root users (`10001` backend, `1001` frontend), minimal base images (Alpine), and standalone Next.js packaging.
- **Principle XXIV (Local Infrastructure & Docker Compose)**: PASS. `docker-compose.yml` specifies PostgreSQL 16 and Redis 7 with healthchecks, persistent volumes, and 12-factor `.env` configuration with zero hardcoded credentials.
- **Principle XXV (Discoverable Workflows & Makefile)**: PASS. Root `Makefile` codifies `make dev`, `make test`, `make lint`, `make format`, `make build`, `make docker-up`, `make docker-down`, `make migrate-up`, `make migrate-down`, `make ci`.
- **Principle XXVI (CI/CD Automation)**: PASS. GitHub Actions `.github/workflows/ci.yml` triggers on PRs and mainline pushes, executing backend checks, frontend checks, and container build validation.
- **Principle XXVIII (Distributed Caching & Redis Governance)**: PASS. Redis is added to infrastructure as foundation only; not used as primary database; business caching deferred.
- **Principle XXX (Health Check Semantics & Graceful Shutdown)**: PASS. Backend exposes `/health/live` and `/health/ready` verifying database connectivity.
- **Principle XXXV (Database Reliability & Safe Migrations)**: PASS. Goose baseline migration is transactional, idempotent, and reversible.
- **Principle XXXVI (Twelve-Factor Configuration)**: PASS. Updated `.env.example` templates in root, backend, and frontend.
- **Principle XLIII (Technology Justification)**: PASS. Every tool (Docker, Goose, Makefile, GitHub Actions) directly fulfills core reproducibility and CI requirements without speculative bloat.

---

## Project Structure

### Documentation (this feature)

```text
specs/002-phase1-infra-containers-ci/
├── spec.md                          # Phase 1 Specification
├── plan.md                          # Implementation Plan (This document)
├── research.md                      # Technical Decisions & Entity Extraction
├── data-model.md                    # Database Schema & Goose Baseline Specification
├── quickstart.md                    # Developer Quickstart & Verification Guide
├── checklists/
│   └── requirements.md              # Specification Quality Checklist (PASS)
└── contracts/
    └── infrastructure.md            # Contracts for Docker, Compose, Makefile, CI, Health Probes
```

### Source Code Planned Additions & Modifications

```text
Full-Stack-App-Store/
├── .env.example                     # [NEW] Root environment template for Docker Compose
├── docker-compose.yml               # [NEW] Multi-service local development orchestration
├── Makefile                         # [NEW] Root lifecycle commands manual
├── .github/
│   └── workflows/
│       └── ci.yml                   # [NEW] GitHub Actions CI workflow pipeline
├── backend/
│   ├── Dockerfile                   # [NEW] Multi-stage, non-root Go backend container
│   ├── .dockerignore                # [NEW] Ignore local build/tmp/env in container context
│   ├── .env.example                 # [MODIFY] Document Redis and connection parameters
│   ├── routes/
│   │   └── routes.go                # [MODIFY] Mount /health/live and /health/ready probes
│   ├── controllers/
│   │   └── healthController.go      # [NEW] Implement liveness and readiness handlers
│   └── db/
│       └── migrations/
│           ├── 00001_initial_schema.sql  # [NEW] Goose baseline up/down SQL migration
│           └── README.md            # [NEW] Migration usage and conventions guide
└── frontend/
    ├── Dockerfile                   # [NEW] Multi-stage, standalone Next.js container
    ├── .dockerignore                # [NEW] Ignore node_modules/.next/local env
    ├── .env.example                 # [MODIFY] Document updated frontend environment keys
    └── next.config.ts               # [MODIFY] Ensure output: "standalone" is active
```

---

## Implementation Sequence

### Step 1: Operational Health Checks (`/health/live` and `/health/ready`)
- Create `backend/controllers/healthController.go` with:
  - `HealthLive(c *fiber.Ctx) error`: Returns 200 `{"status": "UP"}`.
  - `HealthReady(c *fiber.Ctx) error`: Tests `databases.DB` ping. Returns 200 `{"status": "READY", "components": {"database": "UP"}}` or 503 if unreachable.
- Mount routes in `backend/routes/routes.go`.
- Add test assertions in `backend/routes/routes_test.go`.

### Step 2: Database Migration Baseline with Goose
- Create `backend/db/migrations/` directory.
- Author `backend/db/migrations/00001_initial_schema.sql` containing the exact 12-table schema, 4 join tables, indexes, unique constraints, and paired rollback drop statements.
- Author `backend/db/migrations/README.md` documenting Goose CLI commands.

### Step 3: Backend & Frontend Containerization (Dockerfiles)
- Author `backend/Dockerfile` with multi-stage Go compilation, non-root `appuser:appgroup` (`UID 10001`), and minimal runtime.
- Author `backend/.dockerignore`.
- Update `frontend/next.config.ts` to include `output: "standalone"`.
- Author `frontend/Dockerfile` with multi-stage standalone Next.js build and non-root `nextjs:nodejs` (`UID 1001`).
- Author `frontend/.dockerignore`.

### Step 4: Docker Compose Orchestration
- Author root `docker-compose.yml` defining:
  - `postgres` (PostgreSQL 16 Alpine, persistent volume, healthcheck).
  - `redis` (Redis 7 Alpine, ephemeral mode, healthcheck).
  - `backend` (built from `backend/`, depends on postgres and redis).
  - `frontend` (built from `frontend/`, depends on backend).
- Create root `.env.example` mapping all compose variables.

### Step 5: Root Makefile Codification
- Author root `Makefile` implementing:
  - `make help`, `make dev`, `make test`, `make lint`, `make format`, `make build`.
  - `make docker-up`, `make docker-down`.
  - `make migrate-up`, `make migrate-down`, `make migrate-status`, `make migrate-create`.
  - `make ci`.

### Step 6: Continuous Integration Workflow (GitHub Actions)
- Author `.github/workflows/ci.yml` defining:
  - `backend-ci` (Go 1.25/1.26, `gofmt`, `go build`, `go test`).
  - `frontend-ci` (Node 22, pnpm 10, `pnpm install`, `tsc --noEmit`, `pnpm build`).
  - `docker-build-ci` (Docker multi-stage build validation for backend and frontend).

### Step 7: Documentation & Verification Gate
- Update root `README.md` with developer setup instructions pointing to Docker Compose and Makefile commands.
- Validate end-to-end execution matching `quickstart.md`.
