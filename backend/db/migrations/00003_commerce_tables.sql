-- +goose Up
-- +goose StatementBegin
-- 1. Upgrade orders table with relational user linkage, status lifecycle, total amount, and shipping details
ALTER TABLE orders 
    ADD COLUMN IF NOT EXISTS user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS status VARCHAR(50) NOT NULL DEFAULT 'pending',
    ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS shipping_address TEXT;

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- 2. Upgrade order_items with product foreign key reference
ALTER TABLE order_items
    ADD COLUMN IF NOT EXISTS product_id BIGINT REFERENCES products(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- 3. Enhance favorites indexes for zero-IDOR queries
CREATE INDEX IF NOT EXISTS idx_favorites_user_product ON favorites(user_id, product_id);

-- 4. Establish payments table for idempotency-guarded transaction processing
CREATE TABLE IF NOT EXISTS payments (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    provider VARCHAR(50) NOT NULL DEFAULT 'mock',
    idempotency_key VARCHAR(100) UNIQUE NOT NULL,
    payment_intent_id VARCHAR(100) UNIQUE,
    status VARCHAR(50) NOT NULL DEFAULT 'pending'
);

CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_idempotency_key ON payments(idempotency_key);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS payments;

DROP INDEX IF EXISTS idx_favorites_user_product;
DROP INDEX IF EXISTS idx_order_items_product_id;
DROP INDEX IF EXISTS idx_order_items_order_id;
DROP INDEX IF EXISTS idx_orders_created_at;
DROP INDEX IF EXISTS idx_orders_status;
DROP INDEX IF EXISTS idx_orders_user_id;

ALTER TABLE order_items DROP COLUMN IF EXISTS product_id;

ALTER TABLE orders 
    DROP COLUMN IF EXISTS shipping_address,
    DROP COLUMN IF EXISTS total_amount,
    DROP COLUMN IF EXISTS status,
    DROP COLUMN IF EXISTS user_id;
-- +goose StatementEnd
