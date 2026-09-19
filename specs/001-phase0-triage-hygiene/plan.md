# Implementation Plan: Phase 0 — Triage, Compilation Integrity & Perimeter Security Hygiene

**Branch**: `001-phase0-triage-hygiene` | **Date**: 2026-09-14 | **Last Updated**: 2026-09-15 | **Spec**: [specs/001-phase0-triage-hygiene/spec.md](file:///g:/react/next-go/Full-Stack-App-Store/specs/001-phase0-triage-hygiene/spec.md)  
**Input**: Feature specification for Phase 0: Restore backend compilation, secure perimeter & critical mutations, prevent IDOR, forward Server Action credentials, externalize secrets, untrack binary & upload artifacts, and fix frontend sidebar/middleware plumbing.

---

## 1. Summary

This plan provides an implementation-ready, low-risk execution sequence for **Phase 0**. It addresses immediate compilation, security, and plumbing blockers while strictly prohibiting premature architectural rewrites. All steps are broken down with precise file references, operational commands, failure criteria, and validation gates.

---

## 2. Technical Context

* **Language / Runtime Versions**:
  * Backend: Go `1.26.0` (compiled with Go module target `1.22+`).
  * Frontend: Node.js `v22.18.0`, pnpm `10.33.0`, TypeScript `5.x`.
* **Primary Frameworks & Libraries**:
  * Backend: Fiber `v2.52.12`, GORM `v1.25.10` (preserved intact for legacy tables during Phase 0), `golang-jwt/jwt`, `github.com/joho/godotenv` (added for local `.env` loading).
  * Frontend: Next.js `16.1.6` (App Router), React `19.2.3`, Tailwind CSS `v4`.
* **Storage & Persistence**:
  * PostgreSQL 16 (target database `shoppy`). In Phase 0, connection string parameters are externalized without altering tables or executing new migrations.
* **Testing & Verification Tools**:
  * `go build ./...`, `go test ./...` (in-memory Fiber tests for 401/403 gates), `gofmt -l .`
  * `pnpm install --frozen-lockfile`, `pnpm exec tsc --noEmit`, `pnpm build`
  * Boundary assertions for HTTP 401 (unauthenticated), HTTP 403 (unauthorized/non-admin/IDOR), and HTTP 200 (public).
* **Target Platforms**:
  * Windows / Linux local developer workstation; CI runner container environment.
* **Project Type**:
  * Full-stack monorepo (`backend/` + `frontend/`).
* **Critical Architectural Constraints**:
  * ⛔ **NO GORM migration or removal** (GORM remains active in Phase 0).
  * ⛔ **NO SQLC implementation** (Deferred to Phase 1 & 3).
  * ⛔ **NO database schema migration or table creation** (No `user_sessions` table in Phase 0).
  * ⛔ **NO Clean Architecture refactoring** (Directory moves deferred to Phase 2).
  * ⛔ **NO frontend state redesign** (Redux and TanStack Query setup deferred to Phase 2).
  * ⛔ **NO Refresh Token, Rotation, or Device Session implementation** (Explicitly deferred to Phase 3 per Constitution Principle XLIV).

---

## 3. Constitution & Quality Gates Check

| Constitution Principle | Conformance Status | Implementation Note in Phase 0 |
| :--- | :---: | :--- |
| **Principle I (Layered Architecture)** | **PASS** | No business logic added to handlers; existing handler signatures preserved. |
| **Principle XIV (Defense-in-Depth)** | **PASS** | `IsAuthenticated` and temporary `RequireAdmin` guards mounted across all critical mutations and data-exposure routes. |
| **Principle XVIII (Dead Code & Artifacts)**| **PASS** | `backend/tmp/main.exe` and `backend/uploads/*.png` verified to have zero runtime code dependencies before untracking. |
| **Principle XXXVI (12-Factor Config)** | **PASS** | Database credentials, `PORT`, and `JWT_SECRET` externalized to environment variables with `.env.example` templates; `godotenv` integrated for local dev. |
| **Principle XLIV (Target Auth Architecture)** | **PASS** | Adheres to the Phasing Boundary: hygiene and critical perimeter in Phase 0; full dual-token/session engine in Phase 3. |
| **Principle XXII (Definition of Done)** | **PASS** | Every task has deterministic validation commands, exit criteria, and rollback procedures. |

---

## 4. Project Structure & Modified Files Layout

```text
Full-Stack-App-Store/
├── .gitignore                                 # [NEW] Root gitignore (ignores tmp, bins, .env* preserving .env.example)
├── specs/001-phase0-triage-hygiene/
│   ├── spec.md                                # Approved feature specification
│   ├── plan.md                                # This implementation plan
│   ├── research.md                            # Phase 0 research decisions
│   ├── data-model.md                          # Configuration & route security schemas
│   ├── quickstart.md                          # Runnable validation guide
│   └── contracts/
│       └── perimeter-routes.md                # Complete API & edge middleware contracts
├── backend/
│   ├── .gitignore                             # [NEW] Backend gitignore (tmp, uploads/*, *.exe)
│   ├── .env.example                           # [NEW] Template environment configuration
│   ├── go.mod                                 # [MODIFY] Add github.com/joho/godotenv
│   ├── main.go                                # [MODIFY] Load godotenv in dev, read PORT from env
│   ├── databases/
│   │   └── conected.go                        # [MODIFY] Fix dsn typo, read DB env vars
│   ├── util/
│   │   └── jwt.go                             # [MODIFY] Read JWT_SECRET from env var
│   ├── middlewares/
│   │   └── authMiddleware.go                  # [MODIFY] Add IsAuthenticated, RequireAdmin, and Ownership check
│   ├── routes/
│   │   └── routes.go                          # [MODIFY] Mount security guards across all non-public routes
│   ├── tmp/
│   │   └── main.exe                           # [DELETE/UNTRACK] Remove from Git and disk
│   └── uploads/
│       └── *.png                              # [UNTRACK] Remove test images from Git tracking
└── frontend/
    ├── .env.example                           # [NEW] Template frontend environment configuration
    ├── app/
    │   ├── layout.tsx                         # [MODIFY] Strip duplicate AppSidebar; keep Theme/Toaster
    │   └── actions/
    │       └── user.action.ts                 # [MODIFY] Forward JWT cookie in deleteUser Server Action
    ├── proxy.ts                               # [DELETE/RENAME]
    └── middleware.ts                          # [NEW/RENAME] Next.js 16 canonical edge middleware
```

---

## 5. Detailed Step-by-Step Implementation Plan

### Step 1: Baseline Recording & Environment Snapshot
* **Responsibility**: Record exact state of Git working tree, compiler versions, and build status prior to any modifications.
* **Commands**:
  ```bash
  git status --porcelain
  go version
  node -v
  pnpm -v
  ```
* **Expected Result**: Go `1.26.0`, Node `v22.18.0`, pnpm `10.33.0`.
* **Validation Checkpoint**: Baseline recorded.

---

### Step 2: Backend Compilation Repair (`conected.go`)
* **Responsibility**: Resolve undeclared variable compilation blocker in [`backend/databases/conected.go`](file:///g:/react/next-go/Full-Stack-App-Store/backend/databases/conected.go).
* **Files to Modify**: [`backend/databases/conected.go`](file:///g:/react/next-go/Full-Stack-App-Store/backend/databases/conected.go).
* **Exact Changes**:
  1. Fix typo from `dns := ...` to `dsn := ...` matching `postgres.Open(dsn)`.
  2. Implement helper `getEnv(key, defaultVal string) string` reading `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_SSLMODE` with local development fallbacks.
  3. Construct DSN using formatted string.
  4. Retain `db.AutoMigrate(...)` intact.
* **Commands**:
  ```bash
  cd backend && go build ./...
  ```
* **Expected Result**: Backend compiles with exit code 0.

---

### Step 3: Local Environment Loader & Configuration Hardening
* **Responsibility**: Integrate `godotenv` for local development, bind dynamic `PORT` in `main.go`, and create sanitized `.env.example` templates.
* **Files to Modify / Create**:
  * [`backend/main.go`](file:///g:/react/next-go/Full-Stack-App-Store/backend/main.go) [MODIFY]
  * [`backend/go.mod`](file:///g:/react/next-go/Full-Stack-App-Store/backend/go.mod) [MODIFY]
  * [`backend/.env.example`](file:///g:/react/next-go/Full-Stack-App-Store/backend/.env.example) [NEW]
  * [`frontend/.env.example`](file:///g:/react/next-go/Full-Stack-App-Store/frontend/.env.example) [NEW]
* **Exact Changes**:
  1. In `backend/main.go`: Call `_ = godotenv.Load()` before initializing config. Read `port := os.Getenv("PORT")` (fallback `"8000"`) and listen on `":" + port`.
  2. In `backend/.env.example`: Placeholders for `PORT`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_SSLMODE`, `JWT_SECRET`.
  3. In `frontend/.env.example`: Placeholders for `NEXT_PUBLIC_API_URL` and `PARSPACK_*` S3 keys.
* **Commands**:
  ```bash
  cd backend && go get github.com/joho/godotenv
  go build ./...
  ```
* **Expected Result**: Clean compilation with `godotenv` integrated.

---

### Step 4: Secret Externalization & JWT Hardening
* **Responsibility**: Externalize JWT signing key and eliminate hardcoded `"secret"` constant.
* **Files to Modify**: [`backend/util/jwt.go`](file:///g:/react/next-go/Full-Stack-App-Store/backend/util/jwt.go).
* **Exact Changes**:
  1. Remove `const SecretKey = "secret"`.
  2. Implement `getJwtSecret() []byte`: reads `os.Getenv("JWT_SECRET")`. In local development, fallback `"dev-insecure-secret-change-me"`. If in production (`APP_ENV=production`), panic or fail if secret is missing or equals fallback.
  3. Update `GenerateJwt` and `ParseJwt` to call `getJwtSecret()`.
* **Commands**:
  ```bash
  cd backend && go build ./...
  ```
* **Expected Result**: No constant secret in `jwt.go`; dynamic key resolution passing builds.

---

### Step 5: Git Hygiene, Tracked Binaries & Upload Artifact Cleanup
* **Responsibility**: Untrack and delete `main.exe`, untrack runtime test uploads in `backend/uploads/`, and establish `.gitignore` rules.
* **Files to Modify / Create**:
  * [`.gitignore`](file:///g:/react/next-go/Full-Stack-App-Store/.gitignore) (Root - NEW)
  * [`backend/.gitignore`](file:///g:/react/next-go/Full-Stack-App-Store/backend/.gitignore) (NEW)
  * `backend/tmp/main.exe` (DELETE)
* **Exact Changes**:
  1. Delete `backend/tmp/main.exe` and untrack: `git rm -f backend/tmp/main.exe`.
  2. Untrack runtime test uploads: `git rm --cached backend/uploads/*.png`.
  3. In root `.gitignore`: ignore `.env`, `.env.local`, `.env.*.local`, preserving `!.env.example`.
  4. In `backend/.gitignore`: ignore `/tmp/`, `/uploads/*`, `!/uploads/.gitkeep`, `*.exe`, `*.test`, `*.out`.
* **Commands**:
  ```bash
  git ls-files backend/tmp/main.exe
  git ls-files backend/uploads/
  git check-ignore -v backend/tmp/test.exe .env
  ```
* **Expected Result**: Zero tracked binary or test upload files.

---

### Step 6: Perimeter Security, Critical Mutation & IDOR Guards
* **Responsibility**: Attach authentication and temporary authorization guards across all non-public routes.
* **Files to Modify**:
  * [`backend/middlewares/authMiddleware.go`](file:///g:/react/next-go/Full-Stack-App-Store/backend/middlewares/authMiddleware.go) [MODIFY]
  * [`backend/routes/routes.go`](file:///g:/react/next-go/Full-Stack-App-Store/backend/routes/routes.go) [MODIFY]
* **Exact Changes**:
  1. In `middlewares/authMiddleware.go`:
     - Implement `RequireAdmin(c *fiber.Ctx) error`: verifies `user.RoleID == 2` (or Role name `"admin"`); returns HTTP 403 `{"message": "forbidden: requires administrator privileges"}` if non-admin.
     - Implement favorite ownership verification in `controllers.AddFavorite` / `controllers.RemoveFavorite`: verify `input.UserID == callerID`.
  2. In `routes/routes.go`:
     - Attach `middlewares.IsAuthenticated` + `middlewares.RequireAdmin` to:
       `DELETE/POST/PUT /api/users`, `GET /api/users`, `GET /api/alluser`, `GET /api/users/:id`
       `DELETE/POST/PUT /api/products/:id`
       `DELETE/POST/PUT/GET /api/roles`
       `POST /uploads`
       `GET /api/orders`, `GET /api/orders/export`, `GET /api/orders/chart`
     - Attach `middlewares.IsAuthenticated` to:
       `GET /api/user`, `PUT /api/updateinfo`, `PUT /api/updatepassword`, `GET/POST/DELETE /api/favorites`
     - Leave public catalog routes open (`GET /api/products`, `GET /api/products/:id`, `POST /api/login`, `POST /api/register`).
* **Commands**:
  ```bash
  cd backend && go build ./...
  ```
* **Expected Result**: Backend compiles cleanly with all routes guarded.

---

### Step 7: Frontend Layout & Sidebar Deduplication
* **Responsibility**: Strip duplicate sidebar from root layout, preserving it strictly in route groups.
* **Files to Modify**: [`frontend/app/layout.tsx`](file:///g:/react/next-go/Full-Stack-App-Store/frontend/app/layout.tsx).
* **Exact Changes**:
  1. Remove `<SidebarProvider>` and `<AppSidebar />` from `frontend/app/layout.tsx`.
  2. Wrap `{children}` in `<ThemeProvider>` and `<Toaster />`.
  3. Storefront pages in `(main)` and dashboard pages in `(dashboard)` retain their dedicated sidebars.
* **Expected Result**: Storefront renders 1 sidebar; auth pages render 0 sidebars.

---

### Step 8: Next.js 16 Route Protection Activation
* **Responsibility**: Rename `proxy.ts` to canonical `middleware.ts`.
* **Files to Modify**: Rename `frontend/proxy.ts` $\rightarrow$ [`frontend/middleware.ts`](file:///g:/react/next-go/Full-Stack-App-Store/frontend/middleware.ts).
* **Exact Changes**:
  1. Rename file to `frontend/middleware.ts`.
  2. Change exported function to `export function middleware(request: NextRequest)`.
  3. Keep `config.matcher` for private and auth routes.
* **Expected Result**: Next.js activates edge route redirection.

---

### Step 9: Frontend Server Action Credential Forwarding
* **Responsibility**: Forward caller session cookie in `user.action.ts` to prevent user deletion regression.
* **Files to Modify**: [`frontend/app/actions/user.action.ts`](file:///g:/react/next-go/Full-Stack-App-Store/frontend/app/actions/user.action.ts).
* **Exact Changes**:
  1. In `deleteUser(id: number)`:
     ```ts
     const token = await getToken();
     const response = await axios.delete(`http://localhost:8000/api/users/${id}`, {
       headers: { Cookie: `jwt=${token}` },
     });
     ```
* **Expected Result**: Admin dashboard user deletion continues working against guarded backend.

---

### Step 10: Frontend Dependencies & Verification Gate
* **Responsibility**: Install dependencies via frozen lockfile and execute verification checks.
* **Commands**:
  ```bash
  cd frontend
  pnpm install --frozen-lockfile
  pnpm exec tsc --noEmit
  pnpm build
  ```
* **Expected Result**: TypeScript typecheck and Next.js build succeed with 0 errors. (If network/registry failure occurs, logged as environment blocker).

---

### Step 11: Backend Automated In-Memory Verification
* **Responsibility**: Run automated unit test verifying 401 unauthenticated and 403 unauthorized rejections without live database dependency.
* **Files to Modify / Create**: [`backend/routes/routes_test.go`](file:///g:/react/next-go/Full-Stack-App-Store/backend/routes/routes_test.go) [NEW].
* **Exact Changes**:
  Write lightweight Fiber in-memory tests using `app.Test(req)`:
  - Assert HTTP 401 on unauthenticated `DELETE /api/users/1`.
  - Assert HTTP 403 on non-admin token attempting `DELETE /api/users/1`.
  - Assert HTTP 200 on public `GET /api/products`.
* **Commands**:
  ```bash
  cd backend && go test ./...
  ```
* **Expected Result**: Automated test suite passes deterministically in CI and local without running PostgreSQL.

---

### Step 12: Final Regression & Git Check
* **Responsibility**: Final review ensuring zero tracked binaries, clean working tree, and no lingering uncommitted files.
* **Commands**:
  ```bash
  git status
  git ls-files | grep -E '\.(exe|dll|so|bin)$'
  git ls-files backend/uploads/
  ```
* **Expected Result**: 0 tracked binaries, 0 tracked upload images, clean git status.

---

## 6. Phase 0 Exit Criteria (Definition of Done)

Phase 0 is officially **COMPLETE** when:
1. ✅ **Backend Compiles**: `go build ./...` inside `backend/` passes with 0 errors.
2. ✅ **Zero Tracked Binaries & Uploads**: `backend/tmp/main.exe` and `backend/uploads/*.png` are untracked.
3. ✅ **Root & Backend .gitignore Present**: Ignoring build outputs and `.env*` (preserving `.env.example`).
4. ✅ **Zero Plaintext Secrets**: Dynamic environment variable resolution via `godotenv`.
5. ✅ **Critical Mutation Perimeter Guarded**: All destructive and administrative mutation endpoints require authentication and temporary admin role verification.
6. ✅ **IDOR Protected**: Personal favorite endpoints verify caller identity against request parameters.
7. ✅ **No Server Action Regression**: Admin user deletion succeeds through credential forwarding in `user.action.ts`.
8. ✅ **Single Sidebar Rendered**: Customer storefront renders exactly 1 sidebar; auth pages render cleanly.
9. ✅ **Next.js Route Protection Active**: Unauthenticated navigation to `/dashboard` redirects to `/login`.
10. ✅ **Zero Out-of-Scope Changes**: Full RBAC, refresh tokens, SQLC, and Redux/TanStack migrations remain untouched.
