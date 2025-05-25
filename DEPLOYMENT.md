# 🚀 دليل نشر موقع Energy.AI

## 📋 الخطوات السريعة للنشر:

### 1️⃣ إعداد قاعدة البيانات (MongoDB Atlas)

1. **إنشاء حساب**: سجل في https://cloud.mongodb.com
2. **إنشاء Cluster**: اختر الخطة المجانية
3. **إنشاء Database User**:
   - Username: `energy-ai-user`
   - Password: `اختر كلمة مرور قوية`
4. **إعداد Network Access**: أضف `0.0.0.0/0` (للاختبار)
5. **الحصول على Connection String**: انسخ الرابط

### 2️⃣ نشر Backend على Vercel

1. **إنشاء حساب Vercel**: https://vercel.com
2. **تثبيت Vercel CLI**:
   ```bash
   npm i -g vercel
   ```
3. **نشر Backend**:
   ```bash
   cd backend
   vercel
   ```
4. **إضافة متغيرات البيئة** في لوحة تحكم Vercel:
   - `MONGODB_URI`: رابط قاعدة البيانات
   - `JWT_SECRET`: `energy-ai-secret-key-2024`
   - `NODE_ENV`: `production`
   - `CORS_ORIGIN`: `https://yourusername.github.io`

### 3️⃣ نشر Frontend على GitHub Pages

1. **إنشاء مستودع GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/energy-ai.git
   git push -u origin main
   ```

2. **تفعيل GitHub Pages**:
   - اذهب إلى Settings → Pages
   - اختر Source: "Deploy from a branch"
   - اختر Branch: "main"
   - احفظ الإعدادات

3. **تحديث API URL**:
   ```javascript
   // في public/js/main.js - استبدل:
   BASE_URL: "https://your-backend-url.vercel.app/api"
   ```

### 4️⃣ اختبار النظام

1. **افتح الموقع**: `https://yourusername.github.io/energy-ai`
2. **اختبر تسجيل الدخول**:
   - انقر على "Login/Dashboard"
   - أنشئ حساب جديد
   - اختبر تسجيل الدخول
3. **اختبر الدردشة**: انقر على "SERVICE"

## 🔧 خيارات أخرى للاستضافة:

### Frontend:
- ✅ **Netlify**: اسحب المجلد إلى netlify.com
- ✅ **Vercel**: `vercel --prod`
- ✅ **Firebase Hosting**: `firebase deploy`

### Backend:
- ✅ **Railway**: اربط مستودع GitHub
- ✅ **Render**: نشر مجاني مع قيود
- ✅ **Heroku**: خطة مجانية محدودة

## 🔐 إعدادات الأمان:

### 1. متغيرات البيئة الآمنة:
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/energy-ai
JWT_SECRET=your-super-secret-key-here-make-it-long-and-random
PORT=5000
CORS_ORIGIN=https://yourusername.github.io
```

### 2. إعدادات MongoDB:
- استخدم IP Whitelist محدد بدلاً من 0.0.0.0/0
- أنشئ مستخدم قاعدة بيانات منفصل لكل بيئة
- فعّل المصادقة ثنائية العامل

### 3. إعدادات CORS:
```javascript
// في backend/server.js
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
```

## 📱 تحسين الأداء:

### 1. ضغط الملفات:
```javascript
// في backend/server.js
const compression = require('compression');
app.use(compression());
```

### 2. تحسين الصور:
- استخدم تنسيقات WebP
- ضغط الصور قبل الرفع
- استخدم CDN للصور

### 3. تخزين مؤقت:
```javascript
// إضافة headers للتخزين المؤقت
app.use(express.static('public', {
  maxAge: '1d'
}));
```

## 🔍 مراقبة النظام:

### 1. Logs:
```javascript
// في backend/server.js
const morgan = require('morgan');
app.use(morgan('combined'));
```

### 2. Error Tracking:
- استخدم Sentry للتتبع
- إعداد تنبيهات للأخطاء

### 3. Analytics:
- Google Analytics للواجهة
- مراقبة API calls

## 🚨 استكشاف الأخطاء:

### مشاكل شائعة:

1. **CORS Error**:
   - تأكد من إعداد CORS_ORIGIN صحيح
   - تحقق من رابط Frontend

2. **Database Connection**:
   - تأكد من صحة MONGODB_URI
   - تحقق من Network Access في MongoDB

3. **Authentication Issues**:
   - تأكد من JWT_SECRET
   - تحقق من انتهاء صلاحية التوكن

### أوامر مفيدة:
```bash
# فحص logs في Vercel
vercel logs

# اختبار API محلياً
curl https://your-backend-url.vercel.app/api/health

# فحص متغيرات البيئة
vercel env ls
```

## 📞 الدعم:

إذا واجهت أي مشاكل:
1. تحقق من console في المتصفح
2. راجع logs في Vercel
3. تأكد من إعدادات قاعدة البيانات
4. اطلب المساعدة مع تفاصيل الخطأ

---

🎉 **مبروك!** موقعك الآن متاح على الإنترنت!
