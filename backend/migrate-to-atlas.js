// ============================================================
// 🚀 سكربت الترحيل إلى MongoDB Atlas
// بينقل كل الداتا من المونجو المحلي إلى الكلاود
//
// الاستخدام:
//   node migrate-to-atlas.js "mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/beautyhub"
// ============================================================

const mongoose = require('mongoose');

const LOCAL_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/beautyhub';
const TARGET_URI = process.argv[2];

if (!TARGET_URI) {
  console.log('\n❌ ناقص الـ connection string بتاع Atlas!\n');
  console.log('الاستخدام الصحيح:\n');
  console.log('  node migrate-to-atlas.js "mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/beautyhub"\n');
  console.log('📋 وين تلاقي الـ string؟');
  console.log('  Atlas → Cluster → Connect → Drivers → انسخ الـ connection string');
  console.log('  وبدّل <password> بكلمة السر الحقيقية وأضف اسم الداتابيس (beautyhub)\n');
  process.exit(1);
}

(async () => {
  let local, atlas;

  // 1) الاتصال بالمصدر (المحلي)
  try {
    console.log('🔌 جاري الاتصال بالمونجو المحلي...');
    local = await mongoose.createConnection(LOCAL_URI).asPromise();
    console.log('✅ المحلي متصل');
  } catch (e) {
    console.log('❌ فشل الاتصال بالمحلي:', e.message);
    process.exit(1);
  }

  // 2) الاتصال بالوجهة (Atlas)
  try {
    console.log('☁️  جاري الاتصال بـ MongoDB Atlas...');
    atlas = await mongoose.createConnection(TARGET_URI, {
      serverSelectionTimeoutMS: 15000
    }).asPromise();
    console.log('✅ Atlas متصل');
  } catch (e) {
    console.log('\n❌ فشل الاتصال بـ Atlas:', e.message, '\n');
    console.log('🔍 أشيع الأسباب:');
    console.log('  • كلمة السر فيها رموز خاصة (@ : / ?) — شفّرها (URL-encode)');
    console.log('  • نسيت تبدّل <password> بكلمة السر الحقيقية');
    console.log('  • نسيبت تضيف 0.0.0.0/0 في Network Access بـ Atlas');
    console.log('    (Atlas → Network Access → Add IP → Allow Access From Anywhere)\n');
    local.close();
    process.exit(1);
  }

  // 3) نقل كل الـ collections
  const cols = await local.db.listCollections().toArray();
  if (!cols.length) {
    console.log('⚠️  الداتابيس المحلية فاضية — ما في شي للنقل.');
    await local.close();
    await atlas.close();
    process.exit(0);
  }

  console.log(`\n📦 بدأ النقل (${cols.length} collection)...\n`);

  for (const { name } of cols) {
    const docs = await local.db.collection(name).find().toArray();

    if (!docs.length) {
      console.log(`  ⏭️  ${name}: فاضية — تخطّي`);
      continue;
    }

    const target = atlas.db.collection(name);
    await target.deleteMany({}); // مسح القديم إن وجد
    await target.insertMany(docs);
    console.log(`  ✅ ${name}: ${docs.length} document(s) نُقلوا`);
  }

  // 4) تحقق نهائي
  console.log('\n🔍 تحقق نهائي:');
  for (const { name } of cols) {
    const count = await atlas.db.collection(name).countDocuments();
    console.log(`  • ${name}: ${count}`);
  }

  console.log('\n🎉 الترحيل اكتمل بنجاح!');
  console.log('\n📌 الخطوة الأخيرة — حدّث backend/.env:');
  console.log(`   MONGO_URI=${TARGET_URI}`);
  console.log('\n   ثم أعد تشغيل السيرفر وكل حاجة رح تشتغل على الكلاود ☁️\n');

  await local.close();
  await atlas.close();
  process.exit(0);
})();