/**
 * Naya Voice Assistant - Main Interface
 * مساعد Naya الصوتي - الواجهة الرئيسية
 */

class NayaAssistant {
    constructor() {
        this.isActive = false;
        this.isListening = false;
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.currentLanguage = localStorage.getItem('website-language') || 'en';
        this.wakePhrases = ['naya', 'نايا', 'ناية', 'نايه', 'maya', 'nia'];
        this.stopPhrases = ['stop', 'توقف', 'توقفي', 'اسكت', 'اسكتي', 'كفى', 'خلاص', 'silence', 'quiet', 'shut up'];
        this.isWakeWordListening = false;
        this.selectedVoice = localStorage.getItem('naya-selected-voice') || null;
        this.availableVoices = [];
        this.isSpeaking = false;
        this.currentUtterance = null;
        this.lastCommand = '';
        this.lastCommandTime = 0;
        this.isProcessingCommand = false;
        this.commandCooldown = 3000; // منع تكرار الأوامر لمدة 3 ثوان
        this.lastResponse = '';
        this.lastResponseTime = 0;
        this.responseCooldown = 5000; // منع تكرار نفس الرد لمدة 5 ثوان

        this.init();
    }

    async init() {
        this.createNayaInterface();
        await this.requestMicrophonePermission();
        this.setupSpeechRecognition();
        this.loadVoices(); // تحميل الأصوات المتاحة
        this.startWakeWordDetection();
        this.setupEventListeners();
    }

    async requestMicrophonePermission() {
        try {
            console.log('Requesting microphone permission...');
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            console.log('Microphone permission granted');
            // إيقاف الستريم فوراً لأننا نحتاج فقط للإذن
            stream.getTracks().forEach(track => track.stop());
            return true;
        } catch (error) {
            console.error('Microphone permission denied:', error);
            this.updateStatus(
                this.currentLanguage === 'ar'
                    ? "يرجى السماح بالوصول للميكروفون لتفعيل Naya"
                    : "Please allow microphone access to activate Naya"
            );
            return false;
        }
    }

    createNayaInterface() {
        // إنشاء حاوية Naya
        const nayaContainer = document.createElement('div');
        nayaContainer.id = 'naya-container';
        nayaContainer.className = 'naya-container hidden';

        nayaContainer.innerHTML = `
            <div class="naya-overlay"></div>
            <div class="naya-interface">
                <div class="naya-avatar">
                    <div class="naya-circle">
                        <div class="naya-pulse"></div>
                        <div class="naya-core">
                            <ion-icon name="mic-outline" class="naya-icon"></ion-icon>
                        </div>
                    </div>
                </div>
                <div class="naya-text">
                    <h2 class="naya-title" data-en="NAYA" data-ar="نايا">NAYA</h2>
                    <p class="naya-subtitle" data-en="Voice Assistant" data-ar="المساعد الصوتي">Voice Assistant</p>
                    <div class="naya-status" id="naya-status">
                        <span data-en="Say 'Naya' to activate" data-ar="قل 'نايا' للتفعيل">Say 'Naya' to activate</span>
                    </div>
                </div>
                <div class="naya-controls">
                    <button class="naya-btn naya-close" id="naya-close">
                        <ion-icon name="close-outline"></ion-icon>
                    </button>
                    <button class="naya-btn naya-settings" id="naya-settings">
                        <ion-icon name="settings-outline"></ion-icon>
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(nayaContainer);
    }

    loadVoices() {
        // تحميل الأصوات المتاحة
        if (this.synthesis) {
            // في بعض المتصفحات، الأصوات تحتاج وقت للتحميل
            const loadVoicesTimeout = () => {
                const voices = this.synthesis.getVoices();
                if (voices.length > 0) {
                    this.availableVoices = voices;
                    console.log('Available voices loaded:', voices.length);
                    voices.forEach(voice => {
                        console.log(`Voice: ${voice.name}, Lang: ${voice.lang}, Gender: ${voice.name.toLowerCase().includes('female') || voice.name.toLowerCase().includes('woman') ? 'Female' : 'Unknown'}`);
                    });
                } else {
                    console.log('No voices available yet, retrying...');
                    setTimeout(loadVoicesTimeout, 100);
                }
            };

            // محاولة تحميل الأصوات فوراً
            loadVoicesTimeout();

            // إضافة مستمع لحدث تحميل الأصوات
            this.synthesis.addEventListener('voiceschanged', () => {
                console.log('Voices changed event triggered');
                loadVoicesTimeout();
            });
        }
    }

    setupSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();

            // إعدادات محسنة للدقة والسرعة
            this.recognition.continuous = true;
            this.recognition.interimResults = true; // تمكين النتائج المؤقتة للاستجابة السريعة
            this.recognition.lang = this.currentLanguage === 'ar' ? 'ar-SA' : 'en-US';
            this.recognition.maxAlternatives = 3; // المزيد من البدائل لدقة أفضل

            // إعدادات إضافية للتحسين
            if (this.recognition.serviceURI !== undefined) {
                this.recognition.serviceURI = ''; // استخدام الخدمة المحلية للسرعة
            }

            // تحسين دقة التعرف للكلمات المهمة
            if (this.recognition.grammars && window.SpeechGrammarList) {
                const grammar = '#JSGF V1.0; grammar commands; public <command> = ' +
                    this.wakePhrases.concat(this.stopPhrases).join(' | ') + ';';
                const speechRecognitionList = new (window.SpeechGrammarList || window.webkitSpeechGrammarList)();
                speechRecognitionList.addFromString(grammar, 1);
                this.recognition.grammars = speechRecognitionList;
            }

            this.recognition.onresult = (event) => {
                this.handleSpeechResult(event);
            };

            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.handleSpeechError(event.error);

                // إعادة تشغيل التعرف على الصوت في حالة الخطأ (ما عدا الأخطاء الدائمة)
                if (this.isWakeWordListening &&
                    event.error !== 'not-allowed' &&
                    event.error !== 'service-not-allowed') {

                    const delay = event.error === 'aborted' ? 500 : 2000;
                    console.log(`Restarting recognition after ${delay}ms due to error: ${event.error}`);

                    setTimeout(() => {
                        if (this.isWakeWordListening) {
                            try {
                                this.recognition.start();
                                console.log('Recognition restarted after error');
                            } catch (e) {
                                console.error('Failed to restart recognition:', e);
                            }
                        }
                    }, delay);
                }
            };

            this.recognition.onend = () => {
                console.log('Speech recognition ended');
                if (this.isWakeWordListening && !this.isActive) {
                    // إعادة تشغيل التعرف على الصوت فقط إذا لم يكن Naya نشطاً
                    setTimeout(() => {
                        if (this.isWakeWordListening && !this.isActive) {
                            try {
                                this.recognition.start();
                                console.log('Speech recognition restarted automatically');
                            } catch (e) {
                                console.error('Failed to restart recognition:', e);
                                // محاولة إعادة التشغيل مرة أخرى بعد وقت أطول
                                setTimeout(() => {
                                    if (this.isWakeWordListening && !this.isActive) {
                                        try {
                                            this.recognition.start();
                                            console.log('Speech recognition restarted on second attempt');
                                        } catch (e2) {
                                            console.error('Second restart attempt failed:', e2);
                                        }
                                    }
                                }, 3000);
                            }
                        }
                    }, 1000);
                }
            };
        }
    }

    startWakeWordDetection() {
        if (!this.recognition) {
            console.error('Speech recognition not supported');
            return;
        }

        if (this.isWakeWordListening) {
            console.log('Wake word detection already running');
            return;
        }

        console.log('Starting wake word detection...');
        this.isWakeWordListening = true;

        try {
            this.recognition.start();
            console.log('Speech recognition started successfully');
        } catch (error) {
            console.error('Error starting speech recognition:', error);
            this.isWakeWordListening = false;

            // محاولة إعادة التشغيل بعد ثانية واحدة
            setTimeout(() => {
                if (!this.isWakeWordListening) {
                    console.log('Retrying to start wake word detection...');
                    this.startWakeWordDetection();
                }
            }, 1000);
        }
    }

    handleSpeechResult(event) {
        const results = event.results;
        const lastResult = results[results.length - 1];

        // معالجة النتائج المؤقتة للاستجابة السريعة
        if (!lastResult.isFinal && this.isActive) {
            const interimTranscript = lastResult[0].transcript.toLowerCase().trim();

            // التحقق من أوامر الإيقاف في النتائج المؤقتة للاستجابة السريعة
            if (this.isStopCommand(interimTranscript) && this.isSpeaking) {
                console.log('Quick stop command detected:', interimTranscript);
                this.stopSpeaking();
                return;
            }
        }

        if (lastResult.isFinal) {
            // اختيار أفضل نتيجة من البدائل المتاحة
            let bestTranscript = lastResult[0].transcript;
            let bestConfidence = lastResult[0].confidence || 0;

            // البحث عن أفضل نتيجة بناءً على الثقة والكلمات المهمة
            for (let i = 0; i < lastResult.length; i++) {
                const alternative = lastResult[i];
                const transcript = alternative.transcript.toLowerCase();
                const confidence = alternative.confidence || 0;

                // إعطاء أولوية للنتائج التي تحتوي على كلمات مهمة
                const hasWakeWord = this.wakePhrases.some(phrase => transcript.includes(phrase));
                const hasStopWord = this.stopPhrases.some(phrase => transcript.includes(phrase));

                if ((hasWakeWord || hasStopWord) || confidence > bestConfidence) {
                    bestTranscript = alternative.transcript;
                    bestConfidence = confidence;
                }
            }

            const transcript = bestTranscript.toLowerCase().trim();
            const currentTime = Date.now();

            console.log('Speech recognized:', transcript, 'Confidence:', bestConfidence);

            // منع تكرار نفس الأمر خلال فترة قصيرة
            if (transcript === this.lastCommand &&
                (currentTime - this.lastCommandTime) < this.commandCooldown) {
                console.log('Duplicate command ignored:', transcript);
                return;
            }

            // منع معالجة الأوامر أثناء معالجة أمر آخر
            if (this.isProcessingCommand) {
                console.log('Command ignored - already processing:', transcript);
                return;
            }

            this.lastCommand = transcript;
            this.lastCommandTime = currentTime;
            this.isProcessingCommand = true;

            try {
                if (!this.isActive) {
                    // البحث عن كلمة التفعيل
                    const foundPhrase = this.wakePhrases.find(phrase => transcript.includes(phrase));
                    console.log('Found wake phrase:', foundPhrase);

                    if (foundPhrase) {
                        console.log('Activating Naya...');
                        this.activateNaya();
                    }
                } else {
                    // معالجة الأوامر عندما يكون Naya نشطاً
                    this.processCommand(transcript);
                }
            } finally {
                // إعادة تعيين حالة المعالجة بعد ثانية
                setTimeout(() => {
                    this.isProcessingCommand = false;
                }, 1000);
            }
        }
    }

    activateNaya() {
        // منع التفعيل المتكرر
        if (this.isActive) {
            console.log('Naya already active, ignoring activation');
            return;
        }

        this.isActive = true;
        this.showNaya();

        // رسالة ترحيب مختصرة وسريعة
        const welcomeMessage = this.currentLanguage === 'ar'
            ? "مرحباً، أنا نايا. كيف أساعدك؟"
            : "Hello, I'm Naya. How can I help?";

        this.speak(welcomeMessage);
        this.updateStatus(
            this.currentLanguage === 'ar' ? "👂 أستمع..." : "👂 Listening..."
        );

        // إيقاف التفعيل التلقائي بعد 25 ثانية (أقصر للاستجابة السريعة)
        this.autoDeactivateTimer = setTimeout(() => {
            if (this.isActive) {
                console.log('Auto-deactivating Naya due to inactivity');
                this.deactivateNaya();
            }
        }, 25000);
    }

    deactivateNaya() {
        this.isActive = false;
        this.hideNaya();

        // إلغاء مؤقت الإيقاف التلقائي
        if (this.autoDeactivateTimer) {
            clearTimeout(this.autoDeactivateTimer);
            this.autoDeactivateTimer = null;
        }

        // إيقاف أي كلام جاري
        this.stopSpeaking();

        // إعادة تعيين حالة المعالجة
        this.isProcessingCommand = false;

        this.updateStatus(
            this.currentLanguage === 'ar' ? "قل 'نايا' للتفعيل" : "Say 'Naya' to activate"
        );
    }

    showNaya() {
        const container = document.getElementById('naya-container');
        container.classList.remove('hidden');
        container.classList.add('active');

        // تأثير الظهور
        setTimeout(() => {
            container.querySelector('.naya-interface').classList.add('visible');
        }, 100);
    }

    hideNaya() {
        const container = document.getElementById('naya-container');
        container.querySelector('.naya-interface').classList.remove('visible');

        setTimeout(() => {
            container.classList.remove('active');
            container.classList.add('hidden');
        }, 300);
    }

    speak(text) {
        if (this.synthesis) {
            // منع تكرار نفس الرد خلال فترة قصيرة
            const currentTime = Date.now();
            if (text === this.lastResponse &&
                (currentTime - this.lastResponseTime) < this.responseCooldown) {
                console.log('Duplicate response prevented:', text);
                return;
            }

            this.lastResponse = text;
            this.lastResponseTime = currentTime;

            // إيقاف أي كلام سابق
            this.stopSpeaking();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = this.currentLanguage === 'ar' ? 'ar-SA' : 'en-US';

            // تحسينات جودة الصوت مع سرعة محسنة
            utterance.rate = 0.95; // سرعة أسرع للاستجابة السريعة
            utterance.volume = 0.9; // صوت أعلى قليلاً
            utterance.pitch = 1.15; // نبرة أنثوية محسنة

            // إعدادات إضافية لتحسين الجودة
            if (this.currentLanguage === 'ar') {
                utterance.rate = 0.9; // أسرع للعربية مع الحفاظ على الوضوح
            }

            let selectedVoice = null;

            // إذا كان هناك صوت محدد مسبقاً، استخدمه
            if (this.selectedVoice) {
                selectedVoice = this.availableVoices.find(voice => voice.name === this.selectedVoice);
                if (selectedVoice) {
                    console.log('Using user-selected voice:', selectedVoice.name);
                }
            }

            // إذا لم يتم العثور على الصوت المحدد، ابحث عن صوت أنثى
            if (!selectedVoice) {
                const voices = this.availableVoices.length > 0 ? this.availableVoices : this.synthesis.getVoices();

                if (this.currentLanguage === 'ar') {
                    // البحث عن صوت أنثى عربي
                    selectedVoice = voices.find(voice =>
                        voice.lang.includes('ar') &&
                        (voice.name.toLowerCase().includes('female') ||
                         voice.name.toLowerCase().includes('woman') ||
                         voice.name.toLowerCase().includes('zira') ||
                         voice.name.toLowerCase().includes('hoda') ||
                         voice.name.toLowerCase().includes('naayf'))
                    );

                    // إذا لم نجد صوت أنثى عربي، نبحث عن أي صوت عربي
                    if (!selectedVoice) {
                        selectedVoice = voices.find(voice => voice.lang.includes('ar'));
                    }
                } else {
                    // البحث عن صوت أنثى إنجليزي
                    selectedVoice = voices.find(voice =>
                        voice.lang.includes('en') &&
                        (voice.name.toLowerCase().includes('female') ||
                         voice.name.toLowerCase().includes('woman') ||
                         voice.name.toLowerCase().includes('zira') ||
                         voice.name.toLowerCase().includes('hazel') ||
                         voice.name.toLowerCase().includes('susan') ||
                         voice.name.toLowerCase().includes('samantha') ||
                         voice.name.toLowerCase().includes('karen') ||
                         voice.name.toLowerCase().includes('moira') ||
                         voice.name.toLowerCase().includes('tessa') ||
                         voice.name.toLowerCase().includes('veena') ||
                         voice.name.toLowerCase().includes('fiona'))
                    );

                    // إذا لم نجد صوت أنثى، نبحث عن أي صوت إنجليزي
                    if (!selectedVoice) {
                        selectedVoice = voices.find(voice => voice.lang.includes('en'));
                    }
                }

                if (selectedVoice) {
                    console.log('Using auto-selected voice:', selectedVoice.name);
                } else {
                    console.log('No suitable voice found, using default voice');
                }
            }

            // تطبيق الصوت المختار
            if (selectedVoice) {
                utterance.voice = selectedVoice;
            }

            // إضافة معالجات الأحداث
            utterance.onstart = () => {
                this.isSpeaking = true;
                this.currentUtterance = utterance;
                console.log('Naya started speaking');
                this.updateStatus('🗣️ أتحدث...');
            };

            utterance.onend = () => {
                this.isSpeaking = false;
                this.currentUtterance = null;
                console.log('Naya finished speaking');
                this.updateStatus('👂 أستمع...');
            };

            utterance.onerror = (error) => {
                this.isSpeaking = false;
                this.currentUtterance = null;
                console.error('Speech synthesis error:', error);
                this.updateStatus('❌ خطأ في النطق');
            };

            utterance.onpause = () => {
                console.log('Speech paused');
            };

            utterance.onresume = () => {
                console.log('Speech resumed');
            };

            this.synthesis.speak(utterance);
        }
    }

    // دالة لإيقاف الكلام
    stopSpeaking() {
        if (this.synthesis) {
            this.synthesis.cancel();
            this.isSpeaking = false;
            this.currentUtterance = null;
            console.log('Speech stopped');
            this.updateStatus('🤐 تم الإيقاف');

            // العودة لحالة الاستماع بعد ثانية
            setTimeout(() => {
                this.updateStatus('👂 أستمع...');
            }, 1000);
        }
    }

    // دالة لتغيير الصوت المختار
    setVoice(voiceName) {
        const voice = this.availableVoices.find(v => v.name === voiceName);
        if (voice) {
            this.selectedVoice = voiceName;
            localStorage.setItem('naya-selected-voice', voiceName);
            console.log('Voice changed to:', voiceName);

            // اختبار الصوت الجديد
            const testMessage = this.currentLanguage === 'ar'
                ? `مرحباً، أنا نايا. تم تغيير صوتي إلى ${voiceName}`
                : `Hello, I am Naya. My voice has been changed to ${voiceName}`;
            this.speak(testMessage);

            return true;
        } else {
            console.error('Voice not found:', voiceName);
            return false;
        }
    }

    // دالة للحصول على قائمة الأصوات المتاحة
    getAvailableVoices() {
        return this.availableVoices.map(voice => ({
            name: voice.name,
            lang: voice.lang,
            localService: voice.localService,
            default: voice.default,
            isFemale: this.isFemaleVoice(voice)
        }));
    }

    // دالة للتحقق من كون الصوت أنثوي
    isFemaleVoice(voice) {
        const femaleKeywords = ['female', 'woman', 'zira', 'hazel', 'susan', 'samantha',
                               'karen', 'moira', 'tessa', 'veena', 'fiona', 'hoda', 'naayf'];
        return femaleKeywords.some(keyword => voice.name.toLowerCase().includes(keyword));
    }

    updateStatus(message) {
        const statusElement = document.getElementById('naya-status');
        if (statusElement) {
            statusElement.innerHTML = `<span>${message}</span>`;
        }
    }

    processCommand(command) {
        console.log('Processing command:', command);

        // إعادة تعيين مؤقت الإيقاف التلقائي عند تلقي أمر جديد
        if (this.autoDeactivateTimer) {
            clearTimeout(this.autoDeactivateTimer);
            this.autoDeactivateTimer = setTimeout(() => {
                if (this.isActive) {
                    this.deactivateNaya();
                }
            }, 25000);
        }

        // التحقق من أوامر الإيقاف أولاً
        if (this.isStopCommand(command)) {
            console.log('Stop command detected:', command);
            this.stopSpeaking();

            // رد مختصر وسريع للتأكيد
            setTimeout(() => {
                const confirmMessage = this.currentLanguage === 'ar' ? 'تم' : 'OK';
                this.speak(confirmMessage);
            }, 300); // أسرع من 500ms
            return;
        }

        // أوامر التحكم الأساسية
        if (this.isCloseCommand(command)) {
            this.deactivateNaya();
            return;
        }

        // أوامر التنقل
        if (this.isNavigationCommand(command)) {
            this.handleNavigation(command);
            return;
        }

        // أوامر المعلومات
        if (this.isInfoCommand(command)) {
            this.handleInfoRequest(command);
            return;
        }

        // أوامر تسجيل الدخول
        if (this.isAuthCommand(command)) {
            this.handleAuthRequest(command);
            return;
        }

        // رد افتراضي
        this.handleGeneralQuery(command);
    }

    isStopCommand(command) {
        return this.stopPhrases.some(phrase => command.toLowerCase().includes(phrase.toLowerCase()));
    }

    isCloseCommand(command) {
        const closeCommands = ['close', 'exit', 'bye', 'goodbye', 'إغلاق', 'خروج', 'وداعاً', 'مع السلامة'];
        return closeCommands.some(cmd => command.includes(cmd));
    }

    isNavigationCommand(command) {
        const navCommands = [
            'go to', 'open', 'open the', 'show', 'show me', 'navigate', 'navigate to',
            'اذهب إلى', 'افتح', 'أظهر', 'انتقل', 'انتقل إلى', 'اذهب', 'اعرض'
        ];
        return navCommands.some(cmd => command.includes(cmd));
    }

    isInfoCommand(command) {
        const infoCommands = ['what', 'how', 'when', 'where', 'why', 'tell me', 'ماذا', 'كيف', 'متى', 'أين', 'لماذا', 'أخبرني'];
        return infoCommands.some(cmd => command.includes(cmd));
    }

    isAuthCommand(command) {
        const authCommands = ['login', 'sign in', 'register', 'join', 'account', 'تسجيل دخول', 'دخول', 'تسجيل', 'انضمام', 'حساب'];
        return authCommands.some(cmd => command.includes(cmd));
    }

    handleNavigation(command) {
        // تنظيف الأمر من كلمات التنقل
        let cleanCommand = command.toLowerCase()
            .replace(/open\s+the\s+/g, '')
            .replace(/open\s+/g, '')
            .replace(/go\s+to\s+/g, '')
            .replace(/show\s+me\s+/g, '')
            .replace(/show\s+/g, '')
            .replace(/navigate\s+to\s+/g, '')
            .replace(/navigate\s+/g, '')
            .replace(/اذهب\s+إلى\s+/g, '')
            .replace(/اذهب\s+/g, '')
            .replace(/افتح\s+/g, '')
            .replace(/أظهر\s+/g, '')
            .replace(/انتقل\s+إلى\s+/g, '')
            .replace(/انتقل\s+/g, '')
            .replace(/اعرض\s+/g, '')
            .trim();

        console.log('Clean navigation command:', cleanCommand);

        if (cleanCommand.includes('home') || cleanCommand.includes('الرئيسية') || cleanCommand.includes('البداية')) {
            document.getElementById('home').scrollIntoView({ behavior: 'smooth' });
            this.speak(this.currentLanguage === 'ar' ? "الرئيسية" : "Home");

        } else if (cleanCommand.includes('about') || cleanCommand.includes('حول') || cleanCommand.includes('حولنا')) {
            document.getElementById('about').scrollIntoView({ behavior: 'smooth' });
            this.speak(this.currentLanguage === 'ar' ? "حولنا" : "About");

        } else if (cleanCommand.includes('service') || cleanCommand.includes('services') ||
                   cleanCommand.includes('خدمات') || cleanCommand.includes('خدمة')) {
            document.getElementById('service').scrollIntoView({ behavior: 'smooth' });
            this.speak(this.currentLanguage === 'ar' ? "الخدمات" : "Services");

        } else if (cleanCommand.includes('design') || cleanCommand.includes('تصميم') ||
                   cleanCommand.includes('تصاميم') || cleanCommand.includes('ديزاين')) {
            document.getElementById('design').scrollIntoView({ behavior: 'smooth' });
            this.speak(this.currentLanguage === 'ar' ? "التصميم" : "Design");

        } else if (cleanCommand.includes('contact') || cleanCommand.includes('اتصال') ||
                   cleanCommand.includes('تواصل') || cleanCommand.includes('التواصل')) {
            document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
            this.speak(this.currentLanguage === 'ar' ? "التواصل" : "Contact");

        } else if (cleanCommand.includes('chat') || cleanCommand.includes('ai') ||
                   cleanCommand.includes('محادثة') || cleanCommand.includes('شات')) {
            // فتح واجهة الدردشة
            const chatContainer = document.getElementById('aiChatContainer');
            if (chatContainer) {
                chatContainer.style.display = 'flex';
                chatContainer.classList.add('active');
            }
            this.speak(this.currentLanguage === 'ar' ? "الدردشة" : "Chat");

        } else if (cleanCommand.includes('search') || cleanCommand.includes('بحث')) {
            // التركيز على مربع البحث
            const searchInput = document.querySelector('.srch');
            if (searchInput) {
                searchInput.focus();
            }
            this.speak(this.currentLanguage === 'ar' ? "البحث" : "Search");

        } else {
            // إذا لم يتم التعرف على القسم
            this.speak(this.currentLanguage === 'ar'
                ? "أي قسم تريد؟ الرئيسية، حولنا، الخدمات، التصميم، أو التواصل؟"
                : "Which section? Home, About, Services, Design, or Contact?");
        }
    }

    handleInfoRequest(command) {
        if (command.includes('time') || command.includes('وقت')) {
            const time = new Date().toLocaleTimeString(this.currentLanguage === 'ar' ? 'ar-SA' : 'en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });
            this.speak(this.currentLanguage === 'ar' ? `الوقت ${time}` : `Time: ${time}`);
        } else if (command.includes('date') || command.includes('تاريخ')) {
            const date = new Date().toLocaleDateString(this.currentLanguage === 'ar' ? 'ar-SA' : 'en-US', {
                month: 'short',
                day: 'numeric'
            });
            this.speak(this.currentLanguage === 'ar' ? `التاريخ ${date}` : `Date: ${date}`);
        } else {
            // ردود متنوعة لتجنب التكرار
            const responses = this.currentLanguage === 'ar'
                ? ["ماذا تريد؟", "نعم؟", "أستمع", "تفضل"]
                : ["Yes?", "What do you need?", "I'm listening", "Go ahead"];

            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            this.speak(randomResponse);
        }
    }

    handleAuthRequest(command) {
        // فتح نموذج تسجيل الدخول
        const joinBtn = document.getElementById('joinBtn');
        if (joinBtn) {
            joinBtn.click();
        }
        this.speak(this.currentLanguage === 'ar'
            ? "تسجيل الدخول"
            : "Login");
    }

    handleGeneralQuery(command) {
        // ردود متنوعة لتجنب التكرار
        const responses = this.currentLanguage === 'ar'
            ? [
                "لم أفهم. جرب مرة أخرى",
                "ماذا تقصد؟",
                "لم أستطع فهم ذلك",
                "يمكنك إعادة الصياغة؟",
                "غير واضح. أعد المحاولة"
            ]
            : [
                "I didn't understand. Try again",
                "What do you mean?",
                "I couldn't understand that",
                "Can you rephrase?",
                "Not clear. Please try again"
            ];

        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        this.speak(randomResponse);
    }

    handleSpeechError(error) {
        console.error('Speech error:', error);
        if (error === 'not-allowed') {
            this.updateStatus(
                this.currentLanguage === 'ar'
                    ? "يرجى السماح بالوصول للميكروفون"
                    : "Please allow microphone access"
            );
        }
    }

    setupEventListeners() {
        // زر الإغلاق
        document.addEventListener('click', (e) => {
            if (e.target.closest('#naya-close')) {
                this.deactivateNaya();
            } else if (e.target.closest('#naya-settings')) {
                this.showVoiceSettings();
            }
        });

        // تغيير اللغة
        document.addEventListener('languageChanged', (e) => {
            this.currentLanguage = e.detail.language;
            if (this.recognition) {
                this.recognition.lang = this.currentLanguage === 'ar' ? 'ar-SA' : 'en-US';
            }
        });

        // زر اختبار مؤقت - يمكن حذفه لاحقاً
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F1') {
                console.log('F1 pressed - manually activating Naya');
                this.activateNaya();
            } else if (e.key === 'F2') {
                console.log('F2 pressed - restarting wake word detection');
                this.restartWakeWordDetection();
            }
        });

        // مراقبة حالة النظام وإعادة تشغيله عند الحاجة
        this.startSystemMonitoring();
    }

    restartWakeWordDetection() {
        console.log('Restarting wake word detection...');

        // إيقاف التعرف الحالي
        this.stopWakeWordDetection();

        // إعادة التشغيل بعد وقت قصير
        setTimeout(() => {
            this.startWakeWordDetection();
        }, 1500);
    }

    stopWakeWordDetection() {
        console.log('Stopping wake word detection...');
        this.isWakeWordListening = false;

        if (this.recognition) {
            try {
                this.recognition.stop();
                console.log('Speech recognition stopped');
            } catch (e) {
                console.log('Recognition was not running or already stopped');
            }
        }
    }

    startSystemMonitoring() {
        console.log('Starting system monitoring...');

        // فحص دوري كل 15 ثانية
        setInterval(() => {
            if (!this.isActive && !this.isWakeWordListening) {
                console.log('System monitoring: Wake word detection stopped, restarting...');
                this.startWakeWordDetection();
            }
        }, 15000);

        // فحص أكثر تفصيلاً كل 30 ثانية
        setInterval(() => {
            if (!this.isActive) {
                console.log('System monitoring: Checking system health...');
                this.checkSystemHealth();
            }
        }, 30000);
    }

    checkSystemHealth() {
        const healthStatus = {
            recognition: !!this.recognition,
            synthesis: !!this.synthesis,
            listening: this.isWakeWordListening,
            active: this.isActive,
            wakePhrases: this.wakePhrases.length > 0
        };

        console.log('System health check:', healthStatus);

        // إعادة تشغيل النظام إذا كان هناك مشاكل
        if (!healthStatus.recognition || !healthStatus.listening) {
            console.log('System health check failed, restarting...');
            this.restartWakeWordDetection();
        }
    }

    // دالة لإظهار إعدادات الصوت
    showVoiceSettings() {
        // إنشاء نافذة إعدادات الصوت
        const settingsModal = document.createElement('div');
        settingsModal.id = 'naya-voice-settings';
        settingsModal.className = 'naya-voice-settings-modal';

        const voices = this.getAvailableVoices();
        const currentVoice = this.selectedVoice || 'افتراضي';

        settingsModal.innerHTML = `
            <div class="naya-settings-overlay"></div>
            <div class="naya-settings-content">
                <div class="naya-settings-header">
                    <h3>${this.currentLanguage === 'ar' ? 'إعدادات صوت نايا' : 'Naya Voice Settings'}</h3>
                    <button class="naya-settings-close" id="close-voice-settings">
                        <ion-icon name="close-outline"></ion-icon>
                    </button>
                </div>
                <div class="naya-settings-body">
                    <div class="current-voice-info">
                        <p><strong>${this.currentLanguage === 'ar' ? 'الصوت الحالي:' : 'Current Voice:'}</strong> ${currentVoice}</p>
                    </div>
                    <div class="voice-list">
                        <h4>${this.currentLanguage === 'ar' ? 'اختر صوت جديد:' : 'Choose a new voice:'}</h4>
                        <div class="voice-options">
                            ${voices.map(voice => `
                                <div class="voice-option ${voice.name === this.selectedVoice ? 'selected' : ''}"
                                     data-voice="${voice.name}">
                                    <div class="voice-info">
                                        <span class="voice-name">${voice.name}</span>
                                        <span class="voice-lang">${voice.lang}</span>
                                        ${voice.isFemale ? '<span class="voice-gender">👩 أنثى</span>' : '<span class="voice-gender">👤</span>'}
                                    </div>
                                    <button class="test-voice-btn" data-voice="${voice.name}">
                                        ${this.currentLanguage === 'ar' ? 'اختبار' : 'Test'}
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div class="settings-actions">
                        <button class="naya-btn reset-voice" id="reset-voice">
                            ${this.currentLanguage === 'ar' ? 'إعادة تعيين للافتراضي' : 'Reset to Default'}
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(settingsModal);

        // إضافة مستمعي الأحداث
        this.setupVoiceSettingsEvents(settingsModal);

        // إظهار النافذة
        setTimeout(() => {
            settingsModal.classList.add('visible');
        }, 10);
    }

    setupVoiceSettingsEvents(modal) {
        // إغلاق النافذة
        modal.addEventListener('click', (e) => {
            if (e.target.closest('#close-voice-settings') || e.target.classList.contains('naya-settings-overlay')) {
                this.closeVoiceSettings(modal);
            }
        });

        // اختيار صوت
        modal.addEventListener('click', (e) => {
            if (e.target.closest('.voice-option') && !e.target.closest('.test-voice-btn')) {
                const voiceOption = e.target.closest('.voice-option');
                const voiceName = voiceOption.dataset.voice;

                // إزالة التحديد من جميع الخيارات
                modal.querySelectorAll('.voice-option').forEach(option => {
                    option.classList.remove('selected');
                });

                // تحديد الخيار الجديد
                voiceOption.classList.add('selected');

                // تغيير الصوت
                this.setVoice(voiceName);

                // تحديث معلومات الصوت الحالي
                const currentVoiceInfo = modal.querySelector('.current-voice-info p');
                currentVoiceInfo.innerHTML = `<strong>${this.currentLanguage === 'ar' ? 'الصوت الحالي:' : 'Current Voice:'}</strong> ${voiceName}`;
            }
        });

        // اختبار الصوت
        modal.addEventListener('click', (e) => {
            if (e.target.closest('.test-voice-btn')) {
                e.stopPropagation();
                const voiceName = e.target.closest('.test-voice-btn').dataset.voice;
                const voice = this.availableVoices.find(v => v.name === voiceName);

                if (voice) {
                    const testMessage = this.currentLanguage === 'ar'
                        ? `مرحباً، هذا اختبار للصوت ${voiceName}`
                        : `Hello, this is a test for voice ${voiceName}`;

                    // إنشاء utterance مؤقت للاختبار
                    const utterance = new SpeechSynthesisUtterance(testMessage);
                    utterance.voice = voice;
                    utterance.lang = this.currentLanguage === 'ar' ? 'ar-SA' : 'en-US';
                    utterance.rate = 0.9;
                    utterance.volume = 0.8;
                    utterance.pitch = 1.2;

                    this.synthesis.speak(utterance);
                }
            }
        });

        // إعادة تعيين للافتراضي
        modal.addEventListener('click', (e) => {
            if (e.target.closest('#reset-voice')) {
                this.selectedVoice = null;
                localStorage.removeItem('naya-selected-voice');

                // إزالة التحديد من جميع الخيارات
                modal.querySelectorAll('.voice-option').forEach(option => {
                    option.classList.remove('selected');
                });

                // تحديث معلومات الصوت الحالي
                const currentVoiceInfo = modal.querySelector('.current-voice-info p');
                currentVoiceInfo.innerHTML = `<strong>${this.currentLanguage === 'ar' ? 'الصوت الحالي:' : 'Current Voice:'}</strong> ${this.currentLanguage === 'ar' ? 'افتراضي (تلقائي)' : 'Default (Auto)'}`;

                // اختبار الصوت الافتراضي
                const testMessage = this.currentLanguage === 'ar'
                    ? 'تم إعادة تعيين الصوت للوضع الافتراضي'
                    : 'Voice has been reset to default mode';
                this.speak(testMessage);
            }
        });
    }

    closeVoiceSettings(modal) {
        modal.classList.remove('visible');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

// تهيئة Naya عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing Naya Assistant...');
    window.naya = new NayaAssistant();
    console.log('Naya Assistant initialized:', window.naya);
});
