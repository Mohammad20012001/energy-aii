import express from 'express';
import { chatController } from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// مسار الدردشة العام (بدون مصادقة)
router.post('/public', chatController);

// مسار الدردشة المحمي (يتطلب مصادقة)
router.post('/', protect, chatController);

export default router;