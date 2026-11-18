import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/response.js';
import {
  listCategories,
  getCategoryDetail,
  createCategoryAdmin,
  updateCategoryAdmin,
  uploadCategoryImage,
  deleteCategoryAdmin,
} from './categories.service.js';

/** GET /api/categories */
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await listCategories();
  sendSuccess(res, { categories });
});

/** GET /api/categories/:slug */
export const getCategoryBySlugHandler = asyncHandler(async (req, res) => {
  const category = await getCategoryDetail(req.params.slug);
  sendSuccess(res, { category });
});

/** POST /api/categories  [admin] */
export const createCategoryHandler = asyncHandler(async (req, res) => {
  const { name, slug, description, sortOrder } = req.body;
  const category = await createCategoryAdmin({ name, slug, description, sortOrder });
  sendSuccess(res, { category }, 'Category created', 201);
});

/** PUT /api/categories/:id  [admin] */
export const updateCategoryHandler = asyncHandler(async (req, res) => {
  const { name, slug, description, isActive, sortOrder } = req.body;
  const category = await updateCategoryAdmin(req.params.id, { name, slug, description, isActive, sortOrder });
  sendSuccess(res, { category }, 'Category updated');
});

/** POST /api/categories/:id/image  [admin] */
export const uploadCategoryImageHandler = asyncHandler(async (req, res) => {
  if (!req.file) throw new Error('No image file provided');
  const category = await uploadCategoryImage(req.params.id, req.file.buffer, req.file.mimetype);
  sendSuccess(res, { category }, 'Image uploaded');
});

/** DELETE /api/categories/:id  [admin] */
export const deleteCategoryHandler = asyncHandler(async (req, res) => {
  await deleteCategoryAdmin(req.params.id);
  sendSuccess(res, null, 'Category deleted');
});
