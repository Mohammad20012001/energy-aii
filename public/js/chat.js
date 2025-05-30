/* ===== ENERGY.AI CHAT SYSTEM ===== */

class EnergyAIChat {
    constructor() {
        this.isMinimized = false;
        this.isTyping = false;
        this.conversationHistory = [];
        this.currentProvider = localStorage.getItem('ai_provider') || 'groq'; // Groq as default
        this.groqService = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupSuggestedQuestions();
        this.addProviderSelector();
        this.initializeGroqService();
        console.log('💬 Energy.AI Chat System initialized');
    }

    initializeGroqService() {
        if (typeof GroqService !== 'undefined') {
            this.groqService = new GroqService();
        }
    }

    setupEventListeners() {
        // Chat control buttons
        const minimizeBtn = document.getElementById('minimizeChatBtn');
        const closeBtn = document.getElementById('closeChatBtn');
        const sendBtn = document.getElementById('sendMessageBtn');
        const userInput = document.getElementById('userInput');
        const attachmentBtn = document.getElementById('sendAttachmentBtn');
        const providerSelect = document.getElementById('aiProviderSelect');
        const settingsBtn = document.getElementById('groqSettingsBtn');

        if (minimizeBtn) {
            minimizeBtn.addEventListener('click', () => this.toggleMinimize());
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeChat());
        }

        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendMessage());
        }

        if (userInput) {
            userInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });

            userInput.addEventListener('input', () => {
                this.adjustInputHeight();
            });
        }

        if (attachmentBtn) {
            attachmentBtn.addEventListener('click', () => this.handleAttachment());
        }

        if (providerSelect) {
            providerSelect.addEventListener('change', (e) => {
                this.currentProvider = e.target.value;
                localStorage.setItem('ai_provider', this.currentProvider);
                this.updateProviderUI();
            });
        }

        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                if (typeof groqSettings !== 'undefined') {
                    groqSettings.show();
                }
            });
        }
    }

    setupSuggestedQuestions() {
        const questionBtns = document.querySelectorAll('.question-btn');
        questionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const question = btn.textContent;
                this.sendMessage(question);
            });
        });
    }

    addProviderSelector() {
        // Provider selector is now in HTML, just update the UI
        this.updateProviderUI();
    }

    updateProviderUI() {
        const providerSelect = document.getElementById('aiProviderSelect');
        const settingsBtn = document.getElementById('groqSettingsBtn');

        if (providerSelect) {
            providerSelect.value = this.currentProvider;
        }

        if (settingsBtn) {
            settingsBtn.style.display = this.currentProvider === 'groq' ? 'block' : 'none';
        }
    }

    async sendMessage(message = null) {
        const userInput = document.getElementById('userInput');
        const chatMessages = document.getElementById('chatMessages');

        const messageText = message || userInput.value.trim();
        if (!messageText) return;

        // Clear input
        if (!message) userInput.value = '';

        // Add user message
        this.addMessage(messageText, 'user');

        // Show typing indicator
        this.showTypingIndicator();

        try {
            // Use backend API instead of direct Groq
            const response = await this.sendToBackendAPI(messageText);

            // Hide typing indicator
            this.hideTypingIndicator();

            // Add bot response
            this.addMessage(response, 'bot');

            // Update conversation history
            this.conversationHistory.push(
                { role: 'user', content: messageText },
                { role: 'assistant', content: response }
            );

        } catch (error) {
            console.error('Chat error:', error);
            this.hideTypingIndicator();
            this.addMessage('عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.', 'bot');
        }
    }

    async sendToBackendAPI(message) {
        const API_BASE_URL = window.location.hostname === 'localhost'
            ? "http://localhost:5000/api"
            : "https://energy-ai-backend-gemini-i30n5wt6k-mohammad-basims-projects.vercel.app/api";

        const response = await fetch(`${API_BASE_URL}/chat/public`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: message
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.message || data.response || 'لا يوجد رد من الذكاء الاصطناعي.';
    }

    async getBasicResponse(message) {
        // Basic energy-related responses
        const responses = {
            'energy': 'الطاقة هي القدرة على القيام بالعمل. في Energy.AI، نركز على تحسين استخدام الطاقة باستخدام الذكاء الاصطناعي.',
            'ai': 'الذكاء الاصطناعي يساعد في تحليل أنماط استهلاك الطاقة وتقديم توصيات لتحسين الكفاءة.',
            'renewable': 'الطاقة المتجددة تشمل الطاقة الشمسية وطاقة الرياح والطاقة المائية، وهي مصادر نظيفة ومستدامة.',
            'default': 'شكراً لسؤالك! أنا مساعد Energy.AI وأساعدك في كل ما يتعلق بالطاقة والذكاء الاصطناعي.'
        };

        const lowerMessage = message.toLowerCase();
        for (const [key, response] of Object.entries(responses)) {
            if (lowerMessage.includes(key)) {
                return response;
            }
        }

        return responses.default;
    }

    addMessage(content, sender) {
        const chatMessages = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;

        if (sender === 'bot') {
            messageDiv.innerHTML = `
                <div class="avatar">
                    <div class="avatar-icon-wrapper">
                        <ion-icon name="analytics-outline"></ion-icon>
                    </div>
                </div>
                <div class="message-content">${content}</div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="message-content">${content}</div>
                <div class="avatar">
                    <div class="avatar-icon-wrapper">
                        <ion-icon name="person-outline"></ion-icon>
                    </div>
                </div>
            `;
        }

        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    showTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        if (indicator) {
            indicator.style.display = 'flex';
        }
    }

    hideTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        if (indicator) {
            indicator.style.display = 'none';
        }
    }

    toggleMinimize() {
        const chatContainer = document.getElementById('aiChatContainer');
        this.isMinimized = !this.isMinimized;

        if (this.isMinimized) {
            chatContainer.classList.add('minimized');
        } else {
            chatContainer.classList.remove('minimized');
        }
    }

    closeChat() {
        const chatContainer = document.getElementById('aiChatContainer');
        chatContainer.style.display = 'none';
    }

    adjustInputHeight() {
        const userInput = document.getElementById('userInput');
        userInput.style.height = 'auto';
        userInput.style.height = userInput.scrollHeight + 'px';
    }

    handleAttachment() {
        // Create file input
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*,.pdf,.doc,.docx,.txt';

        fileInput.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                this.addMessage(`📎 تم إرفاق الملف: ${file.name}`, 'user');
                this.addMessage('شكراً لإرفاق الملف. سأقوم بمراجعته وتقديم المساعدة المناسبة.', 'bot');
            }
        };

        fileInput.click();
    }
}
// تهيئة نظام الشات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    window.energyAIChat = new EnergyAIChat();

    // تصدير دالة addMessage للاستخدام العام
    window.addMessage = function(message, sender) {
        window.energyAIChat.addMessage(message, sender);
    };
});

// تصدير الفئة للاستخدام العام
window.EnergyAIChat = EnergyAIChat;