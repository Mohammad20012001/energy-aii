import express from 'express';
import authRoutes from './routes/authRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import { contactController } from './controllers.js';
import { notFoundMiddleware, authErrorMiddleware, validationErrorMiddleware, errorHandlerMiddleware } from './middleware/errorMiddleware.js';
const router = express.Router();

// استخدام مسارات الوحدات
router.use('/auth', authRoutes);
router.use('/chat', chatRoutes);

// مسار لحفظ بيانات نموذج الاتصال
router.post('/contact', contactController);

// وسائط معالجة الأخطاء
router.use(notFoundMiddleware);
router.use(authErrorMiddleware);
router.use(validationErrorMiddleware);
router.use(errorHandlerMiddleware);
export default router;
