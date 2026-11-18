import { Router } from 'express';
import multer from 'multer';
import { adminOnly } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import {
  createProductSchema,
  updateProductSchema,
  addVariantSchema,
  updateVariantSchema,
  listProductsSchema,
} from './products.schema.js';
import {
  getProducts,
  getFeatured,
  getBestsellers,
  getProduct,
  createProductHandler,
  updateProductHandler,
  deleteProductHandler,
  uploadImageHandler,
  deleteImageHandler,
  addVariantHandler,
  updateVariantHandler,
  deleteVariantHandler,
} from './products.controller.js';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_, file, cb) =>
    file.mimetype.startsWith('image/')
      ? cb(null, true)
      : cb(new Error('Only image files are allowed')),
});

// ─── Health ───────────────────────────────────────────────────────────────────
router.get('/health', (_, res) => res.json({ module: 'products', status: 'ok' }));

// ─── Public — IMPORTANT: static routes before /:slug ─────────────────────────
router.get('/featured',    getFeatured);
router.get('/bestsellers', getBestsellers);

router.get('/', validate(listProductsSchema, 'query'), getProducts);
router.get('/:slug', getProduct);

// ─── Admin ────────────────────────────────────────────────────────────────────
router.post('/',   adminOnly, validate(createProductSchema), createProductHandler);
router.put('/:id', adminOnly, validate(updateProductSchema), updateProductHandler);
router.delete('/:id', adminOnly, deleteProductHandler);

// Images
router.post('/:id/images',               adminOnly, upload.single('image'), uploadImageHandler);
router.delete('/:id/images/:imageId',    adminOnly, deleteImageHandler);

// Variants
router.post('/:id/variants',                       adminOnly, validate(addVariantSchema),    addVariantHandler);
router.put('/:id/variants/:variantId',             adminOnly, validate(updateVariantSchema), updateVariantHandler);
router.delete('/:id/variants/:variantId',          adminOnly, deleteVariantHandler);

export default router;
