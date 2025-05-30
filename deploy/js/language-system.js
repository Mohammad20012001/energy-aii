/**
 * Multi-Language System
 * نظام تعدد اللغات
 */

class LanguageSystem {
    constructor() {
        // Default language is English (LTR)
        this.currentLanguage = localStorage.getItem('website-language') || 'en';
        this.translations = {};
        this.init();
    }

    init() {
        this.loadTranslations();
        this.createLanguageToggle();
        this.applyLanguage(this.currentLanguage);
        this.setupEventListeners();
    }

    loadTranslations() {
        this.translations = {
            en: {
                // Navigation
                'home': 'Home',
                'about': 'About',
                'services': 'Services',
                'design': 'Design',
                'contact': 'Contact',
                'join-us': 'Join Us',

                // Hero Section
                'hero-title': 'Energy.AI Smart Solutions for Tomorrow',
                'hero-subtitle': 'Powering the Future with Intelligent Solutions',
                'hero-description': 'AI is the spark igniting a new era of energy innovation powering tomorrow with intelligent solutions today',
                'get-started': 'Get Started',
                'learn-more': 'Learn More',

                // About Section
                'about-title': 'About Energy.AI',
                'about-description': 'We are pioneers in AI-driven energy solutions, combining cutting-edge technology with sustainable practices to create a smarter, more efficient energy ecosystem.',
                'feature-1-title': 'Smart Analytics',
                'feature-1-desc': 'Advanced data analysis for optimal energy consumption',
                'feature-2-title': 'AI Optimization',
                'feature-2-desc': 'Machine learning algorithms for energy efficiency',
                'feature-3-title': 'Sustainable Solutions',
                'feature-3-desc': 'Eco-friendly approaches to energy management',

                // Services Section
                'services-title': 'Our Services',
                'service-1-title': 'Energy Consulting',
                'service-1-desc': 'Expert consultation for energy optimization and cost reduction strategies.',
                'service-2-title': 'AI-Powered Analytics',
                'service-2-desc': 'Advanced analytics and insights for smart energy management.',
                'service-3-title': 'Renewable Integration',
                'service-3-desc': 'Seamless integration of renewable energy sources into existing systems.',
                'service-4-title': 'Smart Grid Solutions',
                'service-4-desc': 'Intelligent grid management for enhanced efficiency and reliability.',

                // Design Section
                'design-title': 'Our Designs',
                'design-1-title': 'Solar Panel Systems',
                'design-1-desc': 'Efficient solar energy solutions for residential and commercial use.',
                'design-2-title': 'Wind Energy Projects',
                'design-2-desc': 'Innovative wind power installations for sustainable energy generation.',
                'design-3-title': 'Renewable Focus',
                'design-3-desc': 'Comprehensive renewable energy system designs and implementations.',
                'api-test': 'API Test',

                // Contact Section
                'contact-title': 'Contact Us',
                'contact-name': 'Name',
                'contact-email': 'Email',
                'contact-message': 'Message',
                'send-message': 'Send Message',
                'contact-location': 'Jordan, Amman',
                'contact-phone': '+962791556430',

                // Footer
                'footer-description': 'Powering the future with intelligent solutions',
                'footer-links': 'Links',
                'footer-social': 'Follow Us',
                'footer-newsletter': 'Newsletter',
                'footer-newsletter-desc': 'Stay updated with our latest news',
                'footer-copyright': '© 2025 Energy.AI. All Rights Reserved.',
                'subscribe': 'Subscribe',

                // Auth Forms
                'login': 'Login',
                'register': 'Register',
                'email': 'Email',
                'password': 'Password',
                'confirm-password': 'Confirm Password',
                'full-name': 'Full Name',
                'forgot-password': 'Forgot Password?',
                'remember-me': 'Remember Me',
                'already-have-account': 'Already have an account?',
                'dont-have-account': "Don't have an account?",
                'sign-in': 'Sign In',
                'sign-up': 'Sign Up',

                // Dashboard
                'dashboard': 'Dashboard',
                'profile': 'Profile',
                'settings': 'Settings',
                'logout': 'Logout',
                'welcome-back': 'Welcome back',
                'energy-consumption': 'Energy Consumption',
                'cost-savings': 'Cost Savings',
                'efficiency-score': 'Efficiency Score',
                'recent-activity': 'Recent Activity',

                // Naya
                'naya-welcome': 'Hello, I am Naya. Welcome to Energy AI website. How can I help you?',
                'naya-listening': 'Listening...',
                'naya-activate': "Say 'Naya' to activate",
                'naya-voice-assistant': 'Voice Assistant',

                // Messages
                'success-message': 'Operation completed successfully!',
                'error-message': 'An error occurred. Please try again.',
                'loading': 'Loading...',
                'please-wait': 'Please wait...',
                'microphone-access': 'Please allow microphone access',
                'browser-not-supported': 'Browser does not support speech recognition'
            },
            ar: {
                // Navigation
                'home': 'الرئيسية',
                'about': 'حولنا',
                'services': 'الخدمات',
                'design': 'التصميم',
                'contact': 'اتصل بنا',
                'join-us': 'انضم إلينا',

                // Hero Section
                'hero-title': 'Energy.AI حلول ذكية للمستقبل',
                'hero-subtitle': 'تشغيل المستقبل بحلول ذكية',
                'hero-description': 'الذكاء الاصطناعي هو الشرارة التي تشعل عصراً جديداً من ابتكار الطاقة تشغل الغد بحلول ذكية اليوم',
                'get-started': 'ابدأ الآن',
                'learn-more': 'اعرف المزيد',

                // About Section
                'about-title': 'حول Energy.AI',
                'about-description': 'نحن رواد في حلول الطاقة المدعومة بالذكاء الاصطناعي، نجمع بين التكنولوجيا المتطورة والممارسات المستدامة لإنشاء نظام بيئي للطاقة أكثر ذكاءً وكفاءة.',
                'feature-1-title': 'التحليلات الذكية',
                'feature-1-desc': 'تحليل متقدم للبيانات لاستهلاك الطاقة الأمثل',
                'feature-2-title': 'تحسين الذكاء الاصطناعي',
                'feature-2-desc': 'خوارزميات التعلم الآلي لكفاءة الطاقة',
                'feature-3-title': 'حلول مستدامة',
                'feature-3-desc': 'مناهج صديقة للبيئة لإدارة الطاقة',

                // Services Section
                'services-title': 'خدماتنا',
                'service-1-title': 'استشارات الطاقة',
                'service-1-desc': 'استشارة خبراء لاستراتيجيات تحسين الطاقة وتقليل التكاليف.',
                'service-2-title': 'التحليلات المدعومة بالذكاء الاصطناعي',
                'service-2-desc': 'تحليلات ورؤى متقدمة لإدارة الطاقة الذكية.',
                'service-3-title': 'تكامل الطاقة المتجددة',
                'service-3-desc': 'تكامل سلس لمصادر الطاقة المتجددة في الأنظمة الحالية.',
                'service-4-title': 'حلول الشبكة الذكية',
                'service-4-desc': 'إدارة ذكية للشبكة لتعزيز الكفاءة والموثوقية.',

                // Design Section
                'design-title': 'تصاميمنا',
                'design-1-title': 'أنظمة الألواح الشمسية',
                'design-1-desc': 'حلول طاقة شمسية فعالة للاستخدام السكني والتجاري.',
                'design-2-title': 'مشاريع طاقة الرياح',
                'design-2-desc': 'تركيبات مبتكرة لطاقة الرياح لتوليد الطاقة المستدامة.',
                'design-3-title': 'التركيز على الطاقة المتجددة',
                'design-3-desc': 'تصاميم وتنفيذ شامل لأنظمة الطاقة المتجددة.',
                'api-test': 'اختبار API',

                // Contact Section
                'contact-title': 'اتصل بنا',
                'contact-name': 'الاسم',
                'contact-email': 'البريد الإلكتروني',
                'contact-message': 'الرسالة',
                'send-message': 'إرسال الرسالة',
                'contact-location': 'الأردن، عمان',
                'contact-phone': '+962791556430',

                // Footer
                'footer-description': 'تشغيل المستقبل بحلول ذكية',
                'footer-links': 'الروابط',
                'footer-social': 'تابعنا',
                'footer-newsletter': 'النشرة الإخبارية',
                'footer-newsletter-desc': 'ابق على اطلاع بأحدث أخبارنا',
                'footer-copyright': '© 2025 Energy.AI. جميع الحقوق محفوظة.',
                'subscribe': 'اشتراك',

                // Auth Forms
                'login': 'تسجيل الدخول',
                'register': 'التسجيل',
                'email': 'البريد الإلكتروني',
                'password': 'كلمة المرور',
                'confirm-password': 'تأكيد كلمة المرور',
                'full-name': 'الاسم الكامل',
                'forgot-password': 'نسيت كلمة المرور؟',
                'remember-me': 'تذكرني',
                'already-have-account': 'لديك حساب بالفعل؟',
                'dont-have-account': 'ليس لديك حساب؟',
                'sign-in': 'دخول',
                'sign-up': 'تسجيل',

                // Dashboard
                'dashboard': 'لوحة التحكم',
                'profile': 'الملف الشخصي',
                'settings': 'الإعدادات',
                'logout': 'تسجيل الخروج',
                'welcome-back': 'مرحباً بعودتك',
                'energy-consumption': 'استهلاك الطاقة',
                'cost-savings': 'توفير التكاليف',
                'efficiency-score': 'نقاط الكفاءة',
                'recent-activity': 'النشاط الأخير',

                // Naya
                'naya-welcome': 'مرحباً، أنا نايا. أهلاً بك في موقع Energy AI. كيف يمكنني مساعدتك؟',
                'naya-listening': 'أستمع إليك...',
                'naya-activate': "قل 'نايا' للتفعيل",
                'naya-voice-assistant': 'المساعد الصوتي',

                // Messages
                'success-message': 'تمت العملية بنجاح!',
                'error-message': 'حدث خطأ. يرجى المحاولة مرة أخرى.',
                'loading': 'جاري التحميل...',
                'please-wait': 'يرجى الانتظار...',
                'microphone-access': 'يرجى السماح بالوصول للميكروفون',
                'browser-not-supported': 'المتصفح لا يدعم التعرف على الصوت'
            }
        };
    }

    createLanguageToggle() {
        const languageToggle = document.createElement('div');
        languageToggle.className = 'language-toggle';
        languageToggle.innerHTML = `
            <button class="lang-btn ${this.currentLanguage === 'en' ? 'active' : ''}" data-lang="en">EN</button>
            <button class="lang-btn ${this.currentLanguage === 'ar' ? 'active' : ''}" data-lang="ar">عر</button>
        `;

        // إضافة التبديل إلى الشريط العلوي
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            navbar.appendChild(languageToggle);
        }
    }

    setupEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('lang-btn')) {
                const newLang = e.target.getAttribute('data-lang');
                this.changeLanguage(newLang);
            }
        });
    }

    changeLanguage(language) {
        if (language !== this.currentLanguage) {
            this.currentLanguage = language;
            localStorage.setItem('website-language', language);
            this.applyLanguage(language);
            this.updateLanguageButtons();

            // إرسال حدث تغيير اللغة
            document.dispatchEvent(new CustomEvent('languageChanged', {
                detail: { language: language }
            }));
        }
    }

    applyLanguage(language) {
        // تحديث اتجاه الصفحة - الافتراضي LTR للإنجليزية
        document.documentElement.setAttribute('lang', language);

        // تعيين الاتجاه: LTR للإنجليزية، RTL للعربية
        const direction = language === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.setAttribute('dir', direction);

        // تحديث body direction أيضاً
        document.body.style.direction = direction;
        document.body.style.textAlign = language === 'ar' ? 'right' : 'left';

        // تحديث النصوص
        this.updateTexts(language);

        // تحديث الخطوط
        this.updateFonts(language);

        // إضافة class للتحكم في التصميم
        document.body.classList.toggle('rtl-layout', language === 'ar');
        document.body.classList.toggle('ltr-layout', language === 'en');
    }

    updateTexts(language) {
        const elements = document.querySelectorAll('[data-en], [data-ar]');
        elements.forEach(element => {
            const key = element.getAttribute(`data-${language}`);
            if (key && this.translations[language][key]) {
                element.textContent = this.translations[language][key];
            } else if (key) {
                element.textContent = key;
            }
        });
    }

    updateFonts(language) {
        const body = document.body;
        if (language === 'ar') {
            body.style.fontFamily = "'Tajawal', 'Cairo', 'Segoe UI', sans-serif";
        } else {
            body.style.fontFamily = "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
        }
    }

    updateLanguageButtons() {
        const buttons = document.querySelectorAll('.lang-btn');
        buttons.forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-lang') === this.currentLanguage);
        });
    }

    translate(key) {
        return this.translations[this.currentLanguage][key] || key;
    }

    getCurrentLanguage() {
        return this.currentLanguage;
    }
}

// تهيئة نظام اللغات
document.addEventListener('DOMContentLoaded', () => {
    window.languageSystem = new LanguageSystem();
});
