const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? ['https://energy-ai.com', 'https://www.energy-ai.com']
      : '*',
    methods: ['GET', 'POST']
  }
});

// إعداد محدد معدل الطلبات
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 100, // الحد الأقصى للطلبات لكل IP
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

// إعداد محدد معدل الطلبات لواجهة برمجة التطبيقات الخاصة بالذكاء الاصطناعي
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // دقيقة واحدة
  max: 5, // الحد الأقصى للطلبات لكل IP
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many AI requests from this IP, please try again after a minute'
});

// Middleware
app.use(helmet()); // تحسين الأمان
app.use(compression()); // ضغط الاستجابات
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://energy-ai.com', 'https://www.energy-ai.com']
    : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '1mb' })); // تحديد حجم طلبات JSON
app.use(express.urlencoded({ extended: false, limit: '1mb' }));

// تسجيل الطلبات في بيئة التطوير
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// تطبيق محدد معدل الطلبات على جميع الطلبات
app.use('/api/', limiter);

// تطبيق محدد معدل الطلبات على طلبات الذكاء الاصطناعي
app.use('/api/chat/:id/message', aiLimiter);

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));

// Socket.io for real-time chat
require('./services/socketService')(io);

// مسار الصحة للتحقق من حالة الخادم
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Energy.AI Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Default route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Energy.AI API',
    version: '1.0.0',
    documentation: '/api-docs'
  });
});

// Error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// For Vercel deployment
if (process.env.NODE_ENV !== 'production') {
  server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
}

// Export for Vercel
module.exports = app;

// معالجة الإغلاق الآمن للخادم
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

// معالجة الأخطاء غير المتوقعة
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // تسجيل الخطأ ثم إغلاق الخادم بأمان
  server.close(() => {
    process.exit(1);
  });
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // تسجيل الخطأ ولكن عدم إغلاق الخادم
});
