const express = require('express');
const router = express.Router();
const {
  createChat,
  getChats,
  getChat,
  sendMessage,
  deleteChat,
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getChats)
  .post(protect, createChat);

router.route('/:id')
  .get(protect, getChat)
  .delete(protect, deleteChat);

router.post('/:id/message', protect, sendMessage);

module.exports = router;
