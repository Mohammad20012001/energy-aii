import authService from '../services/authService.js';

/**
 * وسيط حماية المسارات التي تتطلب مصادقة
 * @param {Object} req - كائن الطلب
 * @param {Object} res - كائن الاستجابة
 * @param {Function} next - وظيفة الانتقال إلى الوسيط التالي
 */
export const protect = (req, res, next) => {
    try {
        // استخراج الرمز من رأس الطلب
        const token = authService.extractTokenFromRequest(req);
        
        if (!token) {
            const error = new Error('غير مصرح بالوصول. يرجى تسجيل الدخول');
            error.statusCode = 401;
            throw error;
        }
        
        // التحقق من صحة الرمز
        const decoded = authService.verifyToken(token);
        
        if (!decoded) {
            const error = new Error('الرمز غير صالح أو منتهي الصلاحية');
            error.statusCode = 401;
            throw error;
        }
        
        // إضافة بيانات المستخدم إلى الطلب
        req.user = decoded;
        next();
    } catch (error) {
        next(error);
    }
};

/**
 * وسيط للتحقق من أدوار المستخدم
 * @param  {...string} roles - الأدوار المسموح لها بالوصول
 * @returns {Function} وسيط التحقق من الأدوار
 */
export const authorize = (...roles) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                const error = new Error('يجب تطبيق وسيط المصادقة قبل وسيط التفويض');
                error.statusCode = 500;
                throw error;
            }
            
            // التحقق من وجود دور المستخدم في قائمة الأدوار المسموح بها
            if (!roles.includes(req.user.role)) {
                const error = new Error('غير مصرح لك بالوصول إلى هذا المورد');
                error.statusCode = 403;
                throw error;
            }
            
            next();
        } catch (error) {
            next(error);
        }
    };
};