-- name: ListActiveBannersByType :many
SELECT id, created_at, updated_at, title, subtitle, badge, image_url, link_url, cta_text, cta_link, type, position, is_active
FROM banners
WHERE is_active = true 
  AND (type = sqlc.narg('type') OR sqlc.narg('type') IS NULL)
ORDER BY position ASC, id ASC;

-- name: ListAllBanners :many
SELECT id, created_at, updated_at, title, subtitle, badge, image_url, link_url, cta_text, cta_link, type, position, is_active
FROM banners
ORDER BY type ASC, position ASC, id ASC;

-- name: GetBannerByID :one
SELECT id, created_at, updated_at, title, subtitle, badge, image_url, link_url, cta_text, cta_link, type, position, is_active
FROM banners
WHERE id = $1;

-- name: CreateBanner :one
INSERT INTO banners (
    title, subtitle, badge, image_url, link_url, cta_text, cta_link, type, position, is_active, created_at, updated_at
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW()
)
RETURNING id, created_at, updated_at, title, subtitle, badge, image_url, link_url, cta_text, cta_link, type, position, is_active;

-- name: UpdateBanner :one
UPDATE banners
SET
    title = $2,
    subtitle = $3,
    badge = $4,
    image_url = $5,
    link_url = $6,
    cta_text = $7,
    cta_link = $8,
    type = $9,
    position = $10,
    is_active = $11,
    updated_at = NOW()
WHERE id = $1
RETURNING id, created_at, updated_at, title, subtitle, badge, image_url, link_url, cta_text, cta_link, type, position, is_active;

-- name: DeleteBanner :exec
DELETE FROM banners
WHERE id = $1;
