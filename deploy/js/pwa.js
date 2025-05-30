/* ===== ENERGY.AI PWA (Progressive Web App) ===== */

class PWAManager {
    constructor() {
        this.deferredPrompt = null;
        this.isInstalled = false;
        this.isOnline = navigator.onLine;
        this.serviceWorker = null;
        this.init();
    }

    init() {
        this.registerServiceWorker();
        this.setupInstallPrompt();
        this.setupOfflineHandling();
        this.setupUpdateHandling();
        this.checkInstallStatus();
        console.log('📱 PWA Manager initialized');
    }

    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                this.serviceWorker = registration;
                
                console.log('✅ Service Worker registered successfully');
                
                // التحقق من التحديثات
                registration.addEventListener('updatefound', () => {
                    this.handleServiceWorkerUpdate(registration);
                });
                
            } catch (error) {
                console.error('❌ Service Worker registration failed:', error);
            }
        }
    }

    setupInstallPrompt() {
        // التقاط حدث beforeinstallprompt
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallButton();
        });

        // التحقق من التثبيت
        window.addEventListener('appinstalled', () => {
            this.isInstalled = true;
            this.hideInstallButton();
            this.showInstallSuccessMessage();
            console.log('📱 App installed successfully');
        });
    }

    showInstallButton() {
        // إنشاء زر التثبيت
        if (document.querySelector('.pwa-install-btn')) return;
        
        const installBtn = document.createElement('button');
        installBtn.className = 'pwa-install-btn';
        installBtn.innerHTML = `
            <ion-icon name="download-outline"></ion-icon>
            <span>تثبيت التطبيق</span>
        `;
        
        installBtn.addEventListener('click', () => this.promptInstall());
        
        // إضافة الزر إلى الصفحة
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            navbar.appendChild(installBtn);
        }
        
        // إضافة الأنماط
        this.addInstallButtonStyles();
    }

    addInstallButtonStyles() {
        if (document.querySelector('#pwa-install-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'pwa-install-styles';
        styles.textContent = `
            .pwa-install-btn {
                background: linear-gradient(135deg, #4caf50 0%, #8bc34a 100%);
                border: none;
                border-radius: 8px;
                padding: 8px 12px;
                color: white;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 5px;
                font-size: 12px;
                font-weight: 500;
                margin-left: 10px;
                box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
            }
            
            .pwa-install-btn:hover {
                transform: scale(1.05);
                box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
            }
            
            .pwa-install-btn ion-icon {
                font-size: 16px;
            }
            
            .pwa-update-banner {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background: linear-gradient(135deg, #2196f3 0%, #03a9f4 100%);
                color: white;
                padding: 12px 20px;
                text-align: center;
                z-index: 10000;
                transform: translateY(-100%);
                transition: transform 0.3s ease;
                font-size: 14px;
            }
            
            .pwa-update-banner.show {
                transform: translateY(0);
            }
            
            .pwa-update-btn {
                background: rgba(255, 255, 255, 0.2);
                border: 1px solid rgba(255, 255, 255, 0.3);
                border-radius: 5px;
                color: white;
                padding: 5px 10px;
                margin-left: 10px;
                cursor: pointer;
                font-size: 12px;
                transition: all 0.3s ease;
            }
            
            .pwa-update-btn:hover {
                background: rgba(255, 255, 255, 0.3);
            }
            
            .pwa-offline-indicator {
                position: fixed;
                bottom: 20px;
                left: 20px;
                background: rgba(244, 67, 54, 0.9);
                color: white;
                padding: 10px 15px;
                border-radius: 25px;
                font-size: 12px;
                z-index: 10000;
                display: none;
                align-items: center;
                gap: 8px;
                backdrop-filter: blur(10px);
            }
            
            .pwa-offline-indicator.show {
                display: flex;
            }
            
            .pwa-offline-indicator.online {
                background: rgba(76, 175, 80, 0.9);
            }
            
            @media (max-width: 768px) {
                .pwa-install-btn {
                    padding: 6px 10px;
                    font-size: 11px;
                    margin-left: 5px;
                }
                
                .pwa-install-btn ion-icon {
                    font-size: 14px;
                }
                
                .pwa-update-banner {
                    padding: 10px 15px;
                    font-size: 13px;
                }
                
                .pwa-offline-indicator {
                    bottom: 15px;
                    left: 15px;
                    font-size: 11px;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }

    async promptInstall() {
        if (!this.deferredPrompt) return;
        
        try {
            // إظهار مربع حوار التثبيت
            this.deferredPrompt.prompt();
            
            // انتظار اختيار المستخدم
            const { outcome } = await this.deferredPrompt.userChoice;
            
            if (outcome === 'accepted') {
                console.log('👍 User accepted the install prompt');
            } else {
                console.log('👎 User dismissed the install prompt');
            }
            
            this.deferredPrompt = null;
            
        } catch (error) {
            console.error('Error during install prompt:', error);
        }
    }

    hideInstallButton() {
        const installBtn = document.querySelector('.pwa-install-btn');
        if (installBtn) {
            installBtn.remove();
        }
    }

    showInstallSuccessMessage() {
        this.showPWANotification('تم تثبيت التطبيق بنجاح! 🎉', 'success');
    }

    setupOfflineHandling() {
        // مراقبة حالة الاتصال
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.handleOnlineStatus();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.handleOfflineStatus();
        });
        
        // إنشاء مؤشر الاتصال
        this.createOfflineIndicator();
    }

    createOfflineIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'pwa-offline-indicator';
        indicator.innerHTML = `
            <ion-icon name="wifi-outline"></ion-icon>
            <span class="status-text">غير متصل</span>
        `;
        
        document.body.appendChild(indicator);
    }

    handleOnlineStatus() {
        const indicator = document.querySelector('.pwa-offline-indicator');
        if (indicator) {
            indicator.classList.add('online');
            indicator.querySelector('.status-text').textContent = 'متصل';
            indicator.querySelector('ion-icon').setAttribute('name', 'wifi');
            
            // إخفاء المؤشر بعد 3 ثوان
            setTimeout(() => {
                indicator.classList.remove('show');
            }, 3000);
        }
        
        console.log('🌐 App is online');
    }

    handleOfflineStatus() {
        const indicator = document.querySelector('.pwa-offline-indicator');
        if (indicator) {
            indicator.classList.remove('online');
            indicator.classList.add('show');
            indicator.querySelector('.status-text').textContent = 'غير متصل';
            indicator.querySelector('ion-icon').setAttribute('name', 'wifi-outline');
        }
        
        this.showPWANotification('أنت تعمل في وضع عدم الاتصال', 'warning');
        console.log('📴 App is offline');
    }

    setupUpdateHandling() {
        if (this.serviceWorker) {
            this.serviceWorker.addEventListener('controllerchange', () => {
                window.location.reload();
            });
        }
    }

    handleServiceWorkerUpdate(registration) {
        const newWorker = registration.installing;
        
        newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                this.showUpdateBanner();
            }
        });
    }

    showUpdateBanner() {
        // إنشاء بانر التحديث
        const banner = document.createElement('div');
        banner.className = 'pwa-update-banner';
        banner.innerHTML = `
            <span>تحديث جديد متاح للتطبيق</span>
            <button class="pwa-update-btn" onclick="pwaManager.applyUpdate()">تحديث الآن</button>
            <button class="pwa-update-btn" onclick="this.parentElement.remove()">لاحقاً</button>
        `;
        
        document.body.appendChild(banner);
        
        // إظهار البانر
        setTimeout(() => {
            banner.classList.add('show');
        }, 100);
    }

    applyUpdate() {
        if (this.serviceWorker && this.serviceWorker.waiting) {
            this.serviceWorker.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
    }

    checkInstallStatus() {
        // التحقق من حالة التثبيت
        if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
            this.isInstalled = true;
            console.log('📱 App is running in standalone mode');
        }
        
        // التحقق من iOS
        if (window.navigator.standalone === true) {
            this.isInstalled = true;
            console.log('📱 App is running in iOS standalone mode');
        }
    }

    // إدارة البيانات المخزنة محلياً
    async getCacheSize() {
        if ('storage' in navigator && 'estimate' in navigator.storage) {
            try {
                const estimate = await navigator.storage.estimate();
                return {
                    used: estimate.usage,
                    available: estimate.quota,
                    percentage: Math.round((estimate.usage / estimate.quota) * 100)
                };
            } catch (error) {
                console.error('Error getting cache size:', error);
                return null;
            }
        }
        return null;
    }

    async clearCache() {
        try {
            if ('caches' in window) {
                const cacheNames = await caches.keys();
                await Promise.all(
                    cacheNames.map(cacheName => caches.delete(cacheName))
                );
                console.log('🗑️ Cache cleared successfully');
                this.showPWANotification('تم مسح البيانات المخزنة', 'success');
            }
        } catch (error) {
            console.error('Error clearing cache:', error);
            this.showPWANotification('خطأ في مسح البيانات', 'error');
        }
    }

    // إشعارات PWA
    showPWANotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `pwa-notification ${type}`;
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : type === 'warning' ? '#ff9800' : '#2196f3'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 10001;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            animation: slideInRight 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }

    // دوال مساعدة
    isAppInstalled() {
        return this.isInstalled;
    }

    isAppOnline() {
        return this.isOnline;
    }

    getInstallPrompt() {
        return this.deferredPrompt;
    }

    // تحليلات PWA
    trackPWAEvent(eventName, eventData = {}) {
        const pwaData = {
            isInstalled: this.isInstalled,
            isOnline: this.isOnline,
            displayMode: window.matchMedia('(display-mode: standalone)').matches ? 'standalone' : 'browser',
            ...eventData
        };
        
        if (window.trackEvent) {
            window.trackEvent(`pwa_${eventName}`, pwaData);
        }
        
        console.log(`📊 PWA Event: ${eventName}`, pwaData);
    }
}

// تهيئة PWA Manager عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    window.pwaManager = new PWAManager();
});

// تصدير الفئة للاستخدام العام
window.PWAManager = PWAManager;
