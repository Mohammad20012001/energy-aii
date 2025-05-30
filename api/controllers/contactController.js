/**
 * وحدة التحكم في نموذج الاتصال
 * @param {Object} req - كائن الطلب
 * @param {Object} res - كائن الاستجابة
 * @param {Function} next - وظيفة الانتقال إلى الوسيط التالي
 */
export const contactController = async (req, res, next) => {
    try {
        const { name, email, message } = req.body;
        
        // التحقق من وجود البيانات المطلوبة
        if (!name || !email || !message) {
            const error = new Error('جميع الحقول مطلوبة');
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
        
        // التحقق من طول الرسالة
        if (message.length < 10) {
            const error = new Error('يجب أن تحتوي الرسالة على 10 أحرف على الأقل');
            error.statusCode = 400;
            throw error;
        }
        
        console.log(`Contact form submission from: ${name} (${email})`);
        
        // هنا يمكن إضافة كود لحفظ بيانات الاتصال في قاعدة البيانات
        // أو إرسال بريد إلكتروني إلى المسؤول
        
        // محاكاة تأخير لإرسال النموذج
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // إرسال استجابة النجاح
        res.json({
            status: 'success',
            message: 'تم إرسال رسالتك بنجاح',
            data: {
                timestamp: new Date().toISOString(),
                reference: `contact_${Date.now()}`
            }
        });
    } catch (error) {
        next(error);
    }
};