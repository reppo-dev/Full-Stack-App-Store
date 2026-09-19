# Modernization Roadmap: DashStack Platform

> **Document Status**: Execution Roadmap (Phased, Testable, Reversible)  
> **Guiding Principle**: Strangler Fig Migration Pattern — zero blind rewrites, continuous build integrity, and behavioral parity at every milestone.  
> **Source Documents**:
> * [`.specify/memory/constitution.md`](file:///g:/react/next-go/Full-Stack-App-Store/.specify/memory/constitution.md) (v1.1.0)
> * [`docs/current-architecture.md`](file:///g:/react/next-go/Full-Stack-App-Store/docs/current-architecture.md)
> * [`docs/target-architecture.md`](file:///g:/react/next-go/Full-Stack-App-Store/docs/target-architecture.md)

---

## 1. Roadmap Architecture & Execution Philosophy

This roadmap transitions the DashStack e-commerce codebase from its current state (tightly coupled GORM active records, unprotected endpoints, dual frontend transport paths, hardcoded secrets, and zero automated tests) into the target **Modular Monolith** designed for 1,000,000 users.

### The 4 Non-Negotiable Rules of this Roadmap
1. **Never Break the Build**: Every completed phase must leave the repository in a clean-compiling, runnable, and passing state (`go build` and `pnpm build` clean).
2. **Behavioral Parity First**: Existing functional behavior (even legacy behavior) must be preserved and guarded by tests before refactoring internal structures.
3. **No Dual-Writing of Source of Truth**: Relational data lives in PostgreSQL; ephemeral cache in Redis; server state in TanStack Query; UI state in Redux Toolkit.
4. **Strangler Migration**: Legacy GORM code runs in parallel with new SQLC modules. Once a domain is proven via automated tests and contract verification, the legacy routes are retired.

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       Modernization Phase Timeline                                      │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [Phase 0: Triage, Compilation Fix & Security Hygiene] ────────────────────────── (Days 1 - 2)           │
│   │                                                                                                     │
│   ▼                                                                                                     │
│ [Phase 1: Developer Toolchain, Infrastructure & CI/CD Pipeline] ──────────────── (Days 3 - 6)           │
│   │                                                                                                     │
│   ▼                                                                                                     │
│ [Phase 2: Core Foundation & Transport Layer Normalization] ───────────────────── (Days 7 - 12)          │
│   │                                                                                                     │
│   ▼                                                                                                     │
│ [Phase 3: Identity, Security & User Domain Migration] ────────────────────────── (Days 13 - 18)         │
│   │                                                                                                     │
│   ▼                                                                                                     │
│ [Phase 4: Catalog Subsystem & Customer Browsing (Products/Categories)] ───────── (Days 19 - 25)         │
│   │                                                                                                     │
│   ▼                                                                                                     │
│ [Phase 5: Commerce Transaction Lifecycle (Cart, Wishlist, Orders, Payments)] ── (Days 26 - 35)         │
│   │                                                                                                     │
│   ▼                                                                                                     │
│ [Phase 6: Support, Intelligence & Operations (Ticketing & Dashboard)] ────────── (Days 36 - 44)         │
│   │                                                                                                     │
│   ▼                                                                                                     │
│ [Phase 7: Hardening, Observability, Dead-Code Pruning & Production Readiness] ── (Days 45 - 50)         │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Detailed Phase Specifications

---

### Phase 0: Triage, Compilation Fix & Security Hygiene

* **Goal**: Restore backend compilation integrity, eliminate immediate security vulnerabilities, and fix critical layout bugs without altering core logic.
* **Rationale**: The backend currently cannot compile due to an undeclared identifier in [`backend/databases/conected.go:17`](file:///g:/react/next-go/Full-Stack-App-Store/backend/databases/conected.go#L17). Furthermore, all backend endpoints are open to unauthenticated destructive access, and secrets are hardcoded in git.
* **Prerequisites**: Access to codebase.
* **Dependencies**: None.
* **Affected Areas**:
  * [`backend/databases/conected.go`](file:///g:/react/next-go/Full-Stack-App-Store/backend/databases/conected.go)
  * [`backend/util/jwt.go`](file:///g:/react/next-go/Full-Stack-App-Store/backend/util/jwt.go)
  * [`backend/routes/routes.go`](file:///g:/react/next-go/Full-Stack-App-Store/backend/routes/routes.go)
  * [`backend/tmp/main.exe`](file:///g:/react/next-go/Full-Stack-App-Store/backend/tmp/main.exe)
  * [`frontend/app/layout.tsx`](file:///g:/react/next-go/Full-Stack-App-Store/frontend/app/layout.tsx)
  * [`frontend/app/(main)/layout.tsx`](file:///g:/react/next-go/Full-Stack-App-Store/frontend/app/(main)/layout.tsx)
  * [`frontend/proxy.ts`](file:///g:/react/next-go/Full-Stack-App-Store/frontend/proxy.ts)
* **Migration Strategy**:
  1. Fix typo in [`conected.go:14-17`](file:///g:/react/next-go/Full-Stack-App-Store/backend/databases/conected.go#L14-L17) (`dns := ...` $\rightarrow$ `dsn := ...`) and verify `go build ./...` succeeds.
  2. Create `.env.example` in both `backend` and `frontend`; replace hardcoded JWT `"secret"` and database connection strings with `os.Getenv` fallbacks.
  3. Delete the 24 MB binary committed to version control in [`backend/tmp/main.exe`](file:///g:/react/next-go/Full-Stack-App-Store/backend/tmp/main.exe) and add `/tmp` to `.gitignore`.
  4. Temporarily mount [`middlewares.IsAuthenticated`](file:///g:/react/next-go/Full-Stack-App-Store/backend/middlewares/authMiddleware.go) on destructive routes (`DELETE /api/users/:id`, `DELETE /api/products/:id`) to prevent unauthorized deletion.
  5. Remove inner duplicate `<SidebarProvider>` and `<AppSidebar />` from [`frontend/app/(main)/layout.tsx`](file:///g:/react/next-go/Full-Stack-App-Store/frontend/app/(main)/layout.tsx#L11-L17) to resolve dual-sidebar DOM rendering.
  6. Rename [`frontend/proxy.ts`](file:///g:/react/next-go/Full-Stack-App-Store/frontend/proxy.ts) to `frontend/middleware.ts` so Next.js executes routing protection.
* **Risks**: Modifying route middleware might block existing unauthenticated frontend calls.
* **Rollback Strategy**: Git revert of targeted one-line edits.
* **Tests Required**:
  * Manual smoke test: `go build ./...` succeeds cleanly.
  * Browser test: Loading `http://localhost:3000` renders a single unified sidebar.
* **Definition of Done**: Backend compiles cleanly from a fresh checkout; committed binary is removed from git history; duplicate sidebar is gone.
* **Priority**: **P0 (Blocker — Immediate)**

---

### Phase 1: Developer Toolchain, Infrastructure & CI/CD Pipeline

* **Goal**: Establish deterministic local orchestration, build automation, database migration tooling, and automated continuous integration.
* **Rationale**: Without automated CI, unit testing frameworks, and Docker orchestration, subsequent domain refactorings cannot be verified safely against regressions.
* **Prerequisites**: Phase 0 completion.
* **Dependencies**: Docker engine, GitHub repository settings.
* **Affected Areas**:
  * Project root: [`Dockerfile`](file:///g:/react/next-go/Full-Stack-App-Store/Dockerfile), [`docker-compose.yml`](file:///g:/react/next-go/Full-Stack-App-Store/docker-compose.yml), [`Makefile`](file:///g:/react/next-go/Full-Stack-App-Store/Makefile)
  * GitHub directory: `.github/workflows/ci.yml`
  * Database tooling: `backend/sqlc.yaml`, `backend/db/migrations/`
* **Migration Strategy**:
  1. **Containerization**:
     * Author multi-stage, non-root `backend/Dockerfile` (Alpine/Distroless, UID 10001).
     * Author multi-stage `frontend/Dockerfile` (`output: "standalone"`, non-root user).
  2. **Docker Compose**:
     * Configure `docker-compose.yml` defining PostgreSQL 16 Alpine, Redis 7 Alpine, and environment variable bindings.
  3. **Root Makefile**:
     * Implement standard targets: `make dev`, `make test`, `make lint`, `make format`, `make build`, `make migrate`, `make migration`, `make docker-up`, `make docker-down`, `make ci`.
  4. **Database Migration Tooling**:
     * Install [Goose](https://github.com/pressly/goose) as the independent migration engine.
     * Export the current database schema into baseline migration `db/migrations/000001_init_schema.sql` (both `.up.sql` and `.down.sql`).
  5. **SQLC Setup**:
     * Initialize `sqlc.yaml` targeting PostgreSQL with `package: "sqlc"` and `out: "internal/infrastructure/database/sqlc"`.
  6. **CI/CD Pipeline (GitHub Actions)**:
     * Author `.github/workflows/ci.yml` executing linting (`golangci-lint`, `pnpm lint`), type checking (`tsc --noEmit`), unit tests, and container builds on every PR.
* **Risks**: Developer machine differences in Docker runtime or permissions.
* **Rollback Strategy**: Docker and Makefile additions are purely additive; removal does not affect runtime code.
* **Tests Required**:
  * `make docker-up` spins up PostgreSQL and Redis healthy.
  * `goose up` applies the baseline migration successfully.
  * `make ci` passes on GitHub Actions runner.
* **Definition of Done**: `make dev` and `make ci` run cleanly; baseline PostgreSQL schema is codified in versioned SQL; CI pipeline executes green on Pull Requests.
* **Priority**: **P1 (Critical Foundation)**

---

### Phase 2: Core Foundation & Transport Layer Normalization

* **Goal**: Establish clean backend layered packages, centralized error handling, structured logging, centralized frontend Axios client, and state management providers.
* **Rationale**: Standardizing transport, logging, configuration, and API communication decouples the frontend from backend implementation details and creates the target structure for domain migrations.
* **Prerequisites**: Phase 1 completion.
* **Dependencies**: `log/slog`, `envconfig`, Axios, TanStack Query, Redux Toolkit.
* **Affected Areas**:
  * Backend: `internal/transport/http/`, `internal/config/`, `internal/domain/errors.go`
  * Frontend: `lib/api/client.ts`, `lib/query/queryClient.ts`, `lib/redux/store.ts`, `app/layout.tsx`
* **Migration Strategy**:
  1. **Backend Layered Shell**:
     * Create `internal/config/config.go` to parse all environment variables with strict defaults.
     * Implement structured JSON logging (`log/slog`) with request correlation ID middleware (`X-Request-ID`).
     * Create standard JSON envelope responders: `response.Success(c, data)` and `response.Error(c, status, code, message)`.
     * Add `/health/live` and `/health/ready` probe endpoints.
     * Add OS signal trap in `cmd/api/main.go` for graceful shutdown (`ShutdownWithTimeout`).
  2. **Frontend Transport & State Providers**:
     * Implement centralized Axios client in `frontend/lib/api/client.ts` with `baseURL: process.env.NEXT_PUBLIC_API_URL`, automatic credential passing, and normalized `ApiError` interceptor.
     * Install `@tanstack/react-query` and `@reduxjs/toolkit`.
     * Initialize `QueryClientProvider` and Redux `Provider` in `frontend/app/layout.tsx`.
     * Create root Redux store with initial slices for UI state (sidebar, modals, filters).
* **Risks**: Wrapping app layout with providers could cause React hydration mismatches if not configured with `"use client"` provider boundaries.
* **Rollback Strategy**: Providers and client are additive; revert layout wrapping if issues arise.
* **Tests Required**:
  * Unit tests for `config.go` environment validation.
  * Unit tests for central Axios error interceptor.
  * Integration test for `/health/ready` verifying database ping.
* **Definition of Done**: Backend logs structured JSON with `request_id`; health probes respond 200; frontend has active `QueryClient` and central Axios client; Next.js rewrites proxy can begin deprecation.
* **Priority**: **P1 (High)**

---

### Phase 3: Identity, Security & User Domain Migration

* **Goal**: Migrate Authentication, Users, and Roles domains to clean architecture services and SQLC, securing backend routes and consolidating frontend auth.
* **Rationale**: Auth and Users are the root dependency of all other e-commerce domains. Backend routes are currently open, bcrypt cost is dangerously high (14), and role checking is hardcoded to `role_id === 2`.
* **Prerequisites**: Phase 2 completion.
* **Dependencies**: Goose, SQLC, `golang-jwt/jwt/v5`, TanStack Query.
* **Affected Areas**:
  * Backend:
    * [`backend/controllers/authController.go`](file:///g:/react/next-go/Full-Stack-App-Store/backend/controllers/authController.go)
    * [`backend/controllers/userController.go`](file:///g:/react/next-go/Full-Stack-App-Store/backend/controllers/userController.go)
    * [`backend/controllers/roelController.go`](file:///g:/react/next-go/Full-Stack-App-Store/backend/controllers/roelController.go)
    * [`backend/models/user.go`](file:///g:/react/next-go/Full-Stack-App-Store/backend/models/user.go), [`models/role.go`](file:///g:/react/next-go/Full-Stack-App-Store/backend/models/role.go)
  * Frontend:
    * [`frontend/app/actions/auth.ts`](file:///g:/react/next-go/Full-Stack-App-Store/frontend/app/actions/auth.ts), [`actions/user.action.ts`](file:///g:/react/next-go/Full-Stack-App-Store/frontend/app/actions/user.action.ts)
    * [`frontend/components/login-form.tsx`](file:///g:/react/next-go/Full-Stack-App-Store/frontend/components/login-form.tsx), [`components/signup-form.tsx`](file:///g:/react/next-go/Full-Stack-App-Store/frontend/components/signup-form.tsx)
    * [`frontend/app/(dashboard)/contact/page.tsx`](file:///g:/react/next-go/Full-Stack-App-Store/frontend/app/(dashboard)/contact/page.tsx)
* **Migration Strategy**:
  1. **SQLC & Migrations**:
     * Author `db/queries/users.sql` and `db/queries/roles.sql`. Generate Go repository code with SQLC.
  2. **Backend Use-Cases**:
     * Implement `AuthService` (`Register`, `Login`, `RefreshToken`, `UpdatePassword`).
     * Adjust bcrypt cost from 14 to optimal 12 to prevent server thread blocking.
     * Upgrade to `golang-jwt/jwt/v5` with explicit expiration and issuer claims.
     * Implement `UserService` and `RoleService` with unit tests.
     * Replace `authController.go`, `userController.go`, and `roelController.go` (fixing `if err != err` typo) with clean Fiber handlers.
     * Group routes under `/api/v1/auth`, `/api/v1/users`, `/api/v1/roles` with `Authenticate` and `RequireRole("admin")` middlewares.
  3. **Frontend Auth & User Module**:
     * Create `frontend/features/auth/` and `frontend/features/users/`.
     * Move login/signup form logic to call the central Axios client (`authApi.login`) and integrate TanStack Query mutation.
     * Replace hardcoded `role_id === 2` check in [`(dashboard)/layout.tsx`](file:///g:/react/next-go/Full-Stack-App-Store/frontend/app/(dashboard)/layout.tsx#L38) with `user.role === "admin"`.
     * Rename/refactor [`(dashboard)/contact/page.tsx`](file:///g:/react/next-go/Full-Stack-App-Store/frontend/app/(dashboard)/contact/page.tsx) to its true semantic identity: Admin User Creation (`/dashboard/users/create`).
* **Risks**: Session cookie format change could invalidate existing test cookies.
* **Rollback Strategy**: Keep legacy GORM endpoints active on `/api/...` during staging verification; point frontend central client URL back to legacy endpoints if regression occurs.
* **Tests Required**:
  * Unit tests for password hashing and JWT issuance.
  * Integration tests for user creation, login, and RBAC rejection (401/403).
  * Frontend Cypress/Playwright or RTL test for login form submission.
* **Definition of Done**: Auth and User management execute 100% via SQLC and clean use-cases; GORM models for User and Role retired; protected routes return 401 on missing JWT.
* **Priority**: **P1 (High)**

---

### Phase 4: Catalog Subsystem & Customer Browsing (Products & Categories)

* **Goal**: Migrate Products and Categories to SQLC, resolve missing customer product detail pages, implement resilient 5-state UI, and add Redis caching.
* **Rationale**: Products are read-heavy and essential for e-commerce. Customer store currently has a broken link (`/products/[id]` 404s), duplicated banner carousels, and un-cached catalog queries.
* **Prerequisites**: Phase 3 completion.
* **Dependencies**: SQLC, Redis, TanStack Query.
* **Affected Areas**:
  * Backend:
    * [`backend/controllers/productController.go`](file:///g:/react/next-go/Full-Stack-App-Store/backend/controllers/productController.go)
    * [`backend/controllers/categoryController.go`](file:///g:/react/next-go/Full-Stack-App-Store/backend/controllers/categoryController.go)
    * [`backend/models/product.go`](file:///g:/react/next-go/Full-Stack-App-Store/backend/models/product.go), [`models/category.go`](file:///g:/react/next-go/Full-Stack-App-Store/backend/models/category.go)
  * Frontend:
    * [`frontend/app/(main)/products/`](file:///g:/react/next-go/Full-Stack-App-Store/frontend/app/(main)/products)
    * [`frontend/components/bannerProducts.tsx`](file:///g:/react/next-go/Full-Stack-App-Store/frontend/components/bannerProducts.tsx), [`components/BannerCarousel.tsx`](file:///g:/react/next-go/Full-Stack-App-Store/frontend/components/BannerCarousel.tsx)
    * [`frontend/components/cardProductsmain.tsx`](file:///g:/react/next-go/Full-Stack-App-Store/frontend/components/cardProductsmain.tsx)
* **Migration Strategy**:
  1. **SQLC & Migrations**:
     * Author `db/queries/products.sql` and `db/queries/categories.sql`.
     * Define composite indexes on `products (category_id, is_active, created_at)`.
  2. **Backend Product & Category Service**:
     * Build `ProductService` supporting cursor/offset pagination, category filtering, and slug lookups.
     * Register previously orphaned Category controller routes (`AllCategory`, `CategoryTree`) under `/api/v1/categories`.
     * Integrate Redis caching in `ProductRepository`: cache product by ID (`catalog:product:{id}`, TTL 1h) and category tree (`catalog:categories:tree`, TTL 24h). Invalidate on update/delete.
  3. **Frontend Customer Product Experience**:
     * Create `frontend/features/products/` with `useProductsQuery` and `useProductDetailQuery`.
     * Create [`frontend/app/(main)/products/[id]/page.tsx`](file:///g:/react/next-go/Full-Stack-App-Store/frontend/app/(main)/products) to fix the 404 error when customers click "see more".
     * Deduplicate banner components: retain one canonical `BannerCarousel.tsx` in `components/shared/` and delete redundant copies.
     * Update landing page ([`(main)/page.tsx`](file:///g:/react/next-go/Full-Stack-App-Store/frontend/app/(main)/page.tsx)) with responsive horizontal scroll product rows (New Arrivals, Best Sellers) implementing 5-state rendering (Skeleton, Empty, Error, Success).
* **Risks**: Cache invalidation bugs leading to stale product prices or stock numbers.
* **Rollback Strategy**: Set Redis cache feature flag to bypass cache and query PostgreSQL directly if discrepancies occur.
* **Tests Required**:
  * Unit tests for product pagination and category hierarchy traversal.
  * Cache invalidation test: Updating a product flushes its Redis key.
  * E2E test: Browsing `/products`, clicking product card, and rendering `/products/[id]`.
* **Definition of Done**: Product detail page functional for customers; categories mounted to HTTP API; Redis caching active with graceful fallback; banner code duplication eliminated.
* **Priority**: **P2 (High)**

---

### Phase 5: Commerce Transaction Lifecycle (Cart, Wishlist, Orders, Payments)

* **Goal**: Implement persistent client Cart, migrate Wishlist and Orders to SQLC with Unit-of-Work transactions, fix GORM preload bugs, and build payment foundation.
* **Rationale**: Orders currently suffer from GORM association errors (`Preload("OrderItems")`), CSV exports crash due to missing `./csv` directory, Wishlist has IDOR security flaws, and Cart is completely missing from the application.
* **Prerequisites**: Phase 4 completion.
* **Dependencies**: Redux Toolkit, SQLC, Transaction Manager.
* **Affected Areas**:
  * Backend:
    * [`backend/controllers/orderController.go`](file:///g:/react/next-go/Full-Stack-App-Store/backend/controllers/orderController.go)
    * [`backend/controllers/favoriteController.go`](file:///g:/react/next-go/Full-Stack-App-Store/backend/controllers/favoriteController.go)
    * [`backend/models/order.go`](file:///g:/react/next-go/Full-Stack-App-Store/backend/models/order.go), [`models/favorite.go`](file:///g:/react/next-go/Full-Stack-App-Store/backend/models/favorite.go)
  * Frontend:
    * [`frontend/app/(main)/favorite/page.tsx`](file:///g:/react/next-go/Full-Stack-App-Store/frontend/app/(main)/favorite/page.tsx), [`(dashboard)/favorites/page.tsx`](file:///g:/react/next-go/Full-Stack-App-Store/frontend/app/(dashboard)/favorites/page.tsx)
    * [`frontend/app/(main)/orderlist/page.tsx`](file:///g:/react/next-go/Full-Stack-App-Store/frontend/app/(main)/orderlist/page.tsx), [`(dashboard)/orderlists/page.tsx`](file:///g:/react/next-go/Full-Stack-App-Store/frontend/app/(dashboard)/orderlists/page.tsx)
    * New: `frontend/features/cart/`
* **Migration Strategy**:
  1. **Wishlist Security & SQLC**:
     * Migrate `favorites` table to SQLC.
     * Fix IDOR flaw in [`favoriteController.go:26`](file:///g:/react/next-go/Full-Stack-App-Store/backend/controllers/favoriteController.go#L26): resolve `user_id` strictly from authenticated JWT context, rejecting client-provided `user_id`.
     * Consolidate frontend duplicate pages: unify Wishlist under [`app/(main)/wishlist/page.tsx`](file:///g:/react/next-go/Full-Stack-App-Store/frontend/app/(main)/wishlist) using TanStack Query.
  2. **Cart Subsystem (Redux Toolkit)**:
     * Implement `cartSlice.ts` in Redux Toolkit (managing items, quantities, and local persistence via `localStorage`).
     * Build `CartDrawer` component in frontend.
  3. **Order Subsystem & Transaction Manager**:
     * Author SQLC queries for orders and order items.
     * Implement atomic checkout in `OrderService.CreateOrder` using `TransactionManager`:
       1. Lock product inventory (`SELECT ... FOR UPDATE`).
       2. Validate stock availability.
       3. Decrement stock.
       4. Insert Order and OrderItems.
     * Fix CSV export in [`orderController.go:57`](file:///g:/react/next-go/Full-Stack-App-Store/backend/controllers/orderController.go#L57): generate CSV in memory (`bytes.Buffer`) and stream to client response rather than writing to disk `./csv/order.csv`.
     * Unify frontend order views: customer history in `app/(main)/orders/` and admin fulfillment in `app/(dashboard)/admin/orders/`.
  4. **Payments Foundation**:
     * Author payments table migration with unique idempotency keys (`idempotency_key`, `payment_intent_id`, `status`).
* **Risks**: Concurrent checkout stock race conditions if row locking is omitted.
* **Rollback Strategy**: Maintain GORM order endpoints in parallel until atomic SQLC order checkout passes concurrency load tests.
* **Tests Required**:
  * Concurrency test: 50 simultaneous checkout requests for a product with 5 items in stock must result in exactly 5 orders and 45 out-of-stock rejections.
  * IDOR security test: Non-admin cannot view or modify another user's wishlist.
* **Definition of Done**: Cart functions offline and syncs with checkout; orders execute atomically via SQLC; CSV export streams without disk dependency; IDOR vulnerability closed.
* **Priority**: **P2 (High)**

---

### Phase 6: Support, Intelligence & Operations (Ticketing & Dashboard)

* **Goal**: Build the autonomous Ticketing domain from scratch and connect the operational Dashboard to real aggregated SQLC queries, eliminating mock data.
* **Rationale**: The ticketing section currently renders static dummy strings (`"aa"`, `"..."`) and mock data arrays. The dashboard contains 6 unrendered chart components and static fake metrics.
* **Prerequisites**: Phase 3 & 4 completion.
* **Dependencies**: SQLC, TanStack Query, Recharts, S3 storage.
* **Affected Areas**:
  * Backend:
    * [`backend/models/message.go`](file:///g:/react/next-go/Full-Stack-App-Store/backend/models/message.go), [`models/label.go`](file:///g:/react/next-go/Full-Stack-App-Store/backend/models/label.go)
    * New: `internal/domain/entity/ticket.go`, `internal/application/service/ticket_service.go`
  * Frontend:
    * [`frontend/app/(dashboard)/(inbox)/`](file:///g:/react/next-go/Full-Stack-App-Store/frontend/app/(dashboard)/(inbox))
    * [`frontend/app/(dashboard)/components/dashboard/`](file:///g:/react/next-go/Full-Stack-App-Store/frontend/app/(dashboard)/components/dashboard)
* **Migration Strategy**:
  1. **Ticketing Domain**:
     * Drop orphaned `messages` and `labels` GORM models. Author clean migration: `tickets`, `ticket_messages`, `ticket_attachments`.
     * Build `TicketService` supporting status transitions (`Open` $\rightarrow$ `In-Progress` $\rightarrow$ `Resolved` $\rightarrow$ `Closed`), priority flags, and internal agent notes.
     * Connect attachments to S3 client presigned URLs.
     * Build Gmail-inspired two-pane UI in `frontend/features/tickets/`: left pane filters/tickets list; right pane active conversation thread. Wire cleanly to TanStack Query (`useTicketsQuery`, `useTicketDetailQuery`).
  2. **Operational Dashboard**:
     * Author analytical SQLC queries in `db/queries/dashboard.sql` aggregating actual database figures: Total Revenue, Total Orders by status, Active Users, and Unresolved Tickets.
     * Connect `frontend/app/(dashboard)/dashboard/page.tsx` to `dashboardApi.getMetrics()` via TanStack Query.
     * Implement 4 purposeful charts:
       1. Revenue trend (Area chart)
       2. Orders breakdown by status (Donut chart)
       3. Sales by category (Pie chart)
       4. User acquisition trend (Bar chart)
     * Delete the 6 dead chart components ([`Calculate.tsx`](file:///g:/react/next-go/Full-Stack-App-Store/frontend/app/(dashboard)/components/dashboard/Calculate.tsx), [`Chart.tsx`](file:///g:/react/next-go/Full-Stack-App-Store/frontend/app/(dashboard)/components/dashboard/Chart.tsx), `chart-bar-interactive.tsx`, `chart-bar-label-custom.tsx`, `chart-line-multiple.tsx`, `chart-pie-donut-text.tsx`).
* **Risks**: Complex analytical queries could cause high database CPU if date columns lack indexes.
* **Rollback Strategy**: Analytical queries run read-only; dashboard can fall back to simplified KPI counters if complex aggregations require optimization.
* **Tests Required**:
  * Unit test for ticket state transition machine.
  * Query performance test: Dashboard aggregation queries execute in under 100ms.
* **Definition of Done**: Support ticketing system fully operational with real customer/agent threads; Dashboard renders live operational data; all 6 dead mock chart files deleted.
* **Priority**: **P3 (Feature Complete)**

---

### Phase 7: Hardening, Observability, Dead-Code Pruning & Production Readiness

* **Goal**: Complete dead-code removal, enforce distributed rate limiting, validate database performance and connection pooling, configure backup runbooks, and finalize CD.
* **Rationale**: Complete eradication of technical debt, retirement of legacy GORM package, and hardening the system for 1,000,000 active users.
* **Prerequisites**: Phases 1 through 6 completion.
* **Dependencies**: Redis, PostgreSQL `pgxpool`, GitHub Actions.
* **Affected Areas**:
  * Entire codebase: `backend/go.mod`, `frontend/package.json`, `frontend/components/ui/`
* **Migration Strategy**:
  1. **Final Dead Code & Dependency Elimination**:
     * Remove GORM dependency (`gorm.io/gorm`, `gorm.io/driver/postgres`) from `go.mod`.
     * Remove leftover template dependencies in `frontend/package.json` (`@prisma/adapter-pg`, `@prisma/client`, `better-auth`, and package `"add"`).
     * Delete [`frontend/lib/auth.ts`](file:///g:/react/next-go/Full-Stack-App-Store/frontend/lib/auth.ts).
     * Prune the 43 confirmed unused shadcn UI components in [`frontend/components/ui/`](file:///g:/react/next-go/Full-Stack-App-Store/frontend/components/ui).
  2. **Defensive Rate Limiting**:
     * Mount Redis token-bucket rate limiter middleware on `/api/v1/auth/login` (5 requests/min per IP) and public search (60 requests/min).
  3. **Database Performance & Reliability**:
     * Run `EXPLAIN ANALYZE` on all SQLC queries to verify index usage.
     * Configure `pgxpool` limits (`MaxConns: 50`, `MinConns: 10`, `MaxConnLifetime: 1h`).
     * Codify database backup and Point-In-Time-Recovery (PITR) documentation in `docs/runbooks/database-backup.md`.
  4. **Continuous Delivery (CD)**:
     * Author CD workflow in GitHub Actions to build production containers on Git tags and push to container registry.
* **Risks**: Accidental deletion of a component with dynamic/indirect imports.
* **Rollback Strategy**: Git commit rollback; test suite in CI acts as safety barrier.
* **Tests Required**:
  * Load test: Benchmark 5,000 requests/second on catalog endpoints using `k6` or `wrk`.
  * Rate-limit test: Exceeding 5 login attempts returns `429 Too Many Requests`.
  * Dependency audit: `govulncheck` and `pnpm audit` return 0 known vulnerabilities.
* **Definition of Done**: GORM completely eliminated from `go.mod`; zero dead code or unused template packages; rate limiting verified; production CD automated.
* **Priority**: **P3 (Hardening)**

---

## 3. Sequential vs. Parallel Execution Plan

To maximize team velocity while preserving stability, phases are structured into sequential dependency gates and parallel work streams:

```
[Phase 0: Triage & Hygiene] (Strictly Sequential - Blocker)
            │
            ▼
[Phase 1: Toolchain & CI/CD] (Strictly Sequential - Safety Net)
            │
            ▼
[Phase 2: Core Foundation & Transport] (Strictly Sequential - Foundation)
            │
            ├─────────────────────────────────────────┐
            ▼                                         ▼
[Phase 3: Auth & Users]                   [Phase 4: Products & Catalog]
(Parallel Stream A: Security & Account)   (Parallel Stream B: Browsing & UX)
            │                                         │
            └────────────────────┬────────────────────┘
                                 │
                                 ▼
            [Phase 5: Commerce Transaction Lifecycle]
            (Strictly Sequential - Requires Users, Auth, & Products)
                                 │
                                 ├────────────────────────┐
                                 ▼                        ▼
            [Phase 6: Support & Ticketing]   [Phase 6: Operations & Dashboard]
            (Parallel Stream C: Support)     (Parallel Stream D: Analytics)
                                 │                        │
                                 └───────────┬────────────┘
                                             │
                                             ▼
            [Phase 7: Hardening, Pruning & Production Readiness]
            (Strictly Sequential - Final Verification Gate)
```

---

## 4. Recommended Execution Order

The sequential order of implementation steps is explicitly ordered from **1 to 14**:

1. **Fix compilation bug in `conected.go` (`dsn` typo) and secure open deletion routes.**
   * *Rationale*: Software that does not compile cannot be run, tested, containerized, or refactored. This unblocks the entire pipeline in under 15 minutes.
2. **Remove binary `backend/tmp/main.exe` and externalize secrets to `.env`.**
   * *Rationale*: Prevents repository bloat and stops plain-text credential proliferation before introducing CI/CD.
3. **Establish Docker Compose, root Makefile, and GitHub Actions CI.**
   * *Rationale*: Establishes reproducible local development and ensures every future commit is automatically verified against regressions.
4. **Establish Goose migrations and SQLC configuration.**
   * *Rationale*: Data access cannot migrate away from GORM until the migration engine and query compiler exist.
5. **Implement Backend Clean Architecture shell and structured logging (`log/slog`).**
   * *Rationale*: Creates the target packages (`internal/transport`, `internal/application`, `internal/domain`) so future domains have an immediate destination.
6. **Implement Frontend Central Axios Client and state providers (QueryClient + Redux).**
   * *Rationale*: Normalizes the transport layer and eliminates fragmented Next.js rewrites before migrating page data.
7. **Migrate Auth, Users, and Roles to SQLC & Clean Services.**
   * *Rationale*: User identity is the foreign key prerequisite for Wishlist, Orders, Cart, and Tickets.
8. **Fix Frontend Layout (single sidebar, `middleware.ts`) and Auth Forms.**
   * *Rationale*: Resolves UI layout breakage and provides authenticated sessions for subsequent customer flows.
9. **Migrate Products and Categories to SQLC & TanStack Query.**
   * *Rationale*: Catalog data is read-heavy and needed before building shopping carts and order checkouts.
10. **Implement Customer Product Details page (`/products/[id]`) and Landing Page rows.**
    * *Rationale*: Closes the critical customer browsing 404 gap and verifies the 5-state UI contract on public traffic.
11. **Implement Cart (Redux), Wishlist, and atomic Order checkout (Transaction Manager).**
    * *Rationale*: Connects the primary revenue engine of the platform under strict transactional consistency.
12. **Build Ticketing domain from scratch (SQLC + S3 + two-pane UI).**
    * *Rationale*: Replaces broken mock inbox with a robust, autonomous support module.
13. **Connect Operational Dashboard to real analytical queries.**
    * *Rationale*: Dashboard metrics depend on completed orders, users, and tickets existing in the database.
14. **Prune dead code (GORM removal, Prisma cleanup, unused shadcn components) and execute load testing.**
    * *Rationale*: Safe final cleanup only after all functional domains are verified operational on the target architecture.

---

## 5. Do Not Do Yet (High-Risk & High-Blast-Radius Guardrails)

The following actions are **strictly forbidden** until their explicit prerequisite phases are completed:

* ⛔ **DO NOT do a Big-Bang rewrite of the entire backend or frontend in one PR.**
  * *Why*: Huge blast radius. Halts delivery, introduces untraceable regressions, and guarantees merge conflicts.
* ⛔ **DO NOT delete GORM from `backend/go.mod` in Phases 0 through 4.**
  * *Why*: Legacy tables (Orders, Products, Categories) continue running on GORM until their respective phases migrate them to SQLC. Removing GORM early breaks the application.
* ⛔ **DO NOT introduce microservices or split the backend into separate network services.**
  * *Why*: Unnecessary distributed systems overhead. The target modular monolith can easily handle 1,000,000 users with lower operational cost.
* ⛔ **DO NOT install or use Redis as a primary database for user accounts or orders.**
  * *Why*: Violates Constitution Principle XXVIII. Relational business data must remain ACID-compliant in PostgreSQL.
* ⛔ **DO NOT prematurely delete frontend components or controllers without zero-reference proof.**
  * *Why*: Violates Constitution Principle XVIII. Deletions must be verified through automated tests and grep verification.
* ⛔ **DO NOT copy server API responses into Redux Toolkit slices.**
  * *Why*: Violates Constitution Principle IV. Server state must reside exclusively in TanStack Query to prevent dual source of truth synchronization bugs.
* ⛔ **DO NOT write application code in the `cmd/api/main.go` file.**
  * *Why*: Entry point must remain purely for dependency injection and lifecycle orchestration.

---

## 6. Architecture Gaps & Migration Tracking Matrix

This matrix tracks the migration status of every gap identified in [`docs/current-architecture.md`](file:///g:/react/next-go/Full-Stack-App-Store/docs/current-architecture.md):

| Subsystem Area | Current Architectural Reality | Target Architectural State | Assigned Phase | Target Milestone Status |
| :--- | :--- | :--- | :--- | :--- |
| **Compiler Integrity** | Undeclared `dsn` variable halts build. | Zero compiler errors; clean static build. | **Phase 0** | Ready for Execution |
| **API Perimeter Security** | Unmounted middlewares; public endpoints open. | Route groups secured by JWT and RBAC middlewares. | **Phase 0 & 3** | Ready for Execution |
| **Binary Artifacts** | 24MB Windows `.exe` tracked in Git. | Clean Git tree with zero compiled binaries. | **Phase 0** | Ready for Execution |
| **Configuration** | Secrets hardcoded in source code (`"secret"`). | 12-factor configuration via `.env` and `config.go`. | **Phase 0 & 2** | Ready for Execution |
| **Developer Workflow** | Ad-hoc shell commands; no Makefile. | Universal `make` targets across all tasks. | **Phase 1** | Ready for Execution |
| **DevOps & CI/CD** | No Docker, no Compose, no GitHub Actions. | Multi-stage Docker, Compose parity, automated CI. | **Phase 1** | Ready for Execution |
| **Database Access** | GORM ORM with GORM AutoMigrate. | SQLC type-safe code compiled from raw SQL. | **Phase 1, 3, 4, 5** | Ready for Execution |
| **Database Schemas** | Unversioned startup AutoMigration. | Explicit, reversible versioned SQL migrations (Goose). | **Phase 1** | Ready for Execution |
| **Transport Layer** | Controllers execute DB queries directly. | 5-tier Clean Architecture (Handlers $\rightarrow$ Services $\rightarrow$ Repos). | **Phase 2 & 3** | Ready for Execution |
| **Frontend Transport** | Dual path: Next rewrites vs direct Axios. | Centralized Axios client with error normalization. | **Phase 2** | Ready for Execution |
| **Frontend State** | Mixed `useEffect` fetches and Server Actions. | TanStack Query (Server) + Redux Toolkit (Client). | **Phase 2, 3, 4, 5** | Ready for Execution |
| **Layout & UI Bugs** | Duplicate sidebars; 404 on product detail. | Single sidebar shell; functional `/products/[id]`. | **Phase 0 & 4** | Ready for Execution |
| **Commerce Flow** | No Cart; Orders have GORM preload bugs. | Redux Cart; atomic checkout with Transaction Manager. | **Phase 5** | Ready for Execution |
| **Ticketing Subsystem** | Incomplete mockup with hardcoded strings. | Autonomous support domain with S3 attachments. | **Phase 6** | Ready for Execution |
| **Admin Dashboard** | Static fake charts; 6 dead chart files. | Real-time operational KPIs from SQLC aggregations. | **Phase 6** | Ready for Execution |
| **Caching & Protection**| Zero caching; no rate limiting. | Redis catalog caching and distributed rate limiting. | **Phase 4 & 7** | Ready for Execution |
| **Automated Testing** | 0 test files across entire repository. | Full test pyramid (Unit, Integration, Contract, E2E). | **Phase 1, 3, 4, 5, 7**| Ready for Execution |
| **Dead Code Pruning** | Unregistered controllers, broken `lib/auth.ts`. | Clean codebase free of dead files or unused tools. | **Phase 0 & 7** | Ready for Execution |
