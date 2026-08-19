import express from 'express';
import {
  createOrUpdateAssessment,
  getAssessmentByUserId,
  getAllAssessments,
} from '../controllers/assessmentController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// POST /api/assessments - Create or update own assessment
// Identity comes from the token — a candidate cannot write another user's scores.
router.post('/', requireAuth, (req, res, next) => {
  if (req.auth.role !== 'admin') {
    req.body.userId = req.auth.sub;
  }
  next();
}, createOrUpdateAssessment);

// GET /api/assessments - Get all assessments (admin only)
router.get('/', requireAdmin, getAllAssessments);

// GET /api/assessments/user/:userId - Own assessment, or any for admins
router.get('/user/:userId', requireAuth, (req, res, next) => {
  if (req.auth.role !== 'admin' && req.params.userId !== req.auth.sub) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
}, getAssessmentByUserId);

export default router;
