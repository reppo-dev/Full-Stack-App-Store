# Data Model & State Schemas: Phase 2 — Core Foundation & Transport Layer Normalization

**Feature**: [spec.md](./spec.md)  
**Date**: 2026-09-15  
**Status**: Active  

---

## 1. Backend Core Schemas

### 1.1 App Configuration (`backend/internal/config/config.go`)

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `Port` | `string` | No | `"8000"` | HTTP server listening port |
| `Env` | `string` | No | `"development"` | Environment (`development`, `production`, `test`) |
| `DBHost` | `string` | No | `"localhost"` | PostgreSQL hostname |
| `DBPort` | `string` | No | `"5432"` | PostgreSQL port |
| `DBUser` | `string` | No | `"postgres"` | PostgreSQL user |
| `DBPassword` | `string` | No | `""` | PostgreSQL password |
| `DBName` | `string` | No | `"dashstack"` | PostgreSQL database name |
| `DBSSLMode` | `string` | No | `"disable"` | SSL mode (`disable`, `require`, etc.) |
| `DatabaseURL` | `string` | No | `""` | Composite connection string (takes precedence if set) |
| `RedisURL` | `string` | No | `"localhost:6379"` | Redis connection URL |
| `JWTSecret` | `string` | In Prod | `"dev-jwt-secret-key-change-in-production"` | Secret for token signing |
| `ClientURL` | `string` | No | `"http://localhost:3000"` | Allowed CORS origin |

### 1.2 Structured Response Envelope (`backend/internal/transport/http/response/`)

- `Response[T]`:
  - `Success`: `bool`
  - `Data`: `T`
  - `Meta`: `*PaginationMeta` (optional)
- `ErrorResponse`:
  - `Success`: `bool` (`false`)
  - `Error`: `ErrorDetail`
- `ErrorDetail`:
  - `Code`: `string`
  - `Message`: `string`
  - `RequestID`: `string`
  - `Details`: `any` (optional)

---

## 2. Frontend State Schemas

### 2.1 Server State (TanStack Query Cache)
Managed by `@tanstack/react-query`:
- Query keys structured as domain arrays: e.g. `["health"]`, `["auth", "session"]`, `["products", { page: 1 }]`.
- Default stale time: 60,000ms (1 minute).
- Cache invalidation driven by mutation hooks.

### 2.2 Client UI State (`frontend/lib/redux/slices/uiSlice.ts`)

```typescript
export interface UIState {
  sidebar: {
    isOpen: boolean;
    isCollapsed: boolean;
  };
  activeModal: string | null;
  modalPayload: Record<string, unknown> | null;
  theme: "light" | "dark" | "system";
}

export const initialUIState: UIState = {
  sidebar: {
    isOpen: true,
    isCollapsed: false,
  },
  activeModal: null,
  modalPayload: null,
  theme: "system",
};
```

Actions:
- `toggleSidebar()`
- `setSidebarOpen(boolean)`
- `setSidebarCollapsed(boolean)`
- `openModal({ modalId: string, payload?: Record<string, unknown> })`
- `closeModal()`
- `setTheme("light" | "dark" | "system")`

---

## 3. SQLC Entity Generation Target

Configured in `backend/sqlc.yaml`:
- Dialect: `postgresql`
- Schema path: `db/migrations`
- Queries path: `db/queries`
- Output path: `internal/infrastructure/database/sqlc`
- Output package: `sqlc`
- Target library: `database/sql` or `pgx/v5` standard interfaces.
