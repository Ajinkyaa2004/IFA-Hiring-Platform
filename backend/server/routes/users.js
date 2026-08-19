import express from 'express';
import { getAllUsers } from '../controllers/userController.js';
import { register, login } from '../controllers/authController.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// POST /api/users/register - Applicant self-registration (email + password)
router.post('/register', register);

// POST /api/users/login - Email + password login, returns JWT
router.post('/login', login);

// GET /api/users - Get all users (admin only)
router.get('/', requireAdmin, getAllUsers);

export default router;
