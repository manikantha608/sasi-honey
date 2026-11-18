import redis, { TTL } from '../../config/redis.js';
import { uploadImage, deleteImage } from '../../config/cloudinary.js';
import { createError } from '../../middleware/errorHandler.js';
import {
  getAllCategories,
  getCategoryById,
  getCategoryBySlug,
  categoryNameExists,
  categorySlugExists,
  createCategory,
  updateCategoryById,
  deleteCategoryById,
  getCategoryProductCount,
} from './categories.repository.js';

// ─── Slug helper ──────────────────────────────────────────────────────────────
const toSlug = (str) =>
  str.toLowerCase().trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');

// ─── Cache keys ───────────────────────────────────────────────────────────────
const CACHE = {
  all:  'categories:all',
  slug: (s) => `category:${s}`,
};

const bust = async () => redis.del(CACHE.all);

// ─── Public ───────────────────────────────────────────────────────────────────

export const listCategories = async () => {
  const cached = await redis.get(CACHE.all);
  if (cached) return JSON.parse(cached);

  const rows = await getAllCategories();
  await redis.setex(CACHE.all, TTL.CATEGORY, JSON.stringify(rows));
  return rows;
};

export const getCategoryDetail = async (slug) => {
  const cached = await redis.get(CACHE.slug(slug));
  if (cached) return JSON.parse(cached);

  const category = await getCategoryBySlug(slug);
  if (!category) throw createError('Category not found', 404);

  await redis.setex(CACHE.slug(slug), TTL.CATEGORY, JSON.stringify(category));
  return category;
};

// ─── Admin ────────────────────────────────────────────────────────────────────

export const createCategoryAdmin = async ({ name, slug, description, sortOrder }) => {
  const finalSlug = slug || toSlug(name);

  if (await categoryNameExists(name))       throw createError('A category with this name already exists', 409);
  if (await categorySlugExists(finalSlug))  throw createError('A category with this slug already exists', 409);

  const category = await createCategory({ name, slug: finalSlug, description, sortOrder });
  await bust();
  return category;
};

export const updateCategoryAdmin = async (id, fields) => {
  const existing = await getCategoryById(id);
  if (!existing) throw createError('Category not found', 404);

  if (fields.name && fields.name !== existing.name) {
    if (await categoryNameExists(fields.name, id)) throw createError('Category name already in use', 409);
  }
  if (fields.slug && fields.slug !== existing.slug) {
    if (await categorySlugExists(fields.slug, id)) throw createError('Category slug already in use', 409);
  }

  const updated = await updateCategoryById(id, fields);
  await bust();
  await redis.del(CACHE.slug(existing.slug));
  return updated;
};

export const uploadCategoryImage = async (id, fileBuffer, mimetype) => {
  const existing = await getCategoryById(id);
  if (!existing) throw createError('Category not found', 404);

  const dataUri = `data:${mimetype};base64,${fileBuffer.toString('base64')}`;
  const result = await uploadImage(dataUri, 'categories');

  const updated = await updateCategoryById(id, { imageUrl: result.secure_url });
  await bust();
  await redis.del(CACHE.slug(existing.slug));
  return updated;
};

export const deleteCategoryAdmin = async (id) => {
  const existing = await getCategoryById(id);
  if (!existing) throw createError('Category not found', 404);

  const productCount = await getCategoryProductCount(id);
  if (productCount > 0) {
    throw createError(`Cannot delete — ${productCount} active product(s) are linked to this category`, 400);
  }

  await deleteCategoryById(id);
  await bust();
  await redis.del(CACHE.slug(existing.slug));
};
