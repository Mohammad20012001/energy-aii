/**
 * Enhanced Authentication System
 * نظام المصادقة المحسن
 */

class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.isLoggedIn = false;
        this.authModal = null;
        this.dashboardModal = null;
        this.init();
    }

    init() {
        this.createAuthModal();
        this.createDashboard();
        this.setupEventListeners();
        this.checkAuthStatus();
    }

    createAuthModal() {
        const authModal = document.createElement('div');
        authModal.id = 'auth-modal';
        authModal.className = 'auth-modal hidden';

        authModal.innerHTML = `
            <div class="auth-overlay"></div>
            <div class="auth-container">
                <div class="auth-header">
                    <h2 class="auth-title" data-en="Welcome to Energy.AI" data-ar="مرحباً بك في Energy.AI">Welcome to Energy.AI</h2>
                    <button class="auth-close" id="auth-close">
                        <ion-icon name="close-outline"></ion-icon>
                    </button>
                </div>

                <div class="auth-tabs">
                    <button class="auth-tab active" data-tab="login" data-en="Login" data-ar="تسجيل الدخول">Login</button>
                    <button class="auth-tab" data-tab="register" data-en="Register" data-ar="التسجيل">Register</button>
                </div>

                <!-- Login Form -->
                <div class="auth-form active" id="login-form">
                    <form id="login-form-element">
                        <div class="form-group">
                            <label data-en="Email" data-ar="البريد الإلكتروني">Email</label>
                            <input type="email" id="login-email" required>
                        </div>
                        <div class="form-group">
                            <label data-en="Password" data-ar="كلمة المرور">Password</label>
                            <input type="password" id="login-password" required>
                        </div>
                        <div class="form-options">
                            <label class="checkbox-label">
                                <input type="checkbox" id="remember-me">
                                <span data-en="Remember Me" data-ar="تذكرني">Remember Me</span>
                            </label>
                            <a href="#" class="forgot-password" data-en="Forgot Password?" data-ar="نسيت كلمة المرور؟">Forgot Password?</a>
                        </div>
                        <button type="submit" class="auth-btn primary" data-en="Sign In" data-ar="دخول">Sign In</button>
                    </form>
                    <div class="auth-divider">
                        <span data-en="or" data-ar="أو">or</span>
                    </div>
                    <div class="social-login">
                        <button class="social-btn google">
                            <ion-icon name="logo-google"></ion-icon>
                            <span data-en="Continue with Google" data-ar="متابعة مع جوجل">Continue with Google</span>
                        </button>
                    </div>
                </div>

                <!-- Register Form -->
                <div class="auth-form" id="register-form">
                    <form id="register-form-element">
                        <div class="form-group">
                            <label data-en="Full Name" data-ar="الاسم الكامل">Full Name</label>
                            <input type="text" id="register-name" required>
                        </div>
                        <div class="form-group">
                            <label data-en="Email" data-ar="البريد الإلكتروني">Email</label>
                            <input type="email" id="register-email" required>
                        </div>
                        <div class="form-group">
                            <label data-en="Password" data-ar="كلمة المرور">Password</label>
                            <input type="password" id="register-password" required>
                        </div>
                        <div class="form-group">
                            <label data-en="Confirm Password" data-ar="تأكيد كلمة المرور">Confirm Password</label>
                            <input type="password" id="register-confirm-password" required>
                        </div>
                        <div class="form-options">
                            <label class="checkbox-label">
                                <input type="checkbox" id="terms-agreement" required>
                                <span data-en="I agree to the Terms & Conditions" data-ar="أوافق على الشروط والأحكام">I agree to the Terms & Conditions</span>
                            </label>
                        </div>
                        <button type="submit" class="auth-btn primary" data-en="Sign Up" data-ar="تسجيل">Sign Up</button>
                    </form>
                    <div class="auth-divider">
                        <span data-en="or" data-ar="أو">or</span>
                    </div>
                    <div class="social-login">
                        <button class="social-btn google">
                            <ion-icon name="logo-google"></ion-icon>
                            <span data-en="Continue with Google" data-ar="متابعة مع جوجل">Continue with Google</span>
                        </button>
                    </div>
                </div>

                <div class="auth-status" id="auth-status"></div>
            </div>
        `;

        document.body.appendChild(authModal);
        this.authModal = authModal;
    }

    createDashboard() {
        const dashboard = document.createElement('div');
        dashboard.id = 'dashboard-modal';
        dashboard.className = 'dashboard-modal hidden';

        dashboard.innerHTML = `
            <div class="dashboard-overlay"></div>
            <div class="dashboard-container">
                <div class="dashboard-header">
                    <div class="dashboard-user">
                        <div class="user-avatar">
                            <ion-icon name="person-outline"></ion-icon>
                        </div>
                        <div class="user-info">
                            <h3 class="user-name" id="dashboard-user-name">User Name</h3>
                            <p class="user-email" id="dashboard-user-email">user@email.com</p>
                        </div>
                    </div>
                    <button class="dashboard-close" id="dashboard-close">
                        <ion-icon name="close-outline"></ion-icon>
                    </button>
                </div>

                <div class="dashboard-nav">
                    <button class="nav-item active" data-section="overview">
                        <ion-icon name="grid-outline"></ion-icon>
                        <span data-en="Overview" data-ar="نظرة عامة">Overview</span>
                    </button>
                    <button class="nav-item" data-section="energy">
                        <ion-icon name="flash-outline"></ion-icon>
                        <span data-en="Energy Data" data-ar="بيانات الطاقة">Energy Data</span>
                    </button>
                    <button class="nav-item" data-section="analytics">
                        <ion-icon name="analytics-outline"></ion-icon>
                        <span data-en="Analytics" data-ar="التحليلات">Analytics</span>
                    </button>
                    <button class="nav-item" data-section="settings">
                        <ion-icon name="settings-outline"></ion-icon>
                        <span data-en="Settings" data-ar="الإعدادات">Settings</span>
                    </button>
                </div>

                <div class="dashboard-content">
                    <!-- Overview Section -->
                    <div class="dashboard-section active" id="overview-section">
                        <h3 data-en="Dashboard Overview" data-ar="نظرة عامة على لوحة التحكم">Dashboard Overview</h3>
                        <div class="stats-grid">
                            <div class="stat-card">
                                <div class="stat-icon">
                                    <ion-icon name="flash-outline"></ion-icon>
                                </div>
                                <div class="stat-info">
                                    <h4 data-en="Energy Consumption" data-ar="استهلاك الطاقة">Energy Consumption</h4>
                                    <p class="stat-value">1,234 kWh</p>
                                </div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-icon">
                                    <ion-icon name="trending-down-outline"></ion-icon>
                                </div>
                                <div class="stat-info">
                                    <h4 data-en="Cost Savings" data-ar="توفير التكاليف">Cost Savings</h4>
                                    <p class="stat-value">$456</p>
                                </div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-icon">
                                    <ion-icon name="speedometer-outline"></ion-icon>
                                </div>
                                <div class="stat-info">
                                    <h4 data-en="Efficiency Score" data-ar="نقاط الكفاءة">Efficiency Score</h4>
                                    <p class="stat-value">89%</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Energy Section -->
                    <div class="dashboard-section" id="energy-section">
                        <h3 data-en="Energy Management" data-ar="إدارة الطاقة">Energy Management</h3>
                        <div class="energy-chart">
                            <canvas id="energy-chart-canvas"></canvas>
                        </div>
                    </div>

                    <!-- Analytics Section -->
                    <div class="dashboard-section" id="analytics-section">
                        <h3 data-en="Analytics & Reports" data-ar="التحليلات والتقارير">Analytics & Reports</h3>
                        <div class="analytics-content">
                            <p data-en="Detailed analytics coming soon..." data-ar="التحليلات التفصيلية قريباً...">Detailed analytics coming soon...</p>
                        </div>
                    </div>

                    <!-- Settings Section -->
                    <div class="dashboard-section" id="settings-section">
                        <h3 data-en="Account Settings" data-ar="إعدادات الحساب">Account Settings</h3>
                        <div class="settings-content">
                            <div class="setting-item">
                                <label data-en="Email Notifications" data-ar="إشعارات البريد الإلكتروني">Email Notifications</label>
                                <input type="checkbox" checked>
                            </div>
                            <div class="setting-item">
                                <label data-en="Dark Mode" data-ar="الوضع المظلم">Dark Mode</label>
                                <input type="checkbox" id="dashboard-theme-toggle">
                            </div>
                            <button class="auth-btn danger" id="logout-btn" data-en="Logout" data-ar="تسجيل الخروج">Logout</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(dashboard);
        this.dashboardModal = dashboard;
    }

    setupEventListeners() {
        // Auth Modal Events
        document.addEventListener('click', (e) => {
            // Open auth modal - تحديث للعمل مع زر Login/Dashboard
            if (e.target.closest('#joinBtn')) {
                e.preventDefault();
                // إذا كان المستخدم مسجل دخول، أظهر لوحة التحكم
                if (this.isLoggedIn) {
                    this.showDashboard();
                } else {
                    this.showAuthModal();
                }
            }

            // Close auth modal
            if (e.target.closest('#auth-close') || e.target.closest('.auth-overlay')) {
                this.hideAuthModal();
            }

            // Auth tabs
            if (e.target.classList.contains('auth-tab')) {
                this.switchAuthTab(e.target.getAttribute('data-tab'));
            }

            // Dashboard navigation
            if (e.target.closest('.nav-item')) {
                this.switchDashboardSection(e.target.closest('.nav-item').getAttribute('data-section'));
            }

            // Close dashboard
            if (e.target.closest('#dashboard-close') || e.target.closest('.dashboard-overlay')) {
                this.hideDashboard();
            }

            // Logout
            if (e.target.closest('#logout-btn')) {
                this.logout();
            }
        });

        // Form submissions
        document.getElementById('login-form-element').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        document.getElementById('register-form-element').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });

        // Language change
        document.addEventListener('languageChanged', () => {
            this.updateLanguage();
        });
    }

    showAuthModal() {
        this.authModal.classList.remove('hidden');
        this.authModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    hideAuthModal() {
        this.authModal.classList.remove('active');
        this.authModal.classList.add('hidden');
        document.body.style.overflow = '';
    }

    switchAuthTab(tab) {
        // Update tabs
        document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

        // Update forms
        document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
        document.getElementById(`${tab}-form`).classList.add('active');
    }

    async handleLogin() {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        this.showAuthStatus('loading', 'Signing in...');

        try {
            // Simulate API call
            await this.simulateApiCall();

            const user = {
                id: Date.now(),
                name: 'Mo.basim',
                email: email
            };

            this.setUser(user);
            this.showAuthStatus('success', 'Login successful!');

            setTimeout(() => {
                this.hideAuthModal();
                this.showDashboard();
            }, 1000);

        } catch (error) {
            this.showAuthStatus('error', 'Login failed. Please try again.');
        }
    }

    async handleRegister() {
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;

        if (password !== confirmPassword) {
            this.showAuthStatus('error', 'Passwords do not match.');
            return;
        }

        this.showAuthStatus('loading', 'Creating account...');

        try {
            // Simulate API call
            await this.simulateApiCall();

            const user = {
                id: Date.now(),
                name: name,
                email: email
            };

            this.setUser(user);
            this.showAuthStatus('success', 'Account created successfully!');

            setTimeout(() => {
                this.hideAuthModal();
                this.showDashboard();
            }, 1000);

        } catch (error) {
            this.showAuthStatus('error', 'Registration failed. Please try again.');
        }
    }

    setUser(user) {
        this.currentUser = user;
        this.isLoggedIn = true;
        localStorage.setItem('auth-user', JSON.stringify(user));
        localStorage.setItem('auth-token', 'demo-token-' + Date.now());
        this.updateUI();

        // إرسال حدث تغيير حالة المصادقة
        document.dispatchEvent(new CustomEvent('authStateChanged', {
            detail: { isLoggedIn: true, user: user }
        }));
    }

    logout() {
        this.currentUser = null;
        this.isLoggedIn = false;
        localStorage.removeItem('auth-user');
        localStorage.removeItem('auth-token');
        this.hideDashboard();
        this.updateUI();

        // إرسال حدث تغيير حالة المصادقة
        document.dispatchEvent(new CustomEvent('authStateChanged', {
            detail: { isLoggedIn: false, user: null }
        }));
    }

    checkAuthStatus() {
        const user = localStorage.getItem('auth-user');
        const token = localStorage.getItem('auth-token');

        if (user && token) {
            this.currentUser = JSON.parse(user);
            this.isLoggedIn = true;
            this.updateUI();
        }
    }

    updateUI() {
        // تحديث واجهة المستخدم يتم الآن من خلال main.js
        // عبر الأحداث المخصصة authStateChanged
        console.log('Auth state updated:', this.isLoggedIn ? 'Logged in' : 'Logged out');
    }

    showDashboard() {
        if (!this.isLoggedIn) return;

        // Update user info
        document.getElementById('dashboard-user-name').textContent = this.currentUser.name;
        document.getElementById('dashboard-user-email').textContent = this.currentUser.email;

        this.dashboardModal.classList.remove('hidden');
        this.dashboardModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    hideDashboard() {
        this.dashboardModal.classList.remove('active');
        this.dashboardModal.classList.add('hidden');
        document.body.style.overflow = '';
    }

    switchDashboardSection(section) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        document.querySelector(`[data-section="${section}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.dashboard-section').forEach(sec => sec.classList.remove('active'));
        document.getElementById(`${section}-section`).classList.add('active');
    }

    showAuthStatus(type, message) {
        const statusElement = document.getElementById('auth-status');
        statusElement.className = `auth-status ${type}`;
        statusElement.textContent = message;
        statusElement.style.display = 'block';

        if (type !== 'loading') {
            setTimeout(() => {
                statusElement.style.display = 'none';
            }, 3000);
        }
    }

    simulateApiCall() {
        return new Promise((resolve) => {
            setTimeout(resolve, 1500);
        });
    }

    updateLanguage() {
        // Language updates are handled by the language system
        // This method can be used for any auth-specific language updates
    }
}

// Initialize auth system
document.addEventListener('DOMContentLoaded', () => {
    window.authSystem = new AuthSystem();
});
