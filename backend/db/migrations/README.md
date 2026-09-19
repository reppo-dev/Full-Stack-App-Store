# Database Migrations (Goose)

This directory contains versioned SQL migrations managed by [Goose](https://github.com/pressly/goose).

## Conventions

- Every migration file uses the format: `0000X_description.sql`
- Each migration file MUST contain paired `-- +goose Up` and `-- +goose Down` blocks.
- Migrations MUST be executed within transactions (default behavior in Goose unless `-- +goose NO TRANSACTION` is explicitly required for non-transactional DDL like `CREATE INDEX CONCURRENTLY`).
- Down migrations MUST drop tables/constraints in the strict reverse-dependency order of the up migration.
- All column types, constraints, defaults, and foreign keys MUST strictly match the system entities documented in `specs/002-phase1-infra-containers-ci/data-model.md`.

## CLI Usage

### With Goose installed locally:

```bash
# Apply all pending up-migrations
goose -dir backend/db/migrations postgres "host=localhost port=5432 user=postgres password=postgres dbname=postgres sslmode=disable" up

# Rollback the most recently applied migration
goose -dir backend/db/migrations postgres "host=localhost port=5432 user=postgres password=postgres dbname=postgres sslmode=disable" down

# Inspect migration status and applied version
goose -dir backend/db/migrations postgres "host=localhost port=5432 user=postgres password=postgres dbname=postgres sslmode=disable" status

# Create a new migration file pair
goose -dir backend/db/migrations create add_new_feature sql
```

### With Root Makefile:

```bash
# Apply migrations
make migrate-up

# Revert last migration
make migrate-down

# View status
make migrate-status

# Scaffold new migration
make migrate-create name=add_new_feature
```
