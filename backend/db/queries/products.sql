-- name: GetProductByID :one
SELECT 
    p.id, p.created_at, p.updated_at, p.deleted_at,
    p.title, p.slug, p.description, p.price, p.stock, p.rating,
    p.images, p.colors, p.attributes, p.category_id, p.sku, p.is_active,
    COALESCE(c.name, '')::text AS category_name
FROM products p
LEFT JOIN categories c ON c.id = p.category_id
WHERE p.id = $1 AND p.deleted_at IS NULL;

-- name: GetProductBySlug :one
SELECT 
    p.id, p.created_at, p.updated_at, p.deleted_at,
    p.title, p.slug, p.description, p.price, p.stock, p.rating,
    p.images, p.colors, p.attributes, p.category_id, p.sku, p.is_active,
    COALESCE(c.name, '')::text AS category_name
FROM products p
LEFT JOIN categories c ON c.id = p.category_id
WHERE p.slug = $1 AND p.deleted_at IS NULL;

-- name: ListProducts :many
SELECT 
    p.id, p.created_at, p.updated_at, p.deleted_at,
    p.title, p.slug, p.description, p.price, p.stock, p.rating,
    p.images, p.colors, p.attributes, p.category_id, p.sku, p.is_active,
    COALESCE(c.name, '')::text AS category_name
FROM products p
LEFT JOIN categories c ON c.id = p.category_id
WHERE p.deleted_at IS NULL AND (p.is_active = $3 OR $3 IS NULL)
ORDER BY p.id DESC
LIMIT $1 OFFSET $2;

-- name: ListProductsByCategory :many
SELECT 
    p.id, p.created_at, p.updated_at, p.deleted_at,
    p.title, p.slug, p.description, p.price, p.stock, p.rating,
    p.images, p.colors, p.attributes, p.category_id, p.sku, p.is_active,
    COALESCE(c.name, '')::text AS category_name
FROM products p
LEFT JOIN categories c ON c.id = p.category_id
WHERE p.category_id = $1 AND p.deleted_at IS NULL AND p.is_active = TRUE
ORDER BY p.id DESC
LIMIT $2 OFFSET $3;

-- name: ListAllProducts :many
SELECT 
    p.id, p.created_at, p.updated_at, p.deleted_at,
    p.title, p.slug, p.description, p.price, p.stock, p.rating,
    p.images, p.colors, p.attributes, p.category_id, p.sku, p.is_active,
    COALESCE(c.name, '')::text AS category_name
FROM products p
LEFT JOIN categories c ON c.id = p.category_id
WHERE p.deleted_at IS NULL
ORDER BY p.id DESC;

-- name: CountProducts :one
SELECT COUNT(*) FROM products
WHERE deleted_at IS NULL AND (is_active = $1 OR $1 IS NULL);

-- name: CountProductsByCategory :one
SELECT COUNT(*) FROM products
WHERE category_id = $1 AND deleted_at IS NULL AND is_active = TRUE;

-- name: CreateProduct :one
INSERT INTO products (
    title, slug, description, price, stock, rating,
    images, colors, attributes, category_id, sku, is_active,
    created_at, updated_at
)
VALUES (
    $1, $2, $3, $4, $5, $6,
    $7, $8, $9, $10, $11, $12,
    NOW(), NOW()
)
RETURNING id, created_at, updated_at, deleted_at, title, slug, description, price, stock, rating, images, colors, attributes, category_id, sku, is_active;

-- name: UpdateProduct :one
UPDATE products
SET 
    title = $2,
    slug = $3,
    description = $4,
    price = $5,
    stock = $6,
    rating = $7,
    images = $8,
    colors = $9,
    attributes = $10,
    category_id = $11,
    sku = $12,
    is_active = $13,
    updated_at = NOW()
WHERE id = $1 AND deleted_at IS NULL
RETURNING id, created_at, updated_at, deleted_at, title, slug, description, price, stock, rating, images, colors, attributes, category_id, sku, is_active;

-- name: UpdateProductStock :exec
UPDATE products
SET 
    stock = $2,
    updated_at = NOW()
WHERE id = $1 AND deleted_at IS NULL;

-- name: DeleteProduct :exec
UPDATE products
SET deleted_at = NOW()
WHERE id = $1;

-- name: HardDeleteProduct :exec
DELETE FROM products
WHERE id = $1;
