import { Router } from 'express';
import { adminOnly } from '../../middleware/auth.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/response.js';
import {
  getDashboardStats,
  getAllProductsAdmin,
  getAllCategoriesAdmin,
} from './admin.service.js';

const router = Router();

// All admin routes require authentication + admin role
router.use(adminOnly);

// ─── Health ───────────────────────────────────────────────────────────────────
router.get('/health', (_, res) => res.json({ module: 'admin', status: 'ok' }));

// ─── Dashboard ────────────────────────────────────────────────────────────────
/** GET /api/admin/stats */
router.get('/stats', asyncHandler(async (_, res) => {
  const stats = await getDashboardStats();
  sendSuccess(res, { stats });
}));

// ─── Products (admin view — includes inactive) ────────────────────────────────
/** GET /api/admin/products */
router.get('/products', asyncHandler(async (_, res) => {
  const products = await getAllProductsAdmin();
  sendSuccess(res, { products });
}));

// ─── Categories (admin view — includes inactive) ──────────────────────────────
/** GET /api/admin/categories */
router.get('/categories', asyncHandler(async (_, res) => {
  const categories = await getAllCategoriesAdmin();
  sendSuccess(res, { categories });
}));

export default router;
