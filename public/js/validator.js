/**
 * وحدة التحقق من صحة البيانات
 * توفر وظائف للتحقق من صحة المدخلات المختلفة
 */

const Validator = {
    /**
     * التحقق من صحة عنوان البريد الإلكتروني
     * @param {string} email - عنوان البريد الإلكتروني للتحقق منه
     * @returns {boolean} ما إذا كان البريد الإلكتروني صالحًا
     */
    isValidEmail: function(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    
    /**
     * التحقق من صحة كلمة المرور (على الأقل 8 أحرف، حرف كبير، حرف صغير، رقم)
     * @param {string} password - كلمة المرور للتحقق منها
     * @returns {boolean} ما إذا كانت كلمة المرور صالحة
     */
    isStrongPassword: function(password) {
        if (!password || password.length < 8) return false;
        
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        
        return hasUpperCase && hasLowerCase && hasNumbers;
    },
    
    /**
     * التحقق من وجود النص المطلوب
     * @param {string} text - النص للتحقق منه
     * @param {number} [minLength=1] - الحد الأدنى للطول
     * @returns {boolean} ما إذا كان النص صالحًا
     */
    isValidText: function(text, minLength = 1) {
        return text && typeof text === 'string' && text.trim().length >= minLength;
    },
    
    /**
     * التحقق من صحة رقم الهاتف
     * @param {string} phone - رقم الهاتف للتحقق منه
     * @returns {boolean} ما إذا كان رقم الهاتف صالحًا
     */
    isValidPhone: function(phone) {
        // يقبل الصيغ المختلفة مثل: +962791556430، 00962791556430، 0791556430
        const phoneRegex = /^(\+|00)?[0-9]{8,15}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    },
    
    /**
     * التحقق من النموذج بالكامل
     * @param {Object} formData - بيانات النموذج للتحقق منها
     * @param {Object} rules - قواعد التحقق من الصحة
     * @param {string} [language='en'] - لغة رسائل الخطأ
     * @returns {Object} نتيجة التحقق { valid: boolean, errors: Object }
     */
    validateForm: function(formData, rules, language = 'en') {
        const errors = {};
        
        for (const field in rules) {
            const rule = rules[field];
            const value = formData[field];
            
            // التحقق من الحقول المطلوبة
            if (rule.required && !value) {
                errors[field] = language === 'ar' ? 'هذا الحقل مطلوب' : 'This field is required';
                continue;
            }
            
            // تخطي التحقق للقيم الفارغة غير المطلوبة
            if (!value && !rule.required) continue;
            
            // التحقق من نوع البيانات
            switch (rule.type) {
                case 'email':
                    if (!this.isValidEmail(value)) {
                        errors[field] = language === 'ar' 
                            ? 'يرجى إدخال بريد إلكتروني صالح'
                            : 'Please enter a valid email address';
                    }
                    break;
                    
                case 'password':
                    if (!this.isStrongPassword(value)) {
                        errors[field] = language === 'ar' 
                            ? 'يجب أن تحتوي كلمة المرور على 8 أحرف على الأقل وتتضمن أحرفًا كبيرة وصغيرة وأرقام'
                            : 'Password must be at least 8 characters and include uppercase, lowercase, and numbers';
                    }
                    break;
                    
                case 'phone':
                    if (!this.isValidPhone(value)) {
                        errors[field] = language === 'ar' 
                            ? 'يرجى إدخال رقم هاتف صالح'
                            : 'Please enter a valid phone number';
                    }
                    break;
                    
                case 'text':
                    if (!this.isValidText(value, rule.minLength || 1)) {
                        const minLength = rule.minLength || 1;
                        errors[field] = language === 'ar' 
                            ? `يجب أن يحتوي هذا الحقل على ${minLength} أحرف على الأقل`
                            : `This field must contain at least ${minLength} characters`;
                    }
                    break;
            }
            
            // التحقق من التطابق
            if (rule.match && formData[rule.match] !== value) {
                errors[field] = language === 'ar' 
                    ? 'الحقول غير متطابقة'
                    : 'Fields do not match';
            }
        }
        
        return {
            valid: Object.keys(errors).length === 0,
            errors: errors
        };
    }
};

// تصدير الوحدة للاستخدام في الملفات الأخرى
window.Validator = Validator;