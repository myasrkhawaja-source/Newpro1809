// ============================================================
// ✅ تحقق كامل: هل السيرفر متصل بـ MongoDB Atlas؟
//  1) يسجل مستخدم تجريبي عبر الـ API
//  2) يفحص وجوده في المونجو المحلي و Atlas
//  3) يعرض محتويات Atlas
//  4) يحذف المستخدم التجريبي من القاعدتين
// ============================================================
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const API = 'http://localhost:5000/api';
const PROBE = `atlas-verify-${Date.now()}@test.com`;

(async () => {
  // 1) تسجيل مستخدم تجريبي عبر الـ API
  let registered = false;
  try {
    const res = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Atlas Verify', email: PROBE, password: 'password123' })
    });
    const data = await res.json();
    registered = res.ok && Boolean(data.token);
    console.log(registered ? '✅ 1) التسجيل عبر الـ API نجح' : `❌ فشل التسجيل: ${data.message}`);
  } catch (e) {
    console.log('❌ السيرفر ما رد:', e.message);
    process.exit(1);
  }

  // 2) فحص القاعدتين
  const local = await mongoose.createConnection('mongodb://localhost:27017/beautyhub').asPromise();
  const atlas = await mongoose.createConnection(process.env.MONGO_URI, { serverSelectionTimeoutMS: 20000 }).asPromise();

  const inLocal = await local.db.collection('users').countDocuments({ email: PROBE });
  const inAtlas = await atlas.db.collection('users').countDocuments({ email: PROBE });

  console.log(`\n🔍 2) مكان حفظ المستخدم التجريبي (${PROBE}):`);
  console.log(`   💻 المونجو المحلي : ${inLocal ? 'موجود' : 'غير موجود'}`);
  console.log(`   ☁️  MongoDB Atlas  : ${inAtlas ? 'موجود' : 'غير موجود'}`);

  const verdict = inAtlas && !inLocal
    ? '☁️  السيرفر متصل بـ MONGODB ATLAS بنجاح 🎉'
    : inLocal
      ? '💻 السيرفر لسه على المونجو المحلي (محتاج إعادة تشغيل)'
      : '⚠️  غير معروف';
  console.log(`\n➡️  النتيجة: ${verdict}`);

  // 3) محتويات Atlas
  console.log('\n📦 محتويات Atlas:');
  const cols = await atlas.db.listCollections().toArray();
  for (const { name } of cols) {
    const c = await atlas.db.collection(name).countDocuments();
    console.log(`   • ${name.padEnd(16)} ${c}`);
  }

  // 4) تنظيف المستخدمين التجريبيين من القاعدتين
  await local.db.collection('users').deleteMany({ email: /^atlas-(probe|verify)-/ });
  await atlas.db.collection('users').deleteMany({ email: /^atlas-(probe|verify)-/ });
  console.log('\n🧹 تم حذف الحسابات التجريبية من القاعدتين');

  await local.close();
  await atlas.close();
  process.exit(0);
})();