-- name: ListFavoritesByUserID :many
SELECT 
    f.id, 
    f.user_id, 
    f.product_id, 
    f.created_at,
    p.title AS product_title, 
    p.slug AS product_slug, 
    p.price AS product_price,
    p.images AS product_images, 
    p.stock AS product_stock, 
    p.rating AS product_rating
FROM favorites f
JOIN products p ON f.product_id = p.id
WHERE f.user_id = $1 
  AND f.deleted_at IS NULL 
  AND p.deleted_at IS NULL
ORDER BY f.created_at DESC;

-- name: IsFavorite :one
SELECT EXISTS(
    SELECT 1 FROM favorites
    WHERE user_id = $1 
      AND product_id = $2 
      AND deleted_at IS NULL
) AS is_favorite;

-- name: AddFavorite :one
INSERT INTO favorites (user_id, product_id, created_at, updated_at)
VALUES ($1, $2, NOW(), NOW())
ON CONFLICT (user_id, product_id) DO UPDATE 
SET deleted_at = NULL, updated_at = NOW()
RETURNING id, user_id, product_id, created_at, updated_at;

-- name: RemoveFavorite :exec
DELETE FROM favorites
WHERE user_id = $1 AND product_id = $2;
