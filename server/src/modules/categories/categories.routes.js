import { Router } from 'express';

const router = Router();

// Routes will be implemented in Phase 2+
// GET  /api/categories
// POST /api/categories         (admin)
// PUT  /api/categories/:id     (admin)
// DELETE /api/categories/:id   (admin)

router.get('/health', (req, res) => res.json({ module: 'categories', status: 'ok' }));

export default router;
