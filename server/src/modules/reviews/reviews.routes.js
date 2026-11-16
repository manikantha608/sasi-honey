import { Router } from 'express';

const router = Router();

// Routes will be implemented in Phase 3+
// GET  /api/products/:productId/reviews
// POST /api/products/:productId/reviews

router.get('/health', (req, res) => res.json({ module: 'reviews', status: 'ok' }));

export default router;
