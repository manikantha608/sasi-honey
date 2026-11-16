import { Router } from 'express';

const router = Router();

// Routes will be implemented in Phase 3+
// GET    /api/cart
// POST   /api/cart/items
// PATCH  /api/cart/items/:id
// DELETE /api/cart/items/:id

router.get('/health', (req, res) => res.json({ module: 'cart', status: 'ok' }));

export default router;
