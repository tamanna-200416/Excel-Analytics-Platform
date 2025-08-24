import express from 'express';
import File from '../models/File.js';

const router = express.Router();

/**
 * GET /api/files/:id/data
 * Fetch parsed Excel data from the File model
 */
router.get('/:id/data', async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found',
      });
    }

    const parsedData = file.parsedData;

    if (!Array.isArray(parsedData)) {
      return res.status(400).json({
        success: false,
        message: 'Parsed data not found or invalid format',
      });
    }

    return res.status(200).json({
      success: true,
      data: parsedData,
    });
  } catch (err) {
    console.error('Error fetching file data:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching file data',
    });
  }
});

export default router;
