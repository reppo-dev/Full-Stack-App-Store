# DashStack Enterprise Full-Stack Commerce & Operations Platform

[![CI Pipeline](https://github.com/reppo/Full-Stack-App-Store/actions/workflows/ci.yml/badge.svg)](https://github.com/reppo/Full-Stack-App-Store/actions/workflows/ci.yml)
[![Go Version](https://img.shields.io/badge/Go-1.25+-00ADD8?style=flat&logo=go)](https://go.dev/)
[![Next.js Version](https://img.shields.io/badge/Next.js-16.1.6-black?style=flat&logo=next.js)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat&logo=postgresql)](https://www.postgresql.org/)
[![Turbopack](https://img.shields.io/badge/Bundler-Turbopack-0070F3?style=flat)](https://turbo.build/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A high-throughput, enterprise-grade e-commerce storefront, support center, and real-time operational dashboard built on **Go Fiber Clean Architecture**, **PostgreSQL (SQLC + Goose Migrations)**, **Redis Caching**, and **Next.js 16 (App Router + Turbopack + Redux Toolkit + TanStack Query + Tailwind CSS v4 + Shadcn UI)**.

---

## 🌟 System Architecture & Subsystems

The application follows a **Modular Monolith** pattern designed for 1,000,000+ active users with strict behavioral parity, clean separation of concerns, and zero-IDOR perimeter security.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Next.js 16 Client & Dashboard                      │
│     Storefront  •  Cart Drawer  •  Two-Pane Support  •  Live Recharts       │
│     TanStack Query (Server State)   │   Redux Toolkit (Client UI State)     │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Centralized Axios Client (Tracing & Envelopes)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Go Fiber Backend API (Port 8000)                  │
│                                                                             │
│  [ Transport Layer ]   • Structured Slog • Request ID • Rate Limiter        │
│  [ Application ]       • Domain Services • DTOs • Transaction Manager       │
│  [ Domain Layer ]      • Entities • Repository Ports • Sentinel Errors      │
│  [ Infrastructure ]    • SQLC Typed Queries • Redis Cache • PgxPool         │
└──────────────────────┬───────────────────────────────┬──────────────────────┘
                       │                               │
                       ▼                               ▼
       ┌──────────────────────────────┐ ┌──────────────────────────────┐
       │   PostgreSQL 16 (app_store)  │ │      Redis 7 (Cache Engine)  │
       │  Goose Versioned Migrations  │ │  Catalog Caching & Rate-Limit│
       └──────────────────────────────┘ └──────────────────────────────┘
```

---

## 🎯 Platform Capabilities & Features

### 1. 🛡️ Identity, Authentication & RBAC
- **Multi-Role RBAC**: Strict separation between `customer` and `admin` roles.
- **Dual-Token Transport**: HTTP-only secure cookies with `Authorization: Bearer <token>` fallback.
- **Perimeter Protection**: Route-level middleware guards preventing unauthenticated destructive operations.
- **Account Profiles**: User self-profile inspection, update, and password changes.

### 2. 🛍️ Catalog Subsystem & Browsing
- **Hierarchical Categories**: Parent-child nested category trees (`/api/v1/categories/tree`).
- **Product Catalog**: High-performance paginated listings with search, category filtering, and sorting.
- **Customer Product Detail (`/products/[id]`)**: High-resolution gallery, price formatting, stock status, and add-to-cart.
- **Redis Caching**: Sub-millisecond catalog reads with automatic cache invalidation on writes.

### 3. 🛒 Commerce Transaction Lifecycle
- **Slideout Cart Drawer**: Redux Toolkit client cart with persistent storage, item counters, and header badges.
- **Zero-IDOR Wishlist**: Authenticated favorites subsystem enforcing user-scoped data access.
- **Atomic Checkout Pipeline**: Row-level inventory locking (`SELECT FOR UPDATE`), stock verification, order generation, and idempotent payment processing inside single atomic database transactions.
- **Order Management**: Customer order histories and admin export with in-memory CSV streaming.

### 4. 💬 Support Center & Ticketing Subsystem
- **Full Support Lifecycle**: State transitions (`open` $\rightarrow$ `in_progress` $\rightarrow$ `resolved` $\rightarrow$ `closed`).
- **Two-Pane Workspace (`/inbox`)**: Real-time ticket search, priority filtering (`urgent`, `high`, `medium`, `low`), and instant compose modal.
- **Internal Staff Notes**: Dedicated team notes (`is_internal: true`) highlighted with security badges, automatically hidden from customer view.
- **Direct Thread Deep Linking (`/inbox/[messageId]`)**: Responsive conversation interface with live status updater.

### 5. 📊 Executive Operations Dashboard
- **Live KPI Metrics**: Real-time calculations of Total Revenue, Orders by status, Active Users, Catalog count, and Open Tickets.
- **Interactive Recharts**:
  - **Revenue Analytics**: 30-day daily revenue area chart with smooth gradient fills and currency tooltips.
  - **Orders Breakdown**: Donut chart illustrating fulfillment proportions (Delivered, Pending, Processing, Cancelled).
  - **Category Sales**: Bar chart showcasing revenue contribution by product category.
- **Recent Feeds**: Live transaction tables for recent checkouts and incoming customer inquiries.

---

## 🛠 Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | [Next.js 16.1.6](https://nextjs.org/) (App Router, Turbopack, React 19) |
| **Frontend State** | [Redux Toolkit](https://redux-toolkit.js.org/) (UI State) & [TanStack Query v5](https://tanstack.com/query) (Server State) |
| **Styling & UI** | [Tailwind CSS v4](https://tailwindcss.com/), [Shadcn UI](https://ui.shadcn.com/), [Lucide Icons](https://lucide.dev/) |
| **Data Visualization**| [Recharts 2.15](https://recharts.org/) |
| **Backend Framework** | [Golang 1.25+](https://go.dev/) & [Fiber v2](https://gofiber.io/) |
| **Database Access** | [SQLC](https://sqlc.dev/) (Type-Safe Compiled Raw SQL) & [pgx/v5](https://github.com/jackc/pgx) |
| **Migrations** | [Goose](https://github.com/pressly/goose) Versioned SQL Migrations |
| **Databases** | [PostgreSQL 16](https://www.postgresql.org/) & [Redis 7](https://redis.io/) |
| **DevOps & Tooling** | Docker, Docker Compose, GitHub Actions CI, Root Makefile |

---

## 🚀 Quick Start Guide

### Option 1: Fast-Track via Docker Compose (Recommended)

Run the entire containerized stack with a single command:

```bash
# 1. Clone repository and copy environment configurations
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# 2. Launch containerized services
docker compose up -d
# Or using the Makefile:
make docker-up

# 3. Verify health
docker compose ps
```

The services will be immediately accessible at:
- **Frontend Storefront & Dashboard**: `http://localhost:3000`
- **Backend API Gateway**: `http://localhost:8000`
- **Liveness Health Check**: `http://localhost:8000/health/live`
- **Readiness Health Check**: `http://localhost:8000/health/ready`

---

### Option 2: Local Non-Containerized Development

#### Prerequisites
- **Go 1.25+**
- **Node.js 22+** & **pnpm 10+**
- **PostgreSQL 16** (Database name: `app_store`, Password: `password` or matching your `.env`)
- **Redis 7** (Optional, falls back cleanly if offline)

#### 1. Setup Environment Files
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

#### 2. Run Database Migrations & Seed Sample Data
```bash
cd backend

# Run versioned database migrations
goose -dir db/migrations postgres "host=localhost port=5432 user=postgres password=YOUR_PASSWORD dbname=app_store sslmode=disable" up

# Seed high-quality products, categories, demo users, orders & tickets
go run ./cmd/seed/main.go
```

#### 3. Start Backend Dev Server
```bash
cd backend
go run main.go
# Server listens on http://localhost:8000
```

#### 4. Start Frontend Dev Server
```bash
cd frontend
pnpm install
pnpm dev
# Next.js ready in ~2s on http://localhost:3000
```

---

## 🔑 Pre-Seeded Demo Accounts

When running the database seeder (`go run ./cmd/seed/main.go`), the following credentials are ready for instant testing:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@appstore.com` | `password123` | Full access to Executive Dashboard, Ticket Statuses, Product CRUD, User Management |
| **Customer** | `customer@appstore.com` | `password123` | Storefront browsing, Cart, Wishlist, Order Checkout, Submitting Support Tickets |

---

## 📋 Standard Developer Workflows (`Makefile`)

The root `Makefile` standardizes all core development lifecycles:

| Command | Description |
| :--- | :--- |
| `make dev` | Start backend in development mode |
| `make test` | Execute all Go backend unit and integration test suites |
| `make format` | Auto-format Go codebase with `gofmt` |
| `make build` | Compile Go binary and Next.js standalone production bundle |
| `make docker-up` | Launch PostgreSQL, Redis, Go backend, and Next.js in Docker |
| `make docker-down`| Terminate Docker Compose services and networks |
| `make migrate-up` | Apply pending Goose SQL database migrations |
| `make migrate-down`| Roll back the latest Goose database migration |
| `make sqlc-generate`| Recompile type-safe Go database repositories from SQL queries |
| `make ci` | Execute comprehensive pre-flight CI checks (format, build, test) |

---

## 🧪 Testing & Verification

### Backend Automated Test Suite
```bash
cd backend
go test -v ./...
```
- Covers `routes` integration, `service` business logic, security middleware, and transactional repositories.

### Frontend Type Safety & Production Build
```bash
cd frontend
pnpm exec tsc --noEmit
pnpm build
```
- Validates 100% strict TypeScript types and compiles Next.js 16 standalone production assets with 0 errors.

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
