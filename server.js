import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import apiRoutes from './api/routes.js';

// تحميل المتغيرات البيئية
dotenv.config();

// تحديد المسار الحالي في ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// تكوين CORS لزيادة الأمان
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:3000'];
app.use(cors({
    origin: function(origin, callback) {
        // السماح بالطلبات بدون أصل (مثل المتصفح المباشر أو طلبات API)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            return callback(
                new Error('تم رفض الوصول بواسطة سياسة CORS'),
                false
            );
        }
        return callback(null, true);
    },
    credentials: true
}));

// إضافة رؤوس أمان
app.use((req, res, next) => {
    // منع التحميل في إطار من موقع مختلف
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    // منع كشف نوع المحتوى
    res.setHeader('X-Content-Type-Options', 'nosniff');
    // منع التحميل المختلط
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' https://unpkg.com; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com;");
    next();
});

// تقديم الملفات الثابتة
app.use(express.static(__dirname));

// استخدام مسارات API
app.use('/api', apiRoutes);

// مسار الصفحة الرئيسية
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// معالجة المسارات غير الموجودة
app.use((req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'المسار غير موجود',
        path: req.originalUrl
    });
});

// معالجة الأخطاء
app.use((err, req, res, next) => {
    // تسجيل الخطأ بتفاصيل أكثر
    console.error('Server error:', {
        message: err.message,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString()
    });

    res.status(500).json({
        status: 'error',
        message: 'حدث خطأ في الخادم',
        error: process.env.NODE_ENV === 'production' ? undefined : err.message
    });
});

// تشغيل الخادم
const PORT = process.env.FRONTEND_PORT || 3000;
app.listen(PORT, () => {
    console.log(`Frontend server running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});