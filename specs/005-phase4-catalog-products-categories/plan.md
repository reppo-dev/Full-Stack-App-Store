# Implementation Plan: Phase 4 — Catalog Subsystem & Customer Browsing (Products & Categories)

**Spec**: [`spec.md`](spec.md) | **Date**: 2026-09-19 | **Status**: Execution Ready

---

## 1. Technical Strategy

1. **Migration**: Author `backend/db/migrations/00002_catalog_indexes.sql` adding composite indexes and seed roles, then run `goose up`.
2. **SQLC**: Author `backend/db/queries/categories.sql` and `backend/db/queries/products.sql`, then execute `sqlc generate`.
3. **Domain Layer**:
   - `backend/internal/domain/entity/category.go`
   - `backend/internal/domain/entity/product.go`
   - `backend/internal/domain/repository/category_repository.go`
   - `backend/internal/domain/repository/product_repository.go`
4. **Infrastructure**:
   - `backend/internal/infrastructure/database/repository/category_repository_sqlc.go`
   - `backend/internal/infrastructure/database/repository/product_repository_sqlc.go`
5. **Application Layer**:
   - `backend/internal/application/dto/product_dto.go`
   - `backend/internal/application/dto/category_dto.go`
   - `backend/internal/application/service/product_service.go` & `product_service_test.go`
   - `backend/internal/application/service/category_service.go` & `category_service_test.go`
6. **Transport Layer**:
   - `backend/internal/transport/http/handler/product_handler.go`
   - `backend/internal/transport/http/handler/category_handler.go`
   - Register routes in `backend/routes/routes.go` under `/api/v1/products` and `/api/v1/categories` and wire into `backend/main.go`.
7. **Frontend**:
   - `frontend/lib/api/products.ts` & `frontend/lib/api/categories.ts`
   - `frontend/app/(main)/products/[id]/page.tsx`
   - Banner deduplication
8. **Verification**: Full backend and frontend test suites and production builds.
