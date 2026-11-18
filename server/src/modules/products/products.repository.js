import { query } from '../../config/database.js';

// ─── Product list (with joins) ────────────────────────────────────────────────

export const getProductsList = async ({
  limit, offset, categoryId, search, isFeatured, isBestseller, sortBy,
}) => {
  const conditions = ['p.is_active = TRUE', 'c.is_active = TRUE'];
  const params = [];
  let idx = 1;

  if (categoryId) {
    params.push(categoryId);
    conditions.push(`p.category_id = $${idx++}`);
  }
  if (search) {
    params.push(`%${search}%`);
    conditions.push(`(p.name ILIKE $${idx} OR p.short_desc ILIKE $${idx})`);
    idx++;
  }
  if (isFeatured)   conditions.push('p.is_featured = TRUE');
  if (isBestseller) conditions.push('p.is_bestseller = TRUE');

  const where = conditions.join(' AND ');

  const sortMap = {
    newest:     'p.created_at DESC',
    price_asc:  'min_price ASC',
    price_desc: 'min_price DESC',
    name_asc:   'p.name ASC',
  };
  const orderBy = sortMap[sortBy] || 'p.created_at DESC';

  // Total count
  const { rows: countRows } = await query(
    `SELECT COUNT(DISTINCT p.id) AS total
     FROM products p
     JOIN categories c ON c.id = p.category_id
     WHERE ${where}`,
    params
  );
  const total = Number(countRows[0].total);

  // Data — left-join images and variants for aggregated fields
  params.push(limit, offset);
  const { rows } = await query(`
    SELECT
      p.id, p.name, p.slug, p.short_desc, p.is_featured, p.is_bestseller, p.created_at,
      c.id   AS category_id,   c.name AS category_name,   c.slug AS category_slug,
      img.image_url AS primary_image,  img.alt_text AS primary_image_alt,
      COALESCE(MIN(pv.price), 0)       AS min_price,
      COALESCE(MAX(pv.mrp),   0)       AS max_mrp,
      COALESCE(SUM(pv.stock_qty), 0)   AS total_stock,
      COUNT(DISTINCT pv.id)            AS variant_count
    FROM products p
    JOIN categories c   ON c.id  = p.category_id
    LEFT JOIN product_images   img ON img.product_id = p.id AND img.is_primary = TRUE
    LEFT JOIN product_variants pv  ON pv.product_id  = p.id AND pv.is_active  = TRUE
    WHERE ${where}
    GROUP BY p.id, c.id, img.image_url, img.alt_text
    ORDER BY ${orderBy}
    LIMIT $${idx++} OFFSET $${idx++}
  `, params);

  return { rows, total };
};

// ─── Single product (full detail) ─────────────────────────────────────────────

export const getProductBySlug = async (slug) => {
  const { rows } = await query(`
    SELECT p.*,
           c.id AS category_id, c.name AS category_name, c.slug AS category_slug
    FROM products p
    JOIN categories c ON c.id = p.category_id
    WHERE p.slug = $1 AND p.is_active = TRUE
  `, [slug]);
  return rows[0] || null;
};

export const getProductById = async (id) => {
  const { rows } = await query(`
    SELECT p.*,
           c.id AS category_id, c.name AS category_name, c.slug AS category_slug
    FROM products p
    JOIN categories c ON c.id = p.category_id
    WHERE p.id = $1
  `, [id]);
  return rows[0] || null;
};

export const getProductVariants = async (productId) => {
  const { rows } = await query(`
    SELECT * FROM product_variants
    WHERE product_id = $1 AND is_active = TRUE
    ORDER BY sort_order ASC, weight_grams ASC
  `, [productId]);
  return rows;
};

export const getProductImages = async (productId) => {
  const { rows } = await query(`
    SELECT * FROM product_images
    WHERE product_id = $1
    ORDER BY is_primary DESC, sort_order ASC
  `, [productId]);
  return rows;
};

// ─── Admin mutations ──────────────────────────────────────────────────────────

export const productSlugExists = async (slug, excludeId = null) => {
  const { rows } = await query(
    `SELECT id FROM products WHERE slug = $1 ${excludeId ? 'AND id != $2' : ''}`,
    excludeId ? [slug, excludeId] : [slug]
  );
  return rows.length > 0;
};

export const createProduct = async ({ categoryId, name, slug, description, shortDesc, isFeatured, isBestseller, metaTitle, metaDesc }) => {
  const { rows } = await query(`
    INSERT INTO products
      (category_id, name, slug, description, short_desc, is_featured, is_bestseller, meta_title, meta_desc)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    RETURNING *
  `, [categoryId, name, slug, description || null, shortDesc || null,
      isFeatured ?? false, isBestseller ?? false, metaTitle || null, metaDesc || null]);
  return rows[0];
};

export const updateProductById = async (id, fields) => {
  const { rows } = await query(`
    UPDATE products SET
      category_id  = COALESCE($1,  category_id),
      name         = COALESCE($2,  name),
      slug         = COALESCE($3,  slug),
      description  = COALESCE($4,  description),
      short_desc   = COALESCE($5,  short_desc),
      is_featured  = COALESCE($6,  is_featured),
      is_bestseller= COALESCE($7,  is_bestseller),
      is_active    = COALESCE($8,  is_active),
      meta_title   = COALESCE($9,  meta_title),
      meta_desc    = COALESCE($10, meta_desc),
      updated_at   = NOW()
    WHERE id = $11
    RETURNING *
  `, [fields.categoryId, fields.name, fields.slug, fields.description, fields.shortDesc,
      fields.isFeatured, fields.isBestseller, fields.isActive, fields.metaTitle, fields.metaDesc, id]);
  return rows[0] || null;
};

export const deleteProductById = async (id) => {
  const { rows } = await query(
    `UPDATE products SET is_active = FALSE, updated_at = NOW() WHERE id = $1 RETURNING id`,
    [id]
  );
  return rows[0] || null;
};

// ─── Variants ─────────────────────────────────────────────────────────────────

export const getVariantById = async (id) => {
  const { rows } = await query(`SELECT * FROM product_variants WHERE id = $1`, [id]);
  return rows[0] || null;
};

export const addVariant = async (productId, { weightGrams, label, price, mrp, sku, stockQty, lowStockThreshold, sortOrder }) => {
  const { rows } = await query(`
    INSERT INTO product_variants
      (product_id, weight_grams, label, price, mrp, sku, stock_qty, low_stock_threshold, sort_order)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    RETURNING *
  `, [productId, weightGrams, label, price, mrp, sku, stockQty ?? 0, lowStockThreshold ?? 5, sortOrder ?? 0]);
  return rows[0];
};

export const updateVariantById = async (id, fields) => {
  const { rows } = await query(`
    UPDATE product_variants SET
      weight_grams        = COALESCE($1, weight_grams),
      label               = COALESCE($2, label),
      price               = COALESCE($3, price),
      mrp                 = COALESCE($4, mrp),
      sku                 = COALESCE($5, sku),
      stock_qty           = COALESCE($6, stock_qty),
      low_stock_threshold = COALESCE($7, low_stock_threshold),
      is_active           = COALESCE($8, is_active),
      sort_order          = COALESCE($9, sort_order),
      updated_at          = NOW()
    WHERE id = $10
    RETURNING *
  `, [fields.weightGrams, fields.label, fields.price, fields.mrp, fields.sku,
      fields.stockQty, fields.lowStockThreshold, fields.isActive, fields.sortOrder, id]);
  return rows[0] || null;
};

export const deleteVariantById = async (id) => {
  const { rows } = await query(
    `UPDATE product_variants SET is_active = FALSE, updated_at = NOW() WHERE id = $1 RETURNING id`,
    [id]
  );
  return rows[0] || null;
};

export const skuExists = async (sku, excludeId = null) => {
  const { rows } = await query(
    `SELECT id FROM product_variants WHERE sku = $1 ${excludeId ? 'AND id != $2' : ''}`,
    excludeId ? [sku, excludeId] : [sku]
  );
  return rows.length > 0;
};

// ─── Images ───────────────────────────────────────────────────────────────────

export const addProductImage = async (productId, { imageUrl, publicId, altText, isPrimary, sortOrder }) => {
  // If this is primary, unset other primary images first
  if (isPrimary) {
    await query(
      `UPDATE product_images SET is_primary = FALSE WHERE product_id = $1`,
      [productId]
    );
  }
  const { rows } = await query(`
    INSERT INTO product_images (product_id, image_url, public_id, alt_text, is_primary, sort_order)
    VALUES ($1,$2,$3,$4,$5,$6) RETURNING *
  `, [productId, imageUrl, publicId, altText || null, isPrimary ?? false, sortOrder ?? 0]);
  return rows[0];
};

export const getImageById = async (id) => {
  const { rows } = await query(`SELECT * FROM product_images WHERE id = $1`, [id]);
  return rows[0] || null;
};

export const deleteImageById = async (id) => {
  const { rows } = await query(`DELETE FROM product_images WHERE id = $1 RETURNING *`, [id]);
  return rows[0] || null;
};
