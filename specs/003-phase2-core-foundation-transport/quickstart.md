# Quickstart & Verification Guide: Phase 2 — Core Foundation & Transport Layer Normalization

**Feature**: [spec.md](./spec.md)  
**Date**: 2026-09-15  
**Status**: Active  

---

## 1. Prerequisites

- Go 1.25+ installed with `$env:GOPATH="G:\go"` configured.
- Node.js 22+ and pnpm 10+ installed.
- PostgreSQL & Redis running (or local mock/container).

---

## 2. Verification Scenarios

### Scenario 1: Backend Structured Logging & Request ID Tracing
1. Start backend server:
   ```bash
   cd backend && go run main.go
   ```
2. Send request without `X-Request-ID`:
   ```bash
   curl -i http://localhost:8000/health/live
   ```
3. Verify:
   - Response header contains `X-Request-ID: <uuid-v4>`.
   - Backend stdout logs structured entry containing `request_id`, `method=GET`, `path=/health/live`, `status=200`, `latency_ms`.

4. Send request with explicit `X-Request-ID`:
   ```bash
   curl -i -H "X-Request-ID: custom-trace-123" http://localhost:8000/health/live
   ```
5. Verify:
   - Response header mirrors `X-Request-ID: custom-trace-123`.
   - Log entry records `request_id="custom-trace-123"`.

### Scenario 2: Standard Response Envelopes & Panic Recovery
1. Query a modernized endpoint (`/api/v1/health`):
   - Returns HTTP 200 with `{"success": true, "data": ...}`.
2. Trigger an unhandled panic (test route):
   - Returns HTTP 500 with `{"success": false, "error": {"code": "INTERNAL_SERVER_ERROR", "message": "...", "request_id": "..."}}`.
   - Server process does NOT terminate and stack trace is NOT exposed to caller.

### Scenario 3: 12-Factor Configuration & Graceful Shutdown
1. Test config validation in test suite:
   ```bash
   cd backend && go test -v ./internal/config
   ```
2. Send `SIGINT` (Ctrl+C) to running backend:
   - Output logs "initiating graceful shutdown...".
   - Process exits with code 0 after active requests drain.

### Scenario 4: Frontend State Providers & Centralized Client
1. Verify Next.js TypeScript compilation and build:
   ```bash
   cd frontend && pnpm exec tsc --noEmit && pnpm build
   ```
2. Verify root `<AppProviders>` initializes without SSR hydration errors.
3. Verify centralized client exports `apiClient` and `ApiError`.

### Scenario 5: SQLC Code Generation
1. Validate `backend/sqlc.yaml` and run SQLC verification:
   ```bash
   make sqlc-verify # or sqlc compile
   ```
2. Verify output files in `backend/internal/infrastructure/database/sqlc/`.
