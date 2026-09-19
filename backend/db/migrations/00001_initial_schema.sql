-- +goose Up
-- ==============================================================================
-- 1. Identity & Access Control Domain
-- ==============================================================================

CREATE TABLE IF NOT EXISTS roles (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    name VARCHAR(100) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_roles_deleted_at ON roles(deleted_at);

CREATE TABLE IF NOT EXISTS permissions (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    name VARCHAR(100) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_permissions_deleted_at ON permissions(deleted_at);

CREATE TABLE IF NOT EXISTS role_permission (
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id BIGINT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    image TEXT,
    user_name VARCHAR(50) NOT NULL,
    phone_number VARCHAR(20),
    date_of_birth TIMESTAMPTZ,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role_id BIGINT DEFAULT 1 REFERENCES roles(id) ON DELETE SET DEFAULT
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_user_name ON users(user_name);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users(deleted_at);

-- ==============================================================================
-- 2. Product Catalog Domain
-- ==============================================================================

CREATE TABLE IF NOT EXISTS categories (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    name VARCHAR(120) NOT NULL,
    slug VARCHAR(120),
    parent_id BIGINT REFERENCES categories(id) ON DELETE SET NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_deleted_at ON categories(deleted_at);

CREATE TABLE IF NOT EXISTS tags (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    name VARCHAR(100),
    slug VARCHAR(100)
);
CREATE INDEX IF NOT EXISTS idx_tags_deleted_at ON tags(deleted_at);

CREATE TABLE IF NOT EXISTS colors (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    code VARCHAR(7)
);

CREATE TABLE IF NOT EXISTS products (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200),
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    stock INT,
    rating DOUBLE PRECISION DEFAULT 0.0,
    images JSONB DEFAULT '[]'::jsonb,
    colors JSONB DEFAULT '[]'::jsonb,
    attributes JSONB DEFAULT '{}'::jsonb,
    category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
    sku VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_deleted_at ON products(deleted_at);

CREATE TABLE IF NOT EXISTS product_tags (
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    tag_id BIGINT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, tag_id)
);

CREATE TABLE IF NOT EXISTS product_colors (
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    color_id BIGINT NOT NULL REFERENCES colors(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, color_id)
);

CREATE TABLE IF NOT EXISTS favorites (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT idx_user_product UNIQUE (user_id, product_id)
);
CREATE INDEX IF NOT EXISTS idx_favorites_deleted_at ON favorites(deleted_at);

-- ==============================================================================
-- 3. Orders & Commerce Domain
-- ==============================================================================

CREATE TABLE IF NOT EXISTS orders (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255)
);
CREATE INDEX IF NOT EXISTS idx_orders_deleted_at ON orders(deleted_at);

CREATE TABLE IF NOT EXISTS order_items (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_title VARCHAR(200),
    price REAL NOT NULL,
    quantity BIGINT NOT NULL DEFAULT 1
);
CREATE INDEX IF NOT EXISTS idx_order_items_deleted_at ON order_items(deleted_at);

-- ==============================================================================
-- 4. Support & Messaging Domain
-- ==============================================================================

CREATE TABLE IF NOT EXISTS labels (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    color_code VARCHAR(7) DEFAULT '#808080',
    CONSTRAINT idx_user_label UNIQUE (user_id, name)
);
CREATE INDEX IF NOT EXISTS idx_labels_deleted_at ON labels(deleted_at);

CREATE TABLE IF NOT EXISTS messages (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    sender_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    recipient_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    subject VARCHAR(200),
    snippet TEXT,
    body TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    is_starred BOOLEAN DEFAULT FALSE,
    is_important BOOLEAN DEFAULT FALSE,
    is_trashed BOOLEAN DEFAULT FALSE,
    is_draft BOOLEAN DEFAULT FALSE
);
CREATE INDEX IF NOT EXISTS idx_messages_deleted_at ON messages(deleted_at);

CREATE TABLE IF NOT EXISTS message_labels (
    message_id BIGINT NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    label_id BIGINT NOT NULL REFERENCES labels(id) ON DELETE CASCADE,
    PRIMARY KEY (message_id, label_id)
);

-- +goose Down
-- ==============================================================================
-- Atomic Reverse-Dependency Rollback
-- ==============================================================================

DROP TABLE IF EXISTS message_labels CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS labels CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS product_colors CASCADE;
DROP TABLE IF EXISTS colors CASCADE;
DROP TABLE IF EXISTS product_tags CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS role_permission CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS permissions CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
