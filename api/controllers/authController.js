import authService from '../services/authService.js';

/**
 * تسجيل مستخدم جديد
 * @param {Object} req - كائن الطلب
 * @param {Object} res - كائن الاستجابة
 * @param {Function} next - وظيفة الانتقال إلى الوسيط التالي
 */
export const registerUser = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        
        // التحقق من وجود البيانات المطلوبة
        if (!name || !email || !password) {
            const error = new Error('يرجى توفير جميع الحقول المطلوبة');
            error.statusCode = 400;
            throw error;
        }
        
        // التحقق من صحة البريد الإلكتروني
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            const error = new Error('البريد الإلكتروني غير صالح');
            error.statusCode = 400;
            throw error;
        }
        
        // التحقق من قوة كلمة المرور
        if (password.length < 8) {
            const error = new Error('يجب أن تحتوي كلمة المرور على 8 أحرف على الأقل');
            error.statusCode = 400;
            throw error;
        }
        
        // هنا يمكن إضافة التحقق من وجود المستخدم في قاعدة البيانات
        // وتشفير كلمة المرور وإنشاء المستخدم
        
        // تشفير كلمة المرور
        const { hash, salt } = authService.hashPassword(password);
        
        // إنشاء مستخدم جديد (في مرحلة التطوير، نستخدم بيانات وهمية)
        const user = {
            id: 'user_' + Date.now(),
            name,
            email,
            role: 'user',
            createdAt: new Date().toISOString()
        };
        
        // إنشاء رمز المصادقة
        const token = authService.generateToken(user);
        
        // إرسال الاستجابة
        res.status(201).json({
            status: 'success',
            message: 'تم تسجيل المستخدم بنجاح',
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                token
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * تسجيل دخول المستخدم
 * @param {Object} req - كائن الطلب
 * @param {Object} res - كائن الاستجابة
 * @param {Function} next - وظيفة الانتقال إلى الوسيط التالي
 */
export const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        
        // التحقق من وجود البيانات المطلوبة
        if (!email || !password) {
            const error = new Error('يرجى توفير البريد الإلكتروني وكلمة المرور');
            error.statusCode = 400;
            throw error;
        }
        
        // هنا يمكن إضافة التحقق من وجود المستخدم في قاعدة البيانات
        // والتحقق من صحة كلمة المرور
        
        // في مرحلة التطوير، نستخدم بيانات وهمية
        const user = {
            id: 'user_12345',
            name: 'مستخدم تجريبي',
            email,
            role: 'user'
        };
        
        // إنشاء رمز المصادقة
        const token = authService.generateToken(user);
        
        // إرسال الاستجابة
        res.json({
            status: 'success',
            message: 'تم تسجيل الدخول بنجاح',
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                token
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * الحصول على بيانات المستخدم الحالي
 * @param {Object} req - كائن الطلب
 * @param {Object} res - كائن الاستجابة
 * @param {Function} next - وظيفة الانتقال إلى الوسيط التالي
 */
export const getCurrentUser = async (req, res, next) => {
    try {
        // التحقق من وجود بيانات المستخدم
        if (!req.user) {
            const error = new Error('غير مصرح بالوصول');
            error.statusCode = 401;
            throw error;
        }
        
        // إرسال بيانات المستخدم
        res.json({
            status: 'success',
            data: {
                user: {
                    id: req.user.id,
                    name: req.user.name,
                    email: req.user.email,
                    role: req.user.role
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * تغيير كلمة المرور
 * @param {Object} req - كائن الطلب
 * @param {Object} res - كائن الاستجابة
 * @param {Function} next - وظيفة الانتقال إلى الوسيط التالي
 */
export const updatePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        // التحقق من وجود البيانات المطلوبة
        if (!currentPassword || !newPassword) {
            const error = new Error('يرجى توفير كلمة المرور الحالية والجديدة');
            error.statusCode = 400;
            throw error;
        }
        
        // التحقق من قوة كلمة المرور الجديدة
        if (newPassword.length < 8) {
            const error = new Error('يجب أن تحتوي كلمة المرور على 8 أحرف على الأقل');
            error.statusCode = 400;
            throw error;
        }
        
        // هنا يمكن إضافة التحقق من كلمة المرور الحالية وتحديث كلمة المرور الجديدة
        
        // إرسال الاستجابة
        res.json({
            status: 'success',
            message: 'تم تغيير كلمة المرور بنجاح'
        });
    } catch (error) {
        next(error);
    }
};