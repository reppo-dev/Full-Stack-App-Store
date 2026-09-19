-- name: GetRoleByID :one
SELECT id, created_at, updated_at, deleted_at, name
FROM roles
WHERE id = $1 AND deleted_at IS NULL;

-- name: GetRoleByName :one
SELECT id, created_at, updated_at, deleted_at, name
FROM roles
WHERE name = $1 AND deleted_at IS NULL;

-- name: ListRoles :many
SELECT id, created_at, updated_at, deleted_at, name
FROM roles
WHERE deleted_at IS NULL
ORDER BY id ASC;

-- name: CreateRole :one
INSERT INTO roles (name, created_at, updated_at)
VALUES ($1, NOW(), NOW())
RETURNING id, created_at, updated_at, deleted_at, name;

-- name: UpdateRole :one
UPDATE roles
SET name = $2, updated_at = NOW()
WHERE id = $1 AND deleted_at IS NULL
RETURNING id, created_at, updated_at, deleted_at, name;

-- name: DeleteRole :exec
UPDATE roles
SET deleted_at = NOW()
WHERE id = $1;

-- name: HardDeleteRole :exec
DELETE FROM roles
WHERE id = $1;

-- name: GetRolePermissions :many
SELECT p.id, p.created_at, p.updated_at, p.deleted_at, p.name
FROM permissions p
JOIN role_permission rp ON rp.permission_id = p.id
WHERE rp.role_id = $1 AND p.deleted_at IS NULL;

-- name: ClearRolePermissions :exec
DELETE FROM role_permission
WHERE role_id = $1;

-- name: AssignRolePermission :exec
INSERT INTO role_permission (role_id, permission_id)
VALUES ($1, $2)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- name: ListPermissions :many
SELECT id, created_at, updated_at, deleted_at, name
FROM permissions
WHERE deleted_at IS NULL
ORDER BY id ASC;
