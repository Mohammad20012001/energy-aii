import { CodeGPTPlus } from 'judini';

// استخدام متغير بيئي للوصول إلى مفتاح API
const API_KEY = process.env.CODEGPT_API_KEY; // تم إزالة المفتاح الافتراضي للأمان
const AGENT_ID = process.env.AGENT_ID || 'YOUR_AGENT_ID';

// إنشاء مثيل من CodeGPTPlus
const codegpt = new CodeGPTPlus({ apiKey: API_KEY });

/**
 * وحدة التحكم في الدردشة
 * @param {Object} req - كائن الطلب
 * @param {Object} res - كائن الاستجابة
 * @param {Function} next - وظيفة الانتقال إلى الوسيط التالي
 */
export const chatController = async (req, res, next) => {
    try {
        // استخراج البيانات من الطلب
        const userMessage = req.body.message || '';
        const model = req.body.model || 'gpt-4o';
        const temperature = req.body.temperature || 0.7;
        const maxTokens = req.body.max_tokens || 150;

        // التحقق من وجود الرسالة
        if (!userMessage.trim()) {
            const error = new Error('يرجى توفير رسالة');
            error.statusCode = 400;
            throw error;
        }

        // تسجيل معلومات الطلب للتصحيح
        console.log(`Received message: "${userMessage}"`);
        console.log(`Using model: ${model}, temp: ${temperature}, maxTokens: ${maxTokens}`);
        console.log(`User ID: ${req.user?.id || 'anonymous'}`);

        // إعداد رسالة للإرسال إلى API
        const msg = [{ role: 'user', content: userMessage }];

        // إضافة سياق المستخدم إذا كان متاحًا
        if (req.user) {
            msg.unshift({
                role: 'system',
                content: `أنت تتحدث مع ${req.user.name}. قم بتخصيص إجاباتك بناءً على احتياجاته.`
            });
        }

        // إرسال الطلب إلى API
        const aiRes = await codegpt.chatCompletion({
            messages: msg,
            agentId: AGENT_ID,
            temperature: temperature,
            maxTokens: maxTokens
        });

        console.log('AI response received');

        // التحقق من صحة الاستجابة
        if (!aiRes || !aiRes.choices || !aiRes.choices[0] || !aiRes.choices[0].message) {
            throw new Error('استجابة غير صالحة من خدمة الذكاء الاصطناعي');
        }

        // استخراج الرد من الاستجابة
        const botResponse = aiRes.choices[0].message.content;

        // إرسال الاستجابة
        res.json({
            success: true,
            response: botResponse,
            model: model,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        // تسجيل الخطأ للتصحيح
        console.error('Error in AI chat:', error);

        // إنشاء استجابة خطأ مناسبة
        const statusCode = error.statusCode || 500;
        const message = statusCode === 400
            ? error.message
            : 'حدث خطأ أثناء معالجة طلبك';

        res.status(statusCode).json({
            status: 'error',
            message: message,
            choices: [
                {
                    message: {
                        content: "عذراً، حدث خطأ في الذكاء الاصطناعي. يرجى المحاولة مرة أخرى."
                    }
                }
            ]
        });
    }
};