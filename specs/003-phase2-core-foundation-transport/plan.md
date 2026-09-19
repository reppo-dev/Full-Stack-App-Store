# Implementation Plan: Phase 2 — Core Foundation & Transport Layer Normalization

**Branch**: `003-phase2-core-foundation-transport` | **Date**: 2026-09-15 | **Spec**: [Phase 2 Specification](spec.md)  
**Input**: Feature specification from `specs/003-phase2-core-foundation-transport/spec.md`  

---

## Summary

Phase 2 establishes the core architectural shell, transport normalization, and state segregation foundation across DashStack:
1. **Backend Layered Shell & Observability**: Standardized structured JSON logging (`log/slog`), HTTP request correlation ID middleware (`X-Request-ID` using UUID v4), sanitized global panic recovery, uniform JSON response envelopes (`response.Success`, `response.Error`), strict 12-factor configuration validation (`internal/config/config.go`), and signal-trapping graceful shutdown (`ShutdownWithTimeout`).
2. **Frontend Transport & State Segregation**: Centralized Axios client (`frontend/lib/api/client.ts`) with typed `ApiError` normalization, request/response interceptors, and timeout handling; install and configure TanStack Query (`@tanstack/react-query`) for asynchronous server state; install and configure Redux Toolkit (`@reduxjs/toolkit`) for synchronous client UI state; wrap application root in client boundary `<AppProviders>`.
3. **SQLC Tooling Foundation**: Initialize `backend/sqlc.yaml` targeting PostgreSQL with queries directory and verify code generation for upcoming domain migrations.

All changes follow the Strangler Fig pattern, ensuring 100% backward compatibility with existing legacy routes.

---

## Technical Context

**Language/Version**:
- Backend: Go 1.25+ / 1.26
- Frontend: TypeScript 5.9+, Node.js 22, React 19.2.3, Next.js 16.1.6

**Primary Dependencies**:
- Backend: Fiber v2.52+, `google/uuid` v1.6+, `log/slog` (standard library), SQLC v1.28+
- Frontend: `axios` v1.13.6, `@tanstack/react-query` v5+, `@reduxjs/toolkit` v2+, `react-redux` v9+

**Storage**:
- Primary System of Record: PostgreSQL 16
- Caching / Infrastructure: Redis 7

**Testing**:
- Backend: Go native test suite (`go test -v ./...`)
- Frontend: TypeScript typechecking (`pnpm exec tsc --noEmit`), Next.js build validation (`pnpm build`)

**Target Platform**:
- Single Cloud VM / VPS with Docker Compose and Reverse Proxy

**Project Type**: Monorepo Web Application (Go Fiber API Backend + Next.js Frontend)

**Constraints**:
- Strangler Fig migration: No breaking changes to existing legacy routes (`/api/...`).
- Zero leakage of Go source file paths, line numbers, or runtime stack traces in HTTP responses.
- Strict state segregation: Server state strictly in TanStack Query; UI state strictly in Redux Toolkit.
- Clean compilation: `go test -v ./...` and `pnpm build` must pass at every step.

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

- **Principle I (Backend Layered Architecture & SQL-First)**: PASS. Prepares `internal/transport/http/` middleware and response envelopes, and configures SQLC code generation targeting raw SQL schema without extending GORM.
- **Principle IV (Strict State Segregation)**: PASS. Server state assigned strictly to TanStack Query; UI client state assigned strictly to Redux Toolkit. Zero mirroring of remote entities into Redux.
- **Principle V (Centralized API Client & Transport Layer)**: PASS. Centralized Axios client encapsulates base URL, credentials, timeouts, and `ApiError` normalization.
- **Principle XIV (Defense-in-Depth Validation & Security)**: PASS. Global panic recovery prevents stack trace leakage; 12-factor configuration engine validates runtime parameters.
- **Principle XXX (Health Check Semantics & Graceful Shutdown)**: PASS. Graceful shutdown traps `SIGINT`/`SIGTERM`, allows in-flight requests to drain within 10 seconds, and gracefully closes database/Redis handles.
- **Principle XXXIII (Full-Spectrum Observability & Request Tracing)**: PASS. Standardized structured logging with `log/slog` and end-to-end `X-Request-ID` correlation.
- **Principle XXXVI (Twelve-Factor Configuration)**: PASS. Type-safe configuration validator parses environment variables at boot with fail-fast validation.
- **Principle XLIII (Technology Justification)**: PASS. Standard library `log/slog` avoids third-party loggers; SQLC avoids ORM overhead; TanStack Query and Redux Toolkit solve specific separated state concerns.

---

## Project Structure

### Documentation (this feature)

```text
specs/003-phase2-core-foundation-transport/
├── spec.md                          # Feature Specification
├── plan.md                          # Implementation Plan (This document)
├── research.md                      # Technical Decisions & Entity Extraction
├── data-model.md                    # Data Models & State Schemas
├── quickstart.md                    # Verification & Testing Guide
├── checklists/
│   └── requirements.md              # Specification Quality Checklist (PASS)
├── contracts/
│   └── api-transport.md             # API Response Envelopes & Error Contracts
└── tasks.md                         # Dependency-Ordered Implementation Tasks
```

### Source Code Planned Additions & Modifications

```text
Full-Stack-App-Store/
├── backend/
│   ├── sqlc.yaml                                      # [NEW] SQLC code generation configuration
│   ├── db/
│   │   └── queries/
│   │       └── health.sql                             # [NEW] Foundation SQL query for SQLC verification
│   ├── internal/
│   │   ├── config/
│   │   │   ├── config.go                              # [NEW] 12-factor configuration validator
│   │   │   └── config_test.go                         # [NEW] Tests for configuration validation
│   │   ├── transport/
│   │   │   └── http/
│   │   │       ├── middleware/
│   │   │       │   ├── request_id.go                  # [NEW] X-Request-ID correlation middleware
│   │   │       │   ├── request_id_test.go             # [NEW] Tests for request ID generation/preservation
│   │   │       │   ├── logger.go                      # [NEW] slog structured request logging middleware
│   │   │       │   ├── recovery.go                    # [NEW] Global panic recovery middleware
│   │   │       │   └── recovery_test.go               # [NEW] Tests for panic recovery & trace sanitization
│   │   │       └── response/
│   │   │           ├── response.go                    # [NEW] Success and Error response envelope helpers
│   │   │           └── response_test.go               # [NEW] Tests for envelope serialization
│   │   └── infrastructure/
│   │       └── database/
│   │           └── sqlc/                              # [NEW] SQLC generated repository packages
│   │               └── .gitkeep
│   ├── routes/
│   │   └── routes.go                                  # [MODIFY] Register v1 routes & middleware
│   └── main.go                                        # [MODIFY] Mount middleware, config, graceful shutdown
├── frontend/
│   ├── package.json                                   # [MODIFY] Add @tanstack/react-query, @reduxjs/toolkit, react-redux
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts                              # [NEW] Centralized Axios client & ApiError
│   │   │   └── client.test.ts                         # [NEW] Transport client tests
│   │   ├── query/
│   │   │   └── client.ts                              # [NEW] TanStack QueryClient setup
│   │   └── redux/
│   │       ├── store.ts                               # [NEW] Redux Toolkit store & typed hooks
│   │       └── slices/
│   │           └── uiSlice.ts                         # [NEW] UI client state slice (sidebar, modal, theme)
│   ├── components/
│   │   └── providers/
│   │       └── AppProviders.tsx                       # [NEW] Unified "use client" root provider
│   └── app/
│       └── layout.tsx                                 # [MODIFY] Mount AppProviders
└── Makefile                                           # [MODIFY] Add sqlc-generate and sqlc-verify targets
```

---

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| None | All patterns strictly adhere to project constitution | N/A |
