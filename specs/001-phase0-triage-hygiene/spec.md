# Feature Specification: Phase 0 — Triage, Compilation Integrity & Perimeter Security Hygiene

**Feature Branch**: `001-phase0-triage-hygiene`  
**Created**: 2026-09-14  
**Last Updated**: 2026-09-15  
**Status**: Ready for Planning / Tasks  
**Input**: User description: "Phase 0 — Triage, Compilation Integrity & Perimeter Security Hygiene: Restore backend compilability, address immediate critical security gaps without architecture overhaul, remove build artifacts from repository, fix broken frontend plumbing (duplicate sidebar, route protection), and establish a trustworthy baseline for Docker and CI/CD."

---

## Clarifications

### Session 2026-09-15
- **Q: Server Action Authentication Forwarding**: Should `frontend/app/actions/user.action.ts` forward authentication credentials to backend?
  → **A**: **Approved**. Narrow edit to `frontend/app/actions/user.action.ts` (and `favorite.ts`) to forward `Cookie: jwt=${token}` via `getToken()`, preventing regression in admin dashboard user deletion without triggering a full API client redesign.
- **Q: Critical Authorization / IDOR on Sensitive Routes**: Is perimeter authentication alone sufficient for Phase 0?
  → **A**: **Approved**. Phase 0 must close both anonymous perimeter access and obvious privilege-escalation/IDOR risks for authenticated ordinary users on critical mutations. A minimal, low-risk, temporary guard using existing project role semantics (`role_id == 2` / `admin`) is approved for admin-only mutations. Ownership checking (`user_id == caller.id`) is approved for user favorites. Full new RBAC frameworks remain deferred to Phase 3.
- **Q: Scope of Critical Mutation & Data Exposure Endpoints**: Should non-DELETE mutation and data-exposure routes be protected in Phase 0?
  → **A**: **Approved**. Scope expanded beyond DELETE to protect `POST /api/users`, `PUT /api/users/:id`, `POST /uploads`, `POST /api/products`, `PUT /api/products/:id`, `POST /api/roles`, `PUT /api/roles/:id`, `GET /api/users`, `GET /api/alluser`, and `GET /api/orders/export`. Every endpoint is strictly classified as public, authenticated, owner-only, or admin-only.
- **Q: Environment Variable & `.env` Loader**: Is `github.com/joho/godotenv` allowed in backend?
  → **A**: **Approved**. Add `github.com/joho/godotenv` for local development (`.env` -> `godotenv` -> process env). Production relies on process environment / secret managers. `PORT` must be read from environment. Sensitive secrets must NOT have false-security fallbacks ("secret" or "password").
- **Q: Frontend Dependencies & Verification**: How should `node_modules` absence be handled?
  → **A**: **Approved**. Explicit step for `pnpm install --frozen-lockfile` added before typecheck, lint, and build. If installation fails due to network/registry failure, it is classified as an environment blocker, not an implementation defect.
- **Q: Tracked Upload Artifacts in `backend/uploads/`**: Are tracked images in `backend/uploads/` application assets?
  → **A**: **Approved**. Verified that tracked PNGs in `backend/uploads/` are test/runtime artifacts with zero application code references. They must be untracked from Git (`git rm --cached`), ignored via `.gitignore`, and retained on local disk.
- **Q: Phase 0 Scope Boundary Confirmation**: Are large architecture migrations strictly deferred?
  → **A**: **Approved**. Full RBAC redesign, refresh tokens, multi-device sessions (`user_sessions`), SQLC migration, GORM removal, Clean Architecture directory moves, Redis caching, and TanStack Query/Redux Toolkit redesign remain strictly deferred as Follow-up Work.

---

## 1. Executive Summary & Objective

This specification establishes the exact, testable, and non-breaking baseline for **Phase 0** of the modernization program. The primary objectives are:
1. Restore backend compilation to a 100% clean and passing state (`go build ./...`).
2. Close critical perimeter security gaps by connecting authentication and temporary role guards to all destructive (`DELETE`), administrative mutations (`POST /api/users`, `PUT /api/users/:id`, `POST /uploads`, `POST/PUT /api/products`, `POST/PUT /api/roles`), and data-leakage endpoints (`GET /api/users`, `GET /api/orders/export`).
3. Eliminate obvious IDOR vulnerabilities on personal endpoints (e.g. `DELETE/POST /api/favorites`) by validating caller ownership against token claims.
4. Forward session credentials in frontend Server Actions (`frontend/app/actions/user.action.ts`) so protected admin user management does not regress.
5. Integrate `github.com/joho/godotenv` for local `.env` loading, read `PORT` and database credentials from environment, and remove plaintext secret fallbacks.
6. Clean up tracked build artifacts (`backend/tmp/main.exe`) and runtime test uploads (`backend/uploads/`), establishing robust `.gitignore` rules.
7. Fix broken frontend plumbing: eliminate duplicate sidebar rendering in storefront layouts and activate Next.js route protection via canonical `middleware.ts`.
8. Establish an unshakeable, verified foundation for **Phase 1 (Docker, Compose, CI/CD)** without altering core business logic or initiating premature architectural rewrites.

---

## 2. User Scenarios & Testing *(mandatory)*

### User Story 1 - Developer Restores Backend Compilation & Baseline Configuration (Priority: P1)

As a backend developer or CI/CD runner, I want the Go backend to compile cleanly without undeclared variable errors, to load `.env` configuration in local development via `godotenv`, and to read database connection parameters and server `PORT` from environment variables, so that automated builds, container packaging, and local execution succeed deterministically.

**Why this priority**: A codebase that fails to compile blocks all automated testing, containerization, linting, and future refactoring. Fixing this is a prerequisite for all subsequent engineering work.

**Independent Test**: 
Execute `go build ./...` inside `backend/`. The command must terminate with exit code `0` and zero compiler diagnostic errors.

**Acceptance Scenarios**:
1. **Given** the repository where [`backend/databases/conected.go`](file:///g:/react/next-go/Full-Stack-App-Store/backend/databases/conected.go) declares `dns` but passes `dsn` to `gorm.Open`, **When** the variable naming typo is resolved to match the identifier passed to `postgres.Open`, **Then** the Go compiler successfully builds the package without `undefined: dsn` or `declared and not used: dns` errors.
2. **Given** backend initialization in [`backend/main.go`](file:///g:/react/next-go/Full-Stack-App-Store/backend/main.go), **When** `godotenv.Load()` is invoked in development environments, **Then** local `.env` values are populated into process environment variables.
3. **Given** database credentials and server port, **When** parameters are read from environment variables (`PORT`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_SSLMODE`), **Then** the application binds to the configured port and connects to the target PostgreSQL instance without plaintext committed secrets.
4. **Given** JWT secret resolution in [`backend/util/jwt.go`](file:///g:/react/next-go/Full-Stack-App-Store/backend/util/jwt.go), **When** `JWT_SECRET` is read from the environment, **Then** token signing uses the configured secret. In non-development modes, execution MUST fail or emit high-severity alerts if an insecure fallback secret is detected.
5. **Given** `backend/` and `frontend/`, **When** inspected, **Then** clear `.env.example` templates exist documenting all required configuration keys without real secret values.

---

### User Story 2 - Security Perimeter & Critical Mutation Authorization (Priority: P1)

As a system owner and platform user, I want all destructive endpoints, administrative creation/update routes, arbitrary file upload endpoints, and sensitive data-export endpoints guarded by authentication and role/ownership checks, so that anonymous remote attackers and ordinary authenticated users cannot escalate privileges, delete catalog items, alter user roles, upload untrusted files, or access private customer data.

**Why this priority**: Critical security vulnerability. All destructive API endpoints, user management routes, and file uploads are currently exposed without authentication or role validation.

**Independent Test**: 
1. Send an HTTP `DELETE` to `/api/users/1` without a `jwt` cookie $\rightarrow$ Server rejects with HTTP `401 Unauthorized`.
2. Send an HTTP `DELETE` to `/api/users/1` with a `jwt` cookie belonging to an ordinary customer (`RoleID=1`) $\rightarrow$ Server rejects with HTTP `403 Forbidden`.
3. Send an HTTP `POST` to `/uploads` without a `jwt` cookie $\rightarrow$ Server rejects with HTTP `401 Unauthorized`.

**Acceptance Scenarios**:
1. **Given** an unauthenticated client request to any protected route (FR-007), **When** received by Fiber, **Then** `middlewares.IsAuthenticated` returns HTTP `401 Unauthorized` before controller execution.
2. **Given** an authenticated customer (`RoleID=1`), **When** attempting an administrative action (`DELETE /api/users/:id`, `POST /api/users`, `PUT /api/users/:id`, `DELETE /api/products/:id`, `POST /api/products`, `PUT /api/products/:id`, `POST /uploads`, `POST/PUT/DELETE /api/roles`), **Then** the temporary guard returns HTTP `403 Forbidden`.
3. **Given** an authenticated customer modifying favorites (`DELETE /api/favorites`, `POST /api/favorites`), **When** `user_id` does not match the authenticated caller's ID in token claims, **Then** the request is rejected with HTTP `403 Forbidden`.
4. **Given** public read-only catalog routes (`GET /api/products`, `GET /api/products/:id`, `POST /api/login`, `POST /api/register`), **When** requested anonymously, **Then** access is granted (`200 OK`).

---

### User Story 3 - Repository Hygiene & Artifact Cleanup (Priority: P1)

As a developer and version control custodian, I want compiled binaries (`backend/tmp/main.exe`) and temporary runtime uploads (`backend/uploads/*.png`) removed from Git tracking and excluded via comprehensive `.gitignore` rules, so that the repository remains lightweight, secure, and free of machine-specific or test debris.

**Why this priority**: A 24 MB Windows executable and 9 developer test PNGs are tracked in Git. There is no root `.gitignore` or `backend/.gitignore`.

**Independent Test**: 
Run `git ls-files backend/tmp/` and `git ls-files backend/uploads/`. Both must return zero tracked files, and `.env.example` must remain tracked.

**Acceptance Scenarios**:
1. **Given** `backend/tmp/main.exe`, **When** removed from Git index and physically deleted from disk, **Then** it is completely untracked and absent from the working tree.
2. **Given** `backend/uploads/*.png`, **When** removed from Git index via `git rm --cached`, **Then** the files remain on local disk if needed but are untracked by Git.
3. **Given** root `.gitignore` and `backend/.gitignore`, **When** evaluated, **Then** `.env*` files are ignored while explicitly preserving `.env.example` via `!.env.example`.
4. **Given** historical secret leaks in Git history (`password=13802002`), **When** completing Phase 0, **Then** a mandatory Secret Rotation Requirement is recorded for all staging/production environments.

---

### User Story 4 - Frontend Plumbing, Route Protection & Server Action Contract (Priority: P2)

As an online store customer and administrative user, I want the storefront to render a single, unified sidebar layout, the frontend edge middleware to automatically redirect unauthenticated users away from private areas, and admin Server Actions to forward session credentials, so that UI navigation is clean, protected routes are guarded, and user management functions correctly without regressions.

**Why this priority**: 
- Visual defect: Customers browsing storefront see two nested sidebars rendered side-by-side.
- Inactive middleware: Route protection in `frontend/proxy.ts` is dead code because Next.js requires `middleware.ts`.
- Server Action regression: Admin user deletion in `frontend/app/actions/user.action.ts` will fail once backend is guarded unless session cookie is forwarded.

**Independent Test**:
1. Load `http://localhost:3000`. DOM inspection confirms exactly **one** `<aside>` element.
2. Direct navigation to `http://localhost:3000/dashboard` in Incognito redirects to `http://localhost:3000/login`.
3. Invoking `deleteUser` Server Action passes `Cookie: jwt=${token}` to backend.

**Acceptance Scenarios**:
1. **Given** `frontend/app/layout.tsx`, **When** `<SidebarProvider>` and `<AppSidebar />` are removed, **Then** storefront pages in `(main)` render a single sidebar, dashboard pages in `(dashboard)` render their dedicated sidebar, and auth pages render cleanly without any sidebar.
2. **Given** `frontend/proxy.ts`, **When** renamed to `frontend/middleware.ts` exporting `export function middleware(request: NextRequest)`, **Then** Next.js intercepts matching routes.
3. **Given** unauthenticated requests to `/dashboard`, `/profile`, or `/favorite`, **When** intercepted, **Then** redirected to `/login`.
4. **Given** `frontend/app/actions/user.action.ts` (`deleteUser`), **When** executed by an authenticated admin, **Then** the request forwards the caller's JWT cookie to `:8000`, preserving functional compatibility.
5. **Given** frontend verification, **When** dependencies are installed via `pnpm install --frozen-lockfile`, **Then** `pnpm exec tsc --noEmit` and `pnpm build` execute cleanly. (Network/registry failure is documented as an environment blocker).

---

### Edge Cases

1. **Database Connection Failure at Startup**:
   - *Condition*: PostgreSQL is unreachable or credentials in `.env` are invalid.
   - *Behavior*: `databases.Conect()` must log a clear error message indicating host and port before panicking.
2. **Malformed or Expired JWT Cookie in Fiber**:
   - *Condition*: Client sends `Cookie: jwt=malformed_or_expired`.
   - *Behavior*: `middlewares.IsAuthenticated` catches `jwt.ParseWithClaims` error and returns HTTP 401 `{"message": "unauthenticated"}`.
3. **Non-Admin Access to Administrative Endpoints**:
   - *Condition*: Valid token for `RoleID=1` attempts `DELETE /api/users/:id` or `POST /uploads`.
   - *Behavior*: Temporary guard returns HTTP 403 `{"message": "forbidden: requires administrator privileges"}` without deleting records or saving files.
4. **Cross-User IDOR on Favorites**:
   - *Condition*: User 5 sends `DELETE /api/favorites` with body `{"user_id": 2, "product_id": 10}`.
   - *Behavior*: Ownership validation detects `input.UserID != caller.ID` and returns HTTP 403 `{"message": "forbidden: cannot modify another user's resources"}`.
5. **Missing `.env` File in Development**:
   - *Condition*: Developer runs `go run main.go` without `.env`.
   - *Behavior*: `godotenv.Load()` gracefully skips if file not found; application falls back to safe local development defaults.
6. **Frontend Package Registry Unavailability**:
   - *Condition*: `pnpm install --frozen-lockfile` cannot reach external registry.
   - *Behavior*: Flagged as an external environment blocker rather than a code defect.

---

## 3. Requirements *(mandatory)*

### Functional Requirements

#### Backend Integrity & Configuration
- **FR-001**: Backend MUST compile with zero errors when running `go build ./...` with Go 1.22+.
- **FR-002**: Backend database connector in [`databases/conected.go`](file:///g:/react/next-go/Full-Stack-App-Store/backend/databases/conected.go) MUST resolve the variable naming typo (`dns` $\rightarrow$ `dsn`).
- **FR-003**: Backend MUST add `github.com/joho/godotenv` to load `.env` during local development initialization.
- **FR-004**: Backend MUST read database configuration (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_SSLMODE`) and server listening port (`PORT`, default `8000`) from environment variables.
- **FR-005**: Backend MUST read `JWT_SECRET` from environment variable. In production, empty or default secret MUST trigger a fatal error or security alert.
- **FR-006**: Repository MUST contain `backend/.env.example` and `frontend/.env.example` documenting all configuration keys with non-sensitive placeholder values.

#### Perimeter Security & Critical Authorization Matrix
- **FR-007**: Every backend endpoint MUST adhere to the following security boundary classification:

| Endpoint | Method | Classification | Phase 0 Protection Mechanism |
| :--- | :--- | :--- | :--- |
| `/api/register` | `POST` | Public | Open |
| `/api/login` | `POST` | Public | Open |
| `/api/products` | `GET` | Public | Open |
| `/api/productss` | `GET` | Public | Open |
| `/api/products/:id` | `GET` | Public | Open |
| `/api/user` | `GET` | Authenticated | `middlewares.IsAuthenticated` |
| `/api/updateinfo` | `PUT` | Owner Only | `middlewares.IsAuthenticated` (uses token ID) |
| `/api/updatepassword` | `PUT` | Owner Only | `middlewares.IsAuthenticated` (uses token ID) |
| `/getorderbyemail` | `GET` | Owner Only | `middlewares.IsAuthenticated` (uses token ID) |
| `/api/favorites/:id` | `GET` | Owner Only | `middlewares.IsAuthenticated` + check `:id == caller.ID` |
| `/api/favorites` | `POST` | Owner Only | `middlewares.IsAuthenticated` + check `input.UserID == caller.ID` |
| `/api/favorites` | `DELETE` | Owner Only | `middlewares.IsAuthenticated` + check `input.UserID == caller.ID` |
| `/api/users/:id` | `DELETE` | Admin Only | `middlewares.IsAuthenticated` + `RequireAdmin` guard |
| `/api/users` | `POST` | Admin Only | `middlewares.IsAuthenticated` + `RequireAdmin` guard |
| `/api/users/:id` | `PUT` | Admin Only | `middlewares.IsAuthenticated` + `RequireAdmin` guard |
| `/api/users` | `GET` | Admin Only | `middlewares.IsAuthenticated` + `RequireAdmin` guard |
| `/api/alluser` | `GET` | Admin Only | `middlewares.IsAuthenticated` + `RequireAdmin` guard |
| `/api/users/:id` | `GET` | Admin Only | `middlewares.IsAuthenticated` + `RequireAdmin` guard |
| `/api/products/:id` | `DELETE` | Admin Only | `middlewares.IsAuthenticated` + `RequireAdmin` guard |
| `/api/products` | `POST` | Admin Only | `middlewares.IsAuthenticated` + `RequireAdmin` guard |
| `/api/products/:id` | `PUT` | Admin Only | `middlewares.IsAuthenticated` + `RequireAdmin` guard |
| `/uploads` | `POST` | Admin Only | `middlewares.IsAuthenticated` + `RequireAdmin` guard |
| `/api/roles` | `GET` | Admin Only | `middlewares.IsAuthenticated` + `RequireAdmin` guard |
| `/api/roles` | `POST` | Admin Only | `middlewares.IsAuthenticated` + `RequireAdmin` guard |
| `/api/roles/:id` | `GET` | Admin Only | `middlewares.IsAuthenticated` + `RequireAdmin` guard |
| `/api/roles/:id` | `PUT` | Admin Only | `middlewares.IsAuthenticated` + `RequireAdmin` guard |
| `/api/roles/:id` | `DELETE` | Admin Only | `middlewares.IsAuthenticated` + `RequireAdmin` guard |
| `/api/orders` | `GET` | Admin Only | `middlewares.IsAuthenticated` + `RequireAdmin` guard |
| `/api/orders/export` | `GET` | Admin Only | `middlewares.IsAuthenticated` + `RequireAdmin` guard |
| `/api/orders/chart` | `GET` | Admin Only | `middlewares.IsAuthenticated` + `RequireAdmin` guard |

- **FR-008**: Requests failing authentication MUST receive HTTP `401 Unauthorized` with `{"message": "unauthenticated"}`.
- **FR-009**: Requests failing authorization (non-admin on admin route, or caller mismatch on owner route) MUST receive HTTP `403 Forbidden` with a standardized descriptive error message.

#### Repository Hygiene & Version Control
- **FR-010**: Repository MUST untrack and remove `backend/tmp/main.exe` from Git tracking and disk.
- **FR-011**: Repository MUST untrack runtime test upload files in `backend/uploads/` (`git rm --cached`) and ignore `/uploads/` in `backend/.gitignore`.
- **FR-012**: Root `.gitignore` and `backend/.gitignore` MUST ignore build binaries, temporary directories, and `.env*` files while explicitly retaining `.env.example` via `!.env.example`.
- **FR-013**: Zero compiled binaries MUST exist in Git tracking (`git ls-files`).

#### Frontend Plumbing & Navigation
- **FR-014**: Storefront pages under `frontend/app/(main)/` MUST render exactly one `<SidebarProvider>` and one `<AppSidebar />` in the DOM tree.
- **FR-015**: Authentication pages (`/login`, `/signup`) MUST render without the storefront sidebar or header.
- **FR-016**: Frontend MUST enforce route protection via `frontend/middleware.ts` conforming to Next.js 16 conventions (redirecting unauthenticated private routes to `/login`, authenticated auth routes to `/`).
- **FR-017**: Frontend Server Action `deleteUser` in `frontend/app/actions/user.action.ts` MUST forward caller credentials (`Cookie: jwt=${token}`) to prevent regression when deleting users from the dashboard.
- **FR-018**: Frontend verification MUST execute `pnpm install --frozen-lockfile` prior to running `tsc --noEmit` and `pnpm build`.

---

### Key Entities

- **Environment Configuration**: Key-value mapping representing database connection strings, server ports, and secret keys loaded from process environment or `.env` file via `godotenv`.
- **Protected Route Mapping**: Association between an HTTP method + route path, authentication gate (`IsAuthenticated`), and authorization constraint (`RequireAdmin` or owner verification).
- **Authentication Session**: Client token stored in HTTP cookie `jwt` containing signed user identification claims.
- **Sidebar Context**: React context provided by `SidebarProvider` governing mobile/desktop responsive visibility of navigation links.

---

## 4. Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Backend compilation (`go build ./...`) executes with exit code `0` and generates 0 compiler errors.
- **SC-002**: 100% of guarded endpoints return HTTP 401 when requested without a `jwt` cookie.
- **SC-003**: 100% of admin-only endpoints return HTTP 403 when requested by an authenticated non-admin user (`RoleID != 2`).
- **SC-004**: Personal favorite mutations return HTTP 403 when `user_id` in request does not match the authenticated caller's identity.
- **SC-005**: 0 binary executable files (`.exe`, `.bin`) and 0 test upload files exist in Git tracking (`git ls-files backend/tmp` and `git ls-files backend/uploads`).
- **SC-006**: 0 plaintext production database passwords or JWT signing keys are committed in active source files.
- **SC-007**: Customer storefront home page (`/`) renders exactly 1 sidebar component in the DOM.
- **SC-008**: Direct browser navigation to `/dashboard` without an active session cookie redirects to `/login` via `middleware.ts`.
- **SC-009**: User deletion via admin dashboard (`tableUser.tsx`) succeeds without 401 regression due to Server Action cookie forwarding.

---

## 5. Assumptions

1. **PostgreSQL Service**: In local development, developers have a running PostgreSQL instance (or will run one via Docker in Phase 1) with database name `shoppy` and credentials matching `.env.example`.
2. **GORM AutoMigrate Preservation**: In Phase 0, GORM's `db.AutoMigrate` remains intact in `conected.go`. Replacement with versioned Goose migrations is explicitly reserved for **Phase 1**.
3. **No Database Schema Alterations**: Phase 0 does not alter table structures, foreign keys, or database data.
4. **Role Conventions in Phase 0**: The application convention `RoleID = 2` (or Role name `"admin"`) is treated as the temporary definition of an administrator for Phase 0 guards, matching existing frontend dashboard checks (`userData?.role_id === 2`).
5. **Package Manager**: The frontend uses `pnpm` as evidenced by `pnpm-lock.yaml` in `frontend/`.
6. **Next.js 16 Middleware Convention**: Next.js 16 App Router strictly recognizes `middleware.ts` (or `middleware.js`) at the project root (`frontend/middleware.ts`) and does not recognize `proxy.ts`.
7. **Authentication Architecture Phasing Boundary (Constitution Principle XLIV & Target Arch 2.7)**:
   - **Phase 0 Scope**: Strictly limited to immediate security perimeter protection, temporary critical authorization guards, secret externalization, and plumbing hygiene.
   - **Phase 3 Scope (Deferred)**: Full implementation of the Dual-Token Architecture (15-minute Access JWT + rotating 7d-30d Opaque Refresh Tokens), PostgreSQL `user_sessions` multi-device schema (hash-only storage), token reuse detection, session revocation UI, and decoupled RBAC is explicitly deferred to **Phase 3**.

---

## 6. Safety & Verification Plan

### Step-by-Step Verification Checklist

| Step | Verification Command | Expected Outcome |
| :--- | :--- | :--- |
| **1. Backend Compile** | `cd backend && go build ./...` | Exit code 0, no errors. |
| **2. Backend Unit Test** | `cd backend && go test ./...` | In-memory Fiber test verifies 401/403 guards without database dependency. |
| **3. Git Tracking (Binary)** | `git ls-files backend/tmp/main.exe` | Empty output (untracked). |
| **4. Git Tracking (Uploads)** | `git ls-files backend/uploads/` | Empty output (untracked). |
| **5. Gitignore Check** | `git check-ignore -v backend/tmp/test.exe .env` | Matches `.gitignore` rules; `.env.example` remains tracked. |
| **6. Unauthenticated Mutation** | `curl -s -o /dev/null -w "%{http_code}" -X DELETE http://localhost:8000/api/users/1` | Returns `401`. |
| **7. Frontend Dependencies** | `cd frontend && pnpm install --frozen-lockfile` | Dependencies installed cleanly (or logged as environment blocker). |
| **8. Frontend Typecheck** | `cd frontend && pnpm exec tsc --noEmit` | Validates TypeScript compilation with 0 errors. |
| **9. Frontend Route Protection** | Browser test: open `/dashboard` in Incognito | Redirects to `/login`. |
| **10. Frontend Single Sidebar** | Browser test: inspect DOM at `/` | Exactly 1 `<aside>` element rendered. |

---

## 7. Resolved Clarifications & Follow-Up Work

### Resolved Decisions (Phase 0)
- **[RESOLVED-01] Git History Secret Scrubbing**: Git history will NOT be rewritten in Phase 0 to protect collaborator branches. A mandatory Secret Rotation Requirement is established for staging/production deployments.
- **[RESOLVED-02] Scope of Mutation Routes**: Expanded beyond DELETE to cover all critical administrative mutations (`POST/PUT /api/users`, `POST/PUT /api/products`, `POST/PUT /api/roles`, `POST /uploads`) and data leakage routes (`GET /api/users`, `GET /api/orders/export`), protected with temporary `RequireAdmin` guards.
- **[RESOLVED-03] Frontend Dependency Installation**: `pnpm install --frozen-lockfile` is officially integrated into the plan.
- **[RESOLVED-04] Local `.env` Loader**: `github.com/joho/godotenv` is approved for local development loading.
- **[RESOLVED-05] Server Action Credential Forwarding**: `user.action.ts` forwarding of caller cookie is approved to prevent user deletion regression.
- **[RESOLVED-06] Tracked Upload Artifacts**: Untracked from Git and excluded via `.gitignore`.

### Follow-up Work (Deferred to Subsequent Phases)
1. **Phase 1**: Docker multi-stage builds, Docker Compose (`postgres`, `redis`), Makefile, Goose SQL migrations, and CI pipeline.
2. **Phase 2**: Centralized Axios client with automatic interceptors, TanStack Query, Redux Toolkit, and structured JSON logging.
3. **Phase 3**: Industrial Dual-Token Architecture (15m JWT + 7d Opaque Refresh Token), PostgreSQL `user_sessions` table, automatic token replay detection, and decoupled RBAC architecture.
