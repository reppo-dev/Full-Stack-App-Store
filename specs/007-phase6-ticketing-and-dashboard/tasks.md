# Implementation Tasks: Phase 6 — Support, Intelligence & Operations (Ticketing & Dashboard)

**Branch**: `main`  
**Date**: 2026-09-19  
**Status**: In Progress  

---

## Phase 1: Database Migration & SQLC Queries
- [x] T001 Author migration `backend/db/migrations/00004_ticketing_and_analytics.sql` (tickets, ticket_messages, ticket_attachments, indexes)
- [x] T002 Apply migration `00004_ticketing_and_analytics.sql` via Goose on `app_store`
- [x] T003 Author SQLC queries in `backend/db/queries/tickets.sql`
- [x] T004 Author SQLC queries in `backend/db/queries/dashboard.sql`
- [x] T005 Run `sqlc generate` and verify compiled Go structs in `backend/internal/infrastructure/database/sqlc`

---

## Phase 2: Domain Layer & Repository Ports
- [x] T006 Define Ticket, TicketMessage, TicketAttachment entities and status enums in `backend/internal/domain/entity/ticket.go`
- [x] T007 Add ticketing sentinel errors in `backend/internal/domain/errors.go`
- [x] T008 Define TicketRepository port in `backend/internal/domain/repository/ticket_repository.go`
- [x] T009 Define DashboardRepository port in `backend/internal/domain/repository/dashboard_repository.go`

---

## Phase 3: Infrastructure Adapters
- [x] T010 Implement TicketRepositorySQLC in `backend/internal/infrastructure/database/repository/ticket_repository_sqlc.go`
- [x] T011 Implement DashboardRepositorySQLC in `backend/internal/infrastructure/database/repository/dashboard_repository_sqlc.go`

---

## Phase 4: Application Services & DTOs
- [x] T012 Implement TicketDTOs & DashboardDTOs in `backend/internal/application/dto/`
- [x] T013 Implement TicketService and unit tests in `backend/internal/application/service/ticket_service.go` & `ticket_service_test.go`
- [x] T014 Implement DashboardService and unit tests in `backend/internal/application/service/dashboard_service.go` & `dashboard_service_test.go`

---

## Phase 5: HTTP Transport Layer & Route Mounting
- [x] T015 Implement TicketHandler in `backend/internal/transport/http/handler/ticket_handler.go`
- [x] T016 Implement DashboardHandler in `backend/internal/transport/http/handler/dashboard_handler.go`
- [x] T017 Mount `/api/v1/tickets` and `/api/v1/dashboard` in `backend/routes/routes.go` and wire in `backend/main.go`
- [x] T018 Add integration tests in `backend/routes/routes_v1_test.go` and verify `go test -v ./...` passes

---

## Phase 6: Frontend API Clients & Support Ticketing UI
- [x] T019 Implement `frontend/lib/api/tickets.ts` and `frontend/lib/api/dashboard.ts`
- [x] T020 Build two-pane Ticket Management interface in `frontend/app/(dashboard)/(inbox)/inbox/page.tsx` and `BoxMessage.tsx`
- [x] T021 Connect `inbox/[messageId]/page.tsx` to live ticket conversation thread and reply input

---

## Phase 7: Frontend Operational Dashboard with Live Analytics
- [x] T022 Modernize `frontend/app/(dashboard)/dashboard/page.tsx` with live KPI cards and real Recharts
- [x] T023 Clean up and retire dead/unused mock charts in `frontend/app/(dashboard)/components/dashboard/`

---

## Phase 8: Verification & Build Quality
- [x] T024 Run backend test suite via `go test -v ./...` in `backend/`
- [x] T025 Run frontend typecheck via `pnpm exec tsc --noEmit` and build via `pnpm build` in `frontend/`
- [x] T026 Update walkthrough artifact and notify user
