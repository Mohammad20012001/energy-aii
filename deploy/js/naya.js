/* ===== NAYA VOICE ASSISTANT ===== */

class NayaVoiceAssistant {
    constructor() {
        this.isListening = false;
        this.isSpeaking = false;
        this.isActive = false;
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.currentVoice = null;
        this.conversationHistory = [];
        this.init();
    }

    init() {
        this.createNayaInterface();
        this.setupSpeechRecognition();
        this.setupEventListeners();
        this.loadVoiceSettings();
        console.log('🤖 Naya Voice Assistant initialized');
    }

    createNayaInterface() {
        // إنشاء حاوي Naya
        const nayaContainer = document.createElement('div');
        nayaContainer.className = 'naya-container';
        nayaContainer.innerHTML = `
            <div class="naya-interface" id="nayaInterface">
                <div class="naya-header">
                    <div class="naya-avatar"></div>
                    <div class="naya-info">
                        <h3>Naya</h3>
                        <div class="naya-status" id="nayaStatus">جاهزة للمساعدة</div>
                    </div>
                </div>
                
                <div class="naya-conversation" id="nayaConversation">
                    <div class="naya-message assistant">
                        مرحباً! أنا نايا، مساعدتك الذكية في Energy.AI. كيف يمكنني مساعدتك اليوم؟
                    </div>
                </div>
                
                <div class="voice-indicator" id="voiceIndicator">
                    <div class="voice-bar"></div>
                    <div class="voice-bar"></div>
                    <div class="voice-bar"></div>
                    <div class="voice-bar"></div>
                    <div class="voice-bar"></div>
                </div>
                
                <div class="naya-controls">
                    <button class="naya-control-btn" onclick="naya.toggleListening()">
                        <ion-icon name="mic-outline"></ion-icon>
                        استمع
                    </button>
                    <button class="naya-control-btn" onclick="naya.stopSpeaking()">
                        <ion-icon name="stop-outline"></ion-icon>
                        توقف
                    </button>
                    <button class="naya-control-btn" onclick="naya.clearConversation()">
                        <ion-icon name="refresh-outline"></ion-icon>
                        مسح
                    </button>
                </div>
                
                <div class="voice-settings">
                    <div class="voice-setting">
                        <label>الصوت:</label>
                        <select id="voiceSelect" onchange="naya.changeVoice(this.value)">
                            <option value="female">أنثى</option>
                            <option value="male">ذكر</option>
                        </select>
                    </div>
                    <div class="voice-setting">
                        <label>السرعة:</label>
                        <input type="range" id="speechRate" min="0.5" max="2" step="0.1" value="1" 
                               onchange="naya.changeSpeechRate(this.value)">
                    </div>
                </div>
            </div>
            
            <button class="naya-trigger" onclick="naya.toggleInterface()">
                <ion-icon name="mic" class="naya-icon"></ion-icon>
            </button>
        `;

        document.body.appendChild(nayaContainer);
    }

    setupSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'ar-SA'; // Arabic
            
            this.recognition.onstart = () => {
                this.isListening = true;
                this.updateStatus('أستمع...');
                this.updateUI();
            };
            
            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.handleVoiceInput(transcript);
            };
            
            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.isListening = false;
                this.updateStatus('خطأ في التعرف على الصوت');
                this.updateUI();
            };
            
            this.recognition.onend = () => {
                this.isListening = false;
                this.updateStatus('جاهزة للمساعدة');
                this.updateUI();
            };
        } else {
            console.warn('Speech recognition not supported');
        }
    }

    setupEventListeners() {
        // استمع لكلمة التفعيل "نايا"
        document.addEventListener('keydown', (e) => {
            if (e.key === 'n' && e.ctrlKey) {
                e.preventDefault();
                this.activateByVoice();
            }
        });

        // استمع للأوامر الصوتية العامة
        if (this.recognition) {
            // تفعيل الاستماع المستمر لكلمة "نايا"
            this.startWakeWordDetection();
        }
    }

    startWakeWordDetection() {
        // محاكاة كشف كلمة التفعيل
        setInterval(() => {
            if (!this.isListening && !this.isSpeaking) {
                // في التطبيق الحقيقي، سيتم استخدام مكتبة كشف كلمة التفعيل
                // هنا نستخدم محاكاة بسيطة
            }
        }, 5000);
    }

    activateByVoice() {
        if (!this.isActive) {
            this.toggleInterface();
            this.speak('مرحباً! كيف يمكنني مساعدتك؟');
        }
    }

    toggleInterface() {
        this.isActive = !this.isActive;
        const interface = document.getElementById('nayaInterface');
        const trigger = document.querySelector('.naya-trigger');
        
        if (this.isActive) {
            interface.classList.add('show');
            trigger.classList.add('active');
            this.speak('مرحباً! أنا نايا، كيف يمكنني مساعدتك؟');
        } else {
            interface.classList.remove('show');
            trigger.classList.remove('active');
            this.stopSpeaking();
        }
    }

    toggleListening() {
        if (this.isListening) {
            this.stopListening();
        } else {
            this.startListening();
        }
    }

    startListening() {
        if (this.recognition && !this.isListening) {
            this.recognition.start();
            document.getElementById('voiceIndicator').classList.add('active');
        }
    }

    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
            document.getElementById('voiceIndicator').classList.remove('active');
        }
    }

    handleVoiceInput(transcript) {
        console.log('Voice input:', transcript);
        
        // إضافة الرسالة للمحادثة
        this.addMessage(transcript, 'user');
        
        // معالجة الأوامر
        this.processCommand(transcript);
    }

    processCommand(command) {
        const lowerCommand = command.toLowerCase();
        
        // أوامر التوقف
        if (lowerCommand.includes('توقف') || lowerCommand.includes('توقفي') || lowerCommand.includes('stop')) {
            this.stopSpeaking();
            this.addMessage('تم التوقف', 'assistant');
            return;
        }
        
        // أوامر التنقل
        if (lowerCommand.includes('افتح الرئيسية') || lowerCommand.includes('open home')) {
            this.navigateToSection('home');
            this.addMessage('تم فتح الصفحة الرئيسية', 'assistant');
            this.speak('تم فتح الصفحة الرئيسية');
            return;
        }
        
        if (lowerCommand.includes('افتح الخدمات') || lowerCommand.includes('open services')) {
            this.navigateToSection('services');
            this.addMessage('تم فتح قسم الخدمات', 'assistant');
            this.speak('تم فتح قسم الخدمات');
            return;
        }
        
        if (lowerCommand.includes('افتح الخريطة') || lowerCommand.includes('open map')) {
            this.navigateToSection('design');
            this.addMessage('تم فتح Energy.map', 'assistant');
            this.speak('تم فتح Energy.map');
            return;
        }
        
        // أوامر الطاقة الشمسية
        if (lowerCommand.includes('طاقة شمسية') || lowerCommand.includes('solar')) {
            const response = 'يمكنني مساعدتك في حساب الطاقة الشمسية. ما هي المساحة المتاحة لديك؟';
            this.addMessage(response, 'assistant');
            this.speak(response);
            return;
        }
        
        // أوامر عامة
        if (lowerCommand.includes('مساعدة') || lowerCommand.includes('help')) {
            const response = 'يمكنني مساعدتك في: فتح الأقسام، حساب الطاقة الشمسية، استخدام الخرائط، والإجابة على أسئلتك حول الطاقة المتجددة';
            this.addMessage(response, 'assistant');
            this.speak(response);
            return;
        }
        
        // استجابة افتراضية
        const defaultResponse = 'فهمت طلبك. كيف يمكنني مساعدتك أكثر؟';
        this.addMessage(defaultResponse, 'assistant');
        this.speak(defaultResponse);
    }

    navigateToSection(section) {
        const element = document.getElementById(section);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    }

    speak(text) {
        if (this.synthesis) {
            // إيقاف أي كلام سابق
            this.synthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'ar-SA';
            utterance.rate = parseFloat(document.getElementById('speechRate')?.value || 1);
            utterance.pitch = 1;
            
            // اختيار الصوت
            const voices = this.synthesis.getVoices();
            const voiceType = document.getElementById('voiceSelect')?.value || 'female';
            
            if (voiceType === 'female') {
                utterance.voice = voices.find(voice => 
                    voice.lang.includes('ar') && voice.name.toLowerCase().includes('female')
                ) || voices.find(voice => voice.lang.includes('ar')) || voices[0];
            } else {
                utterance.voice = voices.find(voice => 
                    voice.lang.includes('ar') && voice.name.toLowerCase().includes('male')
                ) || voices.find(voice => voice.lang.includes('ar')) || voices[0];
            }
            
            utterance.onstart = () => {
                this.isSpeaking = true;
                this.updateStatus('أتحدث...');
                this.updateUI();
            };
            
            utterance.onend = () => {
                this.isSpeaking = false;
                this.updateStatus('جاهزة للمساعدة');
                this.updateUI();
            };
            
            this.synthesis.speak(utterance);
        }
    }

    stopSpeaking() {
        if (this.synthesis) {
            this.synthesis.cancel();
            this.isSpeaking = false;
            this.updateStatus('تم التوقف');
            this.updateUI();
        }
    }

    addMessage(text, sender) {
        const conversation = document.getElementById('nayaConversation');
        const message = document.createElement('div');
        message.className = `naya-message ${sender}`;
        message.textContent = text;
        
        conversation.appendChild(message);
        conversation.scrollTop = conversation.scrollHeight;
        
        // حفظ في التاريخ
        this.conversationHistory.push({ text, sender, timestamp: new Date() });
    }

    clearConversation() {
        const conversation = document.getElementById('nayaConversation');
        conversation.innerHTML = `
            <div class="naya-message assistant">
                مرحباً! أنا نايا، مساعدتك الذكية في Energy.AI. كيف يمكنني مساعدتك اليوم؟
            </div>
        `;
        this.conversationHistory = [];
    }

    updateStatus(status) {
        const statusElement = document.getElementById('nayaStatus');
        if (statusElement) {
            statusElement.textContent = status;
            statusElement.className = 'naya-status';
            
            if (this.isListening) {
                statusElement.classList.add('listening');
            } else if (this.isSpeaking) {
                statusElement.classList.add('speaking');
            }
        }
    }

    updateUI() {
        const trigger = document.querySelector('.naya-trigger');
        
        if (this.isListening) {
            trigger.classList.add('listening');
            trigger.classList.remove('speaking');
        } else if (this.isSpeaking) {
            trigger.classList.add('speaking');
            trigger.classList.remove('listening');
        } else {
            trigger.classList.remove('listening', 'speaking');
        }
    }

    changeVoice(voiceType) {
        console.log('Voice changed to:', voiceType);
        // سيتم تطبيق التغيير في المرة القادمة للكلام
    }

    changeSpeechRate(rate) {
        console.log('Speech rate changed to:', rate);
        // سيتم تطبيق التغيير في المرة القادمة للكلام
    }

    loadVoiceSettings() {
        // تحميل الإعدادات المحفوظة
        const savedVoice = localStorage.getItem('naya-voice') || 'female';
        const savedRate = localStorage.getItem('naya-rate') || '1';
        
        const voiceSelect = document.getElementById('voiceSelect');
        const rateSlider = document.getElementById('speechRate');
        
        if (voiceSelect) voiceSelect.value = savedVoice;
        if (rateSlider) rateSlider.value = savedRate;
    }

    saveVoiceSettings() {
        const voiceSelect = document.getElementById('voiceSelect');
        const rateSlider = document.getElementById('speechRate');
        
        if (voiceSelect) localStorage.setItem('naya-voice', voiceSelect.value);
        if (rateSlider) localStorage.setItem('naya-rate', rateSlider.value);
    }
}

// تهيئة Naya عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    window.naya = new NayaVoiceAssistant();
});

// تصدير للاستخدام العام
window.NayaVoiceAssistant = NayaVoiceAssistant;
