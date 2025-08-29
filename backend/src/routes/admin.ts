import { Router } from 'express';

const router = Router();

router.get('/dashboard', (req, res) => {
  res.json({ success: true, message: 'Admin dashboard endpoint - Coming soon' });
});

export default router;