# API & Edge Contracts: Phase 0 Perimeter Protection & Critical Authorization

**Feature**: [Phase 0 Specification](../spec.md)  
**Date**: 2026-09-14  
**Last Updated**: 2026-09-15  
**Status**: Active Contract  

---

## 1. Backend Authentication & Authorization Guard Contract

### 1.1 Complete Endpoint Classification Matrix

| Endpoint | Method | Classification | Required Middleware | Unauthenticated Response | Unauthorized (Non-Admin / Non-Owner) |
| :--- | :--- | :--- | :--- | :---: | :---: |
| `/api/register` | `POST` | Public | None | `200 OK` (with payload) | N/A |
| `/api/login` | `POST` | Public | None | `200 OK` (with payload) | N/A |
| `/api/products` | `GET` | Public | None | `200 OK` | N/A |
| `/api/productss` | `GET` | Public | None | `200 OK` | N/A |
| `/api/products/:id` | `GET` | Public | None | `200 OK` | N/A |
| `/api/user` | `GET` | Authenticated | `IsAuthenticated` | `401 Unauthorized` | N/A |
| `/api/updateinfo` | `PUT` | Owner Only | `IsAuthenticated` | `401 Unauthorized` | N/A (binds to token ID) |
| `/api/updatepassword` | `PUT` | Owner Only | `IsAuthenticated` | `401 Unauthorized` | N/A (binds to token ID) |
| `/getorderbyemail` | `GET` | Owner Only | `IsAuthenticated` | `401 Unauthorized` | N/A (binds to token ID) |
| `/api/favorites/:id` | `GET` | Owner Only | `IsAuthenticated` + Ownership | `401 Unauthorized` | `403 Forbidden` (`:id != caller.ID`) |
| `/api/favorites` | `POST` | Owner Only | `IsAuthenticated` + Ownership | `401 Unauthorized` | `403 Forbidden` (`user_id != caller.ID`) |
| `/api/favorites` | `DELETE` | Owner Only | `IsAuthenticated` + Ownership | `401 Unauthorized` | `403 Forbidden` (`user_id != caller.ID`) |
| `/api/users/:id` | `DELETE` | Admin Only | `IsAuthenticated` + `RequireAdmin` | `401 Unauthorized` | `403 Forbidden` (`RoleID != 2`) |
| `/api/users` | `POST` | Admin Only | `IsAuthenticated` + `RequireAdmin` | `401 Unauthorized` | `403 Forbidden` (`RoleID != 2`) |
| `/api/users/:id` | `PUT` | Admin Only | `IsAuthenticated` + `RequireAdmin` | `401 Unauthorized` | `403 Forbidden` (`RoleID != 2`) |
| `/api/users` | `GET` | Admin Only | `IsAuthenticated` + `RequireAdmin` | `401 Unauthorized` | `403 Forbidden` (`RoleID != 2`) |
| `/api/alluser` | `GET` | Admin Only | `IsAuthenticated` + `RequireAdmin` | `401 Unauthorized` | `403 Forbidden` (`RoleID != 2`) |
| `/api/users/:id` | `GET` | Admin Only | `IsAuthenticated` + `RequireAdmin` | `401 Unauthorized` | `403 Forbidden` (`RoleID != 2`) |
| `/api/products/:id` | `DELETE` | Admin Only | `IsAuthenticated` + `RequireAdmin` | `401 Unauthorized` | `403 Forbidden` (`RoleID != 2`) |
| `/api/products` | `POST` | Admin Only | `IsAuthenticated` + `RequireAdmin` | `401 Unauthorized` | `403 Forbidden` (`RoleID != 2`) |
| `/api/products/:id` | `PUT` | Admin Only | `IsAuthenticated` + `RequireAdmin` | `401 Unauthorized` | `403 Forbidden` (`RoleID != 2`) |
| `/uploads` | `POST` | Admin Only | `IsAuthenticated` + `RequireAdmin` | `401 Unauthorized` | `403 Forbidden` (`RoleID != 2`) |
| `/api/roles` | `GET` | Admin Only | `IsAuthenticated` + `RequireAdmin` | `401 Unauthorized` | `403 Forbidden` (`RoleID != 2`) |
| `/api/roles` | `POST` | Admin Only | `IsAuthenticated` + `RequireAdmin` | `401 Unauthorized` | `403 Forbidden` (`RoleID != 2`) |
| `/api/roles/:id` | `GET` | Admin Only | `IsAuthenticated` + `RequireAdmin` | `401 Unauthorized` | `403 Forbidden` (`RoleID != 2`) |
| `/api/roles/:id` | `PUT` | Admin Only | `IsAuthenticated` + `RequireAdmin` | `401 Unauthorized` | `403 Forbidden` (`RoleID != 2`) |
| `/api/roles/:id` | `DELETE` | Admin Only | `IsAuthenticated` + `RequireAdmin` | `401 Unauthorized` | `403 Forbidden` (`RoleID != 2`) |
| `/api/orders` | `GET` | Admin Only | `IsAuthenticated` + `RequireAdmin` | `401 Unauthorized` | `403 Forbidden` (`RoleID != 2`) |
| `/api/orders/export` | `GET` | Admin Only | `IsAuthenticated` + `RequireAdmin` | `401 Unauthorized` | `403 Forbidden` (`RoleID != 2`) |
| `/api/orders/chart` | `GET` | Admin Only | `IsAuthenticated` + `RequireAdmin` | `401 Unauthorized` | `403 Forbidden` (`RoleID != 2`) |

---

### 1.2 Unauthenticated Request Contract (401)
When an anonymous client sends an HTTP request to any protected route:

* **Request**:
  ```http
  DELETE /api/users/1 HTTP/1.1
  Host: localhost:8000
  (No Cookie header or empty/invalid jwt cookie)
  ```

* **Response**:
  ```http
  HTTP/1.1 401 Unauthorized
  Content-Type: application/json

  {
    "message": "unauthenticated"
  }
  ```
* **Contract Invariant**: Zero controller or database logic executes when 401 guard fires.

---

### 1.3 Unauthorized Request Contract (403 Forbidden)

#### Admin-Only Endpoint Accessed by Non-Admin
* **Request**:
  ```http
  DELETE /api/users/1 HTTP/1.1
  Host: localhost:8000
  Cookie: jwt=<token_of_customer_with_role_id_1>
  ```

* **Response**:
  ```http
  HTTP/1.1 403 Forbidden
  Content-Type: application/json

  {
    "message": "forbidden: requires administrator privileges"
  }
  ```

#### Owner-Only Endpoint Cross-Tenant Tampering (IDOR)
* **Request**:
  ```http
  DELETE /api/favorites HTTP/1.1
  Host: localhost:8000
  Cookie: jwt=<token_belonging_to_user_5>
  Content-Type: application/json

  {
    "user_id": 2,
    "product_id": 10
  }
  ```

* **Response**:
  ```http
  HTTP/1.1 403 Forbidden
  Content-Type: application/json

  {
    "message": "forbidden: cannot modify another user's resources"
  }
  ```

---

## 2. Frontend Edge Middleware Redirection Contract

Governs client routing evaluated by `frontend/middleware.ts`:

### 2.1 Private Route Interception
* **Trigger Paths**: `/dashboard`, `/dashboard/*`, `/profile`, `/profile/*`, `/favorite`, `/favorite/*`
* **Condition**: Request lacks `Cookie: jwt=...`
* **Response**:
  ```http
  HTTP/1.1 307 Temporary Redirect
  Location: /login
  ```

### 2.2 Auth Route Interception
* **Trigger Paths**: `/login`, `/signup`
* **Condition**: Request contains valid `Cookie: jwt=...`
* **Response**:
  ```http
  HTTP/1.1 307 Temporary Redirect
  Location: /
  ```

### 2.3 Storefront & Asset Passthrough
* **Trigger Paths**: `/`, `/products`, `/products/*`, `/cart`, `/_next/*`, `/favicon.ico`
* **Condition**: Any
* **Response**:
  ```http
  HTTP/1.1 200 OK (Standard Next.js Server / Client Rendering)
  ```
