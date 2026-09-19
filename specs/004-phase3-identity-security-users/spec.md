# Feature Specification: Phase 3 — Identity, Security & User Domain Migration

**Status**: Active  
**Roadmap Alignment**: [`docs/modernization-roadmap.md`](../../docs/modernization-roadmap.md) (Phase 3: Days 13 - 18)  
**Target Architecture**: [`docs/target-architecture.md`](../../docs/target-architecture.md) (Section 2 & 3)  

---

## 1. Executive Overview

Phase 3 transitions the Identity, Authentication, User Management, and Role-Based Access Control (RBAC) domains from legacy, tightly-coupled GORM active records to the Clean/Hexagonal target architecture. This establishes typed SQLC repositories, domain entities, use-case services (`AuthService`, `UserService`, `RoleService`), cryptographic standards (bcrypt cost 12, JWT v5), standardized HTTP handlers under `/api/v1/*`, and normalized frontend authentication transport.

---

## 2. User Stories & Acceptance Criteria

### User Story 1: Type-Safe SQLC Query Layer for Users & Roles (Priority: P1)
As a backend developer, I want type-safe SQL queries for users, roles, and permissions generated via SQLC, so that all database interactions in the identity domain are compile-time verified and free of runtime reflection overhead.

- **Acceptance Criteria**:
  - `backend/db/queries/users.sql` defines parameterized queries: `GetUserByID`, `GetUserByEmail`, `GetUserByUsername`, `ListUsers`, `CountUsers`, `CreateUser`, `UpdateUser`, `UpdateUserPassword`, `DeleteUser`.
  - `backend/db/queries/roles.sql` defines parameterized queries: `GetRoleByID`, `GetRoleByName`, `ListRoles`, `CreateRole`, `UpdateRole`, `DeleteRole`, `GetRolePermissions`, `ClearRolePermissions`, `AssignRolePermission`.
  - `sqlc generate` produces zero-warning, typed Go structs in `backend/internal/infrastructure/database/sqlc`.

### User Story 2: Pure Domain Core & Repository Ports (Priority: P1)
As a software architect, I want pure domain models (`User`, `Role`, `Permission`) and repository port interfaces isolated from external dependencies, so that core business logic remains independent of database and framework decisions.

- **Acceptance Criteria**:
  - Domain entities in `backend/internal/domain/entity/` contain zero dependencies on Fiber, GORM, or SQLC.
  - Repository interfaces in `backend/internal/domain/repository/` define domain-driven contracts.
  - Domain sentinel errors defined in `backend/internal/domain/errors.go` (`ErrUserNotFound`, `ErrEmailAlreadyExists`, `ErrUsernameAlreadyExists`, `ErrInvalidCredentials`, `ErrRoleNotFound`, `ErrUnauthorized`, `ErrForbidden`).

### User Story 3: Application Services & Cryptographic Hardening (Priority: P1)
As a security auditor, I want standardized password hashing (bcrypt cost 12), JWT generation/validation upgraded to v5 with explicit expiration, and robust application services orchestrating registration, login, profile updates, and role assignments.

- **Acceptance Criteria**:
  - Bcrypt hashing cost standardized to `12` across all authentication flows.
  - Token service upgraded to `github.com/golang-jwt/jwt/v5` with structured claims (Subject, Role, ExpiresAt, IssuedAt).
  - `AuthService` handles `Register`, `Login`, `ValidateToken`, and `UpdatePassword` returning standardized domain results.
  - `UserService` handles pagination, retrieval, profile updates, and user deletion.
  - `RoleService` handles role creation, listing, updating, and permission assignments.
  - Comprehensive unit tests verify validation, hashing, and token logic.

### User Story 4: HTTP Transport, Envelopes & Route Protection (Priority: P1)
As an API consumer, I want consistent `/api/v1/auth`, `/api/v1/users`, and `/api/v1/roles` endpoints returning standard JSON envelopes (`{success, data}` or `{success, error: {code, message}}`), alongside dual-token authentication middleware (Bearer token & cookie).

- **Acceptance Criteria**:
  - Clean HTTP handlers in `backend/internal/transport/http/handler/` consuming application services.
  - `Authenticate` middleware parsing both `Authorization: Bearer <token>` and `jwt` cookie.
  - `RequireRole("admin")` middleware validating permissions dynamically against role name.
  - Strangler Fig compatibility: existing routes (`/api/register`, `/api/login`, `/api/user`, `/api/users`, `/api/roles`) maintain behavioral parity without breaking legacy clients or existing tests.
  - Fix legacy bugs: typo in `roelController.go` (`if err != err`), incorrect slice retrieval in `AllRole`.

### User Story 5: Frontend Auth Transport & Dashboard RBAC Normalization (Priority: P2)
As a frontend developer, I want auth server actions and dashboard layout guards to use centralized configuration, resilient role checking (`user.role === 'admin' || user.role_id === 2`), and eliminate hardcoded localhost URLs.

- **Acceptance Criteria**:
  - `frontend/app/(dashboard)/layout.tsx` validates admin status dynamically via role name or role ID, using `NEXT_PUBLIC_API_URL` or internal backend URL.
  - `frontend/app/actions/auth.ts` and `frontend/app/actions/user.action.ts` utilize configurable base URLs and clean error propagation.
  - Zero TypeScript or lint errors in `frontend`.

---

## 3. Verification & Quality Gates
1. Backend: `cd backend && go test -v ./...` passes 100%.
2. Frontend: `cd frontend && pnpm exec tsc --noEmit` passes with 0 errors.
3. Architecture: Strangler Fig preserves existing endpoints while mounting `/api/v1/*`.
