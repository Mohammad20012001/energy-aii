/**
 * وسيط معالجة الأخطاء للخادم
 * يوفر وظائف وسيطة للتعامل مع الأخطاء في التطبيق
 */

/**
 * تسجيل تفاصيل الخطأ
 * @param {Error} err - كائن الخطأ
 * @param {Object} req - كائن الطلب
 */
const logError = (err, req) => {
    const errorDetails = {
        message: err.message,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method,
        body: req.body,
        params: req.params,
        query: req.query,
        headers: {
            ...req.headers,
            // حذف معلومات المصادقة الحساسة من السجل
            authorization: req.headers.authorization ? '[REDACTED]' : undefined
        },
        timestamp: new Date().toISOString(),
        // معلومات إضافية إذا تم توفيرها
        ...err.additionalInfo
    };
    
    console.error('Application Error:', errorDetails);
    
    // هنا يمكن إضافة تكامل مع خدمات تسجيل الأخطاء مثل Sentry أو Loggly
};

/**
 * وسيط للتعامل مع الخطأ 404 (غير موجود)
 */
export const notFoundMiddleware = (req, res, next) => {
    const error = new Error(`المسار غير موجود - ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
};

/**
 * وسيط للتعامل مع أخطاء المصادقة
 */
export const authErrorMiddleware = (err, req, res, next) => {
    if (err.name === 'UnauthorizedError' || err.statusCode === 401) {
        return res.status(401).json({
            status: 'error',
            message: 'غير مصرح لك بالوصول',
            details: process.env.NODE_ENV === 'production' ? undefined : err.message
        });
    }
    next(err);
};

/**
 * وسيط للتعامل مع أخطاء التحقق من صحة البيانات
 */
export const validationErrorMiddleware = (err, req, res, next) => {
    if (err.name === 'ValidationError' || err.statusCode === 400) {
        return res.status(400).json({
            status: 'error',
            message: 'خطأ في البيانات المدخلة',
            details: process.env.NODE_ENV === 'production' ? undefined : err.message,
            errors: err.errors
        });
    }
    next(err);
};

/**
 * وسيط معالجة الأخطاء العامة
 */
export const errorHandlerMiddleware = (err, req, res, next) => {
    // تسجيل الخطأ
    logError(err, req);
    
    // تحديد رمز الحالة
    const statusCode = err.statusCode || 500;
    
    // إنشاء استجابة الخطأ
    const errorResponse = {
        status: 'error',
        message: statusCode === 500 ? 'حدث خطأ في الخادم' : err.message,
    };
    
    // إضافة تفاصيل الخطأ في بيئة التطوير
    if (process.env.NODE_ENV !== 'production') {
        errorResponse.stack = err.stack;
        errorResponse.details = err.details || err.message;
    }
    
    res.status(statusCode).json(errorResponse);
};