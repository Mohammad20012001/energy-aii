import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRoutes from './api/routes.js';

// تحديد المسار الحالي في ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

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
        message: 'المسار غير موجود'
    });
});

// معالجة الأخطاء
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        status: 'error',
        message: 'حدث خطأ في الخادم'
    });
});

// تشغيل الخادم
const PORT = process.env.FRONTEND_PORT || 3000;
app.listen(PORT, () => {
    console.log(`Frontend server running on http://localhost:${PORT}`);
});