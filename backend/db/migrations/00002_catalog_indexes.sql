-- +goose Up
-- ==============================================================================
-- 1. Catalog Indexes for High-Throughput Customer Browsing
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_products_cat_active_created 
ON products (category_id, is_active, created_at);

CREATE INDEX IF NOT EXISTS idx_products_slug 
ON products (slug);

CREATE INDEX IF NOT EXISTS idx_categories_parent 
ON categories (parent_id);

-- ==============================================================================
-- 2. Baseline System Roles Seeding (Idempotent)
-- ==============================================================================

INSERT INTO roles (id, name, created_at, updated_at)
VALUES 
    (1, 'customer', NOW(), NOW()),
    (2, 'admin', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Reset sequence to prevent ID collision
SELECT setval(pg_get_serial_sequence('roles', 'id'), coalesce(max(id), 1), max(id) IS NOT null) FROM roles;

-- +goose Down
-- ==============================================================================
-- Revert Catalog Indexes
-- ==============================================================================

DROP INDEX IF EXISTS idx_products_cat_active_created;
DROP INDEX IF EXISTS idx_products_slug;
DROP INDEX IF EXISTS idx_categories_parent;
