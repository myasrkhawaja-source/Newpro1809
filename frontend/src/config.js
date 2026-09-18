// ⚙️ إعدادات الاتصال بالباك إند
// - التطوير: نترك VITE_API_URL فارغاً فنستخدم مسارات نسبية (/api) عبر بروكسي Vite
// - الإنتاج: اضبط VITE_API_URL على رابط الباك إند، مثال: https://beauty-hub-api.onrender.com
const rawOrigin = String(import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '')

// أصل السيرفر (بدون /api) — يُستخدم لروابط الصور والملفات المرفوعة
export const API_ORIGIN = rawOrigin

// نقطة بداية كل مسارات الـ API
export const API_BASE = `${rawOrigin}/api`

// يحوّل مساراً نسبياً (مثل /uploads/avatars/x.jpg) إلى رابط كامل
export const assetUrl = (path) => {
  if (!path) return ''
  if (/^(https?:|data:|blob:)/.test(path)) return path
  return `${API_ORIGIN}${path}`
}

export default API_BASE
