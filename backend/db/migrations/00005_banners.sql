-- +goose Up
-- ==============================================================================
-- 1. Banners Table for Dynamic Storefront Hero and Promo Management
-- ==============================================================================

CREATE TABLE IF NOT EXISTS banners (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    title VARCHAR(255) NOT NULL,
    subtitle TEXT,
    badge VARCHAR(100),
    image_url TEXT NOT NULL,
    link_url TEXT NOT NULL DEFAULT '/products',
    cta_text VARCHAR(100) DEFAULT 'Shop Now',
    cta_link TEXT DEFAULT '/products',
    type VARCHAR(50) NOT NULL DEFAULT 'hero', -- 'hero', 'promo'
    position INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_banners_type_active_pos 
ON banners (type, is_active, position);

-- +goose Down
-- ==============================================================================
-- Revert Banners Table
-- ==============================================================================

DROP INDEX IF EXISTS idx_banners_type_active_pos;
DROP TABLE IF EXISTS banners;
