import { query } from '../../config/database.js';

export const getDashboardStats = async () => {
  // Fire all counts in parallel; use allSettled so one missing table (e.g. orders)
  // doesn't crash the whole response while the app is still being built out.
  const results = await Promise.allSettled([
    query(`SELECT COUNT(*) FROM products    WHERE is_active = TRUE`),
    query(`SELECT COUNT(*) FROM categories  WHERE is_active = TRUE`),
    query(`SELECT COUNT(*) FROM users       WHERE role = 'customer' AND is_active = TRUE`),
    query(`SELECT COUNT(*) FROM orders`),
    query(`SELECT COUNT(*) FROM product_variants
           WHERE stock_qty <= low_stock_threshold AND is_active = TRUE`),
    query(`SELECT COUNT(*) FROM products    WHERE is_featured = TRUE`),
    query(`SELECT COUNT(*) FROM products    WHERE is_bestseller = TRUE`),
  ]);

  const n = (r) => r.status === 'fulfilled' ? Number(r.value.rows[0].count) : 0;

  return {
    totalProducts:    n(results[0]),
    totalCategories:  n(results[1]),
    totalCustomers:   n(results[2]),
    totalOrders:      n(results[3]),
    lowStockCount:    n(results[4]),
    featuredProducts: n(results[5]),
    bestsellers:      n(results[6]),
  };
};

/** All products (including inactive) with aggregated fields — for admin table */
export const getAllProductsAdmin = async () => {
  const { rows } = await query(`
    SELECT
      p.id, p.name, p.slug, p.is_featured, p.is_bestseller, p.is_active, p.created_at,
      c.id   AS category_id,
      c.name AS category_name,
      img.image_url AS primary_image,
      COALESCE(MIN(pv.price), 0)     AS min_price,
      COALESCE(SUM(pv.stock_qty), 0) AS total_stock,
      COUNT(DISTINCT pv.id)          AS variant_count
    FROM products p
    JOIN categories c ON c.id = p.category_id
    LEFT JOIN product_images   img ON img.product_id = p.id AND img.is_primary = TRUE
    LEFT JOIN product_variants pv  ON pv.product_id  = p.id AND pv.is_active  = TRUE
    GROUP BY p.id, c.id, c.name, img.image_url
    ORDER BY p.created_at DESC
  `);
  return rows;
};

/** All categories (including inactive) for admin table */
export const getAllCategoriesAdmin = async () => {
  const { rows } = await query(`
    SELECT c.*,
           COUNT(p.id) AS product_count
    FROM categories c
    LEFT JOIN products p ON p.category_id = c.id AND p.is_active = TRUE
    GROUP BY c.id
    ORDER BY c.sort_order ASC, c.name ASC
  `);
  return rows;
};
