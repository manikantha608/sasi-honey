import { query } from '../../config/database.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const BASE_COLS = `id, name, slug, description, image_url, is_active, sort_order, created_at, updated_at`;

// ─── Queries ──────────────────────────────────────────────────────────────────

export const getAllCategories = async (includeInactive = false) => {
  const { rows } = await query(
    `SELECT ${BASE_COLS}
     FROM categories
     ${includeInactive ? '' : 'WHERE is_active = TRUE'}
     ORDER BY sort_order ASC, name ASC`
  );
  return rows;
};

export const getCategoryById = async (id) => {
  const { rows } = await query(
    `SELECT ${BASE_COLS} FROM categories WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
};

export const getCategoryBySlug = async (slug) => {
  const { rows } = await query(
    `SELECT ${BASE_COLS} FROM categories WHERE slug = $1 AND is_active = TRUE`,
    [slug]
  );
  return rows[0] || null;
};

export const categoryNameExists = async (name, excludeId = null) => {
  const { rows } = await query(
    `SELECT id FROM categories WHERE LOWER(name) = LOWER($1) ${excludeId ? 'AND id != $2' : ''}`,
    excludeId ? [name, excludeId] : [name]
  );
  return rows.length > 0;
};

export const categorySlugExists = async (slug, excludeId = null) => {
  const { rows } = await query(
    `SELECT id FROM categories WHERE slug = $1 ${excludeId ? 'AND id != $2' : ''}`,
    excludeId ? [slug, excludeId] : [slug]
  );
  return rows.length > 0;
};

export const createCategory = async ({ name, slug, description, imageUrl, imagePublicId, sortOrder }) => {
  const { rows } = await query(
    `INSERT INTO categories (name, slug, description, image_url, sort_order)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING ${BASE_COLS}`,
    [name, slug, description || null, imageUrl || null, sortOrder ?? 0]
  );
  return rows[0];
};

export const updateCategoryById = async (id, { name, slug, description, imageUrl, isActive, sortOrder }) => {
  const { rows } = await query(
    `UPDATE categories SET
       name        = COALESCE($1, name),
       slug        = COALESCE($2, slug),
       description = COALESCE($3, description),
       image_url   = COALESCE($4, image_url),
       is_active   = COALESCE($5, is_active),
       sort_order  = COALESCE($6, sort_order),
       updated_at  = NOW()
     WHERE id = $7
     RETURNING ${BASE_COLS}`,
    [name, slug, description, imageUrl, isActive, sortOrder, id]
  );
  return rows[0] || null;
};

export const deleteCategoryById = async (id) => {
  const { rows } = await query(
    `UPDATE categories SET is_active = FALSE, updated_at = NOW()
     WHERE id = $1 RETURNING id`,
    [id]
  );
  return rows[0] || null;
};

export const getCategoryProductCount = async (id) => {
  const { rows } = await query(
    `SELECT COUNT(*) FROM products WHERE category_id = $1 AND is_active = TRUE`,
    [id]
  );
  return Number(rows[0].count);
};
