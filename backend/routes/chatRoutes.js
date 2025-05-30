const express = require('express');
const router = express.Router();
const {
  createChat,
  getChats,
  getChat,
  sendMessage,
  sendPublicMessage,
  deleteChat,
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

// Public chat endpoint for anonymous users
router.post('/public', sendPublicMessage);

router.route('/')
  .get(protect, getChats)
  .post(protect, createChat);

router.route('/:id')
  .get(protect, getChat)
  .delete(protect, deleteChat);

router.post('/:id/message', protect, sendMessage);

module.exports = router;
