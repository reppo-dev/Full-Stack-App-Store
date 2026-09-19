# Feature Specification: Phase 4 — Catalog Subsystem & Customer Browsing (Products & Categories)

**Status**: Active  
**Roadmap Alignment**: [`docs/modernization-roadmap.md`](../../docs/modernization-roadmap.md) (Phase 4: Days 19 - 25)  
**Target Architecture**: [`docs/target-architecture.md`](../../docs/target-architecture.md) (Section 2 & 3)  

---

## 1. Executive Overview

Phase 4 focuses on the core e-commerce catalog subsystem: **Products and Categories**. In the legacy codebase, products are queried directly with GORM without indexes, category endpoints were completely orphaned and never mounted to the router, Redis was not utilized for catalog caching, and the customer storefront had a broken link where clicking "see more" on product cards yielded a 404 error (`/products/[id]` was missing).

This phase establishes:
1. Versioned Goose migration for catalog indexing: `00002_catalog_indexes.sql`.
2. Type-safe SQL queries for categories and products compiled via SQLC.
3. Domain entities, repository interfaces, and Redis-cached repository adapters.
4. Application services (`ProductService`, `CategoryService`) with category hierarchy tree traversal, filtering, and pagination.
5. RESTful `/api/v1/products` and `/api/v1/categories` endpoints with standard JSON envelopes.
6. Frontend customer experience: canonical product detail page (`frontend/app/(main)/products/[id]/page.tsx`), banner deduplication, and typed catalog API clients.

---

## 2. User Stories & Acceptance Criteria

### User Story 1: Database Migration & SQLC Catalog Queries (Priority: P1)
As a backend engineer, I want optimized database indexes and type-safe SQLC queries for products and categories, so that high-throughput catalog reads execute with sub-millisecond database latency.

- **Acceptance Criteria**:
  - Goose migration `00002_catalog_indexes.sql` creates composite index on `products (category_id, is_active, created_at)` and indexes on `products (slug)` and `categories (parent_id)`.
  - `backend/db/queries/categories.sql` implements: `GetCategoryByID`, `GetCategoryBySlug`, `ListCategories`, `ListRootCategories`, `ListSubcategories`, `CreateCategory`, `UpdateCategory`, `DeleteCategory`.
  - `backend/db/queries/products.sql` implements: `GetProductByID`, `GetProductBySlug`, `ListProducts`, `ListProductsByCategory`, `CountProducts`, `CreateProduct`, `UpdateProduct`, `DeleteProduct`.
  - `sqlc generate` produces zero-warning Go code in `backend/internal/infrastructure/database/sqlc`.

### User Story 2: Pure Domain Core & Cached Repository Adapters (Priority: P1)
As a system architect, I want pure domain models (`Product`, `Category`) and repository adapters with Redis caching, so that product lookups and category tree queries are cached with automatic invalidation on updates.

- **Acceptance Criteria**:
  - Pure domain entities in `backend/internal/domain/entity/` (`product.go`, `category.go`).
  - Repository interfaces in `backend/internal/domain/repository/` (`product_repository.go`, `category_repository.go`).
  - `ProductRepositorySQLC` caches product by ID (`catalog:product:{id}`, TTL 1h) and invalidates key on update/delete.
  - `CategoryRepositorySQLC` caches category tree (`catalog:categories:tree`, TTL 24h) and invalidates on category mutation. Graceful degradation when Redis is offline.

### User Story 3: Application Services for Catalog Browsing (Priority: P1)
As a store customer, I want to browse products with pagination, category filtering, and category tree navigation, so that I can discover products seamlessly.

- **Acceptance Criteria**:
  - `ProductService` supports `GetByID`, `GetBySlug`, `List` (with pagination, active filtering, category filtering), `Create`, `Update`, and `Delete`.
  - `CategoryService` supports `GetByID`, `GetBySlug`, `List`, `GetCategoryTree` (hierarchical parent-child tree), `Create`, `Update`, and `Delete`.
  - Unit tests verify business logic, category hierarchy assembly, and pagination math.

### User Story 4: Standardized HTTP Transport & Category Mounting (Priority: P1)
As an API consumer, I want consistent `/api/v1/products` and `/api/v1/categories` endpoints returning standard JSON envelopes, with admin authorization guards on mutations.

- **Acceptance Criteria**:
  - `ProductHandler` and `CategoryHandler` implemented in `backend/internal/transport/http/handler/`.
  - Category routes (previously orphaned) properly mounted under `/api/v1/categories`.
  - Public catalog routes (`GET /api/v1/products`, `GET /api/v1/categories`, `GET /api/v1/categories/tree`) require no authentication.
  - Destructive/mutation routes (`POST`, `PUT`, `DELETE`) require `Authenticate` + `RequireRole("admin")`.
  - Legacy routes (`/api/products`, `/api/products/:id`) maintain backward compatibility.

### User Story 5: Frontend Customer Product Detail Page & Banner Deduplication (Priority: P1)
As a storefront visitor, I want to click "see more" on any product and view the full product detail page with price, rating, images, and descriptions, without encountering a 404 error.

- **Acceptance Criteria**:
  - Created `frontend/app/(main)/products/[id]/page.tsx` rendering product images carousel, title, price, description, rating, and stock status.
  - Deduplicated banner components to retain canonical component.
  - Created `frontend/lib/api/products.ts` and `frontend/lib/api/categories.ts` using centralized `apiClient`.
  - Zero TypeScript or lint errors in `frontend`.

---

## 3. Verification & Quality Gates
1. Goose migration applies cleanly: `goose up` succeeds on `app_store`.
2. Backend: `go test -v ./...` passes 100%.
3. Frontend: `pnpm exec tsc --noEmit` passes with 0 errors.
4. Production build: `pnpm build` executes cleanly.
