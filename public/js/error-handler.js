/**
 * وحدة التعامل مع الأخطاء
 * توفر وظائف مساعدة للتعامل مع الأخطاء في التطبيق
 */

const ErrorHandler = {
    /**
     * معالجة أخطاء الشبكة
     * @param {Error} error - كائن الخطأ
     * @param {string} defaultMessage - رسالة افتراضية للعرض
     * @param {string} [language='en'] - لغة الرسالة ('en' أو 'ar')
     * @returns {string} رسالة خطأ مناسبة للعرض
     */
    handleNetworkError: function(error, defaultMessage, language = 'en') {
        console.error('Network Error:', error);
        
        // التحقق من نوع الخطأ
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
            return language === 'ar'
                ? "تعذر الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت الخاص بك."
                : "Could not connect to the server. Please check your internet connection.";
        }
        
        // أخطاء HTTP
        if (error.statusCode) {
            switch (error.statusCode) {
                case 401:
                    return language === 'ar'
                        ? "غير مصرح لك. يرجى تسجيل الدخول مرة أخرى."
                        : "Unauthorized. Please login again.";
                case 403:
                    return language === 'ar'
                        ? "ليس لديك إذن للوصول إلى هذا المورد."
                        : "You don't have permission to access this resource.";
                case 404:
                    return language === 'ar'
                        ? "لم يتم العثور على المورد المطلوب."
                        : "The requested resource was not found.";
                case 429:
                    return language === 'ar'
                        ? "العديد من الطلبات. يرجى المحاولة مرة أخرى لاحقًا."
                        : "Too many requests. Please try again later.";
                case 500:
                    return language === 'ar'
                        ? "حدث خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقًا."
                        : "Server error occurred. Please try again later.";
                default:
                    return language === 'ar'
                        ? `حدث خطأ: ${error.statusCode}`
                        : `An error occurred: ${error.statusCode}`;
            }
        }
        
        // الرجوع إلى الرسالة الافتراضية إذا لم يتم التعرف على الخطأ
        return defaultMessage;
    },
    
    /**
     * معالجة أخطاء التحقق من صحة البيانات
     * @param {Object} data - البيانات المقدمة
     * @param {Array} requiredFields - قائمة الحقول المطلوبة
     * @param {string} [language='en'] - لغة الرسالة ('en' أو 'ar')
     * @returns {Object} نتيجة التحقق من الصحة { valid: boolean, message: string }
     */
    validateData: function(data, requiredFields, language = 'en') {
        const missingFields = [];
        
        for (const field of requiredFields) {
            if (!data[field]) {
                missingFields.push(field);
            }
        }
        
        if (missingFields.length > 0) {
            const fieldsList = missingFields.join(', ');
            const message = language === 'ar'
                ? `الحقول التالية مطلوبة: ${fieldsList}`
                : `The following fields are required: ${fieldsList}`;
                
            return { valid: false, message: message };
        }
        
        return { valid: true, message: '' };
    },
    
    /**
     * تسجيل خطأ إلى وحدة التحكم مع معلومات إضافية
     * @param {string} context - سياق الخطأ
     * @param {Error} error - كائن الخطأ
     * @param {Object} [additionalInfo={}] - معلومات إضافية عن الخطأ
     */
    logError: function(context, error, additionalInfo = {}) {
        console.error(`[${new Date().toISOString()}] ERROR in ${context}:`, {
            message: error.message,
            stack: error.stack,
            ...additionalInfo
        });
    }
};

// تصدير الوحدة للاستخدام في الملفات الأخرى
window.ErrorHandler = ErrorHandler;