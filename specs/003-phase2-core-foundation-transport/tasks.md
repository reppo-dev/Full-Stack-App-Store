# Tasks: Phase 2 — Core Foundation & Transport Layer Normalization

**Branch**: `003-phase2-core-foundation-transport` | **Date**: 2026-09-15 | **Spec**: [Phase 2 Specification](spec.md) | **Plan**: [Implementation Plan](plan.md)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project dependency installation and directory layout preparation

- [X] T001 [P] Create backend internal package directories in `backend/internal/config`, `backend/internal/transport/http/middleware`, `backend/internal/transport/http/response`, `backend/internal/infrastructure/database/sqlc`, and `backend/db/queries`
- [X] T002 [P] Create frontend client architecture directories in `frontend/lib/api`, `frontend/lib/query`, `frontend/lib/redux/slices`, and `frontend/components/providers`
- [X] T003 Install frontend dependencies `@tanstack/react-query`, `@reduxjs/toolkit`, and `react-redux` in `frontend/package.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core configuration and envelope primitives that subsequent user stories depend on

- [X] T004 Implement 12-factor configuration struct and parser in `backend/internal/config/config.go`
- [X] T005 [P] Implement unit tests for configuration parsing and validation in `backend/internal/config/config_test.go`
- [X] T006 [P] Implement standardized JSON response envelopes (`Success`, `Error`, `Created`, `NoContent`) in `backend/internal/transport/http/response/response.go`
- [X] T007 [P] Implement unit tests for response envelope serialization in `backend/internal/transport/http/response/response_test.go`

---

## Phase 3: User Story 1 - Centralized & Resilient Frontend Transport Layer (Priority: P1) 🎯 MVP

**Goal**: Deliver a single, centralized Axios client instance with base URL configuration, credentials forwarding, request timeouts, and typed error normalization.

**Independent Test**: Execute API calls via the centralized client to valid and invalid backend endpoints; verify responses normalize into strongly-typed `ApiError` objects with accurate status codes and message extraction.

- [X] T008 [P] [US1] Define normalized `ApiError` class and Axios client instance with 15s timeout and `withCredentials: true` in `frontend/lib/api/client.ts`
- [X] T009 [P] [US1] Implement request and response interceptors in `frontend/lib/api/client.ts` unpacking API envelopes and mapping HTTP errors
- [X] T010 [US1] Implement unit tests verifying `apiClient` defaults and `ApiError` mapping in `frontend/lib/api/client.test.ts`

---

## Phase 4: User Story 2 - Frontend State Segregation & Providers Infrastructure (Priority: P1)

**Goal**: Architect strict separation between Server State (TanStack Query) and Client UI State (Redux Toolkit) wrapped in a single client boundary provider.

**Independent Test**: Mount the root layout with `<AppProviders>`; verify `QueryClient` caches server queries without SSR hydration warnings, and Redux dispatches UI actions synchronously.

- [X] T011 [P] [US2] Configure TanStack `QueryClient` with 60s stale time and window-focus policies in `frontend/lib/query/client.ts`
- [X] T012 [P] [US2] Implement Redux Toolkit `uiSlice` with sidebar and modal state reducers in `frontend/lib/redux/slices/uiSlice.ts`
- [X] T013 [P] [US2] Configure root Redux store and typed hooks (`useAppDispatch`, `useAppSelector`) in `frontend/lib/redux/store.ts`
- [X] T014 [US2] Implement unified client boundary `<AppProviders>` component in `frontend/components/providers/AppProviders.tsx`
- [X] T015 [US2] Mount `<AppProviders>` into the root application layout in `frontend/app/layout.tsx`

---

## Phase 5: User Story 3 - Structured Backend Logging, Request Tracing & Correlation (Priority: P1)

**Goal**: Provide structured JSON logging via `log/slog` and assign a unique correlation ID (`X-Request-ID`) to every incoming HTTP request.

**Independent Test**: Send HTTP requests to backend; verify `X-Request-ID` is present in response headers, and single-line JSON log is output with method, path, status, latency_ms, and request_id.

- [X] T016 [P] [US3] Implement `X-Request-ID` correlation middleware using UUID v4 in `backend/internal/transport/http/middleware/request_id.go`
- [X] T017 [P] [US3] Implement unit tests for `X-Request-ID` generation and header preservation in `backend/internal/transport/http/middleware/request_id_test.go`
- [X] T018 [US3] Implement structured logging middleware using Go `log/slog` in `backend/internal/transport/http/middleware/logger.go`

---

## Phase 6: User Story 4 - Standardized API Response Envelopes & Domain Error Handling (Priority: P2)

**Goal**: Prevent stack trace leakage and unhandled crashes via global panic recovery, outputting uniform error envelopes.

**Independent Test**: Send request to panic-inducing test endpoint; verify server responds with HTTP 500 error envelope containing `request_id`, logs trace privately, and process remains alive.

- [X] T019 [P] [US4] Implement global panic recovery middleware logging stack trace and returning sanitized HTTP 500 in `backend/internal/transport/http/middleware/recovery.go`
- [X] T020 [P] [US4] Implement unit tests for panic recovery and stack trace sanitization in `backend/internal/transport/http/middleware/recovery_test.go`
- [X] T021 [US4] Register correlation, logger, and recovery middlewares into Fiber pipeline in `backend/routes/routes.go` and `backend/main.go`
- [X] T022 [US4] Implement `/api/v1/health` endpoint utilizing standardized response envelopes in `backend/controllers/healthController.go` and mount in `backend/routes/routes.go`

---

## Phase 7: User Story 5 - Type-Safe Configuration Engine & Graceful Shutdown (Priority: P2)

**Goal**: Validate environment variables at boot ("fail-fast") and implement clean signal trapping allowing up to 10 seconds for in-flight requests to drain.

**Independent Test**: (1) Boot backend with missing port/db $\rightarrow$ fails fast. (2) Send `SIGTERM` $\rightarrow$ server invokes `ShutdownWithTimeout`, drains requests, closes DB/Redis pools, and exits code 0.

- [X] T023 [US5] Integrate `config.LoadConfig()` into backend initialization in `backend/main.go`
- [X] T024 [US5] Implement OS signal trapping (`SIGINT`, `SIGTERM`) and graceful server shutdown with 10s drain in `backend/main.go`
- [X] T025 [US5] Add database and Redis connection pool graceful closure routines on shutdown in `backend/databases/conected.go` and `backend/databases/redis.go`

---

## Phase 8: User Story 6 - SQLC Tooling & Code Generation Foundation (Priority: P2)

**Goal**: Configure SQLC for PostgreSQL and verify type-safe repository code generation from raw SQL queries.

**Independent Test**: Run `make sqlc-generate` or `sqlc generate`; verify generated code outputs cleanly to `backend/internal/infrastructure/database/sqlc`.

- [X] T026 [P] [US6] Create SQLC configuration file targeting PostgreSQL and migrations in `backend/sqlc.yaml`
- [X] T027 [P] [US6] Create baseline SQL verification query in `backend/db/queries/health.sql`
- [X] T028 [US6] Add `sqlc-generate` and `sqlc-verify` targets to root `Makefile`
- [X] T029 [US6] Run SQLC code generation and verify generated Go structs in `backend/internal/infrastructure/database/sqlc`

---

## Phase 9: Polish & Cross-Cutting Integration

**Purpose**: End-to-end build verification, test suite execution, and documentation

- [X] T030 [P] Update `specs/003-phase2-core-foundation-transport/quickstart.md` with final verification commands
- [X] T031 Run backend automated test suite (`go test -v ./...`) across all packages
- [X] T032 Run frontend typecheck (`pnpm exec tsc --noEmit`) and build (`pnpm build`)
- [X] T033 Update root `README.md` to document Phase 2 architecture deliverables and tooling

---

## Dependencies & Execution Order

### Phase Dependencies
- **Setup (Phase 1)**: No dependencies — can start immediately.
- **Foundational (Phase 2)**: Depends on Phase 1 completion — blocks User Stories.
- **User Stories (Phases 3-8)**: Depend on Phase 2 completion.
  - US1 (Frontend Transport) and US2 (Frontend State) proceed on frontend codebase.
  - US3 (Logging), US4 (Envelopes/Recovery), US5 (Config/Shutdown) proceed on backend codebase.
  - US6 (SQLC) proceeds on database/tooling codebase.
- **Polish (Phase 9)**: Depends on all User Stories being implemented.

### Parallel Opportunities
- Frontend tasks (T002, T003, T008-T015) can run in parallel with Backend tasks (T001, T004-T007, T016-T029).
- Unit tests (T005, T007, T017, T020) can run concurrently with implementation components.

---

## Implementation Strategy (MVP First)

1. **Phase 1 & 2**: Establish package layouts, config validator, response envelopes.
2. **Phase 3 & 4 (Frontend MVP)**: Centralized Axios client, TanStack Query, Redux Toolkit, `<AppProviders>`, verify `pnpm build`.
3. **Phase 5, 6 & 7 (Backend Core)**: Request ID, structured logger, panic recovery, graceful shutdown, verify `go test -v ./...`.
4. **Phase 8 (Database Tooling)**: SQLC setup and verification query.
5. **Phase 9 (Final Verification)**: Full automated test run, quickstart validation, documentation update.
