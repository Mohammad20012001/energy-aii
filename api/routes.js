import express from 'express';
import {
    chatController,
    saveConversationController,
    getConversationsController,
    contactController,
    registerController,
    loginController
} from './controllers.js';

const router = express.Router();

// مسار الدردشة مع الذكاء الاصطناعي
router.post('/chat', chatController);

// مسار لحفظ المحادثات
router.post('/save-conversation', saveConversationController);

// مسار لاسترجاع محادثات المستخدم
router.get('/conversations/:userId', getConversationsController);

// مسار لحفظ بيانات نموذج الاتصال
router.post('/contact', contactController);

// مسار للتسجيل
router.post('/register', registerController);

// مسار لتسجيل الدخول
router.post('/login', loginController);

export default router;
