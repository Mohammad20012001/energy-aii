/* ===== ENERGY.AI LANGUAGE SYSTEM ===== */

class LanguageManager {
    constructor() {
        this.currentLanguage = 'ar';
        this.supportedLanguages = ['ar', 'en'];
        this.translations = {};
        this.init();
    }

    init() {
        this.loadTranslations();
        this.detectLanguage();
        this.setupLanguageToggle();
        console.log('🌐 Language Manager initialized');
    }

    loadTranslations() {
        this.translations = {
            ar: {
                // Navigation
                'HOME': 'الرئيسية',
                'ABOUT': 'حولنا',
                'SERVICE': 'الخدمات',
                'DESIGN': 'التصميم',
                'CONTACT': 'اتصل بنا',
                
                // Main content
                'Web Design & Development Energy': 'تصميم وتطوير الويب للطاقة',
                'AI is the spark igniting a new era of energy innovation': 'الذكاء الاصطناعي هو الشرارة التي تشعل عصراً جديداً من الابتكار في الطاقة',
                'powering tomorrow with intelligent solutions today': 'نشغل الغد بحلول ذكية اليوم',
                'Join Us': 'انضم إلينا',
                
                // About section
                'About Energy.AI': 'حول Energy.AI',
                'Energy.AI is at the forefront of combining artificial intelligence with energy solutions': 'Energy.AI في المقدمة لدمج الذكاء الاصطناعي مع حلول الطاقة',
                'Smart Energy Management': 'إدارة الطاقة الذكية',
                'Sustainable Solutions': 'حلول مستدامة',
                'Data-Driven Insights': 'رؤى مدفوعة بالبيانات',
                
                // Services
                'Our Services': 'خدماتنا',
                'Energy Optimization': 'تحسين الطاقة',
                'Predictive Maintenance': 'الصيانة التنبؤية',
                'Energy Security': 'أمان الطاقة',
                'Cloud Energy Management': 'إدارة الطاقة السحابية',
                
                // Design
                'Our Design Approach': 'نهج التصميم لدينا',
                'Energy.map': 'خريطة الطاقة',
                'Professional Geospatial Intelligence': 'الذكاء الجغرافي المكاني المهني',
                
                // Contact
                'Contact Us': 'اتصل بنا',
                'Name': 'الاسم',
                'Email': 'البريد الإلكتروني',
                'Message': 'الرسالة',
                'Send Message': 'إرسال الرسالة',
                
                // Chat
                'Energy.AI Assistant': 'مساعد Energy.AI',
                'Type your message here...': 'اكتب رسالتك هنا...',
                'Send': 'إرسال',
                
                // Common
                'Search': 'بحث',
                'Type to search': 'اكتب للبحث',
                'Loading...': 'جاري التحميل...',
                'Error': 'خطأ',
                'Success': 'نجح',
                'Cancel': 'إلغاء',
                'Save': 'حفظ',
                'Delete': 'حذف',
                'Edit': 'تعديل',
                'Close': 'إغلاق'
            },
            en: {
                // Navigation
                'الرئيسية': 'HOME',
                'حولنا': 'ABOUT',
                'الخدمات': 'SERVICE',
                'التصميم': 'DESIGN',
                'اتصل بنا': 'CONTACT',
                
                // Main content
                'تصميم وتطوير الويب للطاقة': 'Web Design & Development Energy',
                'الذكاء الاصطناعي هو الشرارة التي تشعل عصراً جديداً من الابتكار في الطاقة': 'AI is the spark igniting a new era of energy innovation',
                'نشغل الغد بحلول ذكية اليوم': 'powering tomorrow with intelligent solutions today',
                'انضم إلينا': 'Join Us',
                
                // About section
                'حول Energy.AI': 'About Energy.AI',
                'Energy.AI في المقدمة لدمج الذكاء الاصطناعي مع حلول الطاقة': 'Energy.AI is at the forefront of combining artificial intelligence with energy solutions',
                'إدارة الطاقة الذكية': 'Smart Energy Management',
                'حلول مستدامة': 'Sustainable Solutions',
                'رؤى مدفوعة بالبيانات': 'Data-Driven Insights',
                
                // Services
                'خدماتنا': 'Our Services',
                'تحسين الطاقة': 'Energy Optimization',
                'الصيانة التنبؤية': 'Predictive Maintenance',
                'أمان الطاقة': 'Energy Security',
                'إدارة الطاقة السحابية': 'Cloud Energy Management',
                
                // Design
                'نهج التصميم لدينا': 'Our Design Approach',
                'خريطة الطاقة': 'Energy.map',
                'الذكاء الجغرافي المكاني المهني': 'Professional Geospatial Intelligence',
                
                // Contact
                'اتصل بنا': 'Contact Us',
                'الاسم': 'Name',
                'البريد الإلكتروني': 'Email',
                'الرسالة': 'Message',
                'إرسال الرسالة': 'Send Message',
                
                // Chat
                'مساعد Energy.AI': 'Energy.AI Assistant',
                'اكتب رسالتك هنا...': 'Type your message here...',
                'إرسال': 'Send',
                
                // Common
                'بحث': 'Search',
                'اكتب للبحث': 'Type to search',
                'جاري التحميل...': 'Loading...',
                'خطأ': 'Error',
                'نجح': 'Success',
                'إلغاء': 'Cancel',
                'حفظ': 'Save',
                'حذف': 'Delete',
                'تعديل': 'Edit',
                'إغلاق': 'Close'
            }
        };
    }

    detectLanguage() {
        // تحديد اللغة من التخزين المحلي أو المتصفح
        const savedLanguage = localStorage.getItem('energy-ai-language');
        const browserLanguage = navigator.language || navigator.userLanguage;
        
        if (savedLanguage && this.supportedLanguages.includes(savedLanguage)) {
            this.currentLanguage = savedLanguage;
        } else if (browserLanguage.startsWith('ar')) {
            this.currentLanguage = 'ar';
        } else {
            this.currentLanguage = 'en';
        }
        
        this.applyLanguage();
    }

    setupLanguageToggle() {
        // إنشاء زر تبديل اللغة
        this.createLanguageToggle();
        
        // إضافة مستمعي الأحداث
        document.addEventListener('click', (e) => {
            if (e.target.closest('.language-toggle')) {
                this.toggleLanguage();
            }
        });
    }

    createLanguageToggle() {
        // البحث عن مكان إدراج زر اللغة
        const navbar = document.querySelector('.navbar .menu');
        if (!navbar) return;
        
        // إنشاء زر تبديل اللغة
        const languageToggle = document.createElement('div');
        languageToggle.className = 'language-toggle';
        languageToggle.innerHTML = `
            <button class="language-btn" title="تغيير اللغة / Change Language">
                <span class="language-text">${this.currentLanguage.toUpperCase()}</span>
                <ion-icon name="language-outline"></ion-icon>
            </button>
        `;
        
        // إضافة الأنماط
        this.addLanguageToggleStyles();
        
        // إدراج الزر
        navbar.appendChild(languageToggle);
    }

    addLanguageToggleStyles() {
        if (document.querySelector('#language-toggle-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'language-toggle-styles';
        styles.textContent = `
            .language-toggle {
                margin-left: 15px;
            }
            
            .language-btn {
                background: rgba(255, 114, 0, 0.1);
                border: 1px solid rgba(255, 114, 0, 0.3);
                border-radius: 8px;
                padding: 8px 12px;
                color: #ff7200;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 5px;
                font-size: 12px;
                font-weight: 500;
            }
            
            .language-btn:hover {
                background: rgba(255, 114, 0, 0.2);
                border-color: #ff7200;
                transform: scale(1.02);
            }
            
            .language-text {
                font-weight: 600;
            }
            
            .language-btn ion-icon {
                font-size: 16px;
            }
            
            @media (max-width: 768px) {
                .language-toggle {
                    margin-left: 10px;
                }
                
                .language-btn {
                    padding: 6px 10px;
                    font-size: 11px;
                }
                
                .language-btn ion-icon {
                    font-size: 14px;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }

    toggleLanguage() {
        // تبديل اللغة
        this.currentLanguage = this.currentLanguage === 'ar' ? 'en' : 'ar';
        
        // حفظ اللغة الجديدة
        localStorage.setItem('energy-ai-language', this.currentLanguage);
        
        // تطبيق اللغة الجديدة
        this.applyLanguage();
        
        // تحديث زر اللغة
        this.updateLanguageToggle();
        
        console.log(`🌐 Language changed to: ${this.currentLanguage}`);
    }

    applyLanguage() {
        // تطبيق اتجاه النص
        const htmlRoot = document.documentElement;
        if (this.currentLanguage === 'ar') {
            htmlRoot.setAttribute('dir', 'rtl');
            htmlRoot.setAttribute('lang', 'ar');
        } else {
            htmlRoot.setAttribute('dir', 'ltr');
            htmlRoot.setAttribute('lang', 'en');
        }
        
        // ترجمة النصوص
        this.translateTexts();
        
        // تطبيق أنماط خاصة باللغة
        this.applyLanguageStyles();
    }

    translateTexts() {
        const elementsToTranslate = document.querySelectorAll('[data-translate], h1, h2, h3, p, button, a, label, input[placeholder]');
        
        elementsToTranslate.forEach(element => {
            const key = element.getAttribute('data-translate') || element.textContent.trim();
            const translation = this.getTranslation(key);
            
            if (translation && translation !== key) {
                if (element.tagName === 'INPUT' && element.hasAttribute('placeholder')) {
                    element.setAttribute('placeholder', translation);
                } else {
                    element.textContent = translation;
                }
            }
        });
    }

    getTranslation(key) {
        return this.translations[this.currentLanguage]?.[key] || key;
    }

    applyLanguageStyles() {
        const body = document.body;
        
        // إزالة فئات اللغة السابقة
        body.classList.remove('lang-ar', 'lang-en');
        
        // إضافة فئة اللغة الحالية
        body.classList.add(`lang-${this.currentLanguage}`);
        
        // تطبيق خطوط خاصة باللغة العربية
        if (this.currentLanguage === 'ar') {
            this.applyArabicFonts();
        }
    }

    applyArabicFonts() {
        if (document.querySelector('#arabic-fonts')) return;
        
        const arabicFonts = document.createElement('style');
        arabicFonts.id = 'arabic-fonts';
        arabicFonts.textContent = `
            body.lang-ar {
                font-family: 'Tajawal', 'Cairo', 'Amiri', 'Roboto', sans-serif;
            }
            
            body.lang-ar h1, 
            body.lang-ar h2, 
            body.lang-ar h3 {
                font-family: 'Cairo', 'Tajawal', 'Amiri', 'Roboto', sans-serif;
                font-weight: 600;
            }
            
            body.lang-ar .navbar {
                font-family: 'Cairo', 'Tajawal', sans-serif;
            }
        `;
        
        document.head.appendChild(arabicFonts);
        
        // تحميل خطوط عربية إضافية
        this.loadArabicFonts();
    }

    loadArabicFonts() {
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700&family=Tajawal:wght@300;400;500;700&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
    }

    updateLanguageToggle() {
        const languageText = document.querySelector('.language-text');
        if (languageText) {
            languageText.textContent = this.currentLanguage.toUpperCase();
        }
    }

    // دوال مساعدة للمطورين
    translate(key) {
        return this.getTranslation(key);
    }

    getCurrentLanguage() {
        return this.currentLanguage;
    }

    isRTL() {
        return this.currentLanguage === 'ar';
    }

    addTranslation(language, key, value) {
        if (!this.translations[language]) {
            this.translations[language] = {};
        }
        this.translations[language][key] = value;
    }

    // تحديث الترجمات ديناميكياً
    updateTranslations(newTranslations) {
        Object.keys(newTranslations).forEach(lang => {
            if (this.translations[lang]) {
                Object.assign(this.translations[lang], newTranslations[lang]);
            } else {
                this.translations[lang] = newTranslations[lang];
            }
        });
        
        // إعادة تطبيق الترجمات
        this.translateTexts();
    }
}

// تهيئة مدير اللغات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    window.languageManager = new LanguageManager();
});

// تصدير الفئة للاستخدام العام
window.LanguageManager = LanguageManager;
