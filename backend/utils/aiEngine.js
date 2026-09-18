// 🤖 AI Engine — محرك ذكي لشات بوت + مستشار جمال
// بيحلل النص (عربي/إنجليزي) ويردّ بحاجة حقيقية من قاعدة بيانات الموقع
const Product = require('../models/Product');
const Service = require('../models/Service');
const BeautyProfile = require('../models/BeautyProfile');
const Booking = require('../models/Booking');
const Order = require('../models/Order');

// ---------------------------------------------------------------
// قواميس النوايا (Intent) — عربي + إنجليزي
// ---------------------------------------------------------------

const INTENT_KEYWORDS = {
  recommend_products: [
    'منتج', 'منتجات', 'انصحني', 'انصحنى', 'رشح', 'رشحلي', 'اقترح', 'اقتراح',
    'بدي', 'عايز', 'عاوز', 'لازم', 'ابغى',
    'product', 'recommend', 'suggest', 'advice', 'what should', 'need'
  ],
  book_service: [
    'احجز', 'حجز', 'حجزت', 'موعد', 'سالون', 'صالون', 'كوافير', 'عروسة',
    'book', 'booking', 'appointment', 'salon', 'reserve'
  ],
  services_info: [
    'خدمات', 'خدمة', 'خدمه', 'مساج', 'مكياج', 'شعر', 'اظافر', 'أظافر',
    'مانيكير', 'باديكير', 'service', 'services', 'massage', 'nails'
  ],
  order_status: [
    'طلبي', 'اوردر', 'أوردر', 'طلب', 'شحن', 'وصل', 'دفع', 'اوردرات',
    'order', 'orders', 'delivery', 'shipping'
  ],
  bookings_info: [
    'حجوزاتي', 'حجزي', 'مواعيدي', 'مواعيد',
    'my bookings', 'my appointments'
  ],
  skin_help: [
    'بشرة', 'بشرتي', 'حبوب', 'زيوت', 'جفاف', 'تصبغات', 'مسامات', 'تجاعيد',
    'هالات', 'كوجين', 'skin', 'acne', 'pores', 'dry skin', 'oily skin', 'wrinkles'
  ],
  hair_help: [
    'شعري', 'تساقط', 'تقصف', 'كيراتين', 'بروتين', 'صبغة', 'قشرة',
    'hair', 'hairfall', 'hair loss', 'split ends', 'keratin', 'dandruff'
  ],
  makeup_help: [
    'مكياج', 'ميك اب', 'كونسيلر', 'فاونديشن', 'برايمر', 'مسكرة',
    'lipstick', 'foundation', 'makeup', 'mascara', 'concealer'
  ],
  greeting: [
    'هاي', 'هلا', 'مرحبا', 'اهلا', 'أهلا', 'السلام', 'صباح', 'مساء', 'ازيك', 'إزيك', 'شلونك', 'كيفك',
    'hi', 'hello', 'hey', 'good morning', 'good evening'
  ],
  thanks: [
    'شكرا', 'شكراً', 'تسلم', 'متشكر', 'الله يعطيك',
    'thanks', 'thank you', 'thx'
  ]
};

// خريطة المشاكل (Concerns) → فئات المنتجات + نصائح
const CONCERN_MAP = {
  acne: { tokens: ['حبوب', 'بثور', 'زيوت', 'acne', 'pimples', 'breakout'], categories: ['skincare'], subcategories: ['cleanser', 'toner'], skinTypes: ['oily', 'combination'], tip: 'غسول لطيف صباح ومساء + تونر، وابتعدي عن الزيوت الثقيلة.' },
  dryness: { tokens: ['جفاف', 'جافة', 'متشقة', 'dry', 'flaky'], categories: ['skincare'], subcategories: ['moisturizer', 'cleanser'], skinTypes: ['dry', 'sensitive'], tip: 'مرطب غني بعد الغسول مباشرة على بشرة رطبة يقفل الترطيب جوه.' },
  pigmentation: { tokens: ['تصبغات', 'كلف', 'نمش', 'بقع', 'pigmentation', 'dark spots'], categories: ['skincare'], subcategories: ['serum', 'sunscreen'], skinTypes: [], tip: 'فيتامين C صباحاً + واقي شمس SPF 50 يومياً، النتيجة بعد ٦-٨ أسابيع.' },
  pores: { tokens: ['مسامات', 'مسام', 'pores'], categories: ['skincare'], subcategories: ['toner', 'cleanser'], skinTypes: ['oily', 'combination'], tip: 'تونر بـ Niacinamide أو BHA مرتين أسبوعياً يقلل ظهور المسامات.' },
  aging: { tokens: ['تجاعيد', 'شيخوخة', 'خطوط', 'wrinkles', 'aging'], categories: ['skincare'], subcategories: ['serum', 'moisturizer'], skinTypes: [], tip: 'Retinol بالليل (ابدئي مرتين أسبوعياً) + مرطب + واقي شمس نهاراً.' },
  dark_circles: { tokens: ['هالات', 'dark circles'], categories: ['skincare', 'makeup'], subcategories: ['eye_cream', 'concealer'], skinTypes: [], tip: 'كريم عين بالكافيين صباحاً + نوم كافي، والكونسيلر أدفأ بدرجة.' },
  hairfall: { tokens: ['تساقط', 'hair loss', 'hairfall'], categories: ['haircare'], subcategories: ['serum', 'oil'], skinTypes: [], tip: 'سيروم بالروزماري/بيوتين + مساج فروة الرأس ٥ دقايق يومياً.' },
  dandruff: { tokens: ['قشرة', 'هرش', 'dandruff', 'itchy'], categories: ['haircare'], subcategories: ['shampoo'], skinTypes: [], tip: 'شامبو بـ Zinc Pyrithione أو Ketoconazole مرتين أسبوعياً، وبدون ماء ساخن.' },
  damaged_hair: { tokens: ['تالف', 'تقصف', 'مجهد', 'مصبوغ', 'damaged', 'split ends'], categories: ['haircare'], subcategories: ['mask', 'conditioner'], skinTypes: [], tip: 'ماسك بروتين أسبوعياً + قص الأطراف كل ٣ شهور.' },
  makeup_basic: { tokens: ['مكياج', 'ميك اب', 'makeup', 'daily look'], categories: ['makeup'], subcategories: ['foundation', 'mascara'], skinTypes: [], tip: 'لوك يومي: برايمر + فاونديشن خفيف + مسكرة + ليب جلوس — ١٠ دقايق!' }
};

// ---------------------------------------------------------------
// أدوات التحليل
// ---------------------------------------------------------------

const normalize = (text) =>
  String(text || '')
    .toLowerCase()
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[ًٌٍَُِّْ]/g, '')
    .trim();

const detectIntent = (text) => {
  const t = normalize(text);
  // الاستشارات (بشرة/شعر/مكياج) ليها وزن أعلى عشان تسأبق عرض الخدمات
  const WEIGHT = { skin_help: 1.5, hair_help: 1.5, makeup_help: 1.5 };
  const scores = {};
  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    scores[intent] = keywords.reduce((n, kw) => (t.includes(normalize(kw)) ? n + 1 : n), 0) * (WEIGHT[intent] || 1);
  }
  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  return best && best[1] > 0 ? best[0] : 'unknown';
};

const detectConcerns = (text) => {
  const t = normalize(text);
  return Object.values(CONCERN_MAP).filter((c) => c.tokens.some((token) => t.includes(normalize(token))));
};

const scoreProduct = (product, profile, concerns) => {
  let score = (product.rating || 0) * 2;
  if (profile?.skinType && (product.skinTypes || []).includes(profile.skinType)) score += 15;
  if (profile?.budget && product.price <= profile.budget) score += 8;
  if (concerns.some((c) => c.skinTypes.includes(profile?.skinType))) score += 5;
  if (product.inStock !== false) score += 3;
  return score;
};

const fmtProduct = (p) =>
  `💄 **${p.name}** — ${p.brand}\n   ${p.description || ''}\n   💵 ${p.price}₪${p.originalPrice ? ` ~~${p.originalPrice}₪~~` : ''} ⭐ ${p.rating || '—'}`;

const fmtService = (s) =>
  `💇 **${s.name}** (${s.category})\n   ${s.description || ''}\n   💵 ${s.price}₪ • ⏱ ${s.duration} دقيقة • 📍 ${s.location?.city || '—'} ⭐ ${s.rating || '—'}`;

// ---------------------------------------------------------------
// الردود حسب النية
// ---------------------------------------------------------------

const greetingReply = (name) =>
  `أهلاً ${name || 'بيك'} 👋 أنا **Lumi**، مساعدتك الذكية في Beauty Hub!\n` +
  `أقدر أساعدك في:\n` +
  `• 🛍️ ترشيح منتجات مناسبة لبشرتك وميزانيتك\n` +
  `• 💇‍♀️ استشارات بشرة وشعر ومكياج\n` +
  `• 📅 معلومات الخدمات والحجوزات\n` +
  `• 📦 الاستعلام عن طلباتك\n\n` +
  `اسأليني أي حاجة، مثلاً: "بشرتي دهنية محتاجة روتين بسيط" أو "فين طلبي؟"`;

const thanksReply = () => 'العفو! 🌸 سعيد إنني ساعدتك. لو احتجتِ أي حاجة أنا موجودة دايماً 💜';

const unknownReply = () =>
  `ممكن توضحيلي أكتر؟ 🤔\nأقدر أساعدك في:\n` +
  `• "رشحلي منتجات لبشرتي الدهنية"\n` +
  `• "عندي مشكلة تساقط شعر — ايه الحل؟"\n` +
  `• "ايه أحسن خدمات المكياج عندكم؟"\n` +
  `• "فين طلبي؟"`;

const recommendReply = async (text, profile) => {
  const concerns = detectConcerns(text);
  const categories = concerns.flatMap((c) => c.categories);
  const subcategories = concerns.flatMap((c) => c.subcategories);

  const query = {};
  if (categories.length) query.category = { $in: [...new Set(categories)] };
  if (subcategories.length) query.subcategory = { $in: [...new Set(subcategories)] };
  if (profile?.skinType && concerns.length) query.$or = [{ skinTypes: profile.skinType }, { skinTypes: { $size: 0 } }];

  let products = await Product.find(query).limit(4);

  let reply;
  if (products.length) {
    products.sort((a, b) => scoreProduct(b, profile, concerns) - scoreProduct(a, profile, concerns));
    reply = 'شوفِ الترشيحات دي من عندنا:\n\n' + products.map(fmtProduct).join('\n\n');
    if (concerns.length) reply += '\n\n💡 **نصيحة:** ' + concerns[0].tip;
    reply += '\n\nشوفي كل المنتجات: /products';
  } else {
    reply = 'ما لقيتش منتجات مخصصة للمشكلة دي في الكتالوج حالياً 💔';
    if (concerns.length) reply += '\n\n💡 **نصيحة:** ' + concerns[0].tip;
    reply += '\n\nتصفحي كل المنتجات المتاحة: /products';
  }

  if (profile?.budget && products.length) reply += `\n\n💳 ميزانيتك المسجلة: ${profile.budget}₪ — والترشيحات في حدودها.`;
  return reply;
};

const servicesReply = async (text) => {
  const t = normalize(text);
  const catMap = { مكياج: 'makeup', makeup: 'makeup', اظافر: 'nails', منيكير: 'nails', شعر: 'hair', مساج: 'massage', massage: 'massage', بشرة: 'skincare' };
  const cat = Object.keys(catMap).find((k) => t.includes(normalize(k)));
  const services = await Service.find(cat ? { category: catMap[cat] } : {}).limit(4);

  if (!services.length) return 'ما لقيتش خدمات مطابقة حالياً 🙁 جرّبي "اعرضيلي الخدمات".';
  return (
    'دي أبرز الخدمات المتاحة عندنا:\n\n' +
    services.map(fmtService).join('\n\n') +
    '\n\n📅 للحجز بموعد مناسب: /services'
  );
};

const bookServiceReply = async (text) => {
  const t = normalize(text);
  const services = await Service.find().limit(20);
  const match = services.find((s) => t.includes(normalize(s.name))) || services.find((s) => t.includes(normalize(s.category)));

  if (match) {
    return `حاضر! 💇‍♀️ خدمة **${match.name}** متاحة في ${match.location?.city || '—'} — ${match.price}₪ • ${match.duration} دقيقة.\n\n` +
      `لإتمام الحجز واختيار الموعد: 👉 /services\nاختاري الخدمة واضغطي Book Now، وأنا عندك لو احتجتِ أي مساعدة!`;
  }
  return 'تحبي تحجزي موعد؟ 😊\nقوليلي نوع الخدمة (مكياج، شعر، أظافر، مساج...) وأنا هقولك التفاصيل والأسعار، أو احجزي مباشرة من: /services';
};

const orderStatusReply = async (userId) => {
  const orders = await Order.find({ userId }).sort({ createdAt: -1 }).limit(3);
  if (!orders.length) return 'ما لقيتش أوردرات على حسابك 🛍️\nلما تشتري منتج هتلاقي حالته هنا، وممكن تراجعها من: /order-history';

  const statusAr = { pending: 'قيد المعالجة ⏳', confirmed: 'مؤكد ✅', completed: 'تم التسليم 🎉', cancelled: 'ملغي ❌' };
  const payAr = { paid: 'مدفوع 💳', pending: 'غير مدفوع', refunded: 'مسترجع' };

  return (
    'آخر أوردراتك:\n\n' +
    orders.map((o) =>
      `📦 **#${o._id.toString().slice(-6)}** — ${o.items?.map((i) => `${i.quantity}× ${i.name}`).join(', ')}\n` +
      `   الحالة: ${statusAr[o.status] || o.status} • الدفع: ${payAr[o.paymentStatus] || o.paymentStatus} • الإجمالي: ${o.totalPrice}₪`
    ).join('\n\n') +
    '\n\nللتفاصيل الكاملة: /order-history'
  );
};

const bookingsInfoReply = async (userId) => {
  const bookings = await Booking.find({ userId }).sort({ createdAt: -1 }).limit(4).populate('serviceId', 'name price');
  if (!bookings.length) return 'معندكش حجوزات حالياً 📅\nتحبي نحجز حاجة؟ قوليلي "ايه الخدمات المتاحة؟" وأنا هعرضها عليكي!';

  const statusAr = { pending: 'في انتظار التأكيد ⏳', confirmed: 'مؤكد ✅', completed: 'تم ✨', cancelled: 'ملغي ❌' };
  return (
    'حجوزاتك:\n\n' +
    bookings.map((b) =>
      `📅 **${b.serviceId?.name || 'خدمة'}** — ${new Date(b.date).toLocaleDateString('ar-EG')} الساعة ${b.time}\n` +
      `   الحالة: ${statusAr[b.status] || b.status} • السعر: ${b.totalPrice || b.serviceId?.price || '—'}₪`
    ).join('\n\n') +
    '\n\nللإدارة الكاملة: /bookings'
  );
};

// الاستشارة الشخصية بناءً على beauty profile
const consultationReply = async (profile) => {
  const skinAr = { oily: 'دهنية', dry: 'جافة', combination: 'مختلطة', sensitive: 'حساسة', normal: 'عادية' };
  const hairAr = { straight: 'ناعم', wavy: 'مموّج', curly: 'كيرلي', coily: 'شديد التكون', damaged: 'مجهد' };

  const recProducts = profile?.skinType
    ? await Product.find({ skinTypes: profile.skinType }).limit(3)
    : await Product.find().limit(3);

  const recServices = await Service.find(profile?.skinType === 'oily' ? { category: 'skincare' } : {}).limit(2);

  const routine = [
    '1. غسول لطيف — صباحاً ومساءً',
    '2. تونر موازن — بعد الغسول مباشرة',
    `3. سيروم${profile?.skinType === 'oily' ? ' (Niacinamide للبشرة الدهنية)' : profile?.skinType === 'dry' ? ' (Hyaluronic للترطيب)' : ''}`,
    '4. مرطب — صباحاً ومساءً',
    '5. واقي شمس SPF 50 — كل صباح حتى في الشتا ☀️'
  ];

  return (
    `## استشارتك الشخصية 💜\n\n` +
    `**تحليل:** بشرتك ${skinAr[profile?.skinType] || 'غير محددة'} وشعرك ${hairAr[profile?.hairType] || 'غير محدد'}، وميزانيتك ${profile?.budget ? profile.budget + '₪' : 'مرنة'}.\n\n` +
    `### روتين مقترح\n${routine.join('\n')}\n\n` +
    `### منتجات مناسبة ليك من عندنا\n` +
    (recProducts.length ? recProducts.map(fmtProduct).join('\n\n') : 'كملي الـ Beauty Quiz عشان الترشيحات تبقى أدق 📝') +
    `\n\n### خدمات ننصح بيها\n` +
    (recServices.length ? recServices.map(fmtService).join('\n\n') : '—') +
    `\n\nلو حابة نعمق في جزء معين (مكياج، شعر...)، قوليلي! 💬`
  );
};

// ---------------------------------------------------------------
// الدالة الرئيسية
// ---------------------------------------------------------------

const generateReply = async ({ message, user }) => {
  const intent = detectIntent(message);
  const userId = user?.id;

  let profile = null;
  try {
    if (userId) profile = await BeautyProfile.findOne({ userId });
  } catch (_) { /* تجاهل */ }

  switch (intent) {
    case 'greeting': return greetingReply(user?.name?.split(' ')[0]);
    case 'thanks': return thanksReply();
    // استشارات الشعر والبشرة والمكياج ليها أولوية على عرض الخدمات
    case 'skin_help':
    case 'hair_help':
    case 'makeup_help':
    case 'recommend_products':
      return recommendReply(message, profile);
    case 'book_service': return bookServiceReply(message);
    case 'order_status': return orderStatusReply(userId);
    case 'bookings_info': return bookingsInfoReply(userId);
    case 'services_info': return servicesReply(message);
    default: return unknownReply();
  }
};

module.exports = { generateReply, consultationReply, detectIntent, detectConcerns, normalize };