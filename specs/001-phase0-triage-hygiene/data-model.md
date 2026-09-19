# Data Model & Configuration Schemas: Phase 0 — Triage, Compilation Integrity & Perimeter Security Hygiene

**Feature**: [Phase 0 Specification](../spec.md)  
**Date**: 2026-09-14  
**Last Updated**: 2026-09-15  
**Status**: Completed & Synchronized  

> **CRITICAL ARCHITECTURAL BOUNDARY**: Phase 0 does **NOT** alter the PostgreSQL database schema or introduce any new database tables (the `user_sessions` table specified in Constitution Principle XLIV is explicitly scheduled for **Phase 3**). The entities below govern process configuration, route security mapping, and edge middleware state.

---

## 1. Backend Environment Configuration Schema (`EnvironmentConfig`)

Represents the environment variables consumed by `backend/main.go`, `backend/databases/conected.go`, and `backend/util/jwt.go`. In local development, these variables are loaded via `github.com/joho/godotenv`.

| Variable Name | Type | Required | Default Value (Local Dev) | Description |
| :--- | :--- | :---: | :--- | :--- |
| `PORT` | Integer / String | No | `"8000"` | HTTP server listening port bound in `main.go`. |
| `DB_HOST` | String | No | `"localhost"` | PostgreSQL server hostname or IP. |
| `DB_PORT` | Integer / String | No | `"5432"` | PostgreSQL listening port. |
| `DB_USER` | String | No | `"postgres"` | PostgreSQL database user. |
| `DB_PASSWORD` | String | No | `"postgres"` | PostgreSQL database password. |
| `DB_NAME` | String | No | `"shoppy"` | PostgreSQL database name. |
| `DB_SSLMODE` | String | No | `"disable"` | SSL connection mode (`disable`, `require`, `verify-full`). |
| `JWT_SECRET` | String | Yes (Prod) | `"dev-insecure-secret-change-me"` | Secret key used for signing and verifying HMAC-SHA256 JWTs. |

### Validation & Security Invariants
- `PORT` and `DB_PORT` must be valid port integers between 1 and 65535.
- Sensitive secrets in production must NOT use false-security fallbacks (like `"secret"` or `"password"`).
- In production (`NODE_ENV=production` or `APP_ENV=production`), `JWT_SECRET` must be at least 32 cryptographically random bytes; default or empty values must halt startup.

---

## 2. Protected Route Perimeter & Authorization Mapping (`ProtectedRouteRule`)

Governs which HTTP routes in `backend/routes/routes.go` require `IsAuthenticated` and temporary Phase 0 authorization guards (`RequireAdmin` or caller ownership verification).

| HTTP Method | Route Path | Handler Function | Security Gate | Rejection Status |
| :--- | :--- | :--- | :--- | :---: |
| `POST` | `/api/register` | `controllers.Register` | **Public** | None |
| `POST` | `/api/login` | `controllers.Login` | **Public** | None |
| `GET` | `/api/products` | `controllers.AllProduct` | **Public** | None |
| `GET` | `/api/productss` | `controllers.AllProducts` | **Public** | None |
| `GET` | `/api/products/:id` | `controllers.GetProduct` | **Public** | None |
| `GET` | `/api/user` | `controllers.User` | `IsAuthenticated` | `401` |
| `PUT` | `/api/updateinfo` | `controllers.UpdateInfo` | `IsAuthenticated` (binds to token ID) | `401` |
| `PUT` | `/api/updatepassword`| `controllers.UpdatePassword`| `IsAuthenticated` (binds to token ID) | `401` |
| `GET` | `/getorderbyemail` | `controllers.GetUserOrders`| `IsAuthenticated` (binds to token ID) | `401` |
| `GET` | `/api/favorites/:id` | `controllers.AllFavorite` | `IsAuthenticated` + `:id == caller.ID` | `401` / `403` |
| `POST` | `/api/favorites` | `controllers.AddFavorite` | `IsAuthenticated` + `UserID == caller.ID` | `401` / `403` |
| `DELETE` | `/api/favorites` | `controllers.RemoveFavorite`| `IsAuthenticated` + `UserID == caller.ID` | `401` / `403` |
| `DELETE` | `/api/users/:id` | `controllers.DeleteUser` | `IsAuthenticated` + `RequireAdmin` | `401` / `403` |
| `POST` | `/api/users` | `controllers.CreateUser` | `IsAuthenticated` + `RequireAdmin` | `401` / `403` |
| `PUT` | `/api/users/:id` | `controllers.UpdateUser` | `IsAuthenticated` + `RequireAdmin` | `401` / `403` |
| `GET` | `/api/users` | `controllers.AllUsers` | `IsAuthenticated` + `RequireAdmin` | `401` / `403` |
| `GET` | `/api/alluser` | `controllers.AllUser` | `IsAuthenticated` + `RequireAdmin` | `401` / `403` |
| `GET` | `/api/users/:id` | `controllers.GetUser` | `IsAuthenticated` + `RequireAdmin` | `401` / `403` |
| `DELETE` | `/api/products/:id`| `controllers.DeleteProduct` | `IsAuthenticated` + `RequireAdmin` | `401` / `403` |
| `POST` | `/api/products` | `controllers.CreateProduct` | `IsAuthenticated` + `RequireAdmin` | `401` / `403` |
| `PUT` | `/api/products/:id` | `controllers.UpdateProduct` | `IsAuthenticated` + `RequireAdmin` | `401` / `403` |
| `POST` | `/uploads` | `controllers.Upload` | `IsAuthenticated` + `RequireAdmin` | `401` / `403` |
| `GET` | `/api/roles` | `controllers.AllRole` | `IsAuthenticated` + `RequireAdmin` | `401` / `403` |
| `POST` | `/api/roles` | `controllers.CreateRole` | `IsAuthenticated` + `RequireAdmin` | `401` / `403` |
| `GET` | `/api/roles/:id` | `controllers.GetRole` | `IsAuthenticated` + `RequireAdmin` | `401` / `403` |
| `PUT` | `/api/roles/:id` | `controllers.UpdateRole` | `IsAuthenticated` + `RequireAdmin` | `401` / `403` |
| `DELETE` | `/api/roles/:id` | `controllers.DeleteRole` | `IsAuthenticated` + `RequireAdmin` | `401` / `403` |
| `GET` | `/api/orders` | `controllers.AllOrder` | `IsAuthenticated` + `RequireAdmin` | `401` / `403` |
| `GET` | `/api/orders/export`| `controllers.Export` | `IsAuthenticated` + `RequireAdmin` | `401` / `403` |
| `GET` | `/api/orders/chart` | `controllers.Chart` | `IsAuthenticated` + `RequireAdmin` | `401` / `403` |

---

## 3. Frontend Next.js Route Protection Schema (`NextMiddlewareRule`)

Governs request filtering implemented in `frontend/middleware.ts`.

| Route Category | Path Pattern | Condition | Target Action / Response |
| :--- | :--- | :--- | :--- |
| **Private Routes** | `/dashboard/*`<br>`/profile/*`<br>`/favorite/*` | No `jwt` cookie present | HTTP 307 Redirect to `/login` |
| **Auth Routes** | `/login`<br>`/signup` | Valid `jwt` cookie present | HTTP 307 Redirect to `/` |
| **Bypass Routes** | `/_next/*`<br>`/api/*`<br>`/favicon.ico`<br>`*.svg`, `*.png` | Any | Bypassed by `config.matcher` |
| **Public Storefront** | `/`<br>`/products/*`<br>`/cart/*` | Any | Allowed through (`NextResponse.next()`) |
