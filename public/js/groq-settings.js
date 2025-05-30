/**
 * واجهة إعدادات Groq API
 * تسمح للمستخدم بإدارة مفتاح API والنماذج
 */

class GroqSettings {
    constructor() {
        this.isVisible = false;
        this.init();
    }

    /**
     * تهيئة واجهة الإعدادات
     */
    init() {
        this.createSettingsModal();
        this.setupEventListeners();
        this.loadSettings();
        console.log('⚙️ Groq Settings initialized');
    }

    /**
     * إنشاء نافذة الإعدادات
     */
    createSettingsModal() {
        const modal = document.createElement('div');
        modal.id = 'groqSettingsModal';
        modal.className = 'groq-settings-modal';
        modal.innerHTML = `
            <div class="groq-settings-content">
                <div class="groq-settings-header">
                    <h3>
                        <i class="fas fa-robot"></i>
                        إعدادات Groq AI
                    </h3>
                    <button class="groq-close-btn" onclick="groqSettings.hide()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <div class="groq-settings-body">
                    <!-- API Key Section -->
                    <div class="groq-section">
                        <h4><i class="fas fa-key"></i> مفتاح API</h4>
                        <div class="groq-input-group">
                            <input type="password" id="groqApiKey" placeholder="أدخل مفتاح Groq API الخاص بك">
                            <button type="button" id="toggleApiKey" class="groq-toggle-btn">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                        <small class="groq-help-text">
                            احصل على مفتاح API مجاني من
                            <a href="https://console.groq.com/keys" target="_blank">console.groq.com</a>
                        </small>
                        <div class="groq-api-status" id="groqApiStatus"></div>
                    </div>

                    <!-- Model Selection -->
                    <div class="groq-section">
                        <h4><i class="fas fa-brain"></i> اختيار النموذج</h4>
                        <select id="groqModelSelect" class="groq-select">
                            <option value="llama-3.1-70b-versatile">Llama 3.1 70B (موصى به)</option>
                            <option value="llama-3.1-405b-reasoning">Llama 3.1 405B (الأقوى)</option>
                            <option value="llama-3.1-8b-instant">Llama 3.1 8B (سريع)</option>
                            <option value="mixtral-8x7b-32768">Mixtral 8x7B (متعدد اللغات)</option>
                            <option value="gemma-7b-it">Gemma 7B (جوجل)</option>
                            <option value="gemma2-9b-it">Gemma 2 9B (محسن)</option>
                        </select>
                        <small class="groq-help-text">
                            النماذج الأكبر أكثر دقة لكنها أبطأ
                        </small>
                    </div>

                    <!-- Advanced Settings -->
                    <div class="groq-section">
                        <h4><i class="fas fa-sliders-h"></i> إعدادات متقدمة</h4>

                        <div class="groq-setting-item">
                            <label for="groqTemperature">الإبداع (Temperature): <span id="tempValue">0.7</span></label>
                            <input type="range" id="groqTemperature" min="0" max="2" step="0.1" value="0.7">
                            <small>قيم أعلى = إجابات أكثر إبداعاً</small>
                        </div>

                        <div class="groq-setting-item">
                            <label for="groqMaxTokens">الحد الأقصى للكلمات: <span id="tokensValue">2048</span></label>
                            <input type="range" id="groqMaxTokens" min="256" max="4096" step="256" value="2048">
                            <small>عدد الكلمات في الرد</small>
                        </div>

                        <div class="groq-setting-item">
                            <label for="groqTopP">دقة التركيز (Top P): <span id="topPValue">0.9</span></label>
                            <input type="range" id="groqTopP" min="0.1" max="1" step="0.1" value="0.9">
                            <small>قيم أقل = إجابات أكثر تركيزاً</small>
                        </div>
                    </div>

                    <!-- Usage Info -->
                    <div class="groq-section">
                        <h4><i class="fas fa-chart-bar"></i> معلومات الاستخدام</h4>
                        <div id="groqUsageInfo" class="groq-usage-info">
                            <div class="usage-item">
                                <span>الطلبات اليوم:</span>
                                <span id="requestsToday">0</span>
                            </div>
                            <div class="usage-item">
                                <span>النموذج الحالي:</span>
                                <span id="currentModelDisplay">Llama 3.1 70B</span>
                            </div>
                            <div class="usage-item">
                                <span>حالة الاتصال:</span>
                                <span id="connectionStatus">غير متصل</span>
                            </div>
                        </div>

                        <!-- تحذير حالة الخدمة -->
                        <div class="groq-service-notice">
                            <div class="notice-content">
                                <i class="fas fa-info-circle"></i>
                                <span>إذا كانت خدمة Groq غير متاحة، سيتم التبديل تلقائياً إلى Google Gemini</span>
                            </div>
                        </div>
                    </div>

                    <!-- Actions -->
                    <div class="groq-section">
                        <h4><i class="fas fa-tools"></i> إجراءات</h4>
                        <div class="groq-actions">
                            <button id="testGroqConnection" class="groq-btn groq-btn-primary">
                                <i class="fas fa-plug"></i>
                                اختبار الاتصال
                            </button>
                            <button id="clearGroqHistory" class="groq-btn groq-btn-warning">
                                <i class="fas fa-trash"></i>
                                مسح التاريخ
                            </button>
                            <button id="resetGroqSettings" class="groq-btn groq-btn-danger">
                                <i class="fas fa-undo"></i>
                                إعادة تعيين
                            </button>
                        </div>
                    </div>
                </div>

                <div class="groq-settings-footer">
                    <button class="groq-btn groq-btn-success" onclick="groqSettings.saveSettings()">
                        <i class="fas fa-save"></i>
                        حفظ الإعدادات
                    </button>
                    <button class="groq-btn groq-btn-secondary" onclick="groqSettings.hide()">
                        <i class="fas fa-times"></i>
                        إلغاء
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.addStyles();
    }

    /**
     * إضافة الأنماط CSS
     */
    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .groq-settings-modal {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                z-index: 10000;
                backdrop-filter: blur(5px);
            }

            .groq-settings-content {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: #1a1a1a;
                border-radius: 15px;
                width: 90%;
                max-width: 600px;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                border: 1px solid #333;
            }

            .groq-settings-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                border-bottom: 1px solid #333;
                background: linear-gradient(135deg, #ff7200, #ff9500);
                border-radius: 15px 15px 0 0;
            }

            .groq-settings-header h3 {
                margin: 0;
                color: white;
                font-size: 1.2em;
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .groq-close-btn {
                background: none;
                border: none;
                color: white;
                font-size: 1.2em;
                cursor: pointer;
                padding: 5px;
                border-radius: 5px;
                transition: background 0.3s ease;
            }

            .groq-close-btn:hover {
                background: rgba(255, 255, 255, 0.2);
            }

            .groq-settings-body {
                padding: 20px;
                color: #e0e0e0;
            }

            .groq-section {
                margin-bottom: 25px;
                padding-bottom: 20px;
                border-bottom: 1px solid #333;
            }

            .groq-section:last-child {
                border-bottom: none;
                margin-bottom: 0;
            }

            .groq-section h4 {
                margin: 0 0 15px 0;
                color: #ff7200;
                font-size: 1.1em;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .groq-input-group {
                position: relative;
                display: flex;
                align-items: center;
            }

            .groq-input-group input {
                flex: 1;
                padding: 12px;
                border: 1px solid #444;
                border-radius: 8px;
                background: #2a2a2a;
                color: #e0e0e0;
                font-size: 14px;
            }

            .groq-input-group input:focus {
                outline: none;
                border-color: #ff7200;
                box-shadow: 0 0 0 2px rgba(255, 114, 0, 0.2);
            }

            .groq-toggle-btn {
                position: absolute;
                right: 10px;
                background: none;
                border: none;
                color: #888;
                cursor: pointer;
                padding: 5px;
            }

            .groq-select {
                width: 100%;
                padding: 12px;
                border: 1px solid #444;
                border-radius: 8px;
                background: #2a2a2a;
                color: #e0e0e0;
                font-size: 14px;
            }

            .groq-select:focus {
                outline: none;
                border-color: #ff7200;
                box-shadow: 0 0 0 2px rgba(255, 114, 0, 0.2);
            }

            .groq-help-text {
                display: block;
                margin-top: 5px;
                color: #888;
                font-size: 12px;
            }

            .groq-help-text a {
                color: #ff7200;
                text-decoration: none;
            }

            .groq-help-text a:hover {
                text-decoration: underline;
            }

            .groq-api-status {
                margin-top: 10px;
                padding: 8px 12px;
                border-radius: 5px;
                font-size: 12px;
                display: none;
            }

            .groq-api-status.success {
                background: rgba(76, 175, 80, 0.2);
                color: #4caf50;
                border: 1px solid #4caf50;
                display: block;
            }

            .groq-api-status.error {
                background: rgba(244, 67, 54, 0.2);
                color: #f44336;
                border: 1px solid #f44336;
                display: block;
            }

            .groq-setting-item {
                margin-bottom: 15px;
            }

            .groq-setting-item label {
                display: block;
                margin-bottom: 5px;
                font-weight: 500;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .groq-setting-item input[type="range"] {
                width: 100%;
                margin: 5px 0;
            }

            .groq-setting-item small {
                color: #888;
                font-size: 11px;
            }

            .groq-usage-info {
                background: #2a2a2a;
                padding: 15px;
                border-radius: 8px;
                border: 1px solid #444;
            }

            .usage-item {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;
                font-size: 14px;
            }

            .usage-item:last-child {
                margin-bottom: 0;
            }

            .groq-service-notice {
                margin-top: 15px;
                padding: 12px;
                background: rgba(255, 193, 7, 0.1);
                border: 1px solid rgba(255, 193, 7, 0.3);
                border-radius: 8px;
            }

            .notice-content {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 13px;
                color: #ffc107;
            }

            .notice-content i {
                font-size: 14px;
            }

            .groq-actions {
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
            }

            .groq-btn {
                padding: 10px 15px;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
                display: flex;
                align-items: center;
                gap: 5px;
                transition: all 0.3s ease;
                flex: 1;
                min-width: 120px;
                justify-content: center;
            }

            .groq-btn-primary {
                background: #2196f3;
                color: white;
            }

            .groq-btn-primary:hover {
                background: #1976d2;
            }

            .groq-btn-warning {
                background: #ff9800;
                color: white;
            }

            .groq-btn-warning:hover {
                background: #f57c00;
            }

            .groq-btn-danger {
                background: #f44336;
                color: white;
            }

            .groq-btn-danger:hover {
                background: #d32f2f;
            }

            .groq-btn-success {
                background: #4caf50;
                color: white;
            }

            .groq-btn-success:hover {
                background: #388e3c;
            }

            .groq-btn-secondary {
                background: #666;
                color: white;
            }

            .groq-btn-secondary:hover {
                background: #555;
            }

            .groq-settings-footer {
                padding: 20px;
                border-top: 1px solid #333;
                display: flex;
                gap: 10px;
                justify-content: flex-end;
            }

            @media (max-width: 768px) {
                .groq-settings-content {
                    width: 95%;
                    margin: 20px;
                }

                .groq-actions {
                    flex-direction: column;
                }

                .groq-btn {
                    min-width: auto;
                }

                .groq-settings-footer {
                    flex-direction: column;
                }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * إعداد مستمعي الأحداث
     */
    setupEventListeners() {
        // إغلاق النافذة عند النقر خارجها
        document.getElementById('groqSettingsModal').addEventListener('click', (e) => {
            if (e.target.id === 'groqSettingsModal') {
                this.hide();
            }
        });

        // تبديل إظهار/إخفاء مفتاح API
        document.getElementById('toggleApiKey').addEventListener('click', () => {
            const input = document.getElementById('groqApiKey');
            const icon = document.querySelector('#toggleApiKey i');

            if (input.type === 'password') {
                input.type = 'text';
                icon.className = 'fas fa-eye-slash';
            } else {
                input.type = 'password';
                icon.className = 'fas fa-eye';
            }
        });

        // تحديث قيم المنزلقات
        this.setupSliderUpdates();

        // أزرار الإجراءات
        document.getElementById('testGroqConnection').addEventListener('click', () => this.testConnection());
        document.getElementById('clearGroqHistory').addEventListener('click', () => this.clearHistory());
        document.getElementById('resetGroqSettings').addEventListener('click', () => this.resetSettings());

        // تحديث النموذج عند التغيير
        document.getElementById('groqModelSelect').addEventListener('change', (e) => {
            this.updateCurrentModelDisplay(e.target.value);
        });
    }

    /**
     * إعداد تحديثات المنزلقات
     */
    setupSliderUpdates() {
        const sliders = [
            { id: 'groqTemperature', display: 'tempValue' },
            { id: 'groqMaxTokens', display: 'tokensValue' },
            { id: 'groqTopP', display: 'topPValue' }
        ];

        sliders.forEach(slider => {
            const element = document.getElementById(slider.id);
            const display = document.getElementById(slider.display);

            element.addEventListener('input', () => {
                display.textContent = element.value;
            });
        });
    }

    /**
     * إظهار نافذة الإعدادات
     */
    show() {
        document.getElementById('groqSettingsModal').style.display = 'block';
        this.isVisible = true;
        this.loadSettings();
        this.updateUsageInfo();
    }

    /**
     * إخفاء نافذة الإعدادات
     */
    hide() {
        document.getElementById('groqSettingsModal').style.display = 'none';
        this.isVisible = false;
    }

    /**
     * تحميل الإعدادات المحفوظة
     */
    loadSettings() {
        // تحميل مفتاح API
        const apiKey = localStorage.getItem('groq_api_key') || '';
        document.getElementById('groqApiKey').value = apiKey;

        // تحميل النموذج
        const model = localStorage.getItem('groq_model') || 'llama-3.1-8b-instant';
        document.getElementById('groqModelSelect').value = model;
        this.updateCurrentModelDisplay(model);

        // تحميل الإعدادات المتقدمة
        document.getElementById('groqTemperature').value = localStorage.getItem('groq_temperature') || '0.7';
        document.getElementById('groqMaxTokens').value = localStorage.getItem('groq_max_tokens') || '2048';
        document.getElementById('groqTopP').value = localStorage.getItem('groq_top_p') || '0.9';

        // تحديث العروض
        document.getElementById('tempValue').textContent = document.getElementById('groqTemperature').value;
        document.getElementById('tokensValue').textContent = document.getElementById('groqMaxTokens').value;
        document.getElementById('topPValue').textContent = document.getElementById('groqTopP').value;
    }

    /**
     * حفظ الإعدادات
     */
    saveSettings() {
        const apiKey = document.getElementById('groqApiKey').value.trim();
        const model = document.getElementById('groqModelSelect').value;
        const temperature = document.getElementById('groqTemperature').value;
        const maxTokens = document.getElementById('groqMaxTokens').value;
        const topP = document.getElementById('groqTopP').value;

        // حفظ في التخزين المحلي
        if (apiKey) {
            localStorage.setItem('groq_api_key', apiKey);
            window.groqService.setApiKey(apiKey);
        }

        localStorage.setItem('groq_model', model);
        localStorage.setItem('groq_temperature', temperature);
        localStorage.setItem('groq_max_tokens', maxTokens);
        localStorage.setItem('groq_top_p', topP);

        // تحديث الخدمة
        window.groqService.setModel(model);

        // إظهار رسالة نجاح
        this.showStatus('تم حفظ الإعدادات بنجاح!', 'success');

        setTimeout(() => {
            this.hide();
        }, 1500);
    }

    /**
     * اختبار الاتصال
     */
    async testConnection() {
        const button = document.getElementById('testGroqConnection');
        const originalText = button.innerHTML;

        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الاختبار...';
        button.disabled = true;

        try {
            const apiKey = document.getElementById('groqApiKey').value.trim();
            if (!apiKey) {
                throw new Error('يرجى إدخال مفتاح API أولاً');
            }

            // تحديث مفتاح API مؤقتاً للاختبار
            window.groqService.setApiKey(apiKey);

            const success = await window.groqService.testConnection();

            if (success) {
                this.showStatus('تم الاتصال بنجاح! ✅', 'success');
                document.getElementById('connectionStatus').textContent = 'متصل';
                document.getElementById('connectionStatus').style.color = '#4caf50';
            } else {
                throw new Error('فشل في الاتصال');
            }
        } catch (error) {
            this.showStatus(`خطأ في الاتصال: ${error.message}`, 'error');
            document.getElementById('connectionStatus').textContent = 'غير متصل';
            document.getElementById('connectionStatus').style.color = '#f44336';
        } finally {
            button.innerHTML = originalText;
            button.disabled = false;
        }
    }

    /**
     * مسح التاريخ
     */
    clearHistory() {
        if (confirm('هل أنت متأكد من مسح تاريخ المحادثة؟')) {
            window.groqService.clearHistory();
            this.showStatus('تم مسح التاريخ بنجاح!', 'success');
            this.updateUsageInfo();
        }
    }

    /**
     * إعادة تعيين الإعدادات
     */
    resetSettings() {
        if (confirm('هل أنت متأكد من إعادة تعيين جميع الإعدادات؟')) {
            localStorage.removeItem('groq_api_key');
            localStorage.removeItem('groq_model');
            localStorage.removeItem('groq_temperature');
            localStorage.removeItem('groq_max_tokens');
            localStorage.removeItem('groq_top_p');
            localStorage.removeItem('groq_conversation_history');

            this.loadSettings();
            this.showStatus('تم إعادة تعيين الإعدادات!', 'success');
        }
    }

    /**
     * تحديث معلومات الاستخدام
     */
    async updateUsageInfo() {
        try {
            const usage = await window.groqService.getUsageInfo();
            document.getElementById('requestsToday').textContent = usage.requestsToday;

            const isConnected = window.groqService.isApiKeyValid();
            document.getElementById('connectionStatus').textContent = isConnected ? 'متصل' : 'غير متصل';
            document.getElementById('connectionStatus').style.color = isConnected ? '#4caf50' : '#f44336';
        } catch (error) {
            console.warn('Failed to update usage info:', error);
        }
    }

    /**
     * تحديث عرض النموذج الحالي
     */
    updateCurrentModelDisplay(model) {
        const models = window.groqService.getAvailableModels();
        document.getElementById('currentModelDisplay').textContent = models[model] || model;
    }

    /**
     * إظهار رسالة حالة
     */
    showStatus(message, type) {
        const status = document.getElementById('groqApiStatus');
        status.textContent = message;
        status.className = `groq-api-status ${type}`;

        setTimeout(() => {
            status.style.display = 'none';
        }, 3000);
    }
}

// إنشاء مثيل عام من إعدادات Groq
window.groqSettings = new GroqSettings();

// تصدير للاستخدام في ملفات أخرى
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GroqSettings;
}
