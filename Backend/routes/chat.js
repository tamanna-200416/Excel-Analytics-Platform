import express from 'express';
import Chat from '../models/Chat.js';

const router = express.Router();

// GET /api/chat/:fileId - Fetch chat messages by fileId
router.get('/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    const messages = await Chat.find({ fileId }).sort({ createdAt: 1 }); // Oldest to newest
    res.json({ success: true, messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/chat - Save a new chat message
router.post('/', async (req, res) => {
  try {
    const { fileId, sender, text } = req.body;
    if (!fileId || !sender || !text) {
      return res.status(400).json({ success: false, message: 'Missing fields' });
    }

    const newMessage = new Chat({ fileId, sender, text });
    await newMessage.save();

    res.json({ success: true, message: 'Message saved' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/chat/:fileId
router.delete('/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    await Chat.deleteMany({ fileId });
    res.json({ success: true, message: 'Chat cleared' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error clearing chat' });
  }
});


export default router;
