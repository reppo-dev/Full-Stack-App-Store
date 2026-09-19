# Quickstart & Verification Guide: Phase 1 — Infrastructure & CI

**Feature**: [Phase 1 Specification](spec.md) | [Technical Plan](plan.md)  
**Date**: 2026-09-15  
**Status**: Ready for Verification  

This guide provides executable verification commands to prove that Phase 1 infrastructure, containerization, migrations, and CI workflows operate cleanly without defects.

---

## 1. Prerequisites Check

Verify host toolchain versions:
```bash
# Verify Docker (v24+) & Docker Compose (v2+)
docker --version
docker compose version

# Verify Go (v1.24+)
go version

# Verify Node (v20+) & pnpm (v9+)
node -v
pnpm -v
```

---

## 2. Environment Configuration Setup

Initialize local environment files from version-controlled templates:
```bash
# Copy root, backend, and frontend environment templates
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

---

## 3. Docker Compose Stack Verification

Start all containerized services:
```bash
# Launch stack in detached mode
docker compose up -d

# Verify all 4 services are healthy and running
docker compose ps
# Expected: postgres (healthy), redis (healthy), backend (running/healthy), frontend (running)
```

Test database data persistence:
```bash
# Verify volume creation
docker volume ls | grep postgres_data

# Stop containers
docker compose down

# Relaunch and verify data persists
docker compose up -d
```

---

## 4. Database Migrations Verification (Goose)

Execute SQL migrations against PostgreSQL:
```bash
# Check current migration status
make migrate-status
# Expected: 00001_initial_schema.sql (Pending)

# Apply up-migration
make migrate-up
# Expected: OK 00001_initial_schema.sql (16 tables and join tables created)

# Verify table creation in PostgreSQL
docker compose exec postgres psql -U postgres -d postgres -c "\dt"
# Expected: lists users, products, orders, roles, etc.

# Test rollback safety
make migrate-down
# Expected: OK 00001_initial_schema.sql rolled back cleanly

# Re-apply migration
make migrate-up
```

---

## 5. Operational Health Checks Verification

Test operational probes on the running backend:
```bash
# 1. Test Liveness Probe (Expects 200 OK)
curl -i http://localhost:8000/health/live
# Expected: HTTP/1.1 200 OK, {"status":"UP", ...}

# 2. Test Readiness Probe with Active Database (Expects 200 OK)
curl -i http://localhost:8000/health/ready
# Expected: HTTP/1.1 200 OK, {"status":"READY","components":{"database":"UP"}}
```

---

## 6. Makefile & Local Pre-Flight Verification

Execute standard developer lifecycle targets:
```bash
# 1. Print formatted command manual
make help

# 2. Run backend and frontend code formatting
make format

# 3. Run automated tests
make test

# 4. Build production artifacts
make build

# 5. Run full pre-flight CI check locally
make ci
```

---

## 7. Container Multi-Stage & Security Verification

Verify minimal image sizes and non-root execution:
```bash
# Check backend image size (<50MB)
docker images dashstack-backend --format "{{.Size}}"

# Check backend container non-root UID
docker run --rm dashstack-backend id
# Expected: uid=10001(appuser) gid=10001(appgroup)

# Check frontend container non-root UID
docker run --rm dashstack-frontend id
# Expected: uid=1001(nextjs) gid=1001(nodejs)
```
