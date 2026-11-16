import { Router } from 'express';

const router = Router();

// Routes will be implemented in Phase 4+
// POST /api/payments/create
// POST /api/payments/verify
// POST /api/payments/webhook

router.get('/health', (req, res) => res.json({ module: 'payments', status: 'ok' }));

export default router;
