import { Router } from 'express';

const router = Router();

// Routes will be implemented in Phase 3+
// GET  /api/coupons/validate
// POST /api/coupons            (admin)
// PUT  /api/coupons/:id        (admin)
// DELETE /api/coupons/:id      (admin)

router.get('/health', (req, res) => res.json({ module: 'coupons', status: 'ok' }));

export default router;
