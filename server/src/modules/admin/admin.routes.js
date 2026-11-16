import { Router } from 'express';

const router = Router();

// Routes will be implemented in Phase 6+
// GET /api/admin/dashboard
// GET /api/admin/orders
// GET /api/admin/customers
// GET /api/admin/products
// GET /api/admin/reports/monthly

router.get('/health', (req, res) => res.json({ module: 'admin', status: 'ok' }));

export default router;
