# Quickstart & Verification Guide: Phase 0

**Feature**: [Phase 0 Specification](../spec.md)  
**Date**: 2026-09-14  
**Status**: Ready for Verification  

This guide provides executable verification commands to prove that Phase 0 meets 100% of its acceptance criteria without regressions.

---

## 1. Prerequisites Check

Verify required toolchains and runtimes:
```bash
# Verify Go 1.22+
go version
# Output: go version go1.26.0 windows/amd64

# Verify Node.js 20+
node -v
# Output: v22.18.0

# Verify pnpm 9+
pnpm -v
# Output: 10.33.0

# Record Git baseline
git status --porcelain
# Baseline status: On branch main, untracked docs/ and specs/ initialized
```

---

## 2. Backend Compilation & Formatting Verification

Verify that the `dsn` typo is resolved and the backend builds cleanly:

```bash
cd backend

# 1. Format check
gofmt -l .

# 2. Package build (Must exit with code 0)
go build ./...

# 3. Unit tests (Must pass or report no test files)
go test ./...
```

* **Expected Outcome**: `go build ./...` exits with code `0` and produces zero compilation errors.

---

## 3. Git Hygiene & Artifact Untracking Verification

Verify that no binary files or secrets are tracked:

```bash
# 1. Verify backend/tmp/main.exe is NOT tracked by Git
git ls-files backend/tmp/main.exe
# Expected: (Empty output)

# 2. Verify all tracked binaries in repository
git ls-files | grep -E '\.(exe|dll|so|dylib|bin)$'
# Expected: (Empty output)

# 3. Verify .gitignore ignores future binaries
git check-ignore -v backend/tmp/test.exe
# Expected: Matches rule in backend/.gitignore or root .gitignore

# 4. Verify .env is ignored
git check-ignore -v backend/.env
# Expected: Matches rule in .gitignore
```

---

## 4. Security Perimeter Verification

Start the backend server (ensure PostgreSQL is accessible) and test API boundary responses:

```bash
# In terminal 1: start backend
cd backend
go run main.go
```

In terminal 2, execute boundary checks:

```bash
# Test 1: Unauthenticated DELETE on users MUST return 401
curl -s -o /dev/null -w "%{http_code}\n" -X DELETE http://localhost:8000/api/users/1
# Expected output: 401

# Test 2: Unauthenticated DELETE on products MUST return 401
curl -s -o /dev/null -w "%{http_code}\n" -X DELETE http://localhost:8000/api/products/1
# Expected output: 401

# Test 3: Unauthenticated DELETE on favorites MUST return 401
curl -s -o /dev/null -w "%{http_code}\n" -X DELETE http://localhost:8000/api/favorites
# Expected output: 401

# Test 4: Unauthenticated GET on user profile MUST return 401
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8000/api/user
# Expected output: 401

# Test 5: Public GET on products MUST remain accessible (200)
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8000/api/products
# Expected output: 200
```

---

## 5. Frontend Layout & Route Protection Verification

```bash
cd frontend

# 1. Typecheck
pnpm exec tsc --noEmit

# 2. Build
pnpm build
```

### Visual & Browser Verification:
1. **Single Sidebar Test**:
   - Open `http://localhost:3000/` in Chrome or Firefox.
   - Open Developer Tools (`F12` $\rightarrow$ Elements).
   - Search for `<aside` or `data-sidebar`.
   - **Verification**: Exactly **one** sidebar element exists in the DOM tree.
2. **Edge Route Protection Test**:
   - Open a fresh **Incognito / Private Window** (no cookies).
   - Navigate to `http://localhost:3000/dashboard`.
   - **Verification**: Browser automatically redirects to `http://localhost:3000/login`.
3. **Standalone Auth Layout**:
   - Navigate to `http://localhost:3000/login`.
   - **Verification**: The storefront sidebar and header are NOT rendered; only the login card is visible.
