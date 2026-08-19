import express from 'express';
import {
  createOrUpdateProfile,
  getProfileByUserId,
  getAllProfiles,
} from '../controllers/profileController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// POST /api/profiles - Create or update own profile
// Identity comes from the token — a candidate cannot write another user's profile.
router.post('/', requireAuth, (req, res, next) => {
  if (req.auth.role !== 'admin') {
    req.body.userId = req.auth.sub;
  }
  next();
}, createOrUpdateProfile);

// GET /api/profiles - Get all profiles (admin only)
router.get('/', requireAdmin, getAllProfiles);

// GET /api/profiles/user/:userId - Own profile, or any profile for admins
router.get('/user/:userId', requireAuth, (req, res, next) => {
  if (req.auth.role !== 'admin' && req.params.userId !== req.auth.sub) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
}, getProfileByUserId);

export default router;
