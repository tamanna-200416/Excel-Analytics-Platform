// routes/analytics.js
import express from 'express';
import File from '../models/File.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/chart-count', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await File.countDocuments({ user: userId });

    res.json({ success: true, count });
  } catch (err) {
    console.error('Error fetching chart count:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
