// Groq AI Configuration
const axios = require('axios');

// تكوين Groq AI
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.1-70b-versatile';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// التحقق من توفر مفتاح Groq API
if (GROQ_API_KEY) {
  console.log('✅ Groq AI initialized successfully');
  console.log(`🤖 Using model: ${GROQ_MODEL}`);
} else {
  console.log('❌ Groq API key not found - AI features will be limited');
}

// استيراد خدمة التخزين المؤقت
const cacheService = require('./cacheService');
const crypto = require('crypto');

/**
 * Sanitize user input to prevent prompt injection
 * @param {string} input - User input
 * @returns {string} - Sanitized input
 */
const sanitizeInput = (input) => {
  // Remove any attempts to escape or inject system prompts
  let sanitized = input.replace(/^system:/i, 'User asked about system:');
  sanitized = sanitized.replace(/^assistant:/i, 'User asked about assistant:');

  // Limit length
  if (sanitized.length > 1000) {
    sanitized = sanitized.substring(0, 1000) + '... (message truncated)';
  }

  return sanitized;
};

/**
 * إنشاء هاش للرسالة والتاريخ لاستخدامه كمفتاح للتخزين المؤقت
 * @param {string} message - رسالة المستخدم
 * @param {Array} history - تاريخ المحادثة
 * @returns {string} - مفتاح التخزين المؤقت
 */
const createCacheKey = (message, history) => {
  // استخدام آخر 5 رسائل فقط للتخزين المؤقت
  const relevantHistory = history.slice(-5);

  // إنشاء سلسلة تمثل الرسالة والتاريخ
  const historyString = relevantHistory.map(msg => `${msg.sender}:${msg.content}`).join('|');
  const inputString = `${message}|${historyString}`;

  // إنشاء هاش SHA-256 للسلسلة
  return crypto.createHash('sha256').update(inputString).digest('hex');
};

/**
 * Get AI response for a message using Groq API
 * @param {string} message - User message
 * @param {Array} history - Chat history
 * @returns {Promise<string>} - AI response
 */
const getResponse = async (message, history) => {
  try {
    // التحقق من توفر Groq AI
    if (!GROQ_API_KEY) {
      console.error('Groq AI not available');
      return 'خدمة الذكاء الاصطناعي غير متوفرة حالياً. يرجى المحاولة لاحقاً.';
    }

    // Sanitize user input
    const sanitizedMessage = sanitizeInput(message);

    // التحقق من وجود الرد في التخزين المؤقت
    const cacheKey = createCacheKey(sanitizedMessage, history);
    const cachedResponse = await cacheService.get(`ai_response:${cacheKey}`);

    if (cachedResponse) {
      console.log('Using cached AI response');
      return cachedResponse;
    }

    // Limit history to prevent token overflow
    const limitedHistory = history.slice(-10);

    // تكوين السياق للذكاء الاصطناعي
    const systemContext = `أنت مساعد ذكي متخصص في هندسة الطاقة والطاقة المتجددة.
    يمكنك المساعدة في:
    - حسابات مشاريع الطاقة الشمسية وتقدير التكاليف
    - متطلبات الطاقة للمباني والمنشآت
    - أنظمة الطاقة المتجددة (شمسية، رياح، مائية، حرارية أرضية)
    - كفاءة الطاقة وتوفير الاستهلاك
    - التحليل الفني والاقتصادي لمشاريع الطاقة

    قواعد مهمة:
    - اجب دائماً باللغة العربية إذا كان السؤال بالعربية
    - اجب دائماً باللغة الإنجليزية إذا كان السؤال بالإنجليزية
    - إذا طُلب منك إجراء حسابات، قدم شرحاً مفصلاً مع النتائج باللغة المناسبة
    - استخدم الأرقام العربية عند الرد بالعربية
    - قدم معلومات دقيقة ومفيدة
    - إذا لم تعرف الإجابة، قل ذلك بدلاً من اختلاق المعلومات`;

    // تكوين تاريخ المحادثة
    let conversationHistory = '';
    if (limitedHistory.length > 0) {
      conversationHistory = '\n\nتاريخ المحادثة:\n';
      limitedHistory.forEach((msg, index) => {
        const role = msg.sender === 'user' ? 'المستخدم' : 'المساعد';
        conversationHistory += `${role}: ${msg.content}\n`;
      });
    }

    // تحضير الرسائل لـ Groq API
    const messages = [
      {
        role: 'system',
        content: systemContext
      }
    ];

    // إضافة تاريخ المحادثة
    if (history && history.length > 0) {
      history.slice(-10).forEach(item => { // آخر 10 رسائل فقط
        if (item.user) {
          messages.push({ role: 'user', content: item.user });
        }
        if (item.assistant) {
          messages.push({ role: 'assistant', content: item.assistant });
        }
      });
    }

    // إضافة الرسالة الحالية
    messages.push({
      role: 'user',
      content: sanitizedMessage
    });

    try {
      console.time('Groq API call');

      // استدعاء Groq API
      const response = await axios.post(GROQ_API_URL, {
        model: GROQ_MODEL,
        messages: messages,
        temperature: 0.7,
        max_tokens: 2048,
        top_p: 0.9,
        stream: false
      }, {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 ثانية timeout
      });

      console.timeEnd('Groq API call');

      const aiResponse = response.data?.choices?.[0]?.message?.content;

      if (!aiResponse || aiResponse.trim() === '') {
        return 'عذراً، لم أتمكن من إنتاج رد مناسب. يرجى إعادة صياغة سؤالك.';
      }

      // تخزين الرد في التخزين المؤقت
      const isGeneralQuestion = sanitizedMessage.length < 50;
      const cacheDuration = isGeneralQuestion ? 86400 : 3600; // 24 ساعة للأسئلة العامة، ساعة واحدة للأسئلة المحددة

      await cacheService.set(`ai_response:${cacheKey}`, aiResponse, cacheDuration);

      return aiResponse;

    } catch (apiError) {
      console.error('Groq API error:', apiError.response?.data || apiError.message);

      // معالجة أخطاء API المختلفة
      if (apiError.response?.status === 429) {
        return 'تم تجاوز الحد المسموح من الطلبات. يرجى المحاولة لاحقاً.';
      } else if (apiError.response?.status === 400) {
        return 'عذراً، لا يمكنني الإجابة على هذا السؤال. يرجى إعادة صياغته.';
      } else if (apiError.code === 'ECONNABORTED') {
        return 'انتهت مهلة الاتصال. يرجى المحاولة مرة أخرى.';
      } else {
        return 'حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى.';
      }
    }

  } catch (error) {
    console.error('Error getting AI response:', error);
    return 'عذراً، واجهت خطأ أثناء معالجة طلبك. يرجى المحاولة لاحقاً.';
  }
};

module.exports = {
  getResponse,
};
