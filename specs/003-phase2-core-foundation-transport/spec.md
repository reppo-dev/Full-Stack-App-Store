# Feature Specification: Phase 2 — Core Foundation & Transport Layer Normalization

**Feature Branch**: `003-phase2-core-foundation-transport`  
**Created**: 2026-09-15  
**Status**: Draft  
**Input**: User prompt requesting Phase 2 implementation covering Backend Layered Shell (slog, request tracing, config validation, graceful shutdown), Frontend Transport Normalization (Centralized Axios, TanStack Query, Redux Toolkit), and SQLC code-generation foundation based on Modernization Roadmap and Project Constitution.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Centralized & Resilient Frontend Transport Layer (Priority: P1) 🎯 MVP

As a frontend developer building e-commerce features,  
I want a single, centralized API client handling all remote communication with the Go backend,  
So that request timeouts, base URLs, authentication cookie transport (`withCredentials: true`), and error normalization are consistently handled without ad-hoc `fetch` or scattered Axios instances.

**Why this priority**: Eliminates dual transport paths, resolves broken error handling, ensures consistent credentials/cookies across all requests, and forms the required transport bridge for subsequent customer and admin features.

**Independent Test**: Trigger API requests from any client component or page using the centralized client. Verify requests automatically route to `NEXT_PUBLIC_API_URL`, include credentials, timeout appropriately, and transform backend HTTP 4xx/5xx responses into strongly-typed `ApiError` objects.

**Acceptance Scenarios**:
1. **Given** an API call made via the central client, **When** the backend returns an error (e.g. 401 Unauthorized or 403 Forbidden), **Then** the client intercepts the error and returns a normalized `ApiError` containing status code, error code, and user-facing message.
2. **Given** the frontend running in the browser, **When** making cross-origin requests to the Go backend, **Then** `withCredentials: true` is automatically included, allowing session and authentication cookies to pass seamlessly.
3. **Given** a hanging network connection, **When** a request exceeds 15 seconds, **Then** the request is automatically aborted with a clear timeout error.

---

### User Story 2 - Frontend State Segregation & Providers Infrastructure (Priority: P1)

As a frontend software engineer,  
I want strict architectural segregation between Server State (TanStack Query) and Client UI State (Redux Toolkit),  
So that asynchronous server data is automatically cached, deduplicated, and kept fresh, while synchronous UI state (sidebar open/close, modals, view toggles) is cleanly managed without polluting remote entity models.

**Why this priority**: Enforces Constitution Principles III & IV (Strict State Segregation), eliminates cache drift, prevents race conditions, and provides the provider infrastructure needed for all upcoming feature pages.

**Independent Test**: Mount the root application layout with `<AppProviders>`. Verify that TanStack `QueryClientProvider` and Redux `Provider` initialize on the client side without React SSR hydration mismatches, and Redux devtools reflect the initial UI state slices.

**Acceptance Scenarios**:
1. **Given** the root application layout, **When** the application renders in Next.js App Router, **Then** `AppProviders` initializes `QueryClientProvider` and Redux `Provider` within a client boundary (`"use client"`) with zero hydration warnings.
2. **Given** two separate components requesting the same data on the same page, **When** TanStack Query executes, **Then** only one HTTP request is dispatched and data is shared from the cache.
3. **Given** client UI state (such as sidebar toggle or filter dialog), **When** dispatching Redux actions, **Then** UI state updates synchronously without triggering network calls or mutating server models.

---

### User Story 3 - Structured Backend Logging, Request Tracing & Correlation (Priority: P1)

As a site reliability engineer and backend maintainer,  
I want every HTTP request to be assigned a unique correlation ID (`X-Request-ID`) and logged in structured JSON using `log/slog`,  
So that any failure, slow query, or security event can be traced from initial ingress through internal processing to final response.

**Why this priority**: Fulfills Constitution Principle XXXIII (Full-Spectrum Observability), providing immediate production debugging capability before domain migration commences.

**Independent Test**: Send an HTTP request with or without an `X-Request-ID` header. Verify the response contains `X-Request-ID`, and the backend console logs a structured JSON entry containing `timestamp`, `level`, `request_id`, `method`, `path`, `status`, and `latency_ms`.

**Acceptance Scenarios**:
1. **Given** an incoming HTTP request without `X-Request-ID`, **When** processed by the backend middleware, **Then** a unique UUID v4 is generated, assigned to request context, and emitted in the response headers.
2. **Given** an incoming HTTP request with an existing `X-Request-ID` header, **When** processed, **Then** the existing ID is preserved and propagated.
3. **Given** completed request processing, **When** the log entry is produced, **Then** it formats as single-line JSON adhering to `log/slog` standards with zero unstructured plain-text logging.

---

### User Story 4 - Standardized API Response Envelopes & Domain Error Handling (Priority: P2)

As an API consumer and frontend engineer,  
I want standardized JSON response envelopes for successful responses and structured error bodies,  
So that the frontend can deterministically parse API payloads and present user-friendly error messages without guessing response schemas.

**Why this priority**: Eliminates scattered response formats, standardizes error codes across domains, and guarantees that unexpected server crashes produce safe, sanitized JSON responses without leaking internal stack traces.

**Independent Test**: Query a standard success endpoint $\rightarrow$ returns HTTP 200 with standard envelope. Trigger an unhandled error or validation error $\rightarrow$ returns HTTP 4xx/5xx with structured error envelope containing `request_id`.

**Acceptance Scenarios**:
1. **Given** a successful API operation on new `/api/v1/` routes or modernized controllers, **When** the controller responds, **Then** the response matches: `{"success": true, "data": ...}`. Legacy `/api/` endpoints remain intact to prevent breaking changes during Strangler Fig migration.
2. **Given** an application error or validation failure, **When** the error handler intercepts the error, **Then** it responds with: `{"success": false, "error": {"code": "...", "message": "...", "request_id": "..."}}`.
3. **Given** an unhandled panic inside a handler, **When** the recovery middleware triggers, **Then** it intercepts the panic, logs the full stack trace privately to `slog.Error`, and returns a generic HTTP 500 `INTERNAL_SERVER_ERROR` with correlation ID, never exposing Go stack traces to the public caller.

---

### User Story 5 - Type-Safe Configuration Engine & Graceful Shutdown (Priority: P2)

As a DevOps engineer deploying backend containers,  
I want a strict 12-factor configuration engine validating all environment variables at startup and a graceful shutdown handler trapping OS signals,  
So that misconfigured containers fail immediately at boot ("fail-fast"), and running containers finish ongoing in-flight HTTP requests before terminating.

**Why this priority**: Prevents runtime crashes caused by missing environment variables, guarantees zero dropped connections during container restarts, and fulfills Constitution Principles XXX & XXXVI.

**Independent Test**: (1) Launch backend with missing required variable $\rightarrow$ process exits immediately with clear diagnostic log. (2) Send `SIGTERM` or `SIGINT` to running backend $\rightarrow$ server stops accepting new connections, drains existing requests within 10 seconds, closes database handles, and terminates cleanly with exit code 0.

**Acceptance Scenarios**:
1. **Given** missing required environment variables (e.g. invalid `PORT` or database connection parameters), **When** backend boots, **Then** the configuration parser logs an explicit fatal validation error and halts execution.
2. **Given** a running backend handling active HTTP requests, **When** a `SIGTERM` or `SIGINT` signal is received, **Then** `ShutdownWithTimeout(10 * time.Second)` is invoked, active requests complete successfully, and database connection pools are closed gracefully.

---

### User Story 6 - SQLC Tooling & Code Generation Foundation (Priority: P2)

As a backend database engineer,  
I want [SQLC](https://sqlc.dev/) configured and verified against our PostgreSQL schema,  
So that we can compile type-safe, boilerplate-free Go repository code from pure SQL queries without manual mapping or ORM overhead.

**Why this priority**: Fulfills Constitution Principle I (SQL-First Architecture) and establishes the exact code generation pipeline required for Phase 3 (Auth & Users) and Phase 4 (Catalog).

**Independent Test**: Execute `sqlc generate` via Makefile target (`make sqlc-generate` or `sqlc generate`). Verify SQLC validates SQL queries against the schema and outputs clean Go code in `backend/internal/infrastructure/database/sqlc`.

**Acceptance Scenarios**:
1. **Given** `backend/sqlc.yaml`, **When** inspecting configuration, **Then** it targets PostgreSQL engine, references `db/migrations`, and outputs to `internal/infrastructure/database/sqlc` with type-safe struct generation.
2. **Given** a foundational query file (`backend/db/queries/health.sql`), **When** running SQLC code generation, **Then** SQLC produces verified Go structs and interfaces that compile without errors.

---

### Edge Cases

- **Next.js SSR Hydration Mismatch**: Initializing client-side state providers in `app/layout.tsx` could cause hydration warnings if not isolated within `"use client"` provider boundaries. `AppProviders` must be isolated as an explicit client component.
- **Request ID Collision**: Fast concurrent requests must not generate colliding IDs. UUID v4 with cryptographically secure random numbers must be used.
- **Panic Recovery during Streaming or Partial Writes**: If a panic occurs after HTTP headers have already been committed, the error handler must gracefully close the connection and log the correlation ID without double-writing headers.
- **Transient Redis / DB during Graceful Shutdown**: Database connection pools must not be closed before in-flight HTTP request handlers finish executing.

---

## Requirements *(mandatory)*

### Functional Requirements

#### Frontend Transport & State Foundation
- **FR-001**: Frontend MUST provide a centralized Axios client instance in [`frontend/lib/api/client.ts`](file:///g:/react/next-go/Full-Stack-App-Store/frontend/lib/api/client.ts) configured with `baseURL: process.env.NEXT_PUBLIC_API_URL`, default 15s timeout, and `withCredentials: true`.
- **FR-002**: Centralized Axios client MUST implement response interceptors that normalize all HTTP error responses into a standardized `ApiError` class containing `status`, `code`, `message`, and `requestId`.
- **FR-003**: Frontend MUST integrate `@tanstack/react-query` as the exclusive manager for asynchronous server state with default stale time of 60 seconds.
- **FR-004**: Frontend MUST integrate `@reduxjs/toolkit` and `react-redux` as the exclusive manager for client-local UI state (sidebar navigation, dialog visibility, table filter state).
- **FR-005**: Frontend MUST provide a unified `<AppProviders>` client component wrapping `QueryClientProvider` and Redux `Provider` in [`frontend/app/layout.tsx`](file:///g:/react/next-go/Full-Stack-App-Store/frontend/app/layout.tsx). UI state in Redux Toolkit manages in-memory layout preferences (sidebar navigation, dialogs); sidebar collapse preference optionally syncs with client localStorage or cookie if available, while modals remain purely in-memory. Server state is strictly prohibited from Redux and handled exclusively by TanStack Query.

#### Backend Core Architecture & Observability
- **FR-006**: Backend MUST implement a structured logging system using Go standard library `log/slog` outputting JSON logs in production and human-readable text in development.
- **FR-007**: Backend MUST implement an HTTP correlation middleware attaching a unique `X-Request-ID` (UUID v4) to each request context and response header.
- **FR-008**: Backend request logger MUST log every incoming request with method, path, status code, latency (ms), and correlation ID.
- **FR-009**: Backend MUST implement centralized response helpers in `internal/transport/http/response/` for standardized success envelopes and error payloads.
- **FR-010**: Backend MUST implement global panic recovery and centralized error handling middleware preventing stack trace leakage to API callers.
- **FR-011**: Backend MUST provide a strict configuration engine in `internal/config/config.go` validating all runtime parameters at application bootstrap.
- **FR-012**: Backend MUST implement graceful process shutdown trapping `SIGINT` and `SIGTERM`, allowing up to 10 seconds for in-flight requests to drain before terminating database pools and exiting.

#### SQLC Database Code Generation
- **FR-013**: System MUST provide `backend/sqlc.yaml` configured for PostgreSQL, reading schema DDL from `backend/db/migrations/` and emitting type-safe code to `backend/internal/infrastructure/database/sqlc`.
- **FR-014**: System MUST provide Makefile targets `make sqlc-generate` and `make sqlc-verify` to generate and validate SQLC code during local development and CI.

---

### Key Entities

- **Centralized API Client (`ApiClient`)**: Singleton Axios client encapsulating base configuration, authorization headers, timeout limits, and standardized error translation.
- **Application Error (`ApiError`)**: Normalized client-side error model representing HTTP status, machine-readable domain code, user-friendly message, and backend request trace ID.
- **Correlation Context (`RequestTrace`)**: Structured request metadata containing `request_id`, client IP, user agent, method, and URI passed through Go context for structured logging.
- **Response Envelope**: Standard JSON schema encapsulating API payloads (`success: true`, `data: ...`) or error details (`success: false`, `error: {...}`).
- **Configuration Record (`AppConfig`)**: Immutable, validated environment configuration containing server ports, database credentials, JWT secrets, and logging levels.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of frontend HTTP communication with the backend passes through the centralized API client; zero ad-hoc un-intercepted `fetch()` calls remain in newly modernized modules.
- **SC-002**: 100% of backend HTTP responses include an `X-Request-ID` header; every log entry contains the corresponding `request_id`.
- **SC-003**: 0% of application panics or internal 500 errors expose Go source file paths, line numbers, or runtime stack traces in the HTTP response body.
- **SC-004**: Backend graceful shutdown terminates with exit code 0 in under 10 seconds without dropping active HTTP connections during SIGTERM events.
- **SC-005**: Next.js application builds cleanly (`pnpm build`) with `<AppProviders>` active, producing 0 React hydration errors or SSR context warnings in browser console.
- **SC-006**: SQLC generates type-safe Go repository code in under 2 seconds via `make sqlc-generate`.
- **SC-007**: Automated test suite (`go test -v ./...` and `tsc --noEmit`) passes 100% with zero regressions.

---

## Assumptions

- Developers have Go 1.25+ and Node.js 22+ with pnpm 10+ available locally.
- SQLC can be run via local CLI or containerized toolchain without requiring external runtime dependencies.
- Frontend App Router conventions in Next.js 16 will continue to support `"use client"` provider boundaries without breaking Server Components.
- TanStack Query v5 and Redux Toolkit v2 are compatible with React 19.
