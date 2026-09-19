# Implementation Tasks: Phase 3 — Identity, Security & User Domain Migration

**Feature**: [Phase 3 Specification](spec.md) | [Implementation Plan](plan.md)  
**Branch**: `main`  
**Date**: 2026-09-19  
**Status**: Completed ✅  

---

## Phase 1: Setup & SQLC Queries (US1)
- [X] T001 [P] [US1] Author SQLC role queries in [`backend/db/queries/roles.sql`](file:///g:/react/next-go/Full-Stack-App-Store/backend/db/queries/roles.sql)
- [X] T002 [P] [US1] Author SQLC user queries in [`backend/db/queries/users.sql`](file:///g:/react/next-go/Full-Stack-App-Store/backend/db/queries/users.sql)
- [X] T003 [US1] Execute `sqlc generate` and verify compiled Go structs in `backend/internal/infrastructure/database/sqlc`

---

## Phase 2: Domain Layer (US2)
- [X] T004 [P] [US2] Define sentinel domain errors in [`backend/internal/domain/errors.go`](file:///g:/react/next-go/Full-Stack-App-Store/backend/internal/domain/errors.go)
- [X] T005 [P] [US2] Define pure domain entities in [`backend/internal/domain/entity/user.go`](file:///g:/react/next-go/Full-Stack-App-Store/backend/internal/domain/entity/user.go) and [`backend/internal/domain/entity/role.go`](file:///g:/react/next-go/Full-Stack-App-Store/backend/internal/domain/entity/role.go)
- [X] T006 [P] [US2] Define domain repository ports in [`backend/internal/domain/repository/user_repository.go`](file:///g:/react/next-go/Full-Stack-App-Store/backend/internal/domain/repository/user_repository.go) and [`backend/internal/domain/repository/role_repository.go`](file:///g:/react/next-go/Full-Stack-App-Store/backend/internal/domain/repository/role_repository.go)

---

## Phase 3: Infrastructure & Security Primitives (US3)
- [X] T007 [P] [US3] Add `golang-jwt/jwt/v5` dependency and implement modern JWT token manager in [`backend/internal/infrastructure/security/token.go`](file:///g:/react/next-go/Full-Stack-App-Store/backend/internal/infrastructure/security/token.go) with unit tests in `token_test.go`
- [X] T008 [P] [US3] Implement password hashing and comparison with bcrypt cost 12 in [`backend/internal/infrastructure/security/password.go`](file:///g:/react/next-go/Full-Stack-App-Store/backend/internal/infrastructure/security/password.go)
- [X] T009 [P] [US3] Create pgxpool connection manager in [`backend/internal/infrastructure/database/postgres.go`](file:///g:/react/next-go/Full-Stack-App-Store/backend/internal/infrastructure/database/postgres.go)
- [X] T010 [US3] Implement SQLC repository adapters in [`backend/internal/infrastructure/database/repository/user_repository_sqlc.go`](file:///g:/react/next-go/Full-Stack-App-Store/backend/internal/infrastructure/database/repository/user_repository_sqlc.go) and [`role_repository_sqlc.go`](file:///g:/react/next-go/Full-Stack-App-Store/backend/internal/infrastructure/database/repository/role_repository_sqlc.go)

---

## Phase 4: Application Layer (DTOs & Services) (US3)
- [X] T011 [P] [US3] Implement DTO structs in [`backend/internal/application/dto/auth_dto.go`](file:///g:/react/next-go/Full-Stack-App-Store/backend/internal/application/dto/auth_dto.go), [`user_dto.go`](file:///g:/react/next-go/Full-Stack-App-Store/backend/internal/application/dto/user_dto.go), and [`role_dto.go`](file:///g:/react/next-go/Full-Stack-App-Store/backend/internal/application/dto/role_dto.go)
- [X] T012 [P] [US3] Implement `AuthService` and unit tests in [`backend/internal/application/service/auth_service.go`](file:///g:/react/next-go/Full-Stack-App-Store/backend/internal/application/service/auth_service.go) and `auth_service_test.go`
- [X] T013 [P] [US3] Implement `UserService` and unit tests in [`backend/internal/application/service/user_service.go`](file:///g:/react/next-go/Full-Stack-App-Store/backend/internal/application/service/user_service.go) and `user_service_test.go`
- [X] T014 [P] [US3] Implement `RoleService` and unit tests in [`backend/internal/application/service/role_service.go`](file:///g:/react/next-go/Full-Stack-App-Store/backend/internal/application/service/role_service.go) and `role_service_test.go`

---

## Phase 5: HTTP Transport Layer & Strangler Pattern (US4)
- [X] T015 [P] [US4] Implement modern `Authenticate` and `RequireRole` middleware in [`backend/internal/transport/http/middleware/auth.go`](file:///g:/react/next-go/Full-Stack-App-Store/backend/internal/transport/http/middleware/auth.go)
- [X] T016 [P] [US4] Implement HTTP handlers in [`backend/internal/transport/http/handler/auth_handler.go`](file:///g:/react/next-go/Full-Stack-App-Store/backend/internal/transport/http/handler/auth_handler.go), [`user_handler.go`](file:///g:/react/next-go/Full-Stack-App-Store/backend/internal/transport/http/handler/user_handler.go), and [`role_handler.go`](file:///g:/react/next-go/Full-Stack-App-Store/backend/internal/transport/http/handler/role_handler.go)
- [X] T017 [US4] Register `/api/v1/auth`, `/api/v1/users`, and `/api/v1/roles` in [`backend/routes/routes.go`](file:///g:/react/next-go/Full-Stack-App-Store/backend/routes/routes.go) while preserving legacy `/api/*` endpoints and fixing legacy bugs in `roelController.go`
- [X] T018 [US4] Wire services into `main.go` and ensure graceful shutdown closes pgxpool

---

## Phase 6: Frontend Auth Transport & Dashboard RBAC (US5)
- [X] T019 [P] [US5] Update `frontend/app/actions/auth.ts` and `frontend/app/actions/user.action.ts` to use configurable API base URL and robust error handling
- [X] T020 [P] [US5] Update `frontend/app/(dashboard)/layout.tsx` to handle dynamic role name and configurable backend URL
- [X] T021 [P] [US5] Update `frontend/app/(dashboard)/contact/page.tsx` to use typed inputs and configurable API client

---

## Phase 7: Verification & Build Quality
- [X] T022 Execute backend test suite via `go test -v ./...` in `backend/`
- [X] T023 Execute frontend typecheck via `pnpm exec tsc --noEmit` and build via `pnpm build` in `frontend/`
