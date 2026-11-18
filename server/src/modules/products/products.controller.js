import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess, sendPaginated } from '../../utils/response.js';
import {
  listProducts,
  getProductDetail,
  getFeaturedProducts,
  getBestsellerProducts,
  createProductAdmin,
  updateProductAdmin,
  deleteProductAdmin,
  uploadProductImage,
  deleteProductImage,
  addProductVariant,
  updateProductVariant,
  deleteProductVariant,
} from './products.service.js';

// ─── Public ───────────────────────────────────────────────────────────────────

/** GET /api/products */
export const getProducts = asyncHandler(async (req, res) => {
  const { products, total, page, limit, totalPages } = await listProducts(req.query);
  sendPaginated(res, { products }, total, page, limit);
});

/** GET /api/products/featured */
export const getFeatured = asyncHandler(async (req, res) => {
  const products = await getFeaturedProducts();
  sendSuccess(res, { products });
});

/** GET /api/products/bestsellers */
export const getBestsellers = asyncHandler(async (req, res) => {
  const products = await getBestsellerProducts();
  sendSuccess(res, { products });
});

/** GET /api/products/:slug */
export const getProduct = asyncHandler(async (req, res) => {
  const product = await getProductDetail(req.params.slug);
  sendSuccess(res, { product });
});

// ─── Admin ────────────────────────────────────────────────────────────────────

/** POST /api/products */
export const createProductHandler = asyncHandler(async (req, res) => {
  const product = await createProductAdmin(req.body);
  sendSuccess(res, { product }, 'Product created', 201);
});

/** PUT /api/products/:id */
export const updateProductHandler = asyncHandler(async (req, res) => {
  const product = await updateProductAdmin(req.params.id, req.body);
  sendSuccess(res, { product }, 'Product updated');
});

/** DELETE /api/products/:id */
export const deleteProductHandler = asyncHandler(async (req, res) => {
  await deleteProductAdmin(req.params.id);
  sendSuccess(res, null, 'Product deleted');
});

/** POST /api/products/:id/images */
export const uploadImageHandler = asyncHandler(async (req, res) => {
  if (!req.file) throw new Error('No image file provided');
  const { altText, isPrimary, sortOrder } = req.body;
  const image = await uploadProductImage(
    req.params.id, req.file.buffer, req.file.mimetype,
    { altText, isPrimary, sortOrder }
  );
  sendSuccess(res, { image }, 'Image uploaded', 201);
});

/** DELETE /api/products/:id/images/:imageId */
export const deleteImageHandler = asyncHandler(async (req, res) => {
  await deleteProductImage(req.params.id, req.params.imageId);
  sendSuccess(res, null, 'Image deleted');
});

/** POST /api/products/:id/variants */
export const addVariantHandler = asyncHandler(async (req, res) => {
  const variant = await addProductVariant(req.params.id, req.body);
  sendSuccess(res, { variant }, 'Variant added', 201);
});

/** PUT /api/products/:id/variants/:variantId */
export const updateVariantHandler = asyncHandler(async (req, res) => {
  const variant = await updateProductVariant(req.params.id, req.params.variantId, req.body);
  sendSuccess(res, { variant }, 'Variant updated');
});

/** DELETE /api/products/:id/variants/:variantId */
export const deleteVariantHandler = asyncHandler(async (req, res) => {
  await deleteProductVariant(req.params.id, req.params.variantId);
  sendSuccess(res, null, 'Variant deleted');
});
