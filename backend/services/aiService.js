const { Configuration, OpenAIApi } = require('openai');

// Configure OpenAI API
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

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
 * Get AI response for a message
 * @param {string} message - User message
 * @param {Array} history - Chat history
 * @returns {Promise<string>} - AI response
 */
const getResponse = async (message, history) => {
  try {
    // Validate API key
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_actual_openai_api_key') {
      console.error('Missing or invalid OpenAI API key');
      return 'Service is currently unavailable. Please contact the administrator.';
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

    // Format chat history for OpenAI API
    const formattedHistory = limitedHistory.map((msg) => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.sender === 'user' ? sanitizeInput(msg.content) : msg.content,
    }));

    // Add system message with context about energy engineering
    const messages = [
      {
        role: 'system',
        content: `You are an AI assistant specialized in energy engineering.
        You can help with calculations related to energy projects, cost estimation,
        energy requirements, and other energy-related topics.
        You have knowledge about solar, wind, hydro, geothermal, and biomass energy systems.
        Provide accurate and helpful information to users' queries.
        If asked about calculations, provide detailed explanations along with the results.
        Always respond in the same language as the user's query.
        If you don't know the answer, say so instead of making up information.`,
      },
      ...formattedHistory,
      { role: 'user', content: sanitizedMessage },
    ];

    // Call OpenAI API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      console.time('OpenAI API call');
      const response = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages,
        temperature: 0.7,
        max_tokens: 500,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      }, { signal: controller.signal });
      console.timeEnd('OpenAI API call');

      clearTimeout(timeoutId);

      const aiResponse = response.data.choices[0].message.content;

      // تخزين الرد في التخزين المؤقت
      // استخدام مدة تخزين مؤقت أطول للأسئلة العامة وأقصر للأسئلة المحددة
      const isGeneralQuestion = sanitizedMessage.length < 50;
      const cacheDuration = isGeneralQuestion ? 86400 : 3600; // 24 ساعة للأسئلة العامة، ساعة واحدة للأسئلة المحددة

      await cacheService.set(`ai_response:${cacheKey}`, aiResponse, cacheDuration);

      return aiResponse;
    } catch (abortError) {
      if (abortError.name === 'AbortError') {
        return 'Request timed out. Please try again with a simpler query.';
      }
      throw abortError;
    }
  } catch (error) {
    console.error('Error getting AI response:', error);
    return 'Sorry, I encountered an error while processing your request. Please try again later.';
  }
};

module.exports = {
  getResponse,
};
