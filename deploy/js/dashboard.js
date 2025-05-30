document.addEventListener('DOMContentLoaded', function() {
    // تهيئة المتغيرات
    const sidebar = document.querySelector('.sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    const contentSections = document.querySelectorAll('.content-section');
    const dashboardSection = document.getElementById('dashboard');
    const themeSwitch = document.getElementById('dashboard-checkbox');
    const logoutBtn = document.getElementById('logout-btn');
    const newProjectBtn = document.getElementById('new-project-btn');
    const newProjectModal = document.getElementById('new-project-modal');
    const closeModalBtn = document.querySelector('.close-modal-btn');
    const cancelProjectBtn = document.getElementById('cancel-project-btn');
    const newProjectForm = document.getElementById('new-project-form');
    const currentDateElement = document.getElementById('current-date');
    
    // تعيين التاريخ الحالي
    setCurrentDate();
    
    // تحميل بيانات المستخدم
    loadUserData();
    
    // تحميل المشاريع الحديثة
    loadRecentProjects();
    
    // تحميل توصيات الذكاء الاصطناعي
    loadAIInsights();
    
    // تهيئة الرسوم البيانية
    initCharts();
    
    // إضافة مستمعي الأحداث
    sidebarToggle.addEventListener('click', toggleSidebar);
    themeSwitch.addEventListener('change', toggleTheme);
    logoutBtn.addEventListener('click', handleLogout);
    
    // مستمعي أحداث التنقل
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            navigateTo(targetId);
        });
    });
    
    // مستمعي أحداث النافذة المنبثقة
    if (newProjectBtn) {
        newProjectBtn.addEventListener('click', openNewProjectModal);
    }
    
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeNewProjectModal);
    }
    
    if (cancelProjectBtn) {
        cancelProjectBtn.addEventListener('click', closeNewProjectModal);
    }
    
    if (newProjectForm) {
        newProjectForm.addEventListener('submit', handleNewProject);
    }
    
    // تحقق من وضع السمة المظلمة
    checkTheme();
    
    // تحميل المشاريع إذا كان قسم المشاريع مرئيًا
    const projectsGrid = document.getElementById('projects-grid');
    if (projectsGrid) {
        loadProjects();
    }
    
    // إضافة مستمعي أحداث لفلاتر المشاريع
    const projectFilters = document.querySelectorAll('.projects-filters select, .projects-filters input');
    projectFilters.forEach(filter => {
        filter.addEventListener('change', function() {
            loadProjects();
        });
    });
    
    document.getElementById('project-search')?.addEventListener('input', debounce(function() {
        loadProjects();
    }, 300));
});

// دالة لتعيين التاريخ الحالي
function setCurrentDate() {
    const currentDateElement = document.getElementById('current-date');
    if (currentDateElement) {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        currentDateElement.textContent = now.toLocaleDateString('ar-EG', options);
    }
}

// دالة للتبديل بين وضع الشريط الجانبي
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('expanded');
}

// دالة للتبديل بين وضع السمة المظلمة والفاتحة
function toggleTheme() {
    if (document.body.getAttribute('data-theme') === 'light') {
        document.body.removeAttribute('data-theme');
        localStorage.setItem('theme', 'dark');
    } else {
        document.body.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    }
}

// دالة للتحقق من وضع السمة المحفوظ
function checkTheme() {
    const savedTheme = localStorage.getItem('theme');
    const themeSwitch = document.getElementById('dashboard-checkbox');
    
    if (savedTheme === 'light') {
        document.body.setAttribute('data-theme', 'light');
        if (themeSwitch) themeSwitch.checked = true;
    } else {
        document.body.removeAttribute('data-theme');
        if (themeSwitch) themeSwitch.checked = false;
    }
}

// دالة للتنقل بين الأقسام
function navigateTo(sectionId) {
    // إخفاء جميع الأقسام
    const contentSections = document.querySelectorAll('.content-section');
    contentSections.forEach(section => {
        section.classList.add('hidden');
    });
    
    // إظهار القسم المطلوب
    const dashboardSection = document.getElementById('dashboard');
    const targetSection = document.getElementById(sectionId);
    
    if (sectionId === 'dashboard') {
        dashboardSection.classList.remove('hidden');
    } else if (targetSection) {
        targetSection.classList.remove('hidden');
    }
    
    // تحديث الروابط النشطة
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    navLinks.forEach(link => {
        link.parentElement.classList.remove('active');
        if (link.getAttribute('href') === `#${sectionId}`) {
            link.parentElement.classList.add('active');
        }
    });
    
    // تحميل البيانات الخاصة بالقسم إذا لزم الأمر
    if (sectionId === 'projects') {
        loadProjects();
    } else if (sectionId === 'chat') {
        loadChats();
    }
}

// دالة لتسجيل الخروج
function handleLogout() {
    // حذف رمز المصادقة من التخزين المحلي
    localStorage.removeItem('auth_token');
    
    // إعادة توجيه المستخدم إلى صفحة تسجيل الدخول
    window.location.href = 'index.html';
}

// دالة لفتح النافذة المنبثقة لإنشاء مشروع جديد
function openNewProjectModal() {
    const newProjectModal = document.getElementById('new-project-modal');
    if (newProjectModal) {
        newProjectModal.classList.add('active');
    }
}

// دالة لإغلاق النافذة المنبثقة
function closeNewProjectModal() {
    const newProjectModal = document.getElementById('new-project-modal');
    if (newProjectModal) {
        newProjectModal.classList.remove('active');
    }
}

// دالة لمعالجة إنشاء مشروع جديد
async function handleNewProject(e) {
    e.preventDefault();
    
    const nameInput = document.getElementById('project-name');
    const typeInput = document.getElementById('project-type');
    const locationInput = document.getElementById('project-location');
    const capacityInput = document.getElementById('project-capacity');
    const statusInput = document.getElementById('project-status');
    const notesInput = document.getElementById('project-notes');
    
    const projectData = {
        name: nameInput.value,
        type: typeInput.value,
        location: locationInput.value,
        capacity: Number(capacityInput.value),
        status: statusInput.value,
        notes: notesInput.value
    };
    
    try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            throw new Error('يرجى تسجيل الدخول أولاً');
        }
        
        const response = await fetch('http://localhost:5000/api/projects', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(projectData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // إغلاق النافذة المنبثقة
            closeNewProjectModal();
            
            // إعادة تحميل المشاريع
            loadProjects();
            loadRecentProjects();
            
            // عرض رسالة نجاح
            showNotification('تم إنشاء المشروع بنجاح', 'success');
        } else {
            throw new Error(data.message || 'حدث خطأ أثناء إنشاء المشروع');
        }
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

// دالة لتحميل بيانات المستخدم
async function loadUserData() {
    try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            // إعادة توجيه المستخدم إلى صفحة تسجيل الدخول إذا لم يكن مسجل الدخول
            window.location.href = 'index.html';
            return;
        }
        
        const response = await fetch('http://localhost:5000/api/auth/me', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // تحديث معلومات المستخدم في الواجهة
            const userNameElement = document.getElementById('user-name');
            const userEmailElement = document.getElementById('user-email');
            
            if (userNameElement) userNameElement.textContent = data.name;
            if (userEmailElement) userEmailElement.textContent = data.email;
        } else {
            throw new Error(data.message || 'فشل في تحميل بيانات المستخدم');
        }
    } catch (error) {
        console.error('خطأ في تحميل بيانات المستخدم:', error);
        showNotification('فشل في تحميل بيانات المستخدم', 'error');
    }
}

// دالة لتحميل المشاريع الحديثة
async function loadRecentProjects() {
    try {
        const token = localStorage.getItem('auth_token');
        if (!token) return;
        
        const response = await fetch('http://localhost:5000/api/projects?limit=5&sort=createdAt&order=desc', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            const recentProjectsList = document.getElementById('recent-projects-list');
            if (!recentProjectsList) return;
            
            recentProjectsList.innerHTML = '';
            
            if (data.data && data.data.length > 0) {
                data.data.forEach(project => {
                    const projectElement = createRecentProjectElement(project);
                    recentProjectsList.appendChild(projectElement);
                });
            } else {
                recentProjectsList.innerHTML = '<p class="empty-message">لا توجد مشاريع حديثة</p>';
            }
        } else {
            throw new Error(data.message || 'فشل في تحميل المشاريع الحديثة');
        }
    } catch (error) {
        console.error('خطأ في تحميل المشاريع الحديثة:', error);
    }
}

// دالة لإنشاء عنصر مشروع حديث
function createRecentProjectElement(project) {
    const projectElement = document.createElement('div');
    projectElement.className = 'recent-project-item';
    
    const projectTypeIcon = getProjectTypeIcon(project.type);
    const projectTypeClass = `project-type-${project.type}`;
    
    projectElement.innerHTML = `
        <div class="project-icon ${projectTypeClass}">
            <ion-icon name="${projectTypeIcon}"></ion-icon>
        </div>
        <div class="project-details">
            <h3>${project.name}</h3>
            <p>${project.location} - ${formatCapacity(project.capacity)}</p>
            <div class="project-status ${project.status}">
                <span>${getStatusText(project.status)}</span>
            </div>
        </div>
        <div class="project-date">
            ${formatDate(project.createdAt)}
        </div>
    `;
    
    return projectElement;
}

// دالة لتحميل توصيات الذكاء الاصطناعي
function loadAIInsights() {
    const insightsList = document.getElementById('ai-insights-list');
    if (!insightsList) return;
    
    // هذه بيانات تجريبية، في التطبيق الحقيقي ستأتي من الخادم
    const insights = [
        {
            id: 1,
            title: 'زيادة كفاءة مشروع الطاقة الشمسية',
            description: 'يمكن زيادة كفاءة مشروع "طاقة شمسية - عمان" بنسبة 15% من خلال تعديل زاوية الألواح الشمسية.',
            type: 'optimization',
            projectId: 'proj123'
        },
        {
            id: 2,
            title: 'توقع انخفاض في إنتاج الطاقة',
            description: 'من المتوقع انخفاض إنتاج الطاقة في مشروع "طاقة الرياح - إربد" بنسبة 10% خلال الشهر القادم بسبب التغيرات الموسمية.',
            type: 'warning',
            projectId: 'proj456'
        },
        {
            id: 3,
            title: 'فرصة لتوسيع مشروع الطاقة المائية',
            description: 'هناك فرصة لزيادة سعة مشروع "الطاقة المائية - البحر الميت" بنسبة 30% مع عائد استثمار متوقع خلال 3 سنوات.',
            type: 'opportunity',
            projectId: 'proj789'
        }
    ];
    
    insightsList.innerHTML = '';
    
    insights.forEach(insight => {
        const insightElement = document.createElement('div');
        insightElement.className = `insight-item ${insight.type}`;
        
        let iconName = 'bulb-outline';
        if (insight.type === 'warning') iconName = 'warning-outline';
        if (insight.type === 'opportunity') iconName = 'trending-up-outline';
        
        insightElement.innerHTML = `
            <div class="insight-icon">
                <ion-icon name="${iconName}"></ion-icon>
            </div>
            <div class="insight-content">
                <h3>${insight.title}</h3>
                <p>${insight.description}</p>
            </div>
        `;
        
        insightsList.appendChild(insightElement);
    });
}

// دالة لتهيئة الرسوم البيانية
function initCharts() {
    initProjectTypeChart();
    initEnergyProductionChart();
}

// دالة لتهيئة رسم توزيع المشاريع حسب النوع
function initProjectTypeChart() {
    const ctx = document.getElementById('projectTypeChart');
    if (!ctx) return;
    
    // بيانات تجريبية، في التطبيق الحقيقي ستأتي من الخادم
    const data = {
        labels: ['طاقة شمسية', 'طاقة رياح', 'طاقة مائية', 'طاقة حرارية أرضية', 'طاقة حيوية', 'أخرى'],
        datasets: [{
            data: [45, 25, 15, 8, 5, 2],
            backgroundColor: [
                'var(--solar-color)',
                'var(--wind-color)',
                'var(--hydro-color)',
                'var(--geothermal-color)',
                'var(--biomass-color)',
                'var(--other-color)'
            ],
            borderWidth: 0,
            hoverOffset: 10
        }]
    };
    
    new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-color'),
                        font: {
                            size: 12
                        },
                        padding: 15
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${percentage}% (${value} مشروع)`;
                        }
                    }
                }
            },
            cutout: '60%'
        }
    });
}

// دالة لتهيئة رسم إنتاج الطاقة الشهري
function initEnergyProductionChart() {
    const ctx = document.getElementById('energyProductionChart');
    if (!ctx) return;
    
    // بيانات تجريبية، في التطبيق الحقيقي ستأتي من الخادم
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    const data = {
        labels: months,
        datasets: [
            {
                label: 'طاقة شمسية',
                data: [150, 180, 210, 240, 270, 300, 320, 310, 280, 240, 190, 160],
                borderColor: 'var(--solar-color)',
                backgroundColor: 'rgba(255, 167, 38, 0.2)',
                tension: 0.4,
                fill: true
            },
            {
                label: 'طاقة رياح',
                data: [200, 220, 190, 170, 150, 130, 120, 140, 160, 190, 210, 230],
                borderColor: 'var(--wind-color)',
                backgroundColor: 'rgba(41, 182, 246, 0.2)',
                tension: 0.4,
                fill: true
            }
        ]
    };
    
    new Chart(ctx, {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-color')
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-color')
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-color')
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.raw} kWh`;
                        }
                    }
                }
            }
        }
    });
}

// دوال مساعدة
function getProjectTypeIcon(type) {
    const icons = {
        'solar': 'sunny-outline',
        'wind': 'thunderstorm-outline',
        'hydro': 'water-outline',
        'geothermal': 'flame-outline',
        'biomass': 'leaf-outline',
        'other': 'flash-outline'
    };
    
    return icons[type] || 'flash-outline';
}

function formatCapacity(capacity) {
    if (capacity >= 1000) {
        return `${(capacity / 1000).toFixed(1)} MW`;
    }
    return `${capacity} kW`;
}

function getStatusText(status) {
    const statusMap = {
        'planning': 'تخطيط',
        'in-progress': 'قيد التنفيذ',
        'completed': 'مكتمل'
    };
    
    return statusMap[status] || status;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });
}

function showNotification(message, type = 'info') {
    // يمكن تنفيذ هذه الدالة لعرض إشعارات للمستخدم
    console.log(`${type}: ${message}`);
    // في التطبيق الحقيقي، يمكن استخدام مكتبة لعرض الإشعارات
}

function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}
