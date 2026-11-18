import { Router } from 'express';
import multer from 'multer';
import { adminOnly } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { createCategorySchema, updateCategorySchema } from './categories.schema.js';
import {
  getCategories,
  getCategoryBySlugHandler,
  createCategoryHandler,
  updateCategoryHandler,
  uploadCategoryImageHandler,
  deleteCategoryHandler,
} from './categories.controller.js';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter: (_, file, cb) =>
    file.mimetype.startsWith('image/')
      ? cb(null, true)
      : cb(new Error('Only image files are allowed')),
});

// ─── Health ───────────────────────────────────────────────────────────────────
router.get('/health', (_, res) => res.json({ module: 'categories', status: 'ok' }));

// ─── Public ───────────────────────────────────────────────────────────────────
router.get('/', getCategories);
router.get('/:slug', getCategoryBySlugHandler);

// ─── Admin ────────────────────────────────────────────────────────────────────
router.post('/',             adminOnly, validate(createCategorySchema), createCategoryHandler);
router.put('/:id',           adminOnly, validate(updateCategorySchema), updateCategoryHandler);
router.post('/:id/image',    adminOnly, upload.single('image'), uploadCategoryImageHandler);
router.delete('/:id',        adminOnly, deleteCategoryHandler);

export default router;
