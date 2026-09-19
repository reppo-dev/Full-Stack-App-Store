# Research & Technical Decisions: Phase 1 — Development Infrastructure, Containerization & CI Foundation

**Feature**: [Phase 1 Specification](spec.md)  
**Date**: 2026-09-15  
**Status**: Completed & Synchronized  

---

## 1. Containerization Architecture (Multi-Stage & Non-Root)

### Context
Constitution Principle XXIII mandates production-grade, isolated containerization:
- Multi-stage builds separating compilers and intermediate caches from the final runtime image.
- Dedicated non-root execution (`UID > 1000`) to prevent container escape escalation.
- Zero development dependencies or server-side secrets leaked in client-facing or runtime layers.

### Decision
1. **Backend Dockerfile (`backend/Dockerfile`)**:
   - **Builder Stage**: `golang:1.24-alpine` (or `golang:1.26-alpine`).
     - Install `git`, `ca-certificates`, `tzdata`.
     - Set `CGO_ENABLED=0` and `GOOS=linux`.
     - Cache modules using `COPY go.mod go.sum` before source code.
     - Compile optimized static binary with `-ldflags="-w -s"`.
   - **Runtime Stage**: `alpine:3.21` (minimal, secure footprint < 20 MB).
     - Create dedicated unprivileged user and group: `addgroup -g 10001 -S appgroup && adduser -u 10001 -S appuser -G appgroup`.
     - Copy CA certificates from builder stage for outbound HTTPS calls.
     - Copy compiled binary `server` into `/app/server`.
     - Set `USER 10001:10001`.
     - Expose port `8000`.
     - Health check via `wget --spider -q http://localhost:8000/health/live || exit 1`.

2. **Frontend Dockerfile (`frontend/Dockerfile`)**:
   - **Base Stage**: `node:22-alpine` with `pnpm` enabled via `corepack enable`.
   - **Builder Stage**:
     - `COPY package.json pnpm-lock.yaml ./`.
     - `RUN pnpm install --frozen-lockfile`.
     - `COPY . .`.
     - Build with standalone target: ensure `next.config.ts` includes `output: "standalone"`.
     - Run `pnpm build`.
   - **Runner Stage**: `node:22-alpine` (minimal Node runtime).
     - Create dedicated non-root user: `addgroup -g 1001 -S nodejs && adduser -u 1001 -S nextjs -G nodejs`.
     - Copy standalone output:
       - `COPY --from=builder /app/.next/standalone ./`
       - `COPY --from=builder /app/.next/static ./.next/static`
       - `COPY --from=builder /app/public ./public`
     - Set permissions and `USER nextjs:nodejs`.
     - Expose port `3000`.
     - Run `node server.js`.

### Alternatives Considered
- **Distroless (`gcr.io/distroless/static-debian12:nonroot`) for Go**: Provides maximum immutability but lacks built-in `wget`/`curl` for native Docker healthchecks without external binary mounting. Alpine with a non-root user provides both a tiny attack surface (<20MB) and native health checking.
- **Full Node Image for Next.js**: Rejected due to image weight (~1 GB vs. ~120 MB with standalone Alpine output).

---

## 2. Local Infrastructure Orchestration (Docker Compose)

### Context
Constitution Principle XXIV mandates reproducible local infrastructure using version-pinned PostgreSQL 16 and Redis 7, with environment-driven configuration and zero hardcoded secrets.

### Decision
1. **Root `docker-compose.yml` Service Topology**:
   - **`postgres`**: Image `postgres:16-alpine`.
     - Environment mapped from root `.env` (`POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`).
     - Persistent volume `postgres_data:/var/lib/postgresql/data`.
     - Healthcheck: `test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-postgres} -d ${DB_NAME:-postgres}"]`, interval 5s, timeout 5s, retries 5.
   - **`redis`**: Image `redis:7-alpine`.
     - Command: `redis-server --save "" --appendonly no` (ephemeral caching profile for development, zero disk overhead).
     - Healthcheck: `test: ["CMD", "redis-cli", "ping"]`, interval 5s, timeout 3s, retries 5.
   - **`backend`**: Builds `backend/Dockerfile`.
     - Environment: `PORT=8000`, `DB_HOST=postgres`, `DB_PORT=5432`, `DB_USER=${DB_USER}`, `DB_PASSWORD=${DB_PASSWORD}`, `DB_NAME=${DB_NAME}`, `DB_SSLMODE=disable`, `REDIS_HOST=redis`, `REDIS_PORT=6379`, `JWT_SECRET=${JWT_SECRET}`.
     - `depends_on`: `postgres: { condition: service_healthy }`, `redis: { condition: service_healthy }`.
     - Ports: `8000:8000`.
   - **`frontend`**: Builds `frontend/Dockerfile`.
     - Environment: `NEXT_PUBLIC_API_URL=http://localhost:8000`, `PORT=3000`.
     - Ports: `3000:3000`.
     - `depends_on`: `backend: { condition: service_started }`.

2. **Network & Volume Configuration**:
   - Internal bridge network `dashstack-network`.
   - Named volume `postgres_data` with standard local driver.

---

## 3. Database Migration Architecture with Goose

### Context
Constitution Principle I & Principle XXXV mandate replacing GORM's `AutoMigrate` with independent, versioned raw SQL migrations. Goose is the chosen engine due to pure SQL file formats, transactional DDL execution, rollback support, and future compatibility with SQLC.

### Current 12-Model Entity Extraction Matrix
Based on empirical analysis of `backend/models/*.go`:

| Table Name | Entity Model | Primary Key | Key Columns & Types | Foreign Keys & Relationships |
| :--- | :--- | :--- | :--- | :--- |
| `users` | `User` | `id BIGSERIAL` | `first_name VARCHAR(50)`, `last_name VARCHAR(50)`, `image TEXT`, `user_name VARCHAR(50) UNIQUE`, `phone_number VARCHAR(20)`, `date_of_birth TIMESTAMPTZ`, `email VARCHAR(255) UNIQUE NOT NULL`, `password VARCHAR(255) NOT NULL`, `role_id BIGINT DEFAULT 1` | FK to `roles(id)` |
| `roles` | `Role` | `id BIGSERIAL` | `name VARCHAR(100)` | Many2Many with `permissions` |
| `permissions` | `Permission` | `id BIGSERIAL` | `name VARCHAR(100)` | Many2Many with `roles` |
| `role_permission` | Join Table | `(role_id, permission_id)` | Composite PK | FKs to `roles(id)` and `permissions(id)` |
| `categories` | `Category` | `id BIGSERIAL` | `name VARCHAR(120) NOT NULL`, `slug VARCHAR(120) UNIQUE`, `parent_id BIGINT` | Self-referencing FK to `categories(id)` |
| `tags` | `Tag` | `id BIGSERIAL` | `name VARCHAR(100)`, `slug VARCHAR(100)` | Many2Many with `products` |
| `products` | `Product` | `id BIGSERIAL` | `title VARCHAR(200) NOT NULL`, `slug VARCHAR(200) UNIQUE`, `description TEXT`, `price DECIMAL(10,2) NOT NULL`, `stock INT`, `rating DOUBLE PRECISION`, `images JSONB`, `colors JSONB`, `attributes JSONB`, `category_id BIGINT`, `sku VARCHAR(100) UNIQUE`, `is_active BOOLEAN DEFAULT true` | FK to `categories(id)` |
| `product_tags` | Join Table | `(product_id, tag_id)` | Composite PK | FKs to `products(id)` and `tags(id)` |
| `colors` | `Color` | `id BIGSERIAL` | `name VARCHAR(50) NOT NULL`, `code VARCHAR(7)` | Many2Many with `products` |
| `product_colors` | Join Table | `(product_id, color_id)` | Composite PK | FKs to `products(id)` and `colors(id)` |
| `orders` | `Order` | `id BIGSERIAL` | `first_name VARCHAR(100)`, `last_name VARCHAR(100)`, `email VARCHAR(255)` | One2Many with `order_items` |
| `order_items` | `OrderItem` | `id BIGSERIAL` | `order_id BIGINT`, `product_title VARCHAR(200)`, `price REAL`, `quantity BIGINT` | FK to `orders(id)` |
| `favorites` | `Favorite` | `id BIGSERIAL` | `user_id BIGINT NOT NULL`, `product_id BIGINT NOT NULL`, UNIQUE(`user_id`, `product_id`) | FKs to `users(id)` and `products(id)` |
| `labels` | `Label` | `id BIGSERIAL` | `user_id BIGINT NOT NULL`, `name VARCHAR(100) NOT NULL`, `color_code VARCHAR(7) DEFAULT '#808080'`, UNIQUE(`user_id`, `name`) | FK to `users(id)` |
| `messages` | `Message` | `id BIGSERIAL` | `sender_id BIGINT`, `recipient_id BIGINT`, `subject VARCHAR(200)`, `snippet TEXT`, `body TEXT`, `is_read BOOL DEFAULT false`, `is_starred BOOL DEFAULT false`, `is_important BOOL DEFAULT false`, `is_trashed BOOL DEFAULT false`, `is_draft BOOL DEFAULT false` | FKs to `users(id)` |
| `message_labels` | Join Table | `(message_id, label_id)` | Composite PK | FKs to `messages(id)` and `labels(id)` |

*Note: All GORM models embedded with `gorm.Model` include `created_at TIMESTAMPTZ`, `updated_at TIMESTAMPTZ`, and `deleted_at TIMESTAMPTZ` (soft delete with partial index).*

### Decision
1. **Migration Tooling**:
   - Direct integration of Goose via Go CLI (`go install github.com/pressly/goose/v3/cmd/goose@latest`) and wrapper scripts / Makefile targets.
   - Migration folder convention: `backend/db/migrations/`.
2. **Baseline Migration (`00001_initial_schema.sql`)**:
   - Write paired `-- +goose Up` and `-- +goose Down` sections.
   - Up creates the exact 12 business tables, 4 join tables, indexes, unique constraints, and foreign key cascades.
   - Down executes `DROP TABLE IF EXISTS ... CASCADE;` in strict reverse dependency order.
3. **Idempotency & Safety Invariants**:
   - Use `CREATE TABLE IF NOT EXISTS` and `CREATE INDEX IF NOT EXISTS`.
   - Wrap statements in atomic transactions (`-- +goose StatementBegin ... -- +goose StatementEnd`).

---

## 4. Discoverable Developer Workflows via Root Makefile

### Context
Constitution Principle XXV mandates a single root `Makefile` standardizing common operations across backend, frontend, database, and Docker environments.

### Decision
Codify standard targets:
- `make help`: Self-documenting target list parsed from comments.
- `make dev`: Concurrently runs backend and frontend in development mode.
- `make test`: Runs `go test -v ./...` in backend and frontend verification.
- `make lint`: Runs `golangci-lint run` (or `gofmt -l`) in backend and `pnpm lint` in frontend.
- `make format`: Runs `gofmt -w .` in backend and prettier/formatter in frontend.
- `make build`: Compiles Go binary and runs `pnpm build`.
- `make docker-up`: Runs `docker compose up -d`.
- `make docker-down`: Runs `docker compose down`.
- `make migrate-up`: Executes `goose -dir backend/db/migrations postgres "<DSN>" up`.
- `make migrate-down`: Executes `goose -dir backend/db/migrations postgres "<DSN>" down`.
- `make migrate-status`: Checks current migration version.
- `make migrate-create`: Scaffolds a new `.sql` migration pair.
- `make ci`: Runs full local pre-flight suite matching CI gates.

---

## 5. Continuous Integration (CI) Pipeline Architecture

### Context
Constitution Principle XXVI mandates automated verification on all Pull Requests and merges to `main`, executing formatting, compilation, testing, typechecking, and Docker builds.

### Decision
1. **Workflow File**: `.github/workflows/ci.yml`.
2. **Triggers**: `pull_request: branches: [main]`, `push: branches: [main]`.
3. **Jobs Matrix**:
   - **`backend-ci`**:
     - Runner: `ubuntu-latest`.
     - Toolchain: `actions/setup-go@v5` (Go 1.24/1.26 with Go module caching).
     - Steps:
       1. `gofmt -l .` verification.
       2. `go vet ./...`.
       3. `go build ./...`.
       4. `go test -v -race -cover ./...`.
   - **`frontend-ci`**:
     - Runner: `ubuntu-latest`.
     - Toolchain: `actions/setup-node@v4` (Node 22), `pnpm/action-setup@v4` (pnpm 10 with store cache).
     - Steps:
       1. `pnpm install --frozen-lockfile`.
       2. `pnpm exec tsc --noEmit`.
       3. `pnpm lint` (if configured/passing).
       4. `pnpm build`.
   - **`docker-build-ci`**:
     - Runner: `ubuntu-latest`.
     - Needs: `[backend-ci, frontend-ci]`.
     - Steps:
       1. `docker build -t dashstack-backend:test backend/`.
       2. `docker build -t dashstack-frontend:test frontend/`.
4. **CI/CD Boundary (Clarification 1 Resolution)**:
   - Automated deployment (CD) is strictly omitted in Phase 1. The target architecture is recorded as Single Cloud VM / VPS with Docker Compose and Reverse Proxy (Nginx/Caddy) for execution in Phase 5.

---

## 6. Operational Health Probes & Graceful Readiness

### Context
Constitution Principle XXX mandates standardized health check semantics:
- Liveness probe confirms HTTP process responsiveness.
- Readiness probe confirms database connectivity before accepting user traffic.

### Decision
1. **Endpoints**:
   - `GET /health/live`: Returns HTTP 200 `{"status": "UP", "timestamp": "..."}` without touching external resources.
   - `GET /health/ready`: Executes a fast SQL ping (`db.Raw("SELECT 1")` or `sqlDB.Ping()`).
     - If ping succeeds: HTTP 200 `{"status": "READY", "database": "UP"}`.
     - If ping fails: HTTP 503 `{"status": "DOWN", "database": "DOWN"}`.
2. **Mounting**:
   - Mounted as public, unauthenticated routes in `backend/routes/routes.go`.
