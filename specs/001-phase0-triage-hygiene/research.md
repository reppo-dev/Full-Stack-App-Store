# Research & Architecture Decisions: Phase 0 — Triage, Compilation Integrity & Perimeter Security Hygiene

**Feature**: [Phase 0 Specification](../spec.md)  
**Date**: 2026-09-14  
**Last Updated**: 2026-09-15  
**Status**: Completed & Synchronized  

---

## 1. Backend Compilation Repair & Local Environment Loader (`conected.go` & `godotenv`)

### Context
Running `go build ./...` in `backend/` halts with:
```text
# github.com/reppo/go-backend/databases
databases\conected.go:14:2: declared and not used: dns
databases\conected.go:17:38: undefined: dsn
```
In [`backend/databases/conected.go`](file:///g:/react/next-go/Full-Stack-App-Store/backend/databases/conected.go#L14-L17):
```go
dns := "host=localhost user=postgres password=******** dbname=shoppy port=5432 sslmode=disable"
db , err := gorm.Open(postgres.Open(dsn),&gorm.Config{})
```
Standard Go `os.Getenv` only reads OS-level process environment variables, not `.env` files on disk. Furthermore, `main.go` hardcodes `app.Listen(":8000")`.

### Decision
- Standardize the variable identifier to `dsn`.
- Add `github.com/joho/godotenv` to load `.env` during local development initialization in `main.go` (gracefully skipping if `.env` is absent).
- Read server port `PORT` from environment (defaulting to `"8000"`).
- Parse connection parameters from environment variables (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_SSLMODE`) via a helper function `getEnv(key, defaultVal)`.
- Retain GORM's `db.AutoMigrate` intact during Phase 0 to ensure zero disruption to database schema until versioned Goose migrations are introduced in Phase 1.

---

## 2. Environment Configuration & Secret Externalization

### Context
In [`backend/util/jwt.go`](file:///g:/react/next-go/Full-Stack-App-Store/backend/util/jwt.go#L11):
```go
const SecretKey = "secret"
```
The JWT signing key is a hardcoded constant `"secret"`, and historical Git commits contained real database password `13802002`.

### Decision
- Replace `const SecretKey = "secret"` with dynamic environment resolution `os.Getenv("JWT_SECRET")`.
- Sensitive secrets in production must NOT use false-security fallbacks (like `"secret"` or `"password"`). In production modes, a missing or default secret MUST trigger an immediate fatal panic or security alert.
- Author `backend/.env.example` and `frontend/.env.example` documenting all configuration keys:
  ```ini
  PORT=8000
  DB_HOST=localhost
  DB_PORT=5432
  DB_USER=postgres
  DB_PASSWORD=postgres
  DB_NAME=shoppy
  DB_SSLMODE=disable
  JWT_SECRET=replace-with-a-secure-random-32-byte-secret
  ```
- In `frontend/.env.example`, include both `NEXT_PUBLIC_API_URL` and `PARSPACK_*` storage variables.
- Mandate a **Secret Rotation Requirement**: Any production deployment must generate fresh, non-historical credentials.

### Mandatory Production Secret Rotation Requirements (T023)
The audit identified two exposed credentials in historical code:
1. **Database Password**: Historical plain-text password `13802002` was committed in `databases/conected.go`.
2. **JWT Signing Secret**: Hardcoded signing key `"secret"` was present in `util/jwt.go`.

**Mandatory Pre-Production Actions**:
1. **PostgreSQL Password Rotation**: If any live PostgreSQL instance ever used `13802002`, the password MUST be rotated immediately via `ALTER USER postgres WITH PASSWORD '...';`.
2. **Cryptographic JWT Secret Generation**: Generate a high-entropy 256-bit secret (e.g. `openssl rand -base64 32`) and supply it strictly via the `JWT_SECRET` environment variable.
3. **Production Startup Assertion**: In production (`APP_ENV=production`), `getJwtSecret()` will panic if `JWT_SECRET` is unset or set to the development fallback.
4. **Zero-Secret Invariant**: Git ignore rules strictly enforce that no `.env*` files containing secrets can be committed. Future history scrubbing may be scheduled during maintenance windows.

---

## 3. Git Hygiene & Artifact Removal (`main.exe` and `uploads/`)

### Context
- [`backend/tmp/main.exe`](file:///g:/react/next-go/Full-Stack-App-Store/backend/tmp/main.exe) is a 24 MB Windows binary committed to Git tracking.
- [`backend/uploads/`](file:///g:/react/next-go/Full-Stack-App-Store/backend/uploads/) contains 9 tracked PNG images from developer runtime testing, verified to have zero application source references.
- There is no root `.gitignore` or `backend/.gitignore`.

### Decision
- Untrack and delete `backend/tmp/main.exe` from Git and disk (`git rm -f backend/tmp/main.exe`).
- Untrack runtime test uploads via `git rm --cached backend/uploads/*.png`, retaining local copies on disk.
- Create root `.gitignore` and `backend/.gitignore` ignoring:
  - `/backend/tmp/`
  - `/backend/uploads/*` (with `.gitkeep`)
  - `*.exe`, `*.dll`, `*.so`, `*.dylib`, `*.test`, `*.out`
  - `.env`, `.env.local`, `.env.*.local` (preserving `.env.example` via `!.env.example`)
  - OS artifacts (`.DS_Store`, `Thumbs.db`)

---

## 4. Perimeter Security, Critical Mutations & IDOR Prevention

### Context
- Analysis of `backend/routes/routes.go` revealed that not only `DELETE` routes, but also `POST /api/users`, `PUT /api/users/:id`, `POST /uploads`, `POST/PUT /api/products`, `POST/PUT /api/roles`, and data-exposure routes `GET /api/users`, `GET /api/orders/export` are completely unprotected.
- Mounting `IsAuthenticated` alone verifies token validity but DOES NOT verify roles or ownership. Ordinary authenticated users could delete admin users or overwrite catalog items.
- `DELETE /api/favorites` and `POST /api/favorites` accept `user_id` in request body without verifying caller ownership (IDOR).

### Decision
- Enforce the foundational rule: **Authentication != Authorization**.
- Attach `middlewares.IsAuthenticated` across all non-public endpoints.
- Implement a minimal, low-risk, temporary Phase 0 guard (`RequireAdmin`) checking `role_id == 2` (or `Role.Name == "admin"`) for administrative mutations (`POST/PUT/DELETE /api/users`, `POST/PUT/DELETE /api/products`, `POST/PUT/DELETE /api/roles`, `POST /uploads`, `GET /api/users`, `GET /api/orders/export`, `GET /api/orders/chart`).
- Implement ownership checking on personal favorite endpoints: verify that `input.UserID` matches the authenticated caller's token ID.
- Full RBAC frameworks and decoupled permission engines remain deferred to **Phase 3**.

---

## 5. Server Action Credential Forwarding (`user.action.ts`)

### Context
In `frontend/app/actions/user.action.ts`, `deleteUser` invokes `axios.delete('http://localhost:8000/api/users/${id}')` without forwarding headers or cookies. Once the backend endpoint is guarded by `IsAuthenticated`, clicking "Delete User" in the admin dashboard (`tableUser.tsx`) would immediately fail with HTTP 401 Unauthorized.

### Decision
- Authorize a narrow, contract-preserving update in `frontend/app/actions/user.action.ts`:
  ```ts
  const token = await getToken();
  const response = await axios.delete(`http://localhost:8000/api/users/${id}`, {
    headers: { Cookie: `jwt=${token}` },
  });
  ```
- This maintains existing admin dashboard functionality without triggering a premature architectural rewrite of the frontend API transport layer.

---

## 6. Frontend Layout & Sidebar Deduplication

### Context
- [`frontend/app/layout.tsx`](file:///g:/react/next-go/Full-Stack-App-Store/frontend/app/layout.tsx#L32) wraps all children in `<SidebarProvider defaultOpen={false}><AppSidebar />`.
- [`frontend/app/(main)/layout.tsx`](file:///g:/react/next-go/Full-Stack-App-Store/frontend/app/(main)/layout.tsx#L11) and [`frontend/app/(dashboard)/layout.tsx`](file:///g:/react/next-go/Full-Stack-App-Store/frontend/app/(dashboard)/layout.tsx#L44) provide their own dedicated sidebars.
- Root wrapping caused duplicate sidebars on storefront and dashboard routes, and leaked navigation chrome into `/login` and `/signup`.

### Decision
- Strip `<SidebarProvider>` and `<AppSidebar />` from root `app/layout.tsx`, leaving only `<ThemeProvider>` and `<Toaster />`.
- Storefront routes in `(main)` and dashboard routes in `(dashboard)` retain their respective sidebars independently.
- Auth routes in `(auth)` render clean authentication cards with zero sidebars.

---

## 7. Next.js 16 Edge Middleware Convention

### Context
- Next.js 16 strictly recognizes `middleware.ts` at the root of `frontend/` (or inside `src/`). `proxy.ts` is ignored.

### Decision
- Rename `frontend/proxy.ts` to `frontend/middleware.ts`.
- Export `export function middleware(request: NextRequest)`.
- Configure `config.matcher` to intercept `/dashboard/*`, `/profile/*`, `/favorite/*` (redirecting to `/login`), and `/login`, `/signup` (redirecting to `/`).

---

## 8. Frontend Dependency Gating (`pnpm install --frozen-lockfile`)

### Context
- `frontend/node_modules` is not present on disk. Running TypeScript typechecks or builds fails immediately without installed packages.

### Decision
- Explicitly add `pnpm install --frozen-lockfile` to the verification sequence.
- If installation fails due to external network or registry unavailability, classify it as an environment blocker rather than a code defect.
