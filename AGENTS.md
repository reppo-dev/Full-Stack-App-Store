# DashStack Project Guide for AI Agents

> **MANDATORY**: Before writing ANY code, read `.specify/memory/constitution.md` (44 principles).
> This file is the single source of truth for architecture decisions.

## Project Overview

- **Stack**: Next.js 15 (frontend) + Go Fiber (backend) + PostgreSQL
- **Frontend**: `frontend/` - Next.js with App Router, Shadcn UI, Tailwind
- **Backend**: `backend/` - Go Fiber with Clean Architecture (SQLC) + Legacy GORM controllers
- **Database**: PostgreSQL `app_store` on localhost:5432, password: `13802002`
- **Language**: English only (no Persian/Farsi strings in UI)

## Critical Rules

1. **NEVER use GORM for new code**. Use SQLC only. See `backend/internal/` for examples.
2. **NEVER use `backend/controllers/`** for new endpoints. Use `backend/internal/transport/http/handler/`.
3. **All new API routes** go under `/api/v1/` in `backend/routes/routes.go`.
4. **All new frontend API calls** use `frontend/lib/api/client.ts` base client.
5. **All migrations** go in `backend/db/migrations/` using Goose format.
6. **All SQLC queries** go in `backend/db/queries/` and run `sqlc generate`.

## Known Issues and Bugs (MUST FIX)

### A. Broken Routes (404 errors)

1. **/pricing page is MISSING**. Link exists in `frontend/components/appSidebar.tsx` line 42 and `frontend/app/(dashboard)/components/SidebarDash.tsx` line 48. No page file exists. CREATE `frontend/app/(main)/pricing/page.tsx`.

2. **/todo page is MISSING**. Link in SidebarDash.tsx line 50. No page exists.

3. **/invoice page is MISSING**. Link in SidebarDash.tsx line 52. No page exists.

4. **/uiElements page is MISSING**. Link in SidebarDash.tsx line 53. No page exists.

5. **/team page is MISSING**. Link in SidebarDash.tsx line 54. No page exists.

6. **/table page is MISSING**. Link in SidebarDash.tsx line 55. No page exists.

7. **/settings page is MISSING**. Link in SidebarDash.tsx line 58 and appSidebar.tsx line 46. No page exists.

8. **/productstock page is MISSING**. Link in SidebarDash.tsx line 44. No page exists.

9. **/dashboard/user has no index page**. Only `[id]/page.tsx` exists inside it. Direct navigation to `/dashboard/user` returns 404.

### B. Broken Images (Console 404 spam)

10. **Calendar page** (`frontend/components/page/calendar/Calendar.tsx`) references images that DO NOT EXIST: `/events/event1.jpg` through `/events/event12.jpg` and `/users/u1.jpg` through `/users/u36.jpg`. The `frontend/public/` folder has NO `events/` or `users/` subdirectory. FIX: Replace hardcoded local paths with Unsplash URLs or Lucide React SVG avatars.

### C. User-to-Dashboard Connection Bugs

11. **Sidebar links go to wrong routes for regular users**. In `frontend/components/appSidebar.tsx`:
    - Line 34: Favorites links to `/favorites` (WRONG - this is inside dashboard layout, blocked for non-admin). MUST change to `/favorite` (the customer page at `frontend/app/(main)/favorite/page.tsx`).
    - Line 35: Inbox links to `/inbox` (WRONG - also inside dashboard layout). Regular users get redirected to `/` because dashboard layout.tsx checks isAdmin on line 58.

12. **AuthButtons.tsx has NO dropdown menu**. File: `frontend/components/header/AuthButtons.tsx`. After login, only shows avatar and bell icon with ZERO clickable links. User cannot navigate to profile, orders, wishlist, or dashboard. MUST add a DropdownMenu with links to: `/favorite` (My Wishlist), `/orderlist` (My Orders), `/dashboard` (Admin Panel - only if role_id=2), and a Logout button.

13. **HeaderDashboard.tsx shows hardcoded dummy text**. File: `frontend/app/(dashboard)/components/HeaderDashboard.tsx` lines 39-40 show literal text `name` and `role` instead of actual user data. Dropdown menu items (Profile, Billing, Team, Subscription) have NO href links.

### D. Misplaced Pages

14. **Contact page is actually a Create User form**. File: `frontend/app/(dashboard)/contact/page.tsx` is labeled "Contact" in sidebar but contains a "Create an user" form with password field. This is NOT a contact page. Either rename to "Create User" or replace with actual contact functionality.

### E. Dead Code and Duplicate Components

15. **`frontend/components/cardLandigpage.tsx`** is DEAD CODE. It is NOT imported anywhere. DELETE it.

16. **`frontend/components/bannerProducts.tsx`** is a useless 6-line wrapper around BannerCarousel. Inline it or DELETE it.

17. **Duplicate card components exist**:
    - `frontend/components/cardProductsmain.tsx` = storefront product card
    - `frontend/app/(dashboard)/components/product/cardProduct.tsx` = dashboard product card
    - These have inconsistent naming. Consider unifying or at least using consistent naming.

18. **Duplicate banner components exist**:
    - `frontend/components/BannerCarousel.tsx` = storefront banner
    - `frontend/app/(dashboard)/components/product/banner.tsx` = dashboard banner preview
    - `frontend/components/bannerProducts.tsx` = unnecessary wrapper

## Architecture Guide

### Backend Structure (Clean Architecture)

- `backend/controllers/` = LEGACY GORM controllers. DO NOT add new code here.
- `backend/internal/domain/entity/` = Domain entities
- `backend/internal/domain/repository/` = Repository interfaces (ports)
- `backend/internal/application/dto/` = Data Transfer Objects
- `backend/internal/application/service/` = Business logic services
- `backend/internal/infrastructure/database/repository/` = SQLC implementations
- `backend/internal/infrastructure/database/sqlc/` = Auto-generated (DO NOT EDIT)
- `backend/internal/transport/http/handler/` = HTTP handlers for /api/v1/
- `backend/internal/transport/http/middleware/` = Auth and RBAC middleware
- `backend/db/migrations/` = Goose SQL migrations (00001 through 00005)
- `backend/db/queries/` = SQLC query files
- `backend/routes/routes.go` = All route registrations
- `backend/main.go` = Entry point with dependency injection

### Frontend Structure

- `frontend/app/(main)/` = Customer-facing storefront pages
- `frontend/app/(dashboard)/` = Admin-only dashboard (guarded by role_id=2)
- `frontend/app/(auth)/` = Login and signup pages
- `frontend/components/` = Shared components (header, cart, landing, ui)
- `frontend/components/landing/` = Landing page sections (Digikala-style)
- `frontend/app/(dashboard)/components/` = Dashboard-specific components
- `frontend/lib/api/` = API client modules (auth, products, orders, tickets, etc.)
- `frontend/lib/redux/` = Redux store and slices (cart)
- `frontend/models/modles.ts` = TypeScript interfaces for all entities

### API Routes Summary

All V1 routes are in `backend/routes/routes.go`:
- `/api/v1/auth/` = register, login, logout, me, password
- `/api/v1/users/` = CRUD (admin only)
- `/api/v1/products/` = list, get, get-by-slug, CRUD (admin)
- `/api/v1/categories/` = list, tree, CRUD (admin)
- `/api/v1/orders/` = create, my-orders, list-all (admin), export CSV
- `/api/v1/favorites/` = list, add, check, remove
- `/api/v1/tickets/` = create, list, get, messages, status, assign
- `/api/v1/dashboard/metrics` = aggregated analytics (admin)
- `/api/v1/banners/` = list-active, get, CRUD (admin)

### Database

- PostgreSQL on `localhost:5432`, database `app_store`, password `13802002`
- Migrations: `backend/db/migrations/` (00001 through 00005)
- SQLC config: `backend/sqlc.yaml`
- After adding new queries, run: `cd backend && sqlc generate`

## Prioritized Roadmap

### Phase 1 (High Priority): Fix broken navigation
- Fix sidebar links for regular users (issue 11)
- Add user dropdown menu to AuthButtons.tsx (issue 12)
- Fix HeaderDashboard.tsx dummy text (issue 13)

### Phase 2 (Medium Priority): Create missing pages
- Create /pricing page (issue 1)
- Create placeholder pages for /todo, /invoice, /team, /table, /settings (issues 2-8)
- Fix calendar broken images (issue 10)

### Phase 3 (Low Priority): Clean up code
- Delete dead code files (issues 15-16)
- Restructure component folders for consistency (issues 17-18)
- Rename contact page or replace with correct content (issue 14)

### Phase 4 (Future): Migrate legacy controllers
- Move all `backend/controllers/*.go` logic to `backend/internal/` clean architecture
- Remove legacy `/api/` routes, keep only `/api/v1/`
- Update any frontend code still calling legacy endpoints
