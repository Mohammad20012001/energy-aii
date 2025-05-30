/**
 * خدمة API للتفاعل مع الخادم
 * توفر وظائف للتواصل مع نقاط نهاية API
 */

const ApiService = {
    /**
     * تكوين API - Backend حقيقي مع Groq AI
     */
    config: {
        // Backend مع Groq AI (Llama 3.1)
        BASE_URL: window.location.hostname === 'localhost'
            ? "http://localhost:5000/api"
            : "https://energy-ai-backend-gemini-i30n5wt6k-mohammad-basims-projects.vercel.app/api",
        ENDPOINTS: {
            CHAT: "/chat/public",
            CHAT_PRIVATE: "/chat",
            LOGIN: "/auth/login",
            REGISTER: "/auth/register",
            CONTACT: "/contact",
            SAVE_CONVERSATION: "/chat",
            GET_CONVERSATIONS: "/chat",
            GET_USER: "/auth/me",
            PROJECTS: "/projects"
        }
    },

    /**
     * الحصول على رمز المصادقة من التخزين المحلي
     * @returns {string|null} رمز المصادقة أو null إذا لم يكن موجودًا
     */
    getAuthToken() {
        return localStorage.getItem('auth-token');
    },

    /**
     * إنشاء رؤوس الطلب مع إضافة رمز المصادقة إذا كان موجودًا
     * @param {boolean} includeAuth - ما إذا كان يجب تضمين رمز المصادقة
     * @returns {Object} رؤوس الطلب
     */
    createHeaders(includeAuth = true) {
        const headers = {
            'Content-Type': 'application/json'
        };

        if (includeAuth) {
            const token = this.getAuthToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        return headers;
    },

    /**
     * إرسال طلب إلى API
     * @param {string} endpoint - نقطة النهاية
     * @param {string} method - طريقة الطلب (GET, POST, PUT, DELETE)
     * @param {Object} data - البيانات المرسلة مع الطلب
     * @param {boolean} requiresAuth - ما إذا كان الطلب يتطلب مصادقة
     * @returns {Promise<Object>} استجابة من الخادم
     */
    async sendRequest(endpoint, method = 'GET', data = null, requiresAuth = true) {
        try {
            const url = `${this.config.BASE_URL}${endpoint}`;
            const headers = this.createHeaders(requiresAuth);

            const options = {
                method,
                headers,
                credentials: 'include',
            };

            if (data && (method === 'POST' || method === 'PUT')) {
                options.body = JSON.stringify(data);
            }

            const response = await fetch(url, options);
            const responseData = await response.json();

            if (!response.ok) {
                // إنشاء كائن خطأ مع معلومات الاستجابة
                const error = new Error(responseData.message || 'حدث خطأ في الطلب');
                error.statusCode = response.status;
                error.data = responseData;
                throw error;
            }

            return responseData;
        } catch (error) {
            // استخدام معالج الأخطاء إذا كان متاحًا
            if (window.ErrorHandler) {
                const language = window.languageSystem?.getCurrentLanguage() || 'ar';
                const defaultMessage = language === 'ar'
                    ? 'حدث خطأ أثناء الاتصال بالخادم'
                    : 'An error occurred while connecting to the server';

                error.message = window.ErrorHandler.handleNetworkError(error, defaultMessage, language);
            }

            console.error('API Error:', error);
            throw error;
        }
    },

    /**
     * إرسال رسالة دردشة إلى API
     * @param {string} message - رسالة المستخدم
     * @param {boolean} useAuth - ما إذا كان يجب استخدام المصادقة
     * @returns {Promise<Object>} استجابة من الخادم
     */
    async sendChatMessage(message, useAuth = false) {
        const endpoint = useAuth ? this.config.ENDPOINTS.CHAT_PRIVATE : this.config.ENDPOINTS.CHAT;

        const data = {
            message: message,
            userId: window.authSystem?.currentUser?.id || 'anonymous',
            timestamp: new Date().toISOString()
        };

        return this.sendRequest(endpoint, 'POST', data, useAuth);
    },

    /**
     * تسجيل المستخدم
     * @param {Object} userData - بيانات المستخدم (name, email, password)
     * @returns {Promise<Object>} استجابة من الخادم
     */
    async registerUser(userData) {
        return this.sendRequest(this.config.ENDPOINTS.REGISTER, 'POST', userData, false);
    },

    /**
     * تسجيل دخول المستخدم
     * @param {Object} credentials - بيانات تسجيل الدخول (email, password)
     * @returns {Promise<Object>} استجابة من الخادم
     */
    async loginUser(credentials) {
        return this.sendRequest(this.config.ENDPOINTS.LOGIN, 'POST', credentials, false);
    },

    /**
     * الحصول على بيانات المستخدم الحالي
     * @returns {Promise<Object>} استجابة من الخادم
     */
    async getCurrentUser() {
        return this.sendRequest(this.config.ENDPOINTS.GET_USER, 'GET');
    },

    /**
     * إرسال نموذج الاتصال
     * @param {Object} contactData - بيانات الاتصال (name, email, message)
     * @returns {Promise<Object>} استجابة من الخادم
     */
    async sendContactForm(contactData) {
        return this.sendRequest(this.config.ENDPOINTS.CONTACT, 'POST', contactData, false);
    },

    /**
     * حفظ محادثة
     * @param {string} userId - معرف المستخدم
     * @param {Array} messages - الرسائل المراد حفظها
     * @returns {Promise<Object>} استجابة من الخادم
     */
    async saveConversation(userId, messages) {
        return this.sendRequest(this.config.ENDPOINTS.SAVE_CONVERSATION, 'POST', {
            userId,
            messages
        });
    },

    /**
     * الحصول على محادثات المستخدم
     * @param {string} userId - معرف المستخدم
     * @returns {Promise<Object>} استجابة من الخادم
     */
    async getConversations(userId) {
        return this.sendRequest(`${this.config.ENDPOINTS.GET_CONVERSATIONS}/${userId}`, 'GET');
    }
};

// تصدير الخدمة للاستخدام في الملفات الأخرى
window.ApiService = ApiService;