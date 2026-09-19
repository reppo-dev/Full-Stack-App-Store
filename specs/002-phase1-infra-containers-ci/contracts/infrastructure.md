# Infrastructure & Operational Contracts: Phase 1

**Feature**: [Phase 1 Specification](../spec.md) | [Data Model](../data-model.md)  
**Date**: 2026-09-15  
**Status**: Active Contract  

---

## 1. Operational Health Probe Contracts

### 1.1 Liveness Probe (`GET /health/live`)
Confirms that the Go HTTP process is initialized and event loop is processing requests.

* **Path**: `/health/live`
* **Method**: `GET`
* **Authentication**: None (Public)
* **Response (200 OK)**:
  ```json
  {
    "status": "UP",
    "timestamp": "2026-09-15T09:40:00Z"
  }
  ```

---

### 1.2 Readiness Probe (`GET /health/ready`)
Confirms that the backend service and its required dependencies (PostgreSQL) are operational.

* **Path**: `/health/ready`
* **Method**: `GET`
* **Authentication**: None (Public)
* **Success Response (200 OK)**:
  ```json
  {
    "status": "READY",
    "timestamp": "2026-09-15T09:40:00Z",
    "components": {
      "database": "UP"
    }
  }
  ```
* **Failure Response (503 Service Unavailable)**:
  Returned when the database connection pool fails ping verification.
  ```json
  {
    "status": "DOWN",
    "timestamp": "2026-09-15T09:40:00Z",
    "components": {
      "database": "DOWN"
    },
    "error": "database connection unreachable"
  }
  ```

---

## 2. Docker Compose Services Contract

All local development infrastructure is bound by the following service contract:

| Service | Image Baseline | Default Port | Healthcheck Command | Dependency Order |
| :--- | :--- | :--- | :--- | :--- |
| `postgres` | `postgres:16-alpine` | `5432:5432` | `pg_isready -U postgres -d postgres` | None (Foundation) |
| `redis` | `redis:7-alpine` | `6379:6379` | `redis-cli ping` | None (Foundation) |
| `backend` | Built from `backend/Dockerfile` | `8000:8000` | `wget -qO- http://localhost:8000/health/live \|\| exit 1` | `postgres` (`service_healthy`), `redis` (`service_healthy`) |
| `frontend` | Built from `frontend/Dockerfile` | `3000:3000` | `wget -qO- http://localhost:3000 \|\| exit 1` | `backend` (`service_started`) |

---

## 3. Root Makefile Interface Contract

The repository root `Makefile` must expose standardized target semantics:

| Target | Responsibility | Underlying Execution | Exit Code Invariant |
| :--- | :--- | :--- | :--- |
| `make help` | Self-documenting target manual | Displays formatted target table | 0 |
| `make dev` | Launches development stack | Runs Go server & Next.js dev concurrently | 0 (until SIGINT) |
| `make test` | Executes all test suites | `go test ./...` in `backend/` | 0 on 100% pass; 1 on failure |
| `make lint` | Runs static analysis | `gofmt -l .` / `golangci-lint` & `pnpm lint` | 0 if clean; 1 if errors |
| `make format` | Auto-formats code | `gofmt -w .` in `backend/` | 0 |
| `make build` | Compiles production binaries | `go build` in `backend/` & `pnpm build` in `frontend/` | 0 |
| `make docker-up` | Starts container stack | `docker compose up -d` | 0 |
| `make docker-down`| Tears down container stack | `docker compose down` | 0 |
| `make migrate-up` | Applies SQL migrations | `goose -dir backend/db/migrations postgres "<DSN>" up` | 0 |
| `make migrate-down`| Rolls back latest migration | `goose -dir backend/db/migrations postgres "<DSN>" down` | 0 |
| `make migrate-status`| Inspects migration version | `goose -dir backend/db/migrations postgres "<DSN>" status` | 0 |
| `make migrate-create`| Scaffolds migration pair | `goose -dir backend/db/migrations create $(name) sql` | 0 |
| `make ci` | Pre-flight CI verification | Formats, builds, tests, and validates Dockerfiles | 0 on green; 1 on any gate |

---

## 4. Continuous Integration (CI) Workflow Contract

The GitHub Actions workflow `.github/workflows/ci.yml` defines the following job contract:

* **Event Triggers**:
  ```yaml
  on:
    push:
      branches: [ main ]
    pull_request:
      branches: [ main ]
  ```
* **Job 1: `backend-ci`**:
  - Environment: `ubuntu-latest`, Go 1.24/1.26.
  - Assertions: `gofmt -l .` returns 0 lines; `go build ./...` succeeds; `go test -v ./...` passes.
* **Job 2: `frontend-ci`**:
  - Environment: `ubuntu-latest`, Node 22, pnpm 10.
  - Assertions: `pnpm install --frozen-lockfile` succeeds; `pnpm exec tsc --noEmit` returns 0 errors; `pnpm build` succeeds.
* **Job 3: `docker-build-ci`**:
  - Environment: `ubuntu-latest`, Docker Buildx.
  - Dependencies: Requires `[backend-ci, frontend-ci]`.
  - Assertions: `docker build` succeeds for `backend/Dockerfile` and `frontend/Dockerfile`.
