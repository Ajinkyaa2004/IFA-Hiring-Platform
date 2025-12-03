import express from 'express';
import {
    getSettings,
    updateSettings,
} from '../controllers/settingsController.js';

const router = express.Router();

// GET /api/settings - Get application settings
router.get('/', getSettings);

// PUT /api/settings - Update application settings (admin only)
router.put('/', updateSettings);

export default router;
