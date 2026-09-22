-- name: ListBrands :many
SELECT id, created_at, updated_at, deleted_at, name, category, href, is_active
FROM brands
WHERE deleted_at IS NULL AND is_active = true
ORDER BY id ASC;

-- name: ListStories :many
SELECT id, created_at, updated_at, title, subtitle, badge, category, image_url, link_url, button_text, gradient_class, icon_name, featured_price, is_active
FROM stories
WHERE is_active = true
ORDER BY id ASC;
