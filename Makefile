# ==============================================================================
# DashStack Monorepo Root Makefile
# Standardized Developer Lifecycle Commands & CI Source of Truth
# ==============================================================================

.DEFAULT_GOAL := help
.PHONY: help dev test lint format build docker-up docker-down migrate-up migrate-down migrate-status migrate-create sqlc-generate sqlc-verify ci

# Default PostgreSQL Connection Parameters for Goose Migrations
DB_HOST ?= localhost
DB_PORT ?= 5432
DB_USER ?= postgres
DB_PASSWORD ?= postgres
DB_NAME ?= postgres
DB_SSLMODE ?= disable

MIGRATIONS_DIR := backend/db/migrations
DSN := host=$(DB_HOST) port=$(DB_PORT) user=$(DB_USER) password=$(DB_PASSWORD) dbname=$(DB_NAME) sslmode=$(DB_SSLMODE)

help: ## Show this help message
	@echo "DashStack Developer Workflows:"
	@echo "  make help            - Display available commands"
	@echo "  make dev             - Start backend in development mode"
	@echo "  make build           - Build Go backend and Next.js frontend production bundle"
	@echo "  make test            - Execute backend automated test suites"
	@echo "  make lint            - Run backend gofmt check and frontend linter"
	@echo "  make format          - Auto-format Go backend code"
	@echo "  make docker-up       - Start Docker Compose services in detached mode"
	@echo "  make docker-down     - Stop and tear down Docker Compose services"
	@echo "  make migrate-up      - Apply pending Goose database migrations"
	@echo "  make migrate-down    - Rollback the latest Goose database migration"
	@echo "  make migrate-status  - View current database migration status"
	@echo "  make migrate-create  - Scaffold a new migration pair (e.g. make migrate-create name=add_feature)"
	@echo "  make sqlc-generate   - Generate type-safe Go repository code from pure SQL queries"
	@echo "  make sqlc-verify     - Validate SQLC configuration and SQL query syntax against schema"
	@echo "  make ci              - Execute local pre-flight CI checks (lint, build, test)"

dev: ## Start backend in development mode
	cd backend && go run main.go

build: ## Build Go backend and Next.js frontend production bundle
	cd backend && go build ./...
	cd frontend && pnpm build

test: ## Execute backend automated test suites
	cd backend && go test -v ./...

lint: ## Run backend gofmt check and frontend linter
	cd backend && gofmt -l .
	cd frontend && pnpm lint

format: ## Auto-format Go backend code
	cd backend && gofmt -w .

docker-up: ## Start Docker Compose services in detached mode
	docker compose up -d

docker-down: ## Stop and tear down Docker Compose services
	docker compose down

migrate-up: ## Apply pending Goose database migrations
	goose -dir $(MIGRATIONS_DIR) postgres "$(DSN)" up

migrate-down: ## Rollback the latest Goose database migration
	goose -dir $(MIGRATIONS_DIR) postgres "$(DSN)" down

migrate-status: ## View current database migration status
	goose -dir $(MIGRATIONS_DIR) postgres "$(DSN)" status

migrate-create: ## Scaffold a new migration pair (e.g. make migrate-create name=add_feature)
	@if [ -z "$(name)" ]; then echo "Error: 'name' is required. Usage: make migrate-create name=migration_name"; exit 1; fi
	goose -dir $(MIGRATIONS_DIR) create $(name) sql

sqlc-generate: ## Generate type-safe Go repository code from pure SQL queries
	cd backend && sqlc generate

sqlc-verify: ## Validate SQLC configuration and SQL query syntax against schema
	cd backend && sqlc compile

ci: ## Execute local pre-flight CI checks (lint, build, test)
	@echo "==> Running backend format check..."
	cd backend && gofmt -l .
	@echo "==> Compiling backend packages..."
	cd backend && go build ./...
	@echo "==> Running backend test suite..."
	cd backend && go test -v ./...
	@echo "==> Running SQLC verification..."
	cd backend && sqlc compile
	@echo "==> Running frontend typecheck..."
	cd frontend && pnpm exec tsc --noEmit
	@echo "==> Running frontend lint..."
	cd frontend && pnpm lint
	@echo "==> Running frontend build..."
	cd frontend && pnpm build
	@echo "==> All pre-flight CI checks passed successfully!"
