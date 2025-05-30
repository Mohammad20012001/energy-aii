/**
 * خدمة Groq API للذكاء الاصطناعي
 * تدعم نماذج Llama وMixtral عبر Groq
 */

class GroqService {
    constructor() {
        this.apiKey = localStorage.getItem('groq_api_key') || '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';
        this.apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
        this.model = localStorage.getItem('groq_model') || 'llama-3.1-8b-instant';
        this.temperature = parseFloat(localStorage.getItem('groq_temperature')) || 0.7;
        this.maxTokens = parseInt(localStorage.getItem('groq_max_tokens')) || 2048;
        this.topP = parseFloat(localStorage.getItem('groq_top_p')) || 0.9;
        this.isConnected = false;
        this.init();
    }

    init() {
        this.testConnection();
        console.log('🤖 Groq Service initialized');
    }

    async testConnection() {
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: [{ role: 'user', content: 'test' }],
                    max_tokens: 10
                })
            });

            this.isConnected = response.ok;
            console.log(this.isConnected ? '✅ Groq API connected' : '❌ Groq API connection failed');
        } catch (error) {
            console.error('Groq connection test failed:', error);
            this.isConnected = false;
        }
    }

    async sendMessage(message, conversationHistory = []) {
        if (!this.apiKey) {
            throw new Error('Groq API key not configured');
        }

        const messages = [
            {
                role: 'system',
                content: `أنت مساعد ذكي متخصص في الطاقة والذكاء الاصطناعي من Energy.AI.
                تجيب باللغة العربية بشكل مفيد ومفصل عن أسئلة الطاقة المتجددة، كفاءة الطاقة،
                والتقنيات الذكية. كن ودوداً ومساعداً.`
            },
            ...conversationHistory.slice(-10), // Keep last 10 messages
            { role: 'user', content: message }
        ];

        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: messages,
                    temperature: this.temperature,
                    max_tokens: this.maxTokens,
                    top_p: this.topP,
                    stream: false
                })
            });

            if (!response.ok) {
                throw new Error(`Groq API error: ${response.status}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;

        } catch (error) {
            console.error('Groq API error:', error);
            throw error;
        }
    }

    updateSettings(settings) {
        if (settings.apiKey) {
            this.apiKey = settings.apiKey;
            localStorage.setItem('groq_api_key', this.apiKey);
        }
        if (settings.model) {
            this.model = settings.model;
            localStorage.setItem('groq_model', this.model);
        }
        if (settings.temperature !== undefined) {
            this.temperature = settings.temperature;
            localStorage.setItem('groq_temperature', this.temperature.toString());
        }
        if (settings.maxTokens) {
            this.maxTokens = settings.maxTokens;
            localStorage.setItem('groq_max_tokens', this.maxTokens.toString());
        }
        if (settings.topP !== undefined) {
            this.topP = settings.topP;
            localStorage.setItem('groq_top_p', this.topP.toString());
        }

        this.testConnection();
    }

    getSettings() {
        return {
            apiKey: this.apiKey,
            model: this.model,
            temperature: this.temperature,
            maxTokens: this.maxTokens,
            topP: this.topP,
            isConnected: this.isConnected
        };
    }

    getAvailableModels() {
        return [
            { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B (سريع - موصى به)' },
            { id: 'llama-3.2-1b-preview', name: 'Llama 3.2 1B (خفيف)' },
            { id: 'llama-3.2-3b-preview', name: 'Llama 3.2 3B (متوازن)' },
            { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B (متعدد اللغات)' },
            { id: 'gemma-7b-it', name: 'Gemma 7B' },
            { id: 'gemma2-9b-it', name: 'Gemma 2 9B' }
        ];
    }
}

// إنشاء مثيل عام من الخدمة
window.groqService = new GroqService();

// تصدير للاستخدام في ملفات أخرى
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GroqService;
}