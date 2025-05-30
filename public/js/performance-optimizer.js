/**
 * محسن الأداء - Energy.AI
 * يحسن تحميل الصفحات ويدمج الملفات لتحسين الأداء
 */

class PerformanceOptimizer {
    constructor() {
        this.loadedResources = new Set();
        this.criticalCSS = '';
        this.deferredScripts = [];
        this.imageObserver = null;
        this.init();
    }

    init() {
        this.setupLazyLoading();
        this.preloadCriticalResources();
        this.optimizeImages();
        this.setupServiceWorker();
        this.monitorPerformance();
    }

    /**
     * إعداد التحميل التدريجي للصور
     */
    setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            this.imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.classList.remove('lazy');
                            this.imageObserver.unobserve(img);
                        }
                    }
                });
            });

            // تطبيق التحميل التدريجي على جميع الصور
            document.querySelectorAll('img[data-src]').forEach(img => {
                this.imageObserver.observe(img);
            });
        }
    }

    /**
     * تحميل مسبق للموارد الحرجة
     */
    preloadCriticalResources() {
        const criticalResources = [
            { href: 'public/css/styles.css', as: 'style' },
            { href: 'public/js/main.js', as: 'script' },
            { href: 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap', as: 'style' }
        ];

        criticalResources.forEach(resource => {
            if (!this.loadedResources.has(resource.href)) {
                const link = document.createElement('link');
                link.rel = 'preload';
                link.href = resource.href;
                link.as = resource.as;
                if (resource.as === 'style') {
                    link.onload = () => {
                        link.rel = 'stylesheet';
                    };
                }
                document.head.appendChild(link);
                this.loadedResources.add(resource.href);
            }
        });
    }

    /**
     * تحسين الصور
     */
    optimizeImages() {
        // تحويل الصور إلى WebP إذا كان المتصفح يدعمها
        if (this.supportsWebP()) {
            document.querySelectorAll('img').forEach(img => {
                if (img.src && !img.src.includes('.webp')) {
                    const webpSrc = img.src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
                    // محاولة تحميل نسخة WebP
                    const testImg = new Image();
                    testImg.onload = () => {
                        img.src = webpSrc;
                    };
                    testImg.src = webpSrc;
                }
            });
        }

        // ضغط الصور ديناميكياً
        this.compressImages();
    }

    /**
     * فحص دعم WebP
     */
    supportsWebP() {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    }

    /**
     * ضغط الصور
     */
    compressImages() {
        document.querySelectorAll('img').forEach(img => {
            img.addEventListener('load', () => {
                if (img.naturalWidth > 1920) {
                    // تصغير الصور الكبيرة
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    const maxWidth = 1920;
                    const ratio = maxWidth / img.naturalWidth;
                    
                    canvas.width = maxWidth;
                    canvas.height = img.naturalHeight * ratio;
                    
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    img.src = canvas.toDataURL('image/jpeg', 0.8);
                }
            });
        });
    }

    /**
     * إعداد Service Worker
     */
    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('Service Worker registered:', registration);
                })
                .catch(error => {
                    console.log('Service Worker registration failed:', error);
                });
        }
    }

    /**
     * مراقبة الأداء
     */
    monitorPerformance() {
        // قياس أوقات التحميل
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                const metrics = {
                    loadTime: perfData.loadEventEnd - perfData.loadEventStart,
                    domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
                    firstPaint: this.getFirstPaint(),
                    firstContentfulPaint: this.getFirstContentfulPaint()
                };

                console.log('Performance Metrics:', metrics);
                this.sendPerformanceData(metrics);
            }, 0);
        });
    }

    /**
     * الحصول على وقت الرسم الأول
     */
    getFirstPaint() {
        const paintEntries = performance.getEntriesByType('paint');
        const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
        return firstPaint ? firstPaint.startTime : 0;
    }

    /**
     * الحصول على وقت الرسم المحتوى الأول
     */
    getFirstContentfulPaint() {
        const paintEntries = performance.getEntriesByType('paint');
        const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
        return fcp ? fcp.startTime : 0;
    }

    /**
     * إرسال بيانات الأداء للتحليل
     */
    sendPerformanceData(metrics) {
        // يمكن إرسال البيانات إلى خدمة تحليل الأداء
        if (window.gtag) {
            window.gtag('event', 'page_load_time', {
                value: Math.round(metrics.loadTime),
                custom_parameter: 'performance_monitoring'
            });
        }
    }

    /**
     * دمج وتصغير ملفات CSS
     */
    async bundleCSS() {
        const cssFiles = [
            'public/css/styles.css',
            'public/css/icons.css',
            'public/css/auth.css',
            'public/css/enhanced-map-animations.css'
        ];

        let combinedCSS = '';
        
        for (const file of cssFiles) {
            try {
                const response = await fetch(file);
                const css = await response.text();
                combinedCSS += this.minifyCSS(css);
            } catch (error) {
                console.warn(`Failed to load CSS file: ${file}`, error);
            }
        }

        // إنشاء ملف CSS مدمج
        const style = document.createElement('style');
        style.textContent = combinedCSS;
        document.head.appendChild(style);

        // إزالة ملفات CSS الأصلية
        cssFiles.forEach(file => {
            const link = document.querySelector(`link[href="${file}"]`);
            if (link) link.remove();
        });
    }

    /**
     * تصغير CSS
     */
    minifyCSS(css) {
        return css
            .replace(/\/\*[\s\S]*?\*\//g, '') // إزالة التعليقات
            .replace(/\s+/g, ' ') // تقليل المسافات
            .replace(/;\s*}/g, '}') // إزالة الفاصلة المنقوطة قبل الإغلاق
            .replace(/\s*{\s*/g, '{') // تنظيف الأقواس
            .replace(/}\s*/g, '}')
            .replace(/;\s*/g, ';')
            .trim();
    }

    /**
     * دمج وتصغير ملفات JavaScript
     */
    async bundleJS() {
        const jsFiles = [
            'public/js/error-handler.js',
            'public/js/validator.js',
            'public/js/api-service.js',
            'public/js/language-system.js'
        ];

        let combinedJS = '';
        
        for (const file of jsFiles) {
            try {
                const response = await fetch(file);
                const js = await response.text();
                combinedJS += this.minifyJS(js) + '\n';
            } catch (error) {
                console.warn(`Failed to load JS file: ${file}`, error);
            }
        }

        // إنشاء ملف JS مدمج
        const script = document.createElement('script');
        script.textContent = combinedJS;
        document.head.appendChild(script);
    }

    /**
     * تصغير JavaScript
     */
    minifyJS(js) {
        return js
            .replace(/\/\*[\s\S]*?\*\//g, '') // إزالة التعليقات متعددة الأسطر
            .replace(/\/\/.*$/gm, '') // إزالة التعليقات أحادية السطر
            .replace(/\s+/g, ' ') // تقليل المسافات
            .replace(/;\s*}/g, '}') // تنظيف الأقواس
            .trim();
    }

    /**
     * تحسين الخطوط
     */
    optimizeFonts() {
        // تحميل الخطوط بشكل غير متزامن
        const fontLink = document.querySelector('link[href*="fonts.googleapis.com"]');
        if (fontLink) {
            fontLink.rel = 'preload';
            fontLink.as = 'style';
            fontLink.onload = () => {
                fontLink.rel = 'stylesheet';
            };
        }

        // استخدام font-display: swap
        const style = document.createElement('style');
        style.textContent = `
            @font-face {
                font-family: 'Roboto';
                font-display: swap;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * تحسين التحميل التدريجي للمحتوى
     */
    setupProgressiveLoading() {
        // تحميل المحتوى الحرج أولاً
        const criticalContent = document.querySelector('.content');
        if (criticalContent) {
            criticalContent.style.opacity = '1';
        }

        // تحميل المحتوى غير الحرج بعد ذلك
        setTimeout(() => {
            const nonCriticalSections = document.querySelectorAll('.section:not(.critical)');
            nonCriticalSections.forEach((section, index) => {
                setTimeout(() => {
                    section.style.opacity = '1';
                    section.style.transform = 'translateY(0)';
                }, index * 100);
            });
        }, 500);
    }
}

// تهيئة محسن الأداء
document.addEventListener('DOMContentLoaded', () => {
    const optimizer = new PerformanceOptimizer();
    
    // تطبيق التحسينات بناءً على حالة الشبكة
    if (navigator.connection) {
        const connection = navigator.connection;
        if (connection.effectiveType === '4g' || connection.effectiveType === 'wifi') {
            // شبكة سريعة - تطبيق جميع التحسينات
            optimizer.bundleCSS();
            optimizer.bundleJS();
        } else {
            // شبكة بطيئة - تحسينات أساسية فقط
            optimizer.optimizeFonts();
            optimizer.setupProgressiveLoading();
        }
    }
});

// تصدير الكلاس للاستخدام في ملفات أخرى
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceOptimizer;
}
