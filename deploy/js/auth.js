/* ===== ENERGY.AI AUTHENTICATION SYSTEM ===== */

class AuthManager {
    constructor() {
        this.isAuthenticated = false;
        this.currentUser = null;
        this.authToken = null;
        this.apiUrl = 'https://energy-ai-backend-gemini-i30n5wt6k-mohammad-basims-projects.vercel.app';
        this.init();
    }

    init() {
        this.checkAuthStatus();
        this.setupEventListeners();
        console.log('🔐 Auth Manager initialized');
    }

    checkAuthStatus() {
        // التحقق من حالة المصادقة المحفوظة
        const savedToken = localStorage.getItem('energy-ai-token');
        const savedUser = localStorage.getItem('energy-ai-user');
        
        if (savedToken && savedUser) {
            try {
                this.authToken = savedToken;
                this.currentUser = JSON.parse(savedUser);
                this.isAuthenticated = true;
                this.updateUIForAuthenticatedUser();
            } catch (error) {
                console.error('Error parsing saved user data:', error);
                this.logout();
            }
        }
    }

    setupEventListeners() {
        // مستمعي أحداث تسجيل الدخول والخروج
        document.addEventListener('click', (e) => {
            if (e.target.closest('.login-btn')) {
                this.showLoginModal();
            }
            
            if (e.target.closest('.logout-btn')) {
                this.logout();
            }
            
            if (e.target.closest('.register-btn')) {
                this.showRegisterModal();
            }
        });
    }

    showLoginModal() {
        // إنشاء نافذة تسجيل الدخول
        const modal = this.createAuthModal('login');
        document.body.appendChild(modal);
        
        // إضافة مستمعي الأحداث
        this.setupModalEventListeners(modal, 'login');
    }

    showRegisterModal() {
        // إنشاء نافذة التسجيل
        const modal = this.createAuthModal('register');
        document.body.appendChild(modal);
        
        // إضافة مستمعي الأحداث
        this.setupModalEventListeners(modal, 'register');
    }

    createAuthModal(type) {
        const modal = document.createElement('div');
        modal.className = 'auth-modal';
        
        const isLogin = type === 'login';
        const title = isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد';
        const submitText = isLogin ? 'دخول' : 'تسجيل';
        const switchText = isLogin ? 'ليس لديك حساب؟ سجل الآن' : 'لديك حساب؟ سجل دخولك';
        
        modal.innerHTML = `
            <div class="auth-modal-overlay">
                <div class="auth-modal-content">
                    <div class="auth-modal-header">
                        <h3>${title}</h3>
                        <button class="auth-modal-close">&times;</button>
                    </div>
                    
                    <form class="auth-form" data-type="${type}">
                        ${!isLogin ? `
                            <div class="form-group">
                                <label for="auth-name">الاسم الكامل</label>
                                <input type="text" id="auth-name" name="name" required>
                            </div>
                        ` : ''}
                        
                        <div class="form-group">
                            <label for="auth-email">البريد الإلكتروني</label>
                            <input type="email" id="auth-email" name="email" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="auth-password">كلمة المرور</label>
                            <input type="password" id="auth-password" name="password" required>
                        </div>
                        
                        ${!isLogin ? `
                            <div class="form-group">
                                <label for="auth-confirm-password">تأكيد كلمة المرور</label>
                                <input type="password" id="auth-confirm-password" name="confirmPassword" required>
                            </div>
                        ` : ''}
                        
                        <button type="submit" class="auth-submit-btn">${submitText}</button>
                        
                        <div class="auth-switch">
                            <a href="#" class="auth-switch-link" data-switch="${isLogin ? 'register' : 'login'}">${switchText}</a>
                        </div>
                        
                        <div class="auth-status"></div>
                    </form>
                </div>
            </div>
        `;
        
        // إضافة الأنماط
        this.addAuthModalStyles();
        
        return modal;
    }

    addAuthModalStyles() {
        if (document.querySelector('#auth-modal-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'auth-modal-styles';
        styles.textContent = `
            .auth-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .auth-modal-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(10px);
            }
            
            .auth-modal-content {
                position: relative;
                background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
                border: 2px solid rgba(255, 114, 0, 0.3);
                border-radius: 15px;
                padding: 30px;
                max-width: 400px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            }
            
            .auth-modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 1px solid rgba(255, 114, 0, 0.2);
            }
            
            .auth-modal-header h3 {
                margin: 0;
                color: #ff7200;
                font-size: 20px;
            }
            
            .auth-modal-close {
                background: none;
                border: none;
                color: #ff7200;
                font-size: 24px;
                cursor: pointer;
                padding: 5px;
                border-radius: 50%;
                transition: all 0.3s ease;
            }
            
            .auth-modal-close:hover {
                background: rgba(255, 114, 0, 0.2);
            }
            
            .auth-form .form-group {
                margin-bottom: 20px;
            }
            
            .auth-form label {
                display: block;
                margin-bottom: 5px;
                color: #ff7200;
                font-size: 14px;
                font-weight: 500;
            }
            
            .auth-form input {
                width: 100%;
                padding: 12px;
                border: 1px solid rgba(255, 114, 0, 0.3);
                border-radius: 8px;
                background: rgba(255, 255, 255, 0.1);
                color: white;
                font-size: 14px;
                transition: all 0.3s ease;
            }
            
            .auth-form input:focus {
                outline: none;
                border-color: #ff7200;
                box-shadow: 0 0 0 2px rgba(255, 114, 0, 0.2);
            }
            
            .auth-submit-btn {
                width: 100%;
                padding: 12px;
                background: linear-gradient(135deg, #ff7200 0%, #ff9500 100%);
                border: none;
                border-radius: 8px;
                color: white;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                margin-bottom: 15px;
            }
            
            .auth-submit-btn:hover {
                transform: scale(1.02);
                box-shadow: 0 5px 15px rgba(255, 114, 0, 0.3);
            }
            
            .auth-switch {
                text-align: center;
                margin-bottom: 15px;
            }
            
            .auth-switch-link {
                color: #ff7200;
                text-decoration: none;
                font-size: 14px;
                transition: all 0.3s ease;
            }
            
            .auth-switch-link:hover {
                color: #ff9500;
                text-decoration: underline;
            }
            
            .auth-status {
                text-align: center;
                font-size: 14px;
                margin-top: 10px;
                padding: 10px;
                border-radius: 5px;
                display: none;
            }
            
            .auth-status.success {
                background: rgba(76, 175, 80, 0.2);
                border: 1px solid rgba(76, 175, 80, 0.3);
                color: #4caf50;
                display: block;
            }
            
            .auth-status.error {
                background: rgba(244, 67, 54, 0.2);
                border: 1px solid rgba(244, 67, 54, 0.3);
                color: #f44336;
                display: block;
            }
            
            .auth-status.loading {
                background: rgba(255, 114, 0, 0.2);
                border: 1px solid rgba(255, 114, 0, 0.3);
                color: #ff7200;
                display: block;
            }
            
            @media (max-width: 480px) {
                .auth-modal-content {
                    padding: 20px;
                    margin: 10px;
                }
                
                .auth-modal-header h3 {
                    font-size: 18px;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }

    setupModalEventListeners(modal, type) {
        // إغلاق النافذة
        modal.querySelector('.auth-modal-close').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.querySelector('.auth-modal-overlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                modal.remove();
            }
        });
        
        // تبديل بين تسجيل الدخول والتسجيل
        modal.querySelector('.auth-switch-link').addEventListener('click', (e) => {
            e.preventDefault();
            const switchType = e.target.getAttribute('data-switch');
            modal.remove();
            
            if (switchType === 'login') {
                this.showLoginModal();
            } else {
                this.showRegisterModal();
            }
        });
        
        // إرسال النموذج
        modal.querySelector('.auth-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAuthSubmit(e.target, type);
        });
    }

    async handleAuthSubmit(form, type) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        const statusElement = form.querySelector('.auth-status');
        
        // التحقق من صحة البيانات
        if (type === 'register') {
            if (data.password !== data.confirmPassword) {
                this.showAuthStatus(statusElement, 'كلمات المرور غير متطابقة', 'error');
                return;
            }
            
            if (data.password.length < 6) {
                this.showAuthStatus(statusElement, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'error');
                return;
            }
        }
        
        // إظهار حالة التحميل
        this.showAuthStatus(statusElement, 'جاري المعالجة...', 'loading');
        
        try {
            const endpoint = type === 'login' ? '/api/auth/login' : '/api/auth/register';
            const response = await fetch(`${this.apiUrl}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (response.ok) {
                // نجح التسجيل/الدخول
                this.handleAuthSuccess(result, type);
                this.showAuthStatus(statusElement, 'تم بنجاح!', 'success');
                
                // إغلاق النافذة بعد ثانيتين
                setTimeout(() => {
                    form.closest('.auth-modal').remove();
                }, 2000);
                
            } else {
                // فشل التسجيل/الدخول
                this.showAuthStatus(statusElement, result.message || 'حدث خطأ', 'error');
            }
            
        } catch (error) {
            console.error('Auth error:', error);
            this.showAuthStatus(statusElement, 'خطأ في الاتصال', 'error');
        }
    }

    handleAuthSuccess(result, type) {
        // حفظ بيانات المستخدم والرمز المميز
        this.authToken = result.token;
        this.currentUser = result.user;
        this.isAuthenticated = true;
        
        // حفظ في التخزين المحلي
        localStorage.setItem('energy-ai-token', this.authToken);
        localStorage.setItem('energy-ai-user', JSON.stringify(this.currentUser));
        
        // تحديث واجهة المستخدم
        this.updateUIForAuthenticatedUser();
        
        // إرسال حدث مخصص
        document.dispatchEvent(new CustomEvent('authStateChanged', {
            detail: { isAuthenticated: true, user: this.currentUser }
        }));
        
        console.log(`✅ ${type === 'login' ? 'Login' : 'Registration'} successful`);
    }

    logout() {
        // مسح البيانات
        this.authToken = null;
        this.currentUser = null;
        this.isAuthenticated = false;
        
        // مسح التخزين المحلي
        localStorage.removeItem('energy-ai-token');
        localStorage.removeItem('energy-ai-user');
        
        // تحديث واجهة المستخدم
        this.updateUIForUnauthenticatedUser();
        
        // إرسال حدث مخصص
        document.dispatchEvent(new CustomEvent('authStateChanged', {
            detail: { isAuthenticated: false, user: null }
        }));
        
        console.log('👋 User logged out');
    }

    updateUIForAuthenticatedUser() {
        // تحديث واجهة المستخدم للمستخدم المسجل
        const userName = this.currentUser?.name || 'المستخدم';
        
        // يمكن إضافة عناصر واجهة المستخدم هنا
        console.log(`👤 Welcome ${userName}`);
    }

    updateUIForUnauthenticatedUser() {
        // تحديث واجهة المستخدم للمستخدم غير المسجل
        console.log('👤 User interface updated for unauthenticated state');
    }

    showAuthStatus(element, message, type) {
        element.textContent = message;
        element.className = `auth-status ${type}`;
    }

    // دوال مساعدة
    isUserAuthenticated() {
        return this.isAuthenticated;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    getAuthToken() {
        return this.authToken;
    }

    // طلب API مع المصادقة
    async authenticatedRequest(url, options = {}) {
        if (!this.authToken) {
            throw new Error('User not authenticated');
        }
        
        const headers = {
            'Authorization': `Bearer ${this.authToken}`,
            'Content-Type': 'application/json',
            ...options.headers
        };
        
        const response = await fetch(url, {
            ...options,
            headers
        });
        
        if (response.status === 401) {
            // انتهت صلاحية الرمز المميز
            this.logout();
            throw new Error('Authentication expired');
        }
        
        return response;
    }
}

// تهيئة مدير المصادقة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    window.authManager = new AuthManager();
});

// تصدير الفئة للاستخدام العام
window.AuthManager = AuthManager;
