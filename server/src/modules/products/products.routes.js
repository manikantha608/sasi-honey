import { Router } from 'express';

const router = Router();

// Routes will be implemented in Phase 2+
// GET  /api/products
// GET  /api/products/:id
// POST /api/products          (admin)
// PUT  /api/products/:id      (admin)
// DELETE /api/products/:id    (admin)

router.get('/health', (req, res) => res.json({ module: 'products', status: 'ok' }));

export default router;
