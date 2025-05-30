/**
 * Naya Voice Assistant - Main Interface
 * مساعد Naya الصوتي - الواجهة الرئيسية
 */

class NayaAssistant {
    constructor() {
        this.isActive = false;
        this.isListening = false;
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.currentLanguage = localStorage.getItem('website-language') || 'en';
        this.wakePhrases = ['naya', 'نايا'];
        this.isWakeWordListening = false;

        this.init();
    }

    init() {
        this.createNayaInterface();
        this.setupSpeechRecognition();
        this.startWakeWordDetection();
        this.setupEventListeners();
    }

    createNayaInterface() {
        // إنشاء حاوية Naya
        const nayaContainer = document.createElement('div');
        nayaContainer.id = 'naya-container';
        nayaContainer.className = 'naya-container hidden';

        nayaContainer.innerHTML = `
            <div class="naya-overlay"></div>
            <div class="naya-interface">
                <div class="naya-avatar">
                    <div class="naya-circle">
                        <div class="naya-pulse"></div>
                        <div class="naya-core">
                            <ion-icon name="mic-outline" class="naya-icon"></ion-icon>
                        </div>
                    </div>
                </div>
                <div class="naya-text">
                    <h2 class="naya-title" data-en="NAYA" data-ar="نايا">NAYA</h2>
                    <p class="naya-subtitle" data-en="Voice Assistant" data-ar="المساعد الصوتي">Voice Assistant</p>
                    <div class="naya-status" id="naya-status">
                        <span data-en="Say 'Naya' to activate" data-ar="قل 'نايا' للتفعيل">Say 'Naya' to activate</span>
                    </div>
                </div>
                <div class="naya-controls">
                    <button class="naya-btn naya-close" id="naya-close">
                        <ion-icon name="close-outline"></ion-icon>
                    </button>
                    <button class="naya-btn naya-settings" id="naya-settings">
                        <ion-icon name="settings-outline"></ion-icon>
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(nayaContainer);
    }

    setupSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();

            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            this.recognition.lang = this.currentLanguage === 'ar' ? 'ar-SA' : 'en-US';

            this.recognition.onresult = (event) => {
                this.handleSpeechResult(event);
            };

            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.handleSpeechError(event.error);
            };

            this.recognition.onend = () => {
                if (this.isWakeWordListening) {
                    setTimeout(() => this.recognition.start(), 1000);
                }
            };
        }
    }

    startWakeWordDetection() {
        if (this.recognition) {
            this.isWakeWordListening = true;
            this.recognition.start();
        }
    }

    handleSpeechResult(event) {
        const results = event.results;
        const lastResult = results[results.length - 1];

        if (lastResult.isFinal) {
            const transcript = lastResult[0].transcript.toLowerCase().trim();

            if (!this.isActive) {
                // البحث عن كلمة التفعيل
                if (this.wakePhrases.some(phrase => transcript.includes(phrase))) {
                    this.activateNaya();
                }
            } else {
                // معالجة الأوامر عندما يكون Naya نشطاً
                this.processCommand(transcript);
            }
        }
    }

    activateNaya() {
        this.isActive = true;
        this.showNaya();

        const welcomeMessage = this.currentLanguage === 'ar'
            ? "مرحباً، أنا نايا. أهلاً بك في موقع Energy AI. كيف يمكنني مساعدتك؟"
            : "Hello, I am Naya. Welcome to Energy AI website. How can I help you?";

        this.speak(welcomeMessage);
        this.updateStatus(
            this.currentLanguage === 'ar' ? "أستمع إليك..." : "Listening..."
        );

        // إيقاف التفعيل التلقائي بعد 30 ثانية من عدم النشاط
        setTimeout(() => {
            if (this.isActive) {
                this.deactivateNaya();
            }
        }, 30000);
    }

    deactivateNaya() {
        this.isActive = false;
        this.hideNaya();
        this.updateStatus(
            this.currentLanguage === 'ar' ? "قل 'نايا' للتفعيل" : "Say 'Naya' to activate"
        );
    }

    showNaya() {
        const container = document.getElementById('naya-container');
        container.classList.remove('hidden');
        container.classList.add('active');

        // تأثير الظهور
        setTimeout(() => {
            container.querySelector('.naya-interface').classList.add('visible');
        }, 100);
    }

    hideNaya() {
        const container = document.getElementById('naya-container');
        container.querySelector('.naya-interface').classList.remove('visible');

        setTimeout(() => {
            container.classList.remove('active');
            container.classList.add('hidden');
        }, 300);
    }

    speak(text) {
        if (this.synthesis) {
            this.synthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = this.currentLanguage === 'ar' ? 'ar-SA' : 'en-US';
            utterance.rate = 0.9;
            utterance.volume = 0.8;
            utterance.pitch = 1;

            this.synthesis.speak(utterance);
        }
    }

    updateStatus(message) {
        const statusElement = document.getElementById('naya-status');
        if (statusElement) {
            statusElement.innerHTML = `<span>${message}</span>`;
        }
    }

    processCommand(command) {
        console.log('Processing command:', command);

        // أوامر التحكم الأساسية
        if (this.isCloseCommand(command)) {
            this.deactivateNaya();
            return;
        }

        // أوامر التنقل
        if (this.isNavigationCommand(command)) {
            this.handleNavigation(command);
            return;
        }

        // أوامر المعلومات
        if (this.isInfoCommand(command)) {
            this.handleInfoRequest(command);
            return;
        }

        // أوامر تسجيل الدخول
        if (this.isAuthCommand(command)) {
            this.handleAuthRequest(command);
            return;
        }

        // رد افتراضي
        this.handleGeneralQuery(command);
    }

    isCloseCommand(command) {
        const closeCommands = ['close', 'exit', 'bye', 'goodbye', 'إغلاق', 'خروج', 'وداعاً', 'مع السلامة'];
        return closeCommands.some(cmd => command.includes(cmd));
    }

    isNavigationCommand(command) {
        const navCommands = ['go to', 'open', 'show', 'navigate', 'اذهب إلى', 'افتح', 'أظهر', 'انتقل'];
        return navCommands.some(cmd => command.includes(cmd));
    }

    isInfoCommand(command) {
        const infoCommands = ['what', 'how', 'when', 'where', 'why', 'tell me', 'ماذا', 'كيف', 'متى', 'أين', 'لماذا', 'أخبرني'];
        return infoCommands.some(cmd => command.includes(cmd));
    }

    isAuthCommand(command) {
        const authCommands = ['login', 'sign in', 'register', 'join', 'account', 'تسجيل دخول', 'دخول', 'تسجيل', 'انضمام', 'حساب'];
        return authCommands.some(cmd => command.includes(cmd));
    }

    handleNavigation(command) {
        if (command.includes('home') || command.includes('الرئيسية')) {
            document.getElementById('home').scrollIntoView({ behavior: 'smooth' });
            this.speak(this.currentLanguage === 'ar' ? "تم الانتقال للصفحة الرئيسية" : "Navigated to home section");
        } else if (command.includes('about') || command.includes('حول')) {
            document.getElementById('about').scrollIntoView({ behavior: 'smooth' });
            this.speak(this.currentLanguage === 'ar' ? "تم الانتقال لقسم حولنا" : "Navigated to about section");
        } else if (command.includes('service') || command.includes('خدمات')) {
            document.getElementById('service').scrollIntoView({ behavior: 'smooth' });
            this.speak(this.currentLanguage === 'ar' ? "تم الانتقال لقسم الخدمات" : "Navigated to services section");
        } else if (command.includes('contact') || command.includes('اتصال')) {
            document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
            this.speak(this.currentLanguage === 'ar' ? "تم الانتقال لقسم التواصل" : "Navigated to contact section");
        }
    }

    handleInfoRequest(command) {
        if (command.includes('time') || command.includes('وقت')) {
            const time = new Date().toLocaleTimeString(this.currentLanguage === 'ar' ? 'ar-SA' : 'en-US');
            this.speak(this.currentLanguage === 'ar' ? `الوقت الحالي هو ${time}` : `The current time is ${time}`);
        } else if (command.includes('date') || command.includes('تاريخ')) {
            const date = new Date().toLocaleDateString(this.currentLanguage === 'ar' ? 'ar-SA' : 'en-US');
            this.speak(this.currentLanguage === 'ar' ? `تاريخ اليوم هو ${date}` : `Today's date is ${date}`);
        } else {
            this.speak(this.currentLanguage === 'ar'
                ? "يمكنني مساعدتك في التنقل في الموقع أو الإجابة على أسئلة حول Energy AI"
                : "I can help you navigate the website or answer questions about Energy AI");
        }
    }

    handleAuthRequest(command) {
        // فتح نموذج تسجيل الدخول
        const joinBtn = document.getElementById('joinBtn');
        if (joinBtn) {
            joinBtn.click();
        }
        this.speak(this.currentLanguage === 'ar'
            ? "تم فتح نموذج تسجيل الدخول"
            : "Opening login form");
    }

    handleGeneralQuery(command) {
        // يمكن هنا إضافة تكامل مع AI API للردود الذكية
        this.speak(this.currentLanguage === 'ar'
            ? "عذراً، لم أفهم طلبك. يمكنك أن تسأل عن الوقت، التاريخ، أو التنقل في الموقع"
            : "Sorry, I didn't understand that. You can ask about time, date, or navigate the website");
    }

    handleSpeechError(error) {
        console.error('Speech error:', error);
        if (error === 'not-allowed') {
            this.updateStatus(
                this.currentLanguage === 'ar'
                    ? "يرجى السماح بالوصول للميكروفون"
                    : "Please allow microphone access"
            );
        }
    }

    setupEventListeners() {
        // زر الإغلاق
        document.addEventListener('click', (e) => {
            if (e.target.closest('#naya-close')) {
                this.deactivateNaya();
            }
        });

        // تغيير اللغة
        document.addEventListener('languageChanged', (e) => {
            this.currentLanguage = e.detail.language;
            if (this.recognition) {
                this.recognition.lang = this.currentLanguage === 'ar' ? 'ar-SA' : 'en-US';
            }
        });
    }
}

// تهيئة Naya عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    window.naya = new NayaAssistant();
});
