-- name: CreateOrder :one
INSERT INTO orders (
    user_id, 
    first_name, 
    last_name, 
    email, 
    total_amount, 
    shipping_address, 
    status, 
    created_at, 
    updated_at
)
VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
RETURNING id, user_id, first_name, last_name, email, total_amount, shipping_address, status, created_at, updated_at;

-- name: CreateOrderItem :one
INSERT INTO order_items (
    order_id, 
    product_id, 
    product_title, 
    price, 
    quantity, 
    created_at, 
    updated_at
)
VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
RETURNING id, order_id, product_id, product_title, price, quantity, created_at, updated_at;

-- name: GetOrderByID :one
SELECT id, user_id, first_name, last_name, email, total_amount, shipping_address, status, created_at, updated_at
FROM orders
WHERE id = $1 AND deleted_at IS NULL;

-- name: GetOrderItemsByOrderID :many
SELECT id, order_id, product_id, product_title, price, quantity, created_at, updated_at
FROM order_items
WHERE order_id = $1 AND deleted_at IS NULL
ORDER BY id ASC;

-- name: ListOrdersByUserID :many
SELECT id, user_id, first_name, last_name, email, total_amount, shipping_address, status, created_at, updated_at
FROM orders
WHERE user_id = $1 AND deleted_at IS NULL
ORDER BY created_at DESC;

-- name: ListAllOrders :many
SELECT id, user_id, first_name, last_name, email, total_amount, shipping_address, status, created_at, updated_at
FROM orders
WHERE deleted_at IS NULL
ORDER BY created_at DESC
LIMIT $1 OFFSET $2;

-- name: CountOrders :one
SELECT COUNT(*) FROM orders WHERE deleted_at IS NULL;

-- name: UpdateOrderStatus :one
UPDATE orders
SET status = $2, updated_at = NOW()
WHERE id = $1 AND deleted_at IS NULL
RETURNING id, user_id, first_name, last_name, email, total_amount, shipping_address, status, created_at, updated_at;

-- name: DailySalesChart :many
SELECT 
    TO_CHAR(o.created_at, 'YYYY-MM-DD') AS sale_date,
    COALESCE(SUM(o.total_amount), 0)::NUMERIC AS total_sales,
    COUNT(o.id) AS order_count
FROM orders o
WHERE o.deleted_at IS NULL
GROUP BY TO_CHAR(o.created_at, 'YYYY-MM-DD')
ORDER BY sale_date DESC
LIMIT 30;

-- name: LockProductForUpdate :one
SELECT id, title, price, stock, is_active
FROM products
WHERE id = $1 AND deleted_at IS NULL
FOR UPDATE;

-- name: DecrementProductStock :exec
UPDATE products
SET stock = stock - $2, updated_at = NOW()
WHERE id = $1 AND stock >= $2;

-- name: GetAllOrdersWithItemsForExport :many
SELECT 
    o.id AS order_id, 
    o.first_name, 
    o.last_name, 
    o.email, 
    o.total_amount, 
    o.status, 
    o.created_at,
    oi.id AS item_id, 
    oi.product_title, 
    oi.price AS item_price, 
    oi.quantity AS item_quantity
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id AND oi.deleted_at IS NULL
WHERE o.deleted_at IS NULL
ORDER BY o.created_at DESC;
