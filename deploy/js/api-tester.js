document.addEventListener('DOMContentLoaded', function() {
    // تهيئة المتغيرات
    const requestMethod = document.getElementById('request-method');
    const requestUrl = document.getElementById('request-url');
    const sendRequestBtn = document.getElementById('send-request');
    const addParamBtn = document.getElementById('add-param');
    const addHeaderBtn = document.getElementById('add-header');
    const addFormDataBtn = document.getElementById('add-form-data');
    const paramsList = document.querySelector('.params-list');
    const headersList = document.querySelector('.headers-list');
    const formDataList = document.querySelector('.form-data-list');
    const jsonEditor = document.getElementById('json-editor');
    const bearerToken = document.getElementById('bearer-token');
    const responseBody = document.getElementById('response-body');
    const responseHeaders = document.getElementById('response-headers');
    const responseStatusCode = document.getElementById('response-status-code');
    const responseTime = document.getElementById('response-time');
    const tabs = document.querySelectorAll('.tab');
    const bodyTypeRadios = document.querySelectorAll('input[name="body-type"]');
    const authTypeRadios = document.querySelectorAll('input[name="auth-type"]');
    const endpoints = document.querySelectorAll('.endpoint');
    
    // تهيئة الموضوع
    initTheme();
    
    // إضافة مستمعي الأحداث
    sendRequestBtn.addEventListener('click', sendRequest);
    addParamBtn.addEventListener('click', addParam);
    addHeaderBtn.addEventListener('click', addHeader);
    addFormDataBtn.addEventListener('click', addFormData);
    
    // مستمعي أحداث التبويبات
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabGroup = this.parentElement;
            const tabContents = tabGroup.nextElementSibling.querySelectorAll('.tab-content');
            const tabId = this.getAttribute('data-tab');
            
            // إزالة الفئة النشطة من جميع التبويبات
            tabGroup.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            
            // إزالة الفئة النشطة من جميع محتويات التبويبات
            tabContents.forEach(content => content.classList.remove('active'));
            
            // إضافة الفئة النشطة إلى التبويب المحدد ومحتواه
            this.classList.add('active');
            document.getElementById(`${tabId}-content`).classList.add('active');
        });
    });
    
    // مستمعي أحداث نوع الجسم
    bodyTypeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            const bodyContainers = document.querySelectorAll('.body-content-container > div');
            
            // إخفاء جميع حاويات الجسم
            bodyContainers.forEach(container => container.classList.remove('active'));
            
            // إظهار الحاوية المحددة
            document.querySelector(`.body-${this.value}`).classList.add('active');
        });
    });
    
    // مستمعي أحداث نوع المصادقة
    authTypeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            const authContainers = document.querySelectorAll('.auth-content-container > div');
            
            // إخفاء جميع حاويات المصادقة
            authContainers.forEach(container => container.classList.remove('active'));
            
            // إظهار الحاوية المحددة
            document.querySelector(`.auth-${this.value}`).classList.add('active');
        });
    });
    
    // مستمعي أحداث نقاط النهاية
    endpoints.forEach(endpoint => {
        endpoint.addEventListener('click', function() {
            const method = this.getAttribute('data-method');
            const endpointPath = this.getAttribute('data-endpoint');
            
            // تعيين الطريقة وعنوان URL
            requestMethod.value = method;
            
            // استبدال عنوان URL مع الحفاظ على المضيف والمنفذ
            const urlParts = requestUrl.value.split('/api');
            requestUrl.value = `${urlParts[0]}${endpointPath}`;
            
            // تحديث نموذج الجسم بناءً على الطريقة
            if (method === 'GET' || method === 'DELETE') {
                document.querySelector('input[name="body-type"][value="none"]').checked = true;
                document.querySelector('.body-none').classList.add('active');
                document.querySelector('.body-form-data').classList.remove('active');
                document.querySelector('.body-json').classList.remove('active');
            } else {
                document.querySelector('input[name="body-type"][value="json"]').checked = true;
                document.querySelector('.body-none').classList.remove('active');
                document.querySelector('.body-form-data').classList.remove('active');
                document.querySelector('.body-json').classList.add('active');
                
                // تعيين نموذج JSON افتراضي بناءً على نقطة النهاية
                setDefaultJsonBody(endpointPath);
            }
        });
    });
    
    // دالة لإضافة معلمة
    function addParam() {
        const paramRow = document.createElement('div');
        paramRow.className = 'param-row';
        paramRow.innerHTML = `
            <input type="text" class="param-key" placeholder="المفتاح">
            <input type="text" class="param-value" placeholder="القيمة">
            <button class="remove-param">×</button>
        `;
        
        paramRow.querySelector('.remove-param').addEventListener('click', function() {
            paramRow.remove();
        });
        
        paramsList.appendChild(paramRow);
    }
    
    // دالة لإضافة رأس
    function addHeader() {
        const headerRow = document.createElement('div');
        headerRow.className = 'header-row';
        headerRow.innerHTML = `
            <input type="text" class="header-key" placeholder="المفتاح">
            <input type="text" class="header-value" placeholder="القيمة">
            <button class="remove-header">×</button>
        `;
        
        headerRow.querySelector('.remove-header').addEventListener('click', function() {
            headerRow.remove();
        });
        
        headersList.appendChild(headerRow);
    }
    
    // دالة لإضافة حقل بيانات النموذج
    function addFormData() {
        const formDataRow = document.createElement('div');
        formDataRow.className = 'form-data-row';
        formDataRow.innerHTML = `
            <input type="text" class="form-data-key" placeholder="المفتاح">
            <input type="text" class="form-data-value" placeholder="القيمة">
            <button class="remove-form-data">×</button>
        `;
        
        formDataRow.querySelector('.remove-form-data').addEventListener('click', function() {
            formDataRow.remove();
        });
        
        formDataList.appendChild(formDataRow);
    }
    
    // دالة لإرسال الطلب
    async function sendRequest() {
        try {
            // إعداد عنوان URL مع المعلمات
            let url = requestUrl.value;
            const params = getParams();
            
            if (Object.keys(params).length > 0) {
                const urlObj = new URL(url);
                Object.keys(params).forEach(key => {
                    urlObj.searchParams.append(key, params[key]);
                });
                url = urlObj.toString();
            }
            
            // إعداد خيارات الطلب
            const options = {
                method: requestMethod.value,
                headers: getHeaders()
            };
            
            // إضافة الجسم إذا لم تكن الطريقة GET أو DELETE
            if (requestMethod.value !== 'GET' && requestMethod.value !== 'DELETE') {
                const bodyType = document.querySelector('input[name="body-type"]:checked').value;
                
                if (bodyType === 'json') {
                    options.headers['Content-Type'] = 'application/json';
                    try {
                        options.body = jsonEditor.value.trim() ? JSON.stringify(JSON.parse(jsonEditor.value)) : '';
                    } catch (e) {
                        alert('خطأ في تنسيق JSON: ' + e.message);
                        return;
                    }
                } else if (bodyType === 'form-data') {
                    const formData = new FormData();
                    document.querySelectorAll('.form-data-row').forEach(row => {
                        const key = row.querySelector('.form-data-key').value;
                        const value = row.querySelector('.form-data-value').value;
                        if (key) {
                            formData.append(key, value);
                        }
                    });
                    options.body = formData;
                    // حذف رأس Content-Type ليتم تعيينه تلقائيًا مع الحدود
                    delete options.headers['Content-Type'];
                }
            }
            
            // إضافة المصادقة
            const authType = document.querySelector('input[name="auth-type"]:checked').value;
            if (authType === 'bearer' && bearerToken.value) {
                options.headers['Authorization'] = `Bearer ${bearerToken.value}`;
            }
            
            // تحديث واجهة المستخدم
            responseBody.textContent = 'جاري إرسال الطلب...';
            responseHeaders.textContent = '';
            responseStatusCode.textContent = '---';
            responseStatusCode.className = '';
            responseTime.textContent = '--- ms';
            
            // قياس وقت الطلب
            const startTime = performance.now();
            
            // إرسال الطلب
            const response = await fetch(url, options);
            
            // حساب وقت الاستجابة
            const endTime = performance.now();
            const duration = Math.round(endTime - startTime);
            
            // تحديث حالة الاستجابة
            responseStatusCode.textContent = response.status;
            responseStatusCode.className = response.ok ? 'success' : 'error';
            responseTime.textContent = `${duration} ms`;
            
            // تحديث رؤوس الاستجابة
            const headersObj = {};
            response.headers.forEach((value, key) => {
                headersObj[key] = value;
            });
            responseHeaders.textContent = JSON.stringify(headersObj, null, 2);
            
            // تحديث جسم الاستجابة
            try {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const data = await response.json();
                    responseBody.textContent = JSON.stringify(data, null, 2);
                } else {
                    const text = await response.text();
                    responseBody.textContent = text;
                }
            } catch (e) {
                responseBody.textContent = 'خطأ في قراءة الاستجابة: ' + e.message;
            }
            
            // التبديل إلى تبويب الاستجابة
            document.querySelector('.response-tabs .tab[data-tab="response-body"]').click();
        } catch (error) {
            responseBody.textContent = 'خطأ في الطلب: ' + error.message;
            responseStatusCode.textContent = 'ERROR';
            responseStatusCode.className = 'error';
        }
    }
    
    // دالة للحصول على المعلمات
    function getParams() {
        const params = {};
        document.querySelectorAll('.param-row').forEach(row => {
            const key = row.querySelector('.param-key').value;
            const value = row.querySelector('.param-value').value;
            if (key) {
                params[key] = value;
            }
        });
        return params;
    }
    
    // دالة للحصول على الرؤوس
    function getHeaders() {
        const headers = {};
        document.querySelectorAll('.header-row').forEach(row => {
            const key = row.querySelector('.header-key').value;
            const value = row.querySelector('.header-value').value;
            if (key) {
                headers[key] = value;
            }
        });
        return headers;
    }
    
    // دالة لتعيين نموذج JSON افتراضي
    function setDefaultJsonBody(endpoint) {
        let defaultBody = {};
        
        if (endpoint.includes('/auth/login')) {
            defaultBody = {
                email: 'user@example.com',
                password: 'password123'
            };
        } else if (endpoint.includes('/auth/register')) {
            defaultBody = {
                name: 'Test User',
                email: 'user@example.com',
                password: 'password123'
            };
        } else if (endpoint.includes('/projects') && !endpoint.includes('/:id')) {
            defaultBody = {
                name: 'مشروع طاقة شمسية',
                type: 'solar',
                location: 'عمان، الأردن',
                capacity: 100,
                status: 'planning',
                notes: 'ملاحظات حول المشروع'
            };
        } else if (endpoint.includes('/chat') && !endpoint.includes('/:id')) {
            defaultBody = {
                title: 'محادثة جديدة'
            };
        } else if (endpoint.includes('/chat/:id/message')) {
            defaultBody = {
                message: 'مرحبا، كيف يمكنني حساب تكلفة مشروع طاقة شمسية؟'
            };
        } else if (endpoint.includes('/calculations/cost')) {
            defaultBody = {
                projectType: 'solar',
                capacity: 100,
                location: 'sunny'
            };
        }
        
        jsonEditor.value = JSON.stringify(defaultBody, null, 2);
    }
    
    // دالة لتهيئة الموضوع
    function initTheme() {
        const toggleSwitch = document.querySelector('#checkbox');
        
        // تبديل الموضوع عند تغيير الزر
        if (toggleSwitch) {
            toggleSwitch.addEventListener('change', switchTheme);
            
            // التحقق من الإعدادات المحفوظة
            const currentTheme = localStorage.getItem('theme');
            if (currentTheme) {
                document.documentElement.setAttribute('data-theme', currentTheme);
                
                if (currentTheme === 'light') {
                    toggleSwitch.checked = true;
                }
            }
        }
    }
    
    // دالة لتبديل الموضوع
    function switchTheme(e) {
        if (e.target.checked) {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        }
    }
    
    // إضافة مستمعي أحداث لأزرار الحذف الموجودة
    document.querySelectorAll('.remove-param').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.param-row').remove();
        });
    });
    
    document.querySelectorAll('.remove-header').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.header-row').remove();
        });
    });
    
    document.querySelectorAll('.remove-form-data').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.form-data-row').remove();
        });
    });
});
