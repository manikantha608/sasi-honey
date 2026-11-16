import { Router } from 'express';

const router = Router();

// Routes will be implemented in Phase 4+
// POST /api/orders
// GET  /api/orders
// GET  /api/orders/:id

router.get('/health', (req, res) => res.json({ module: 'orders', status: 'ok' }));

export default router;
