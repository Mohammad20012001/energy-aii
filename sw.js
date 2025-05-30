/* ===== ENERGY.AI SERVICE WORKER ===== */

const CACHE_NAME = 'energy-ai-v1.0.0';
const STATIC_CACHE = 'energy-ai-static-v1.0.0';
const DYNAMIC_CACHE = 'energy-ai-dynamic-v1.0.0';

// الملفات الأساسية للتخزين المؤقت
const STATIC_FILES = [
    '/',
    '/index.html',
    '/energy-map-professional.html',
    '/public/css/styles.css',
    '/public/css/icons.css',
    '/public/css/brand-icons.css',
    '/public/css/enhanced-map-animations.css',
    '/public/css/advanced-map-tools.css',
    '/public/css/xmap-features.css',
    '/public/css/naya.css',
    '/public/css/language.css',
    '/public/css/auth.css',
    '/public/css/admin-styles.css',
    '/public/js/main.js',
    '/public/js/chat.js',
    '/public/js/auth.js',
    '/public/js/language.js',
    '/public/js/pwa.js',
    '/public/js/advanced-map-tools.js',
    '/public/js/xmap-features.js',
    '/public/js/naya.js',
    '/public/js/error-handler.js',
    '/public/js/validator.js',
    '/public/js/api-service.js',
    '/public/js/groq-service.js',
    '/public/js/groq-settings.js',
    '/public/js/performance-optimizer.js',
    '/public/js/language-system.js',
    '/public/js/auth-system.js',
    '/public/js/embedded-map.js',
    '/public/manifest.json'
];

// الملفات الخارجية المهمة
const EXTERNAL_FILES = [
    'https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js',
    'https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.js',
    'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap',
    'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700&family=Tajawal:wght@300;400;500;700&display=swap',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];

// تثبيت Service Worker
self.addEventListener('install', event => {
    console.log('🔧 Service Worker installing...');

    event.waitUntil(
        Promise.all([
            // تخزين الملفات الأساسية
            caches.open(STATIC_CACHE).then(cache => {
                console.log('📦 Caching static files...');
                return cache.addAll(STATIC_FILES);
            }),
            // تخزين الملفات الخارجية
            caches.open(DYNAMIC_CACHE).then(cache => {
                console.log('🌐 Caching external files...');
                return Promise.allSettled(
                    EXTERNAL_FILES.map(url =>
                        cache.add(url).catch(err => {
                            console.warn(`Failed to cache ${url}:`, err);
                        })
                    )
                );
            })
        ]).then(() => {
            console.log('✅ Service Worker installed successfully');
            // فرض التفعيل الفوري
            return self.skipWaiting();
        })
    );
});

// تفعيل Service Worker
self.addEventListener('activate', event => {
    console.log('🚀 Service Worker activating...');

    event.waitUntil(
        Promise.all([
            // مسح الكاشات القديمة
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== STATIC_CACHE &&
                            cacheName !== DYNAMIC_CACHE &&
                            cacheName !== CACHE_NAME) {
                            console.log('🗑️ Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),
            // السيطرة على جميع العملاء
            self.clients.claim()
        ]).then(() => {
            console.log('✅ Service Worker activated successfully');
        })
    );
});

// اعتراض الطلبات
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // تجاهل الطلبات غير HTTP/HTTPS
    if (!request.url.startsWith('http')) {
        return;
    }

    // تجاهل طلبات API الخارجية الحساسة
    if (url.hostname.includes('googleapis.com') && url.pathname.includes('generateContent')) {
        return;
    }

    // استراتيجية Cache First للملفات الأساسية
    if (STATIC_FILES.some(file => request.url.includes(file))) {
        event.respondWith(cacheFirst(request));
        return;
    }

    // استراتيجية Network First للصفحات
    if (request.mode === 'navigate') {
        event.respondWith(networkFirst(request));
        return;
    }

    // استراتيجية Stale While Revalidate للموارد الأخرى
    event.respondWith(staleWhileRevalidate(request));
});

// استراتيجية Cache First
async function cacheFirst(request) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        const networkResponse = await fetch(request);

        // تخزين الاستجابة الجديدة
        if (networkResponse.ok) {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        console.error('Cache First error:', error);
        return caches.match('/offline.html') || new Response('Offline');
    }
}

// استراتيجية Network First
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);

        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        console.log('Network failed, trying cache...');

        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        // إرجاع صفحة offline أو الصفحة الرئيسية
        return caches.match('/index.html') ||
               caches.match('/') ||
               new Response('Offline', { status: 503 });
    }
}

// استراتيجية Stale While Revalidate
async function staleWhileRevalidate(request) {
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);

    // تحديث الكاش في الخلفية
    const fetchPromise = fetch(request).then(networkResponse => {
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    }).catch(error => {
        console.warn('Fetch failed for:', request.url, error);
        return cachedResponse;
    });

    // إرجاع الكاش فوراً إذا كان متاحاً، وإلا انتظار الشبكة
    return cachedResponse || fetchPromise;
}

// معالجة الرسائل من التطبيق الرئيسي
self.addEventListener('message', event => {
    const { type, data } = event.data;

    switch (type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;

        case 'GET_CACHE_SIZE':
            getCacheSize().then(size => {
                event.ports[0].postMessage({ type: 'CACHE_SIZE', data: size });
            });
            break;

        case 'CLEAR_CACHE':
            clearAllCaches().then(() => {
                event.ports[0].postMessage({ type: 'CACHE_CLEARED' });
            });
            break;

        case 'UPDATE_CACHE':
            updateCache(data.urls).then(() => {
                event.ports[0].postMessage({ type: 'CACHE_UPDATED' });
            });
            break;
    }
});

// حساب حجم الكاش
async function getCacheSize() {
    try {
        const cacheNames = await caches.keys();
        let totalSize = 0;

        for (const cacheName of cacheNames) {
            const cache = await caches.open(cacheName);
            const requests = await cache.keys();

            for (const request of requests) {
                const response = await cache.match(request);
                if (response) {
                    const blob = await response.blob();
                    totalSize += blob.size;
                }
            }
        }

        return {
            size: totalSize,
            formatted: formatBytes(totalSize),
            caches: cacheNames.length
        };
    } catch (error) {
        console.error('Error calculating cache size:', error);
        return { size: 0, formatted: '0 B', caches: 0 };
    }
}

// مسح جميع الكاشات
async function clearAllCaches() {
    try {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
        console.log('🗑️ All caches cleared');
    } catch (error) {
        console.error('Error clearing caches:', error);
    }
}

// تحديث الكاش
async function updateCache(urls = []) {
    try {
        const cache = await caches.open(DYNAMIC_CACHE);

        if (urls.length > 0) {
            await cache.addAll(urls);
        } else {
            // تحديث الملفات الأساسية
            await cache.addAll(STATIC_FILES);
        }

        console.log('🔄 Cache updated');
    } catch (error) {
        console.error('Error updating cache:', error);
    }
}

// تنسيق حجم البايتات
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// معالجة الأخطاء العامة
self.addEventListener('error', event => {
    console.error('Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', event => {
    console.error('Service Worker unhandled rejection:', event.reason);
});

// تنظيف دوري للكاش
setInterval(async () => {
    try {
        const cache = await caches.open(DYNAMIC_CACHE);
        const requests = await cache.keys();

        // حذف الطلبات القديمة (أكثر من 7 أيام)
        const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);

        for (const request of requests) {
            const response = await cache.match(request);
            if (response) {
                const dateHeader = response.headers.get('date');
                if (dateHeader) {
                    const responseDate = new Date(dateHeader).getTime();
                    if (responseDate < oneWeekAgo) {
                        await cache.delete(request);
                        console.log('🗑️ Deleted old cache entry:', request.url);
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error during cache cleanup:', error);
    }
}, 24 * 60 * 60 * 1000); // كل 24 ساعة

console.log('🔧 Energy.AI Service Worker loaded');
