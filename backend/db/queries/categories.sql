-- name: GetCategoryByID :one
SELECT id, created_at, updated_at, deleted_at, name, slug, parent_id, image_url
FROM categories
WHERE id = $1 AND deleted_at IS NULL;

-- name: GetCategoryBySlug :one
SELECT id, created_at, updated_at, deleted_at, name, slug, parent_id, image_url
FROM categories
WHERE slug = $1 AND deleted_at IS NULL;

-- name: ListCategories :many
SELECT id, created_at, updated_at, deleted_at, name, slug, parent_id, image_url
FROM categories
WHERE deleted_at IS NULL
ORDER BY id ASC;

-- name: ListRootCategories :many
SELECT id, created_at, updated_at, deleted_at, name, slug, parent_id, image_url
FROM categories
WHERE parent_id IS NULL AND deleted_at IS NULL
ORDER BY id ASC;

-- name: ListSubcategories :many
SELECT id, created_at, updated_at, deleted_at, name, slug, parent_id, image_url
FROM categories
WHERE parent_id = $1 AND deleted_at IS NULL
ORDER BY id ASC;

-- name: CreateCategory :one
INSERT INTO categories (name, slug, parent_id, image_url, created_at, updated_at)
VALUES ($1, $2, $3, $4, NOW(), NOW())
RETURNING id, created_at, updated_at, deleted_at, name, slug, parent_id, image_url;

-- name: UpdateCategory :one
UPDATE categories
SET 
    name = $2,
    slug = $3,
    parent_id = $4,
    image_url = $5,
    updated_at = NOW()
WHERE id = $1 AND deleted_at IS NULL
RETURNING id, created_at, updated_at, deleted_at, name, slug, parent_id, image_url;

-- name: DeleteCategory :exec
UPDATE categories
SET deleted_at = NOW()
WHERE id = $1;

-- name: HardDeleteCategory :exec
DELETE FROM categories
WHERE id = $1;
