# Technical Research & Architecture Decisions: Phase 2 — Core Foundation & Transport Layer Normalization

**Feature**: [spec.md](./spec.md)  
**Date**: 2026-09-15  
**Status**: Completed  

---

## 1. Backend Structured Logging (`log/slog`)

### Decision
Implement structured JSON logging using Go 1.21+ standard library `log/slog` in `backend/internal/transport/http/middleware/logger.go`.

### Rationale
- Standard library: Zero external third-party dependencies, guaranteeing long-term stability and compatibility.
- Zero-allocation attribute formatting for high-throughput HTTP endpoints.
- Pluggable handlers: Automatically switches to `slog.NewJSONHandler(os.Stdout, ...)` in production/staging and `slog.NewTextHandler(os.Stdout, ...)` in local development (`ENV=development`).
- Integrates seamlessly with Fiber context attributes (`request_id`, `method`, `path`, `status`, `latency_ms`, `ip`).

### Alternatives Considered
- `uber-go/zap`: Extremely fast but introduces external dependency and verbose setup overhead for current modular monolith stage.
- `rs/zerolog`: Fast but redundant given Go standard library's official adoption of `log/slog`.
- Plain `log.Printf`: Rejected due to lack of severity levels, missing structured fields, and impossibility of automated log aggregation in modern APM/ELK pipelines.

---

## 2. Request Correlation & Tracing (`X-Request-ID`)

### Decision
Implement correlation ID middleware in `backend/internal/transport/http/middleware/request_id.go` using `github.com/google/uuid` (already present in `go.mod`).

### Rationale
- Fulfills Constitution Principle XXXIII (Full-Spectrum Observability).
- If the incoming HTTP request contains an `X-Request-ID` header, validate and reuse it (enabling end-to-end tracing originating from reverse proxy or client).
- If absent, generate a cryptographically secure UUID v4.
- Attach `request_id` to Fiber `c.Locals("request_id")`, inject into response header `X-Request-ID`, and attach to Go `context.Context` for downstream logging and database query tagging.

### Alternatives Considered
- Short numeric hashes / nanoid: Rejected because UUID v4 is the universal standard across reverse proxies (Nginx/Caddy/Cloudflare) and cloud APMs.

---

## 3. Global Panic Recovery & Standardized Response Envelopes

### Decision
Implement global panic recovery middleware in `backend/internal/transport/http/middleware/recovery.go` and response utilities in `backend/internal/transport/http/response/response.go`.

### Rationale
- Unhandled runtime panics in HTTP handlers must never leak file paths, line numbers, or runtime stack traces to client callers (Constitution Principle XIV).
- Panic recovery captures the panic, logs the full stack trace privately to `slog.Error` alongside the `request_id`, and safely outputs HTTP 500 with standard error envelope.
- Standard response schemas:
  - **Success**: `{"success": true, "data": ...}`
  - **Error**: `{"success": false, "error": {"code": "...", "message": "...", "request_id": "..."}}`
- In accordance with the Strangler Fig pattern, these envelopes are strictly enforced on all new `/api/v1/` routes and modernized handlers, while existing legacy `/api/` endpoints continue functioning unchanged.

### Alternatives Considered
- Raw Fiber default error handler: Exposes plain text or inconsistent JSON, lacking correlation IDs and standard error taxonomy.

---

## 4. 12-Factor Configuration Engine & Graceful Process Shutdown

### Decision
1. Implement a type-safe configuration validator in `backend/internal/config/config.go`.
2. Implement graceful shutdown in `backend/main.go` utilizing Fiber's `ShutdownWithTimeout(10 * time.Second)` and OS signal trapping (`SIGINT`, `SIGTERM`).

### Rationale
- Fulfills Constitution Principles XXX & XXXVI.
- Validates all critical variables (`PORT`, `DATABASE_URL` or `DB_*`, `REDIS_URL`, `JWT_SECRET`, `ENV`) at bootstrap; exits with diagnostic error code if invalid or missing in production.
- Upon receiving termination signals, the server stops accepting new connections, allows active HTTP handlers up to 10 seconds to drain, and then cleanly closes PostgreSQL database pools (`databases.DB`) and Redis connections before process exit.

### Alternatives Considered
- Hardcoded defaults without validation: Rejected as anti-pattern that leads to deferred runtime panics in production containers.
- Unhandled `os.Exit(0)`: Rejected because abruptly severing database connections causes transaction rollback errors and connection pool exhaustion.

---

## 5. Centralized Frontend HTTP Transport & Error Normalization

### Decision
Create a centralized Axios instance in `frontend/lib/api/client.ts` with typed error normalization into an `ApiError` class.

### Rationale
- Fulfills Constitution Principle V (Centralized API Client & Transport Layer).
- Unified configuration: `baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"`, `timeout: 15000` (15s), `withCredentials: true` (ensuring session/auth cookies flow across origins).
- Interceptors:
  - Request: Injects tracing headers (`X-Client-Version`, `X-Request-ID` if applicable).
  - Response: Automatically unpacks data if envelope is present, and catches Axios HTTP errors (4xx/5xx/network timeouts) normalizing them into `ApiError` containing `statusCode`, `code`, `message`, and `requestId`.

### Alternatives Considered
- Native `fetch` wrappers: Lack built-in timeout handling, require verbose error parsing and header merging.
- Ad-hoc Axios calls per component: Violates Constitution Principle V and causes severe drift in error handling and cookie credentials.

---

## 6. Frontend State Segregation (TanStack Query + Redux Toolkit)

### Decision
1. Install and configure `@tanstack/react-query` for asynchronous server state.
2. Install and configure `@reduxjs/toolkit` and `react-redux` for synchronous client UI state.
3. Wrap application with client-boundary `<AppProviders>` in `frontend/components/providers/AppProviders.tsx` mounted in `frontend/app/layout.tsx`.

### Rationale
- Fulfills Constitution Principle IV (Strict State Segregation).
- **Server State**: Managed exclusively by TanStack Query (`staleTime: 60s`, automatic caching, background revalidation, query key factories).
- **Client State**: Managed exclusively by Redux Toolkit (`uiSlice` with sidebar collapse, dialog open/close, client preferences).
- Zero server entity caching in Redux.
- Isolating providers inside `"use client"` in `AppProviders.tsx` completely eliminates Next.js Server Component hydration mismatches.

### Alternatives Considered
- Zustand: Light and capable, but project constitution explicitly mandates Redux Toolkit for complex UI client workflows.
- Managing server state in Redux: Violates Constitution Principle IV; causes severe cache invalidation bugs and state desynchronization.

---

## 7. SQLC Tooling & Code Generation Foundation

### Decision
Configure `backend/sqlc.yaml` targeting PostgreSQL with queries directory `backend/db/queries/` and output package `backend/internal/infrastructure/database/sqlc`.

### Rationale
- Fulfills Constitution Principle I (SQL-First Architecture).
- Generates compile-time verified, zero-allocation Go structs and query interfaces directly from raw SQL migrations (`backend/db/migrations/`).
- Eliminates manual struct scanning and eliminates reflection overhead.
- Includes sample verification query (`backend/db/queries/health.sql`) to validate code generation locally via Makefile targets.

### Alternatives Considered
- GORM AutoMigrate/Query: Violates Constitution Principle I for all new modules.
- Ent or SQLBoiler: High complexity and code generation bloat compared to SQLC's direct SQL file approach.
