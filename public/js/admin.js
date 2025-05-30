/* ===== ENERGY.AI ADMIN PANEL ===== */

class AdminManager {
    constructor() {
        this.isAdminMode = false;
        this.adminUser = null;
        this.adminToken = null;
        this.init();
    }

    init() {
        this.checkAdminAccess();
        this.setupAdminEventListeners();
        console.log('👑 Admin Manager initialized');
    }

    checkAdminAccess() {
        // التحقق من صلاحيات الإدارة
        const currentUser = window.authManager?.getCurrentUser();
        if (currentUser && currentUser.role === 'admin') {
            this.enableAdminMode();
        }
    }

    setupAdminEventListeners() {
        // مستمعي أحداث الإدارة
        document.addEventListener('keydown', (e) => {
            // تفعيل وضع الإدارة بـ Ctrl+Shift+A
            if (e.ctrlKey && e.shiftKey && e.key === 'A') {
                e.preventDefault();
                this.toggleAdminPanel();
            }
        });
    }

    enableAdminMode() {
        this.isAdminMode = true;
        this.createAdminPanel();
        console.log('👑 Admin mode enabled');
    }

    toggleAdminPanel() {
        if (!this.isAdminMode) {
            this.promptAdminLogin();
        } else {
            const panel = document.querySelector('.admin-panel');
            if (panel) {
                panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
            }
        }
    }

    promptAdminLogin() {
        const password = prompt('أدخل كلمة مرور الإدارة:');
        if (password === 'admin123') { // في التطبيق الحقيقي، يجب استخدام مصادقة آمنة
            this.enableAdminMode();
        } else {
            alert('كلمة مرور خاطئة');
        }
    }

    createAdminPanel() {
        // إنشاء لوحة الإدارة
        const adminPanel = document.createElement('div');
        adminPanel.className = 'admin-panel';
        adminPanel.innerHTML = `
            <div class="admin-panel-header">
                <h3>🛠️ لوحة الإدارة</h3>
                <button class="admin-close-btn" onclick="adminManager.toggleAdminPanel()">×</button>
            </div>
            
            <div class="admin-panel-content">
                <div class="admin-section">
                    <h4>📊 إحصائيات الموقع</h4>
                    <div class="admin-stats">
                        <div class="stat-item">
                            <span class="stat-label">الزوار اليوم:</span>
                            <span class="stat-value" id="todayVisitors">-</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">إجمالي الزوار:</span>
                            <span class="stat-value" id="totalVisitors">-</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">المحادثات النشطة:</span>
                            <span class="stat-value" id="activeChats">-</span>
                        </div>
                    </div>
                </div>
                
                <div class="admin-section">
                    <h4>🎨 تخصيص الموقع</h4>
                    <div class="admin-controls">
                        <button class="admin-btn" onclick="adminManager.toggleMaintenanceMode()">
                            وضع الصيانة
                        </button>
                        <button class="admin-btn" onclick="adminManager.clearAllCaches()">
                            مسح الكاش
                        </button>
                        <button class="admin-btn" onclick="adminManager.exportLogs()">
                            تصدير السجلات
                        </button>
                    </div>
                </div>
                
                <div class="admin-section">
                    <h4>💬 إدارة الشات</h4>
                    <div class="admin-controls">
                        <button class="admin-btn" onclick="adminManager.viewChatLogs()">
                            عرض سجل المحادثات
                        </button>
                        <button class="admin-btn" onclick="adminManager.broadcastMessage()">
                            رسالة عامة
                        </button>
                        <button class="admin-btn" onclick="adminManager.toggleChatSystem()">
                            تعطيل/تفعيل الشات
                        </button>
                    </div>
                </div>
                
                <div class="admin-section">
                    <h4>🗺️ إدارة الخرائط</h4>
                    <div class="admin-controls">
                        <button class="admin-btn" onclick="adminManager.resetMapData()">
                            إعادة تعيين بيانات الخريطة
                        </button>
                        <button class="admin-btn" onclick="adminManager.exportMapUsage()">
                            تصدير إحصائيات الخريطة
                        </button>
                    </div>
                </div>
                
                <div class="admin-section">
                    <h4>⚙️ إعدادات النظام</h4>
                    <div class="admin-settings">
                        <label>
                            <input type="checkbox" id="debugMode"> وضع التطوير
                        </label>
                        <label>
                            <input type="checkbox" id="analyticsEnabled"> تفعيل التحليلات
                        </label>
                        <label>
                            <input type="checkbox" id="maintenanceMode"> وضع الصيانة
                        </label>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(adminPanel);
        this.addAdminPanelStyles();
        this.loadAdminData();
    }

    addAdminPanelStyles() {
        if (document.querySelector('#admin-panel-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'admin-panel-styles';
        styles.textContent = `
            .admin-panel {
                position: fixed;
                top: 20px;
                left: 20px;
                width: 350px;
                max-height: 80vh;
                background: rgba(0, 0, 0, 0.95);
                border: 2px solid #ff7200;
                border-radius: 15px;
                z-index: 10000;
                backdrop-filter: blur(15px);
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                overflow-y: auto;
                font-family: 'Roboto', sans-serif;
            }
            
            .admin-panel-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px 20px;
                border-bottom: 1px solid rgba(255, 114, 0, 0.3);
                background: linear-gradient(135deg, #ff7200 0%, #ff9500 100%);
                border-radius: 13px 13px 0 0;
            }
            
            .admin-panel-header h3 {
                margin: 0;
                color: white;
                font-size: 16px;
                font-weight: 600;
            }
            
            .admin-close-btn {
                background: none;
                border: none;
                color: white;
                font-size: 20px;
                cursor: pointer;
                padding: 5px;
                border-radius: 50%;
                transition: all 0.3s ease;
            }
            
            .admin-close-btn:hover {
                background: rgba(255, 255, 255, 0.2);
            }
            
            .admin-panel-content {
                padding: 20px;
                color: white;
            }
            
            .admin-section {
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 1px solid rgba(255, 114, 0, 0.2);
            }
            
            .admin-section:last-child {
                border-bottom: none;
                margin-bottom: 0;
            }
            
            .admin-section h4 {
                margin: 0 0 10px 0;
                color: #ff7200;
                font-size: 14px;
                font-weight: 600;
            }
            
            .admin-stats {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            
            .stat-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 12px;
                background: rgba(255, 114, 0, 0.1);
                border-radius: 6px;
                font-size: 12px;
            }
            
            .stat-label {
                color: rgba(255, 255, 255, 0.8);
            }
            
            .stat-value {
                color: #ff7200;
                font-weight: 600;
            }
            
            .admin-controls {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            
            .admin-btn {
                padding: 8px 12px;
                background: rgba(255, 114, 0, 0.2);
                border: 1px solid rgba(255, 114, 0, 0.3);
                border-radius: 6px;
                color: white;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .admin-btn:hover {
                background: rgba(255, 114, 0, 0.3);
                border-color: #ff7200;
                transform: scale(1.02);
            }
            
            .admin-settings {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            
            .admin-settings label {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 12px;
                color: rgba(255, 255, 255, 0.9);
                cursor: pointer;
            }
            
            .admin-settings input[type="checkbox"] {
                accent-color: #ff7200;
            }
            
            @media (max-width: 768px) {
                .admin-panel {
                    width: 300px;
                    left: 10px;
                    top: 10px;
                }
                
                .admin-panel-content {
                    padding: 15px;
                }
            }
        `;

        document.head.appendChild(styles);
    }

    loadAdminData() {
        // تحميل البيانات الإدارية
        this.updateStats();
        this.loadSettings();
    }

    updateStats() {
        // تحديث الإحصائيات (محاكاة)
        document.getElementById('todayVisitors').textContent = Math.floor(Math.random() * 100) + 50;
        document.getElementById('totalVisitors').textContent = Math.floor(Math.random() * 10000) + 5000;
        document.getElementById('activeChats').textContent = Math.floor(Math.random() * 20) + 5;
    }

    loadSettings() {
        // تحميل الإعدادات المحفوظة
        const debugMode = localStorage.getItem('admin-debug-mode') === 'true';
        const analyticsEnabled = localStorage.getItem('admin-analytics') === 'true';
        const maintenanceMode = localStorage.getItem('admin-maintenance') === 'true';

        document.getElementById('debugMode').checked = debugMode;
        document.getElementById('analyticsEnabled').checked = analyticsEnabled;
        document.getElementById('maintenanceMode').checked = maintenanceMode;

        // إضافة مستمعي الأحداث
        document.getElementById('debugMode').addEventListener('change', (e) => {
            localStorage.setItem('admin-debug-mode', e.target.checked);
            this.toggleDebugMode(e.target.checked);
        });

        document.getElementById('analyticsEnabled').addEventListener('change', (e) => {
            localStorage.setItem('admin-analytics', e.target.checked);
        });

        document.getElementById('maintenanceMode').addEventListener('change', (e) => {
            localStorage.setItem('admin-maintenance', e.target.checked);
            this.toggleMaintenanceMode(e.target.checked);
        });
    }

    toggleDebugMode(enabled) {
        if (enabled) {
            console.log('🐛 Debug mode enabled');
            // تفعيل وضع التطوير
            document.body.classList.add('debug-mode');
        } else {
            console.log('🐛 Debug mode disabled');
            document.body.classList.remove('debug-mode');
        }
    }

    toggleMaintenanceMode(enabled) {
        if (enabled) {
            this.showMaintenancePage();
        } else {
            this.hideMaintenancePage();
        }
    }

    showMaintenancePage() {
        const maintenanceOverlay = document.createElement('div');
        maintenanceOverlay.id = 'maintenance-overlay';
        maintenanceOverlay.innerHTML = `
            <div class="maintenance-content">
                <h2>🔧 الموقع تحت الصيانة</h2>
                <p>نعمل على تحسين الموقع. سنعود قريباً!</p>
                <div class="maintenance-spinner"></div>
            </div>
        `;

        maintenanceOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            text-align: center;
        `;

        document.body.appendChild(maintenanceOverlay);
    }

    hideMaintenancePage() {
        const maintenanceOverlay = document.getElementById('maintenance-overlay');
        if (maintenanceOverlay) {
            maintenanceOverlay.remove();
        }
    }

    clearAllCaches() {
        if (window.pwaManager) {
            window.pwaManager.clearCache();
        }
        
        // مسح التخزين المحلي
        const confirmed = confirm('هل تريد مسح جميع البيانات المخزنة؟');
        if (confirmed) {
            localStorage.clear();
            sessionStorage.clear();
            alert('تم مسح جميع البيانات');
        }
    }

    exportLogs() {
        // تصدير السجلات
        const logs = {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            localStorage: { ...localStorage },
            performance: performance.getEntriesByType('navigation')[0]
        };

        const dataStr = JSON.stringify(logs, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `energy-ai-logs-${Date.now()}.json`;
        link.click();
    }

    viewChatLogs() {
        // عرض سجل المحادثات
        const chatHistory = window.energyAIChat?.conversationHistory || [];
        
        if (chatHistory.length === 0) {
            alert('لا توجد محادثات مسجلة');
            return;
        }

        const logWindow = window.open('', '_blank', 'width=600,height=400');
        logWindow.document.write(`
            <html>
                <head><title>سجل المحادثات</title></head>
                <body style="font-family: Arial; padding: 20px; background: #f5f5f5;">
                    <h2>سجل المحادثات</h2>
                    ${chatHistory.map(chat => `
                        <div style="margin: 10px 0; padding: 10px; background: white; border-radius: 5px;">
                            <strong>${chat.sender === 'user' ? 'المستخدم' : 'Energy.AI'}:</strong>
                            <p>${chat.message}</p>
                            <small>${chat.timestamp.toLocaleString('ar-SA')}</small>
                        </div>
                    `).join('')}
                </body>
            </html>
        `);
    }

    broadcastMessage() {
        const message = prompt('أدخل الرسالة العامة:');
        if (message) {
            // إرسال رسالة لجميع المستخدمين
            if (window.energyAIChat) {
                window.energyAIChat.addMessage(`📢 إعلان: ${message}`, 'bot');
            }
            alert('تم إرسال الرسالة');
        }
    }

    toggleChatSystem() {
        // تعطيل/تفعيل نظام الشات
        const chatContainer = document.getElementById('aiChatContainer');
        if (chatContainer) {
            const isDisabled = chatContainer.style.display === 'none';
            chatContainer.style.display = isDisabled ? 'block' : 'none';
            alert(isDisabled ? 'تم تفعيل نظام الشات' : 'تم تعطيل نظام الشات');
        }
    }

    resetMapData() {
        // إعادة تعيين بيانات الخريطة
        const confirmed = confirm('هل تريد إعادة تعيين جميع بيانات الخريطة؟');
        if (confirmed) {
            if (window.advancedMapTools) {
                window.advancedMapTools.clearAllShapes();
            }
            alert('تم إعادة تعيين بيانات الخريطة');
        }
    }

    exportMapUsage() {
        // تصدير إحصائيات استخدام الخريطة
        const mapData = {
            timestamp: new Date().toISOString(),
            shapesCount: window.advancedMapTools?.shapes?.length || 0,
            currentTool: window.advancedMapTools?.currentTool || 'none',
            mapCenter: window.leafletMap?.getCenter() || null,
            mapZoom: window.leafletMap?.getZoom() || null
        };

        const dataStr = JSON.stringify(mapData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `map-usage-${Date.now()}.json`;
        link.click();
    }

    // دوال مساعدة
    isAdminModeEnabled() {
        return this.isAdminMode;
    }

    getAdminUser() {
        return this.adminUser;
    }
}

// تهيئة مدير الإدارة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    window.adminManager = new AdminManager();
});

// تصدير الفئة للاستخدام العام
window.AdminManager = AdminManager;
