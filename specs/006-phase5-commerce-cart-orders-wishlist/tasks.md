# Implementation Tasks: Phase 5 — Commerce Transaction Lifecycle (Cart, Wishlist, Orders, Payments)

**Branch**: `main`  
**Date**: 2026-09-19  
**Status**: In Progress  

---

## Phase 1: Database Migration & SQLC Queries
- [x] T001 Author migration `backend/db/migrations/00003_commerce_tables.sql` (orders upgrade, order_items upgrade, payments table, indexes)
- [x] T002 Apply migration `00003_commerce_tables.sql` via Goose on `app_store`
- [x] T003 Author SQLC queries in `backend/db/queries/favorites.sql`
- [x] T004 Author SQLC queries in `backend/db/queries/orders.sql`
- [x] T005 Run `sqlc generate` and verify compiled Go structs in `backend/internal/infrastructure/database/sqlc`

---

## Phase 2: Domain Layer & Repository Ports
- [x] T006 Define Order & OrderItem entities in `backend/internal/domain/entity/order.go`
- [x] T007 Define Favorite entity in `backend/internal/domain/entity/favorite.go`
- [x] T008 Define Payment entity in `backend/internal/domain/entity/payment.go`
- [x] T009 Add commerce sentinel errors to `backend/internal/domain/errors.go`
- [x] T010 Define OrderRepository port in `backend/internal/domain/repository/order_repository.go`
- [x] T011 Define FavoriteRepository port in `backend/internal/domain/repository/favorite_repository.go`

---

## Phase 3: Infrastructure Adapters & Unit of Work
- [x] T012 Implement TransactionManager in `backend/internal/infrastructure/database/transaction.go`
- [x] T013 Implement OrderRepositorySQLC in `backend/internal/infrastructure/database/repository/order_repository_sqlc.go`
- [x] T014 Implement FavoriteRepositorySQLC in `backend/internal/infrastructure/database/repository/favorite_repository_sqlc.go`

---

## Phase 4: Application Services & DTOs
- [x] T015 Implement OrderDTOs & FavoriteDTOs in `backend/internal/application/dto/`
- [x] T016 Implement OrderService and unit tests in `backend/internal/application/service/order_service.go`
- [x] T017 Implement FavoriteService and unit tests in `backend/internal/application/service/favorite_service.go`

---

## Phase 5: HTTP Transport Layer & Route Mounting
- [x] T018 Implement OrderHandler in `backend/internal/transport/http/handler/order_handler.go`
- [x] T019 Implement FavoriteHandler in `backend/internal/transport/http/handler/favorite_handler.go`
- [x] T020 Mount `/api/v1/orders` and `/api/v1/favorites` in `backend/routes/routes.go` and wire dependencies in `backend/main.go`
- [x] T021 Author integration tests in `backend/routes/routes_v1_test.go` and verify `go test -v ./...` passes

---

## Phase 6: Frontend State, Cart Subsystem & Wishlist Unification
- [x] T022 Implement Redux `cartSlice.ts` in `frontend/lib/redux/slices/cartSlice.ts` and register in `store.ts`
- [x] T023 Implement `CartDrawer.tsx` in `frontend/components/cart/CartDrawer.tsx` and integrate cart icon into `frontend/components/header/Header.tsx`
- [x] T024 Implement `frontend/lib/api/orders.ts` and `frontend/lib/api/favorites.ts`
- [x] T025 Unify `frontend/app/(main)/favorite/page.tsx` and `frontend/components/button-favorite.tsx` using `favoritesApi`
- [x] T026 Update `frontend/app/(main)/orderlist/page.tsx` and checkout integration using `ordersApi`

---

## Phase 7: Verification & Build Quality
- [x] T027 Execute backend test suite via `go test -v ./...` in `backend/`
- [x] T028 Execute frontend typecheck via `pnpm exec tsc --noEmit` and build via `pnpm build` in `frontend/`
- [x] T029 Update walkthrough artifact and notify user
