# Implementation Plan: Phase 3 — Identity, Security & User Domain Migration

**Spec**: [`spec.md`](spec.md) | **Date**: 2026-09-19 | **Status**: Execution Ready

---

## 1. Technical Strategy

We adhere strictly to the **Strangler Fig pattern** outlined in `docs/modernization-roadmap.md`:
1. **SQLC Foundation**: Add `users.sql` and `roles.sql` queries targeting PostgreSQL, compiled into `backend/internal/infrastructure/database/sqlc`.
2. **Domain Core**: Create pure entities (`User`, `Role`, `Permission`), domain errors, and repository interfaces.
3. **Infrastructure**: Implement security helpers (bcrypt cost 12, JWT v5) and SQLC-backed repository implementations.
4. **Application Services**: Implement `AuthService`, `UserService`, `RoleService` with DTOs and unit tests.
5. **HTTP Transport**: Implement Fiber handlers in `internal/transport/http/handler/`, modern auth/RBAC middlewares, and mount routes under `/api/v1/auth`, `/api/v1/users`, `/api/v1/roles` while retaining/bridging legacy routes.
6. **Frontend Integration**: Refactor frontend auth actions and dashboard layout to use environment-based API URLs and dynamic role verification.
7. **Verification**: Run complete test suites (`go test ./...` and `pnpm exec tsc --noEmit`).

---

## 2. Directory Layout & Changes

```
backend/
├── db/
│   └── queries/
│       ├── users.sql
│       └── roles.sql
├── internal/
│   ├── domain/
│   │   ├── errors.go
│   │   ├── entity/
│   │   │   ├── user.go
│   │   │   └── role.go
│   │   └── repository/
│   │       ├── user_repository.go
│   │       └── role_repository.go
│   ├── infrastructure/
│   │   ├── database/
│   │   │   ├── postgres.go
│   │   │   └── repository/
│   │   │       ├── user_repository_sqlc.go
│   │   │       └── role_repository_sqlc.go
│   │   └── security/
│   │       ├── password.go
│   │       ├── token.go
│   │       └── token_test.go
│   ├── application/
│   │   ├── dto/
│   │   │   ├── auth_dto.go
│   │   │   ├── user_dto.go
│   │   │   └── role_dto.go
│   │   └── service/
│   │       ├── auth_service.go
│   │       ├── auth_service_test.go
│   │       ├── user_service.go
│   │       ├── user_service_test.go
│   │       ├── role_service.go
│   │       └── role_service_test.go
│   └── transport/
│       └── http/
│           ├── middleware/
│           │   ├── auth.go
│           │   └── rbac.go
│           └── handler/
│               ├── auth_handler.go
│               ├── user_handler.go
│               └── role_handler.go
```
