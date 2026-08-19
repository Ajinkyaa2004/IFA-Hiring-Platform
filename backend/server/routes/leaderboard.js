import express from 'express';
import { getLeaderboard } from '../controllers/leaderboardController.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET /api/leaderboard - Ranked candidates incl. emails (admin only)
router.get('/', requireAdmin, getLeaderboard);

export default router;
