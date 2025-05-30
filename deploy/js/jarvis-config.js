/**
 * إعدادات Jarvis Voice Assistant
 */

const JARVIS_CONFIG = {
    // إعدادات التعرف على الصوت
    speech: {
        language: 'ar-SA', // اللغة العربية السعودية
        continuous: false,
        interimResults: false,
        maxAlternatives: 1
    },
    
    // إعدادات تحويل النص إلى كلام
    synthesis: {
        language: 'ar-SA',
        rate: 1.0,
        volume: 1.0,
        pitch: 1.0
    },
    
    // الردود المحددة مسبقاً
    responses: {
        welcome: "مرحباً بك! أنا Energy.AI، مساعدك الذكي في مجال الطاقة. كيف يمكنني مساعدتك اليوم؟",
        voiceModeActivated: "تم تفعيل الوضع الصوتي. يمكنك الآن التحدث معي.",
        listening: "أستمع إليك الآن...",
        browserNotSupported: "عذراً، المتصفح لا يدعم التعرف على الصوت.",
        connectionError: "عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.",
        networkError: "عذراً، حدث خطأ في الاتصال. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.",
        googleOpened: "تم فتح جوجل في نافذة جديدة",
        youtubeOpened: "تم فتح يوتيوب في نافذة جديدة",
        noResponse: "عذراً، لم أتمكن من فهم طلبك. يرجى المحاولة مرة أخرى."
    },
    
    // الأوامر الصوتية المدعومة
    commands: {
        greetings: ['مرحبا', 'السلام عليكم', 'أهلا', 'هلا', 'اهلين'],
        time: ['الوقت', 'كم الساعة', 'الساعة كم', 'وقت'],
        date: ['التاريخ', 'اليوم', 'تاريخ اليوم', 'اليوم كم'],
        google: ['افتح جوجل', 'google', 'جوجل', 'فتح جوجل'],
        youtube: ['افتح يوتيوب', 'youtube', 'يوتيوب', 'فتح يوتيوب'],
        calculator: ['حاسبة', 'احسب', 'حساب', 'calculator'],
        weather: ['الطقس', 'حالة الطقس', 'weather', 'طقس'],
        help: ['مساعدة', 'help', 'ساعدني', 'كيف']
    },
    
    // إعدادات الواجهة
    ui: {
        buttonSize: {
            desktop: '40px',
            tablet: '35px',
            mobile: '32px'
        },
        iconSize: {
            desktop: '20px',
            tablet: '18px',
            mobile: '16px'
        },
        colors: {
            primary: '#ff7200',
            secondary: '#ffffff',
            listening: '#ff4444',
            success: '#4CAF50',
            error: '#f44336'
        }
    },
    
    // إعدادات الرسوم المتحركة
    animations: {
        pulseSpeed: '1.5s',
        hoverScale: 1.1,
        transitionSpeed: '0.3s'
    }
};

/**
 * وظائف مساعدة لـ Jarvis
 */
const JarvisHelpers = {
    /**
     * التحقق من دعم المتصفح للتعرف على الصوت
     */
    isSpeechRecognitionSupported() {
        return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    },
    
    /**
     * التحقق من دعم المتصفح لتحويل النص إلى كلام
     */
    isSpeechSynthesisSupported() {
        return 'speechSynthesis' in window;
    },
    
    /**
     * تنسيق الوقت
     */
    formatTime() {
        const now = new Date();
        return now.toLocaleTimeString('ar-SA', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    },
    
    /**
     * تنسيق التاريخ
     */
    formatDate() {
        const now = new Date();
        return now.toLocaleDateString('ar-SA', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },
    
    /**
     * التحقق من وجود كلمة في النص
     */
    containsAny(text, keywords) {
        const lowerText = text.toLowerCase();
        return keywords.some(keyword => lowerText.includes(keyword.toLowerCase()));
    },
    
    /**
     * تنظيف النص من الرموز الخاصة
     */
    cleanText(text) {
        return text.replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s\w]/g, '').trim();
    },
    
    /**
     * إنشاء رسالة خطأ مخصصة
     */
    createErrorMessage(errorType) {
        const messages = {
            'network': JARVIS_CONFIG.responses.networkError,
            'connection': JARVIS_CONFIG.responses.connectionError,
            'browser': JARVIS_CONFIG.responses.browserNotSupported,
            'default': JARVIS_CONFIG.responses.noResponse
        };
        return messages[errorType] || messages.default;
    }
};

// تصدير الإعدادات للاستخدام العام
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { JARVIS_CONFIG, JarvisHelpers };
}
