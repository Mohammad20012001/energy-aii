import express from 'express';
import {
    registerUser,
    loginUser,
    getCurrentUser,
    updatePassword
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// مسارات المصادقة العامة
router.post('/register', registerUser);
router.post('/login', loginUser);

// مسارات المصادقة المحمية
router.get('/me', protect, getCurrentUser);
router.put('/password', protect, updatePassword);

export default router;