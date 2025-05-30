/* ===== ENERGY.AI CHAT SYSTEM ===== */

class EnergyAIChat {
    constructor() {
        this.isMinimized = false;
        this.isTyping = false;
        this.conversationHistory = [];
        this.apiKey = null; // Google Gemini API Key - تم إزالته للأمان
        this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupSuggestedQuestions();
        console.log('💬 Energy.AI Chat System initialized');
    }

    setupEventListeners() {
        // أزرار التحكم في الشات
        const minimizeBtn = document.getElementById('minimizeChatBtn');
        const closeBtn = document.getElementById('closeChatBtn');
        const sendBtn = document.getElementById('sendMessageBtn');
        const userInput = document.getElementById('userInput');
        const attachmentBtn = document.getElementById('sendAttachmentBtn');

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
    }

    setupSuggestedQuestions() {
        const questionBtns = document.querySelectorAll('.question-btn');
        questionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const question = btn.textContent;
                this.sendUserMessage(question);
            });
        });
    }

    toggleMinimize() {
        const chatContainer = document.getElementById('aiChatContainer');
        this.isMinimized = !this.isMinimized;

        if (this.isMinimized) {
            chatContainer.classList.add('minimized');
        } else {
            chatContainer.classList.remove('minimized');
        }

        console.log(`💬 Chat ${this.isMinimized ? 'minimized' : 'restored'}`);
    }

    closeChat() {
        const chatContainer = document.getElementById('aiChatContainer');
        chatContainer.style.display = 'none';
        chatContainer.classList.remove('show');
        console.log('💬 Chat closed');
    }

    async sendMessage() {
        const userInput = document.getElementById('userInput');
        const message = userInput.value.trim();

        if (!message) return;

        // إضافة رسالة المستخدم
        this.addMessage(message, 'user');
        userInput.value = '';
        this.adjustInputHeight();

        // إخفاء الأسئلة المقترحة
        this.hideSuggestedQuestions();

        // إظهار مؤشر الكتابة
        this.showTypingIndicator();

        try {
            // إرسال الرسالة إلى API
            const response = await this.sendToAPI(message);

            // إخفاء مؤشر الكتابة
            this.hideTypingIndicator();

            // إضافة رد البوت
            this.addMessage(response, 'bot');

        } catch (error) {
            console.error('Chat API Error:', error);
            this.hideTypingIndicator();
            this.addMessage('عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.', 'bot');
        }
    }

    sendUserMessage(message) {
        const userInput = document.getElementById('userInput');
        userInput.value = message;
        this.sendMessage();
    }

    async sendToAPI(message) {
        const requestBody = {
            contents: [{
                parts: [{
                    text: `أنت مساعد ذكي متخصص في الطاقة والطاقة المتجددة. اسمك Energy.AI. أجب على السؤال التالي بطريقة مفيدة ومهنية باللغة العربية:

${message}

يرجى تقديم إجابة شاملة ومفيدة حول الطاقة والطاقة المتجددة.`
                }]
            }],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
            }
        };

        const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();

        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            return data.candidates[0].content.parts[0].text;
        } else {
            throw new Error('Invalid API response format');
        }
    }

    addMessage(message, sender) {
        const chatMessages = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;

        const timestamp = new Date().toLocaleTimeString('ar-SA', {
            hour: '2-digit',
            minute: '2-digit'
        });

        if (sender === 'user') {
            messageDiv.innerHTML = `
                <div class="message-content">${this.formatMessage(message)}</div>
                <div class="message-time">${timestamp}</div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="avatar">
                    <div class="avatar-icon-wrapper">
                        <ion-icon name="analytics-outline"></ion-icon>
                    </div>
                </div>
                <div class="message-content">${this.formatMessage(message)}</div>
                <div class="message-time">${timestamp}</div>
            `;
        }

        chatMessages.appendChild(messageDiv);

        // التمرير إلى أسفل
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // حفظ في التاريخ
        this.conversationHistory.push({
            message,
            sender,
            timestamp: new Date()
        });

        // إضافة رسوم متحركة
        messageDiv.style.opacity = '0';
        messageDiv.style.transform = 'translateY(20px)';

        setTimeout(() => {
            messageDiv.style.transition = 'all 0.3s ease';
            messageDiv.style.opacity = '1';
            messageDiv.style.transform = 'translateY(0)';
        }, 100);
    }

    formatMessage(message) {
        // تنسيق الرسالة (تحويل الروابط، إضافة تنسيق، إلخ)
        let formattedMessage = message;

        // تحويل الروابط
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        formattedMessage = formattedMessage.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener">$1</a>');

        // تحويل النص الغامق
        formattedMessage = formattedMessage.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        // تحويل النص المائل
        formattedMessage = formattedMessage.replace(/\*(.*?)\*/g, '<em>$1</em>');

        // تحويل أسطر جديدة
        formattedMessage = formattedMessage.replace(/\n/g, '<br>');

        return formattedMessage;
    }

    showTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.style.display = 'flex';
            this.isTyping = true;

            // التمرير إلى أسفل
            const chatMessages = document.getElementById('chatMessages');
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.style.display = 'none';
            this.isTyping = false;
        }
    }

    hideSuggestedQuestions() {
        const suggestedQuestions = document.querySelector('.suggested-questions');
        if (suggestedQuestions && this.conversationHistory.length === 1) {
            suggestedQuestions.style.display = 'none';
        }
    }

    adjustInputHeight() {
        const userInput = document.getElementById('userInput');
        if (userInput) {
            userInput.style.height = 'auto';
            userInput.style.height = Math.min(userInput.scrollHeight, 120) + 'px';
        }
    }

    handleAttachment() {
        // إنشاء input مخفي للملفات
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*,.pdf,.doc,.docx,.txt';
        fileInput.style.display = 'none';

        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.processAttachment(file);
            }
        });

        document.body.appendChild(fileInput);
        fileInput.click();
        document.body.removeChild(fileInput);
    }

    processAttachment(file) {
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (file.size > maxSize) {
            this.addMessage('حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت.', 'bot');
            return;
        }

        // إضافة رسالة بالملف
        this.addMessage(`📎 تم إرفاق ملف: ${file.name}`, 'user');

        // معالجة الملف (يمكن تطويرها أكثر)
        setTimeout(() => {
            this.addMessage('شكراً لإرفاق الملف. سأقوم بمراجعته وأعطيك ردي قريباً.', 'bot');
        }, 1000);

        console.log('📎 File attached:', file.name, file.type, file.size);
    }

    clearConversation() {
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.innerHTML = `
            <div class="message bot">
                <div class="avatar">
                    <div class="avatar-icon-wrapper">
                        <ion-icon name="analytics-outline"></ion-icon>
                    </div>
                </div>
                <div class="message-content">مرحبا انا ENERGY.AI</div>
            </div>
        `;

        this.conversationHistory = [];

        // إظهار الأسئلة المقترحة مرة أخرى
        const suggestedQuestions = document.querySelector('.suggested-questions');
        if (suggestedQuestions) {
            suggestedQuestions.style.display = 'flex';
        }
    }

    exportConversation() {
        const conversation = this.conversationHistory.map(item => ({
            sender: item.sender === 'user' ? 'المستخدم' : 'Energy.AI',
            message: item.message,
            time: item.timestamp.toLocaleString('ar-SA')
        }));

        const dataStr = JSON.stringify(conversation, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});

        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `energy-ai-chat-${Date.now()}.json`;
        link.click();

        console.log('💾 Conversation exported');
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
