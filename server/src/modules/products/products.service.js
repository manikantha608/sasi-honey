import redis, { TTL } from '../../config/redis.js';
import { uploadImage, deleteImage } from '../../config/cloudinary.js';
import { getPagination } from '../../utils/pagination.js';
import { createError } from '../../middleware/errorHandler.js';
import { getCategoryById } from '../categories/categories.repository.js';
import {
  getProductsList,
  getProductBySlug,
  getProductById,
  getProductVariants,
  getProductImages,
  productSlugExists,
  createProduct,
  updateProductById,
  deleteProductById,
  getVariantById,
  addVariant,
  updateVariantById,
  deleteVariantById,
  skuExists,
  addProductImage,
  getImageById,
  deleteImageById,
} from './products.repository.js';

// ─── Slug helper ──────────────────────────────────────────────────────────────
const toSlug = (str) =>
  str.toLowerCase().trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');

// ─── Cache keys ───────────────────────────────────────────────────────────────
const CACHE = {
  slug:        (s) => `product:${s}`,
  featured:    'products:featured',
  bestsellers: 'products:bestsellers',
};

const bustProduct = async (slug) => redis.del(CACHE.slug(slug));
const bustLists   = async () =>
  Promise.all([redis.del(CACHE.featured), redis.del(CACHE.bestsellers)]);

// ─── Build full product response ──────────────────────────────────────────────
const buildProductDetail = async (product) => {
  const [variants, images] = await Promise.all([
    getProductVariants(product.id),
    getProductImages(product.id),
  ]);
  return { ...product, variants, images };
};

// ─── Public ───────────────────────────────────────────────────────────────────

export const listProducts = async (queryParams) => {
  const { page, limit, offset } = getPagination(queryParams);
  const { category, search, sort, featured, bestseller } = queryParams;

  const { rows, total } = await getProductsList({
    limit, offset,
    categoryId:   category   || null,
    search:       search     || null,
    isFeatured:   featured   === 'true',
    isBestseller: bestseller === 'true',
    sortBy:       sort       || 'newest',
  });

  return { products: rows, total, page, limit, totalPages: Math.ceil(total / limit) };
};

export const getProductDetail = async (slug) => {
  const cached = await redis.get(CACHE.slug(slug));
  if (cached) return JSON.parse(cached);

  const product = await getProductBySlug(slug);
  if (!product) throw createError('Product not found', 404);

  const full = await buildProductDetail(product);
  await redis.setex(CACHE.slug(slug), TTL.PRODUCT, JSON.stringify(full));
  return full;
};

export const getFeaturedProducts = async () => {
  const cached = await redis.get(CACHE.featured);
  if (cached) return JSON.parse(cached);

  const { rows } = await getProductsList({ limit: 8, offset: 0, isFeatured: true, sortBy: 'newest' });
  await redis.setex(CACHE.featured, TTL.PRODUCT, JSON.stringify(rows));
  return rows;
};

export const getBestsellerProducts = async () => {
  const cached = await redis.get(CACHE.bestsellers);
  if (cached) return JSON.parse(cached);

  const { rows } = await getProductsList({ limit: 8, offset: 0, isBestseller: true, sortBy: 'newest' });
  await redis.setex(CACHE.bestsellers, TTL.PRODUCT, JSON.stringify(rows));
  return rows;
};

// ─── Admin ────────────────────────────────────────────────────────────────────

export const createProductAdmin = async (fields) => {
  const { categoryId, name } = fields;

  const category = await getCategoryById(categoryId);
  if (!category) throw createError('Category not found', 404);

  const slug = fields.slug || toSlug(name);
  if (await productSlugExists(slug)) throw createError('A product with this slug already exists', 409);

  const product = await createProduct({ ...fields, slug });
  await bustLists();
  return product;
};

export const updateProductAdmin = async (id, fields) => {
  const existing = await getProductById(id);
  if (!existing) throw createError('Product not found', 404);

  if (fields.categoryId) {
    const cat = await getCategoryById(fields.categoryId);
    if (!cat) throw createError('Category not found', 404);
  }
  if (fields.slug && fields.slug !== existing.slug) {
    if (await productSlugExists(fields.slug, id)) throw createError('Slug already in use', 409);
  }

  const updated = await updateProductById(id, fields);
  await bustProduct(existing.slug);
  await bustLists();
  return updated;
};

export const deleteProductAdmin = async (id) => {
  const existing = await getProductById(id);
  if (!existing) throw createError('Product not found', 404);

  await deleteProductById(id);
  await bustProduct(existing.slug);
  await bustLists();
};

// ─── Admin — Images ───────────────────────────────────────────────────────────

export const uploadProductImage = async (productId, fileBuffer, mimetype, { altText, isPrimary, sortOrder }) => {
  const product = await getProductById(productId);
  if (!product) throw createError('Product not found', 404);

  const dataUri = `data:${mimetype};base64,${fileBuffer.toString('base64')}`;
  const result  = await uploadImage(dataUri, 'products');

  const image = await addProductImage(productId, {
    imageUrl: result.secure_url,
    publicId: result.public_id,
    altText,
    isPrimary: isPrimary === 'true' || isPrimary === true,
    sortOrder: Number(sortOrder) || 0,
  });

  await bustProduct(product.slug);
  return image;
};

export const deleteProductImage = async (productId, imageId) => {
  const image = await getImageById(imageId);
  if (!image || image.product_id !== productId) throw createError('Image not found', 404);

  await deleteImage(image.public_id).catch(() => {});  // best-effort Cloudinary delete
  await deleteImageById(imageId);

  const product = await getProductById(productId);
  if (product) await bustProduct(product.slug);
};

// ─── Admin — Variants ─────────────────────────────────────────────────────────

export const addProductVariant = async (productId, fields) => {
  const product = await getProductById(productId);
  if (!product) throw createError('Product not found', 404);

  if (await skuExists(fields.sku)) throw createError('SKU already in use', 409);

  const variant = await addVariant(productId, fields);
  await bustProduct(product.slug);
  return variant;
};

export const updateProductVariant = async (productId, variantId, fields) => {
  const variant = await getVariantById(variantId);
  if (!variant || variant.product_id !== productId) throw createError('Variant not found', 404);

  if (fields.sku && fields.sku !== variant.sku) {
    if (await skuExists(fields.sku, variantId)) throw createError('SKU already in use', 409);
  }

  const updated = await updateVariantById(variantId, fields);
  const product = await getProductById(productId);
  if (product) await bustProduct(product.slug);
  return updated;
};

export const deleteProductVariant = async (productId, variantId) => {
  const variant = await getVariantById(variantId);
  if (!variant || variant.product_id !== productId) throw createError('Variant not found', 404);

  await deleteVariantById(variantId);
  const product = await getProductById(productId);
  if (product) await bustProduct(product.slug);
};
