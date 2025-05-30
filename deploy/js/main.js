/**
 * ملف JavaScript الرئيسي للموقع
 */

// تكوين API - Backend حقيقي مع Groq AI
const API_CONFIG = {
    // Backend مع Groq AI (Llama 3.1)
    BASE_URL: window.location.hostname === 'localhost'
        ? "http://localhost:5000/api"
        : "https://energy-ai-backend-gemini-i30n5wt6k-mohammad-basims-projects.vercel.app/api",
    ENDPOINTS: {
        CHAT: "/chat",
        LOGIN: "/auth/login",
        REGISTER: "/auth/register",
        CONTACT: "/contact",
        SAVE_CONVERSATION: "/chat",
        GET_CONVERSATIONS: "/chat",
        GET_USER: "/auth/me",
        PROJECTS: "/projects"
    }
};

// متغيرات عامة
let currentUser = null;
let chatHistory = [];
let isDarkMode = true;

// =====================
// وظائف التحميل الأولي
// =====================

document.addEventListener('DOMContentLoaded', function() {
    // تهيئة الموضوع
    initTheme();

    // تهيئة التمرير السلس
    initSmoothScrolling();

    // تهيئة زر تسجيل الدخول/لوحة التحكم
    initLoginButton();

    // تهيئة واجهة الدردشة
    initChatInterface();

    // تهيئة نموذج الاتصال
    initContactForm();

    // تحقق من حالة تسجيل الدخول
    checkLoginStatus();

    // تهيئة الأنظمة الجديدة
    initializeWebsite();

    // تهيئة نظام اللغة (سيتم تحميله من language-system.js)
    initLanguageSupport();

    // تهيئة نظام المصادقة
    initAuthSystem();

    // إضافة مستمع لأحداث التاريخ (زر العودة في المتصفح)
    window.addEventListener('popstate', function(e) {
        // الحصول على الهاش الحالي من URL
        const hash = window.location.hash;

        if (hash) {
            // التمرير إلى العنصر المطلوب
            const targetElement = document.querySelector(hash);
            if (targetElement) {
                // حساب الموضع مع مراعاة ارتفاع القائمة
                const headerOffset = 75;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                // التمرير إلى الهدف بسلاسة
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });

                // تحديث الروابط النشطة في القائمة
                updateActiveNavLinks(hash);
            }
        } else {
            // التمرير إلى أعلى الصفحة إذا لم يكن هناك هاش
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });

            // إزالة التنشيط من جميع الروابط
            document.querySelectorAll('.menu a').forEach(link => {
                link.classList.remove('active');
            });
        }
    });
});

// =====================
// وظائف التهيئة
// =====================

/**
 * تهيئة إعدادات الموضوع (داكن/فاتح)
 */
function initTheme() {
    const toggleSwitch = document.querySelector('#checkbox');

    // تبديل الموضوع عند تغيير الزر
    if (toggleSwitch) {
        toggleSwitch.addEventListener('change', switchTheme);

        // التحقق من الإعدادات المحفوظة
        const currentTheme = localStorage.getItem('theme');
        if (currentTheme) {
            document.documentElement.setAttribute('data-theme', currentTheme);
            isDarkMode = currentTheme === 'dark';

            if (currentTheme === 'light') {
                toggleSwitch.checked = true;
            }
        }
    }
}

/**
 * تبديل الموضوع بين الداكن والفاتح
 */
function switchTheme(e) {
    if (e.target.checked) {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
        isDarkMode = false;
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        isDarkMode = true;
    }
}

/**
 * تهيئة التمرير السلس للروابط
 */
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        // تجاهل روابط SERVICE لأنها تتم معالجتها في وظيفة initChatInterface
        if (anchor.id === 'serviceLink' || anchor.id === 'footerServiceLink') {
            return;
        }

        anchor.addEventListener('click', function(e) {
            if (this.getAttribute('href') !== '#') {
                e.preventDefault();

                // الحصول على الهدف
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);

                if (targetElement) {
                    // حساب الموضع مع مراعاة ارتفاع القائمة
                    const headerOffset = 75;
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    // التمرير إلى الهدف بسلاسة
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });

                    // إضافة تاريخ URL لدعم زر العودة
                    history.pushState(null, null, targetId);

                    // تحديث الروابط النشطة في القائمة
                    updateActiveNavLinks(targetId);
                }
            }
        });
    });

    // تحديث الروابط النشطة عند التمرير
    window.addEventListener('scroll', function() {
        highlightNavOnScroll();
    });
}

/**
 * تحديث الروابط النشطة في القائمة
 */
function updateActiveNavLinks(targetId) {
    // إزالة الفئة النشطة من جميع الروابط
    document.querySelectorAll('.menu a').forEach(link => {
        link.classList.remove('active');
    });

    // إضافة الفئة النشطة إلى الرابط المطابق
    const activeLink = document.querySelector(`.menu a[href="${targetId}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

/**
 * تمييز الروابط في القائمة عند التمرير
 */
function highlightNavOnScroll() {
    // الحصول على جميع الأقسام
    const sections = document.querySelectorAll('.section, #home');

    // الحصول على موضع التمرير الحالي
    const scrollPosition = window.scrollY + 100; // إضافة هامش للتمرير

    // التحقق من القسم الحالي
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            updateActiveNavLinks(`#${sectionId}`);
        }
    });
}

/**
 * تهيئة زر تسجيل الدخول/لوحة التحكم
 */
function initLoginButton() {
    // نظام التسجيل الحديث سيتولى هذا الأمر
    // لا حاجة لإضافة مستمعات إضافية هنا
    console.log('Login button initialized - handled by auth system');
}

/**
 * تهيئة واجهة الدردشة
 */
function initChatInterface() {
    const serviceLink = document.getElementById('serviceLink');
    const footerServiceLink = document.getElementById('footerServiceLink');
    const aiChatContainer = document.getElementById('aiChatContainer');
    const minimizeChatBtn = document.getElementById('minimizeChatBtn');
    const closeChatBtn = document.getElementById('closeChatBtn');
    const userInput = document.getElementById('userInput');
    const sendMessageBtn = document.getElementById('sendMessageBtn');
    const sendAttachmentBtn = document.getElementById('sendAttachmentBtn');
    const suggestedQuestions = document.querySelectorAll('.question-btn');

    // إخفاء الدردشة ومؤشر الكتابة في البداية
    if (aiChatContainer) {
        aiChatContainer.style.display = 'none';
        document.getElementById('typingIndicator').style.display = 'none';
        let isMinimized = false;

        // إظهار الدردشة عند النقر على SERVICE
        if (serviceLink) {
            serviceLink.addEventListener('click', function(e) {
                e.preventDefault();

                // التمرير إلى قسم الخدمة
                const targetElement = document.querySelector('#service');
                if (targetElement) {
                    const headerOffset = 75;
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });

                    // إضافة تاريخ URL لدعم زر العودة
                    history.pushState(null, null, '#service');

                    // تحديث الروابط النشطة في القائمة
                    updateActiveNavLinks('#service');
                }

                // إظهار واجهة الدردشة
                showChat(aiChatContainer, isMinimized);
            });
        }

        if (footerServiceLink) {
            footerServiceLink.addEventListener('click', function(e) {
                e.preventDefault();

                // التمرير إلى قسم الخدمة
                const targetElement = document.querySelector('#service');
                if (targetElement) {
                    const headerOffset = 75;
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });

                    // إضافة تاريخ URL لدعم زر العودة
                    history.pushState(null, null, '#service');

                    // تحديث الروابط النشطة في القائمة
                    updateActiveNavLinks('#service');
                }

                // إظهار واجهة الدردشة
                showChat(aiChatContainer, isMinimized);
            });
        }

        // تصغير الدردشة عند النقر على زر التصغير
        if (minimizeChatBtn) {
            minimizeChatBtn.addEventListener('click', function() {
                isMinimized = !isMinimized;
                toggleChatMinimize(aiChatContainer, isMinimized, minimizeChatBtn);
            });
        }

        // إغلاق الدردشة عند النقر على زر الإغلاق
        if (closeChatBtn) {
            closeChatBtn.addEventListener('click', function() {
                closeChat(aiChatContainer);
                isMinimized = false;
                if (minimizeChatBtn) minimizeChatBtn.textContent = '-';
            });
        }

        // معالجة الأسئلة المقترحة
        suggestedQuestions.forEach(btn => {
            btn.addEventListener('click', function() {
                if (userInput) {
                    userInput.value = this.textContent;
                    sendChatMessage();
                }
            });
        });

        // معالجة إرفاق الملفات
        if (sendAttachmentBtn) {
            sendAttachmentBtn.addEventListener('click', handleFileAttachment);
        }

        // إرسال الرسالة عند النقر على زر الإرسال أو Enter
        if (sendMessageBtn) {
            sendMessageBtn.addEventListener('click', sendChatMessage);
        }

        if (userInput) {
            userInput.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') sendChatMessage();
            });
        }
    }
}

/**
 * تهيئة نموذج الاتصال
 */
function initContactForm() {
    const contactSubmitBtn = document.getElementById('contactSubmitBtn');
    const contactFormStatus = document.getElementById('contactFormStatus');

    if (contactSubmitBtn && contactFormStatus) {
        contactSubmitBtn.addEventListener('click', function(e) {
            e.preventDefault();
            handleContactFormSubmission(contactFormStatus);
        });
    }
}

/**
 * تهيئة دعم نظام اللغة
 */
function initLanguageSupport() {
    // التأكد من أن نظام اللغة محمل
    if (typeof window.languageSystem !== 'undefined') {
        console.log('Language system loaded successfully');

        // الاستماع لأحداث تغيير اللغة
        document.addEventListener('languageChanged', function(e) {
            const newLanguage = e.detail.language;
            console.log('Language changed to:', newLanguage);

            // تحديث placeholder للبحث
            updateSearchPlaceholder(newLanguage);

            // تحديث placeholder للدردشة
            updateChatPlaceholder(newLanguage);
        });
    } else {
        console.log('Language system not loaded yet, will retry...');
        // إعادة المحاولة بعد فترة قصيرة
        setTimeout(initLanguageSupport, 100);
    }
}

/**
 * تحديث placeholder لحقل البحث
 */
function updateSearchPlaceholder(language) {
    const searchInput = document.querySelector('.srch');
    if (searchInput && window.languageSystem) {
        const placeholder = language === 'ar' ? 'اكتب للبحث' : 'Type to search';
        searchInput.placeholder = placeholder;
    }
}

/**
 * تحديث placeholder لحقل الدردشة
 */
function updateChatPlaceholder(language) {
    const chatInput = document.getElementById('userInput');
    if (chatInput && window.languageSystem) {
        const placeholder = language === 'ar' ? 'اكتب رسالتك هنا...' : 'Type your message here...';
        chatInput.placeholder = placeholder;
    }
}

/**
 * تهيئة نظام المصادقة
 */
function initAuthSystem() {
    // التأكد من أن نظام المصادقة محمل
    if (typeof window.authSystem !== 'undefined') {
        console.log('Auth system loaded successfully');

        // ربط زر Join Us بنظام المصادقة
        const joinBtn = document.getElementById('joinBtn');
        if (joinBtn) {
            joinBtn.addEventListener('click', function() {
                if (window.authSystem.isLoggedIn) {
                    // إذا كان مسجل دخول، إظهار لوحة التحكم
                    window.authSystem.showDashboard();
                } else {
                    // إذا لم يكن مسجل دخول، إظهار نافذة تسجيل الدخول
                    window.authSystem.showAuthModal();
                }
            });
        }

        // الاستماع لأحداث تغيير حالة المصادقة
        document.addEventListener('authStateChanged', function(e) {
            updateJoinButton(e.detail.isLoggedIn, e.detail.user);
        });

        // تحديث الزر بناءً على الحالة الحالية
        if (window.authSystem.isLoggedIn) {
            updateJoinButton(true, window.authSystem.currentUser);
        }

    } else {
        console.log('Auth system not loaded yet, will retry...');
        // إعادة المحاولة بعد فترة قصيرة
        setTimeout(initAuthSystem, 100);
    }
}

/**
 * تحديث زر Join Us
 */
function updateJoinButton(isLoggedIn, user) {
    const joinBtn = document.getElementById('joinBtn');
    if (joinBtn && window.languageSystem) {
        const currentLang = window.languageSystem.getCurrentLanguage();

        if (isLoggedIn && user) {
            // إظهار اسم المستخدم أو "Dashboard"
            const displayName = user.name || (currentLang === 'ar' ? 'لوحة التحكم' : 'Dashboard');
            joinBtn.textContent = displayName;
            joinBtn.title = currentLang === 'ar' ? 'انقر لفتح لوحة التحكم' : 'Click to open dashboard';
        } else {
            // إظهار "Join Us"
            joinBtn.textContent = currentLang === 'ar' ? 'انضم إلينا' : 'Join Us';
            joinBtn.title = currentLang === 'ar' ? 'انقر للانضمام أو تسجيل الدخول' : 'Click to join or login';
        }
    }
}

// =====================
// وظائف واجهة المستخدم
// =====================



/**
 * إظهار واجهة الدردشة
 */
function showChat(chatContainer, isMinimized) {
    chatContainer.style.display = 'flex';
    setTimeout(() => {
        chatContainer.classList.add('visible');
        if (isMinimized) {
            chatContainer.classList.add('minimized');
        } else {
            chatContainer.classList.remove('minimized');
        }
    }, 10);
}

/**
 * تبديل حالة تصغير الدردشة
 */
function toggleChatMinimize(chatContainer, isMinimized, minimizeBtn) {
    if (isMinimized) {
        chatContainer.classList.add('minimized');
        minimizeBtn.textContent = '+';
    } else {
        chatContainer.classList.remove('minimized');
        minimizeBtn.textContent = '-';
    }
}

/**
 * إغلاق واجهة الدردشة
 */
function closeChat(chatContainer) {
    chatContainer.classList.remove('visible');
    setTimeout(() => {
        chatContainer.style.display = 'none';
        chatContainer.classList.remove('minimized');
    }, 300);
}

// =====================
// وظائف التفاعل مع API
// =====================

/**
 * التحقق من حالة تسجيل الدخول
 */
function checkLoginStatus() {
    // نظام التسجيل الحديث سيتولى هذا الأمر
    // التحقق من وجود رمز المصادقة في التخزين المحلي
    const token = localStorage.getItem('auth-token');
    const userData = localStorage.getItem('auth-user');

    if (token && userData) {
        try {
            currentUser = JSON.parse(userData);
            updateUIForLoggedInUser();
        } catch (e) {
            console.error('Error parsing user data:', e);
            logout();
        }
    }
}

/**
 * تحديث واجهة المستخدم بعد تسجيل الدخول
 */
function updateUIForLoggedInUser() {
    // نظام التسجيل الحديث سيتولى تحديث واجهة المستخدم
    // لا حاجة لتحديث الزر هنا
    console.log('UI updated for logged in user - handled by auth system');
}



/**
 * تسجيل الخروج
 */
function logout() {
    localStorage.removeItem('auth-token');
    localStorage.removeItem('auth-user');
    currentUser = null;

    // إعادة تحميل الصفحة أو تحديث واجهة المستخدم
    window.location.reload();
}



/**
 * معالجة إرسال نموذج الاتصال
 */
function handleContactFormSubmission(statusElement) {
    const nameInput = document.getElementById('contact-name');
    const emailInput = document.getElementById('contact-email');
    const messageInput = document.getElementById('contact-message');

    // التحقق من صحة البيانات
    if (!nameInput.value || !emailInput.value || !messageInput.value) {
        statusElement.textContent = 'يرجى ملء جميع الحقول المطلوبة';
        statusElement.className = 'form-status error';
        return;
    }

    // إظهار رسالة "جاري الإرسال..."
    statusElement.textContent = 'جاري إرسال الرسالة...';
    statusElement.className = 'form-status loading';

    // إرسال البيانات إلى API
    fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CONTACT}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: nameInput.value,
            email: emailInput.value,
            message: messageInput.value
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            // إظهار رسالة النجاح
            statusElement.textContent = 'تم إرسال رسالتك بنجاح!';
            statusElement.className = 'form-status success';

            // مسح حقول النموذج
            nameInput.value = '';
            emailInput.value = '';
            messageInput.value = '';
        } else {
            // إظهار رسالة الخطأ
            statusElement.textContent = data.message || 'حدث خطأ أثناء إرسال الرسالة';
            statusElement.className = 'form-status error';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        statusElement.textContent = 'حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.';
        statusElement.className = 'form-status error';
    });
}

/**
 * معالجة إرفاق الملفات في الدردشة
 */
function handleFileAttachment() {
    // إنشاء عنصر إدخال ملف
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*,.pdf,.doc,.docx';

    fileInput.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            const fileName = this.files[0].name;
            addChatMessage(`ملف مرفق: ${fileName}`, 'user');

            // محاكاة تحميل الملف والرد
            showTypingIndicator();
            setTimeout(() => {
                hideTypingIndicator();
                addChatMessage('تم استلام الملف بنجاح! سأقوم بتحليل محتواه والرد قريباً.', 'bot');
            }, 1500);
        }
    });

    fileInput.click();
}

/**
 * إرسال رسالة دردشة
 */
function sendChatMessage() {
    const userInput = document.getElementById('userInput');
    const message = userInput.value.trim();
    if (!message) return;

    // إضافة رسالة المستخدم إلى واجهة المستخدم
    addChatMessage(message, 'user');
    userInput.value = '';

    // إضافة رسالة المستخدم إلى سجل المحادثة
    chatHistory.push({ role: 'user', content: message });

    // إظهار مؤشر الكتابة
    showTypingIndicator();

    // إرسال الرسالة إلى API
    sendMessageToAPI(message)
        .then(botReply => {
            hideTypingIndicator();

            // إضافة رد الذكاء الاصطناعي إلى واجهة المستخدم
            addChatMessage(botReply, 'bot');

            // إضافة رد الذكاء الاصطناعي إلى سجل المحادثة
            chatHistory.push({ role: 'bot', content: botReply });

            // حفظ المحادثة إذا كان المستخدم مسجل الدخول
            if (currentUser) {
                saveConversation(currentUser.id, chatHistory)
                    .then(result => {
                        if (result.status === 'success') {
                            console.log('تم حفظ المحادثة بنجاح');
                        }
                    });
            }
        })
        .catch(error => {
            hideTypingIndicator();
            addChatMessage("عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.", 'bot');
        });
}

/**
 * إرسال رسالة إلى API
 */
function sendMessageToAPI(message) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            messages: [
                {
                    role: 'user',
                    content: message
                }
            ],
            model: 'gpt-4o',
            max_tokens: 150,
            temperature: 0.7
        });

        fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CHAT}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('auth_token') ? `Bearer ${localStorage.getItem('auth_token')}` : ''
            },
            body: data
        })
        .then(response => response.json())
        .then(data => {
            const botResponse = data.choices?.[0]?.message?.content || "لا يوجد رد من الذكاء الاصطناعي.";
            resolve(botResponse);
        })
        .catch(error => {
            console.error('Error:', error);
            reject(error);
        });
    });
}

/**
 * حفظ المحادثة إلى API
 */
function saveConversation(userId, messages) {
    return fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SAVE_CONVERSATION}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('auth_token') ? `Bearer ${localStorage.getItem('auth_token')}` : ''
        },
        body: JSON.stringify({
            userId: userId,
            messages: messages
        })
    })
    .then(response => response.json())
    .catch(error => {
        console.error('Error saving conversation:', error);
        return { status: 'error', message: 'فشل في حفظ المحادثة' };
    });
}

/**
 * إضافة رسالة في واجهة الدردشة
 */
function addChatMessage(text, sender = 'user') {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = 'message ' + sender;

    if (sender === 'bot') {
        const avatar = document.createElement('div');
        avatar.className = 'avatar';
        const icon = document.createElement('ion-icon');
        icon.setAttribute('name', 'analytics-outline');
        avatar.appendChild(icon);
        messageDiv.appendChild(avatar);
    }

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = text;
    messageDiv.appendChild(contentDiv);

    // إضافة الطابع الزمني
    const timestamp = document.createElement('div');
    timestamp.className = 'timestamp';
    const now = new Date();
    timestamp.textContent = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
    contentDiv.appendChild(timestamp);

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

/**
 * إظهار مؤشر الكتابة
 */
function showTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.style.display = 'flex';
    }
}

/**
 * إخفاء مؤشر الكتابة
 */
function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.style.display = 'none';
    }
}

// =====================
// وظائف إضافية
// =====================

/**
 * وظائف مساعدة إضافية
 */
function initializeWebsite() {
    console.log('Website initialized with new systems:');
    console.log('- Language System: Ready');
    console.log('- Auth System: Ready');
    console.log('- Naya Assistant: Ready');
}