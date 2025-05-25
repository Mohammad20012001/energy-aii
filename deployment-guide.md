# 🚀 دليل استضافة موقع Energy.AI

## 📋 المتطلبات:
- حساب GitHub
- حساب MongoDB Atlas (مجاني)
- حساب Vercel أو Netlify (مجاني)

## 🌐 الخطوة 1: استضافة الواجهة الأمامية

### GitHub Pages:
1. أنشئ مستودع جديد على GitHub
2. ارفع ملفات الموقع:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/energy-ai.git
git push -u origin main
```

3. فعّل GitHub Pages:
   - Settings → Pages
   - Source: Deploy from branch
   - Branch: main
   - الموقع سيكون متاح على: `https://YOUR_USERNAME.github.io/energy-ai`

## 🔧 الخطوة 2: إعداد قاعدة البيانات

### MongoDB Atlas:
1. سجل في https://cloud.mongodb.com
2. أنشئ Cluster مجاني
3. أنشئ Database User
4. احصل على Connection String
5. أضف IP Address (0.0.0.0/0 للاختبار)

## ⚙️ الخطوة 3: استضافة Backend

### Vercel (الأسهل):
1. سجل في https://vercel.com
2. اربط حساب GitHub
3. استورد مشروع Backend
4. أضف متغيرات البيئة:
   - `MONGODB_URI`: رابط قاعدة البيانات
   - `JWT_SECRET`: مفتاح سري للتوكن
   - `NODE_ENV`: production

### Railway (بديل):
1. سجل في https://railway.app
2. أنشئ مشروع جديد
3. اربط GitHub repository
4. أضف متغيرات البيئة

## 🔗 الخطوة 4: ربط Frontend بـ Backend

### تحديث API URLs:
في ملف `public/js/main.js`:
```javascript
const API_CONFIG = {
    BASE_URL: "https://your-backend-url.vercel.app/api",
    // باقي الإعدادات...
};
```

## 🔐 الخطوة 5: إعداد نظام التسجيل الحقيقي

### تحديث auth-system.js:
```javascript
// استبدال simulateApiCall بـ API حقيقي
async handleLogin() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        
        if (response.ok) {
            this.setUser(data);
            this.showAuthStatus('success', 'Login successful!');
            setTimeout(() => {
                this.hideAuthModal();
                this.showDashboard();
            }, 1000);
        } else {
            this.showAuthStatus('error', data.message);
        }
    } catch (error) {
        this.showAuthStatus('error', 'Network error. Please try again.');
    }
}
```

## 🌍 خيارات الاستضافة المجانية:

### 1. Frontend:
- ✅ GitHub Pages
- ✅ Netlify
- ✅ Vercel
- ✅ Firebase Hosting

### 2. Backend:
- ✅ Vercel (Node.js)
- ✅ Railway
- ✅ Render
- ✅ Heroku (محدود)

### 3. قاعدة البيانات:
- ✅ MongoDB Atlas (512MB مجاني)
- ✅ PlanetScale (MySQL)
- ✅ Supabase (PostgreSQL)

## 📝 ملاحظات مهمة:

1. **CORS**: تأكد من إعداد CORS في Backend
2. **HTTPS**: استخدم HTTPS للأمان
3. **Environment Variables**: لا تضع المفاتيح السرية في الكود
4. **Rate Limiting**: أضف حماية ضد الهجمات

## 🔧 ملفات الإعداد المطلوبة:

### vercel.json (للـ Backend):
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/server.js"
    }
  ]
}
```

### package.json (للـ Backend):
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "engines": {
    "node": "18.x"
  }
}
```

## 🚀 خطوات سريعة للنشر:

1. **رفع Frontend على GitHub Pages**
2. **رفع Backend على Vercel**
3. **إنشاء قاعدة بيانات على MongoDB Atlas**
4. **تحديث API URLs في Frontend**
5. **اختبار النظام**

## 📞 الدعم:
إذا واجهت أي مشاكل، يمكنني مساعدتك في كل خطوة!
