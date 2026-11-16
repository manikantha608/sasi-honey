import { Router } from 'express';

const router = Router();

// Routes will be implemented in Phase 2+
// GET  /api/users/profile
// PUT  /api/users/profile
// GET  /api/users/addresses
// POST /api/users/addresses
// PUT  /api/users/addresses/:id
// DELETE /api/users/addresses/:id

router.get('/health', (req, res) => res.json({ module: 'users', status: 'ok' }));

export default router;
