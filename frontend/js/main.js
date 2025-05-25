/**
 * ملف JavaScript الرئيسي للموقع
 */

// تكوين API
const API_CONFIG = {
    BASE_URL: "http://localhost:3000/api",
    ENDPOINTS: {
        CHAT: "/chat",
        AUTH: {
            LOGIN: "/auth/login",
            REGISTER: "/auth/register",
            ME: "/auth/me"
        },
        PROJECTS: "/projects",
        CONTACT: "/contact"
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

    // تهيئة نموذج تسجيل الدخول
    initLoginForm();

    // تهيئة واجهة الدردشة
    initChatInterface();

    // تهيئة نموذج الاتصال
    initContactForm();

    // تحقق من حالة تسجيل الدخول
    checkLoginStatus();

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
 * تهيئة نموذج تسجيل الدخول
 */
function initLoginForm() {
    const joinBtn = document.getElementById('joinBtn');
    const loginForm = document.getElementById('loginForm');
    const signupLink = document.getElementById('signupLink');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginButton = document.querySelector('.btnn');

    // إخفاء نموذج تسجيل الدخول في البداية
    if (loginForm) {
        loginForm.style.display = 'none';

        // إظهار نموذج تسجيل الدخول عند النقر على زر الانضمام
        if (joinBtn) {
            joinBtn.addEventListener('click', function(e) {
                e.preventDefault();
                toggleLoginForm();
            });
        }

        // التبديل إلى نموذج التسجيل
        if (signupLink) {
            signupLink.addEventListener('click', function(e) {
                e.preventDefault();
                showSignupForm();
            });
        }

        // معالجة تسجيل الدخول
        if (loginButton) {
            loginButton.addEventListener('click', function(e) {
                e.preventDefault();
                handleLogin(emailInput, passwordInput, loginForm);
            });
        }
    }
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

// =====================
// وظائف واجهة المستخدم
// =====================

/**
 * إظهار/إخفاء نموذج تسجيل الدخول
 */
function toggleLoginForm() {
    const loginForm = document.getElementById('loginForm');

    if (loginForm.style.display === 'none') {
        loginForm.style.display = 'block';
        setTimeout(() => {
            loginForm.classList.add('visible');
        }, 10);
    } else {
        loginForm.classList.remove('visible');
        setTimeout(() => {
            loginForm.style.display = 'none';
        }, 300);
    }
}

/**
 * إظهار نموذج التسجيل
 */
function showSignupForm() {
    // يمكن تنفيذ هذا لاحقًا
    alert('سيتم تنفيذ نموذج التسجيل قريبًا');
}

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
    // التحقق من وجود رمز المصادقة في التخزين المحلي
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');

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
    const joinBtn = document.getElementById('joinBtn');
    if (joinBtn && currentUser) {
        joinBtn.textContent = `مرحباً ${currentUser.name}`;
        joinBtn.removeEventListener('click', toggleLoginForm);
        joinBtn.addEventListener('click', showUserMenu);
    }
}

/**
 * إظهار قائمة المستخدم
 */
function showUserMenu() {
    // يمكن تنفيذ هذا لاحقًا
    alert('سيتم تنفيذ قائمة المستخدم قريبًا');
}

/**
 * تسجيل الخروج
 */
function logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    currentUser = null;

    // إعادة تحميل الصفحة أو تحديث واجهة المستخدم
    window.location.reload();
}

/**
 * معالجة تسجيل الدخول
 */
function handleLogin(emailInput, passwordInput, loginForm) {
    let isValid = true;

    if (!emailInput.value || !emailInput.validity.valid) {
        emailInput.classList.add('error');
        isValid = false;
    } else {
        emailInput.classList.remove('error');
    }

    if (!passwordInput.value) {
        passwordInput.classList.add('error');
        isValid = false;
    } else {
        passwordInput.classList.remove('error');
    }

    if (isValid) {
        // إظهار رسالة "جاري تسجيل الدخول..."
        const loadingMessage = document.createElement('div');
        loadingMessage.classList.add('loading-message');
        loadingMessage.textContent = 'جاري تسجيل الدخول...';
        loginForm.appendChild(loadingMessage);

        // استدعاء API لتسجيل الدخول
        loginUser(emailInput.value, passwordInput.value)
            .then(result => {
                loadingMessage.remove();

                if (result.status === 'success') {
                    // حفظ بيانات المستخدم
                    if (result.data && result.data.user && result.data.token) {
                        localStorage.setItem('auth_token', result.data.token);
                        localStorage.setItem('user_data', JSON.stringify(result.data.user));
                        currentUser = result.data.user;
                    }

                    // إظهار رسالة النجاح
                    const message = document.createElement('div');
                    message.classList.add('success-message');
                    message.textContent = 'تم تسجيل الدخول بنجاح!';
                    loginForm.appendChild(message);

                    setTimeout(() => {
                        loginForm.classList.remove('visible');
                        setTimeout(() => {
                            loginForm.style.display = 'none';
                            message.remove();
                            updateUIForLoggedInUser();
                        }, 300);
                    }, 2000);
                } else {
                    // إظهار رسالة الخطأ
                    const errorMessage = document.createElement('div');
                    errorMessage.classList.add('error-message');
                    errorMessage.textContent = result.message || 'فشل في تسجيل الدخول';
                    loginForm.appendChild(errorMessage);

                    setTimeout(() => {
                        errorMessage.remove();
                    }, 3000);
                }
            });
    }
}

/**
 * إرسال طلب تسجيل الدخول إلى API
 */
function loginUser(email, password) {
    return fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.LOGIN}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    })
    .then(response => response.json())
    .catch(error => {
        console.error('Error logging in:', error);
        return { status: 'error', message: 'فشل في تسجيل الدخول' };
    });
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
            message: message
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
            const botResponse = data.choices?.[0]?.message?.content || data.message || "لا يوجد رد من الذكاء الاصطناعي.";
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
    return fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CHAT}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('auth_token') ? `Bearer ${localStorage.getItem('auth_token')}` : ''
        },
        body: JSON.stringify({
            title: 'محادثة جديدة'
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
