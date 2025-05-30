import jwt from 'jsonwebtoken';
import crypto from 'crypto';

/**
 * خدمة المصادقة
 * توفر وظائف للتعامل مع التوثيق وتشفير البيانات والتحقق من الهوية
 */
class AuthService {
    constructor() {
        this.jwtSecret = process.env.JWT_SECRET || 'energy-ai-default-secret-key';
        this.jwtExpiry = process.env.JWT_EXPIRY || '24h';
    }

    /**
     * إنشاء رمز JWT للمستخدم
     * @param {Object} user - بيانات المستخدم
     * @returns {string} رمز JWT
     */
    generateToken(user) {
        if (!user || !user.id) {
            throw new Error('بيانات المستخدم غير صالحة لإنشاء الرمز');
        }

        // إنشاء كائن مع بيانات المستخدم الأساسية فقط
        const payload = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role || 'user'
        };

        // إنشاء وتوقيع الرمز
        return jwt.sign(payload, this.jwtSecret, {
            expiresIn: this.jwtExpiry
        });
    }

    /**
     * التحقق من صحة رمز JWT
     * @param {string} token - رمز JWT للتحقق منه
     * @returns {Object|null} بيانات المستخدم المستخرجة من الرمز أو null إذا كان الرمز غير صالح
     */
    verifyToken(token) {
        if (!token) return null;

        try {
            // التحقق من الرمز واستخراج البيانات
            const decoded = jwt.verify(token, this.jwtSecret);
            return decoded;
        } catch (error) {
            console.error('خطأ في التحقق من الرمز:', error.message);
            return null;
        }
    }

    /**
     * تشفير كلمة المرور
     * @param {string} password - كلمة المرور للتشفير
     * @returns {Object} كلمة المرور المشفرة والملح
     */
    hashPassword(password) {
        // إنشاء ملح عشوائي
        const salt = crypto.randomBytes(16).toString('hex');
        
        // تشفير كلمة المرور مع الملح
        const hash = crypto
            .pbkdf2Sync(password, salt, 10000, 64, 'sha512')
            .toString('hex');
        
        return {
            hash,
            salt
        };
    }

    /**
     * التحقق من صحة كلمة المرور
     * @param {string} password - كلمة المرور للتحقق منها
     * @param {string} hash - كلمة المرور المشفرة المخزنة
     * @param {string} salt - الملح المستخدم في التشفير
     * @returns {boolean} ما إذا كانت كلمة المرور صحيحة
     */
    verifyPassword(password, hash, salt) {
        const verifyHash = crypto
            .pbkdf2Sync(password, salt, 10000, 64, 'sha512')
            .toString('hex');
        
        return hash === verifyHash;
    }

    /**
     * استخراج رمز المصادقة من رأس الطلب
     * @param {Object} req - كائن الطلب
     * @returns {string|null} رمز المصادقة أو null إذا لم يتم توفيره
     */
    extractTokenFromRequest(req) {
        if (!req.headers.authorization) return null;

        const authHeader = req.headers.authorization;
        const parts = authHeader.split(' ');
        
        // التحقق من صيغة "Bearer TOKEN"
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return null;
        }
        
        return parts[1];
    }
}

// تصدير مثيل واحد من الخدمة
export default new AuthService();