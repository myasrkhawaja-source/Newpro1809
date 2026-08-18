# 💄 Beauty Hub

Beauty Hub هي منصة جمال شخصية تجمع بين منتجات العناية، الخدمات، التقييمات، والمراجعات مع توصيات مخصصة حسب نوع البشرة، الشعر، والميزانية.

## ✨ الميزات الرئيسية

- متجر منتجات تجميل وعناية شخصية
- خدمات تجميل متاحة للحجز
- نظام تقييمات ومراجعات
- قائمة المفضلة
- لوحة مستخدم وبيانات شخصية
- توصيات مخصصة بناءً على ملف المستخدم
- إشعارات داخلية للمستخدم
- إدارة bookings والطلبات
- واجهة حديثة ومتجاوبة

## 🧩 التقنيات المستخدمة

### Frontend
- React 18
- Vite
- React Router
- Axios
- CSS Modules / Custom CSS

### Backend
- Node.js
- Express
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs
- Helmet + rate limiting
- Nodemailer

## 🚀 التشغيل المحلي

### 1) Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### 2) Frontend

```bash
cd frontend
npm install
npm run dev
```

## 🔐 متغيرات البيئة

أنشئ ملف `.env` داخل مجلد backend كما في المثال التالي:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/beautyhub
JWT_SECRET=your_super_secure_secret
CLIENT_URL=http://localhost:3000
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

## 🧪 الاختبار

```bash
cd backend
npm test
```

## 🌍 النشر (Deployment)

### Backend على Render
1. ارفع المشروع إلى GitHub
2. أنشئ خدمة Web على Render
3. اختر مجلد backend
4. استخدم هذا الأمر:

```bash
npm install && npm start
```

5. أضف متغيرات البيئة من ملف `.env.production`

### Frontend على Vercel
1. ارفع مجلد frontend إلى Vercel
2. استخدم أمر build الافتراضي:

```bash
npm run build
```
3. تأكد من أن ملف `vercel.json` موجود
4. أضف متغيرات البيئة إذا لزم الأمر

## 📁 الملفات المهمة للنشر

- [backend/.env.production](backend/.env.production)
- [backend/render.yaml](backend/render.yaml)
- [frontend/vercel.json](frontend/vercel.json)

## 🏷️ Branding

تمت إضافة شعار رسمي بصيغة SVG في:
- [frontend/public/favicon.svg](frontend/public/favicon.svg)

كما تم تحديث علامات HTML بحيث يظهر اسم التطبيق وعلامته بطريقة احترافية في المتصفح.

## 📦 ملاحظات مهمة

- استبدل `JWT_SECRET` بقيمة قوية في الإنتاج
- استخدم MongoDB Atlas بدل MongoDB المحلي في النشر الحقيقي
- استخدم HTTPS فقط في الإنتاج
- لا تترك مفاتيح SMTP أو قاعدة البيانات داخل الـ repo

## 📄 الترخيص

ISC# Beautyshop
