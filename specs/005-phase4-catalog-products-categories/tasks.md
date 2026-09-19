# Implementation Tasks: Phase 4 — Catalog Subsystem & Customer Browsing (Products & Categories)

**Feature**: [Phase 4 Specification](spec.md) | [Implementation Plan](plan.md)  
**Branch**: `main`  
**Date**: 2026-09-19  
**Status**: Ready for Execution  

---

## Phase 1: Database Migration & SQLC Queries (US1)
- [x] T001 [P] [US1] Author migration [`backend/db/migrations/00002_catalog_indexes.sql`](file:///g:/react/next-go/Full-Stack-App-Store/backend/db/migrations/00002_catalog_indexes.sql) adding composite index `idx_products_cat_active_created` on `products (category_id, is_active, created_at)` and default roles
- [x] T002 [US1] Apply migration `00002_catalog_indexes.sql` via Goose on `app_store` database
- [x] T003 [P] [US1] Author SQLC category queries in [`backend/db/queries/categories.sql`](file:///g:/react/next-go/Full-Stack-App-Store/backend/db/queries/categories.sql)
- [x] T004 [P] [US1] Author SQLC product queries in [`backend/db/queries/products.sql`](file:///g:/react/next-go/Full-Stack-App-Store/backend/db/queries/products.sql)
- [x] T005 [US1] Execute `sqlc generate` and verify compiled Go structs in `backend/internal/infrastructure/database/sqlc`

---

## Phase 2: Domain Layer (US2)
- [x] T006 [P] [US2] Define Category domain entity in [`backend/internal/domain/entity/category.go`](file:///g:/react/next-go/Full-Stack-App-Store/backend/internal/domain/entity/category.go)
- [x] T007 [P] [US2] Define Product domain entity in [`backend/internal/domain/entity/product.go`](file:///g:/react/next-go/Full-Stack-App-Store/backend/internal/domain/entity/product.go)
- [x] T008 [P] [US2] Define CategoryRepository port in [`backend/internal/domain/repository/category_repository.go`](file:///g:/react/next-go/Full-Stack-App-Store/backend/internal/domain/repository/category_repository.go)
- [x] T009 [P] [US2] Define ProductRepository port in [`backend/internal/domain/repository/product_repository.go`](file:///g:/react/next-go/Full-Stack-App-Store/backend/internal/domain/repository/product_repository.go)

---

## Phase 3: Infrastructure Adapters & Redis Caching (US2)
- [x] T010 [P] [US2] Implement SQLC CategoryRepository adapter in [`backend/internal/infrastructure/database/repository/category_repository_sqlc.go`](file:///g:/react/next-go/Full-Stack-App-Store/backend/internal/infrastructure/database/repository/category_repository_sqlc.go) with Redis caching for category tree
- [x] T011 [P] [US2] Implement SQLC ProductRepository adapter in [`backend/internal/infrastructure/database/repository/product_repository_sqlc.go`](file:///g:/react/next-go/Full-Stack-App-Store/backend/internal/infrastructure/database/repository/product_repository_sqlc.go) with Redis caching for product by ID and cache invalidation on write

---

## Phase 4: Application Services (US3)
- [x] T012 [P] [US3] Implement DTO structs in [`backend/internal/application/dto/category_dto.go`](file:///g:/react/next-go/Full-Stack-App-Store/backend/internal/application/dto/category_dto.go) and [`product_dto.go`](file:///g:/react/next-go/Full-Stack-App-Store/backend/internal/application/dto/product_dto.go)
- [x] T013 [P] [US3] Implement CategoryService and unit tests in [`backend/internal/application/service/category_service.go`](file:///g:/react/next-go/Full-Stack-App-Store/backend/internal/application/service/category_service.go) and `category_service_test.go`
- [x] T014 [P] [US3] Implement ProductService and unit tests in [`backend/internal/application/service/product_service.go`](file:///g:/react/next-go/Full-Stack-App-Store/backend/internal/application/service/product_service.go) and `product_service_test.go`

---

## Phase 5: HTTP Transport Layer & Mounting (US4)
- [x] T015 [P] [US4] Implement CategoryHandler in [`backend/internal/transport/http/handler/category_handler.go`](file:///g:/react/next-go/Full-Stack-App-Store/backend/internal/transport/http/handler/category_handler.go)
- [x] T016 [P] [US4] Implement ProductHandler in [`backend/internal/transport/http/handler/product_handler.go`](file:///g:/react/next-go/Full-Stack-App-Store/backend/internal/transport/http/handler/product_handler.go)
- [x] T017 [US4] Mount `/api/v1/categories` and `/api/v1/products` in [`backend/routes/routes.go`](file:///g:/react/next-go/Full-Stack-App-Store/backend/routes/routes.go) and wire dependencies in [`backend/main.go`](file:///g:/react/next-go/Full-Stack-App-Store/backend/main.go)
- [x] T018 [US4] Write integration test cases for V1 catalog endpoints in `backend/routes/routes_v1_test.go`

---

## Phase 6: Frontend Customer Experience & Detail Page (US5)
- [x] T019 [P] [US5] Implement catalog API clients in [`frontend/lib/api/products.ts`](file:///g:/react/next-go/Full-Stack-App-Store/frontend/lib/api/products.ts) and [`frontend/lib/api/categories.ts`](file:///g:/react/next-go/Full-Stack-App-Store/frontend/lib/api/categories.ts)
- [x] T020 [P] [US5] Create canonical customer product detail page in [`frontend/app/(main)/products/[id]/page.tsx`](file:///g:/react/next-go/Full-Stack-App-Store/frontend/app/(main)/products) resolving the 404 error
- [x] T021 [P] [US5] Deduplicate banner components between `bannerProducts.tsx` and `BannerCarousel.tsx`

---

## Phase 7: Verification & Build Quality
- [x] T022 Execute backend test suite via `go test -v ./...` in `backend/`
- [x] T023 Execute frontend typecheck via `pnpm exec tsc --noEmit` and build via `pnpm build` in `frontend/`
