import express from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth.js';
import { uploadExcel } from '../controllers/uploadController.js';
import File from '../models/File.js'; 

const router = express.Router();


const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, 
  fileFilter: (req, file, cb) => {
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    if (validTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files are allowed (.xls or .xlsx)'));
    }
  },
});


router.post('/upload', authenticate, async (req, res, next) => {
  if (req.user.role !== 'user') {
    return res.status(403).json({ message: 'Only users can upload files' });
  }
  next();
}, upload.single('file'), uploadExcel);


router.get('/files', authenticate, async (req, res) => {
  try {
    const files = await File.find({ user: req.user.id }).sort({ uploadedAt: -1 });

    const formattedFiles = files.map(file => ({
      _id: file._id,
      filename: file.filename,
      uploadDate: file.uploadedAt,
      sheetName: file.sheetName || 'Sheet1',
      fileUrl: file.url, 
    }));

    res.status(200).json({ success: true, files: formattedFiles });
  } catch (error) {
    console.error('Fetch files error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch uploaded files' });
  }
});

router.delete('/files/:id', authenticate, async (req, res) => {
  try {
    const deleted = await File.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'File not found or not authorized',
      });
    }

    res.status(200).json({ success: true, message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ success: false, message: 'Internal server error during delete' });
  }
});

export default router;
