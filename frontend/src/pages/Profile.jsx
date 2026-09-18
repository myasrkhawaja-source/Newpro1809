import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import './Profile.css'
import { API_BASE, API_ORIGIN } from '../config'

const API = API_BASE
const BACKEND = API_ORIGIN

function Profile({ user, setUser, token }) {
  const [beauty, setBeauty] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const fileRef = useRef(null)

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    city: user?.location?.city || '',
    address: user?.location?.address || ''
  })

  useEffect(() => {
    if (!token) return
    const load = async () => {
      try {
        // نجيب أحدث بيانات الحساب + البروفايل الجمالي
        const [meRes, beautyRes] = await Promise.allSettled([
          axios.get(`${API}/profile/me`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API}/profile`, { headers: { Authorization: `Bearer ${token}` } })
        ])
        if (meRes.status === 'fulfilled') {
          const u = meRes.value.data
          syncUser(u)
          setForm({
            name: u.name || '',
            email: u.email || '',
            phone: u.phone || '',
            city: u.location?.city || '',
            address: u.location?.address || ''
          })
        }
        if (beautyRes.status === 'fulfilled') setBeauty(beautyRes.value.data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [token])

  // نحدث نسخة المستخدم في حالة التطبيق (وlocalStorage تلقائياً)
  const syncUser = (u) => setUser?.({ ...(user || {}), ...u, avatar: u.avatar || '' })

  const avatarUrl = user?.avatar
    ? (user.avatar.startsWith('http') ? user.avatar : `${BACKEND}${user.avatar}`)
    : null

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  // حفظ تعديلات الحساب (الاسم/الإيميل/التلفون/العنوان)
  const handleSave = async (e) => {
    e.preventDefault()
    setMessage('')
    try {
      const res = await axios.put(`${API}/profile/account`, form, {
        headers: { Authorization: `Bearer ${token}` }
      })
      syncUser(res.data.user)
      setEditing(false)
      setMessage('✅ تم حفظ التعديلات بنجاح')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setMessage('❌ ' + (err.response?.data?.message || 'حدث خطأ أثناء الحفظ'))
    }
  }

  // رفع صورة البروفايل
  const handleAvatar = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setMessage('')
    try {
      const data = new FormData()
      data.append('avatar', file)
      const res = await axios.post(`${API}/profile/avatar`, data, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      })
      syncUser(res.data.user)
      setMessage('✅ تم تحديث الصورة')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setMessage('❌ ' + (err.response?.data?.message || 'فشل رفع الصورة'))
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const removeAvatar = async () => {
    try {
      const res = await axios.delete(`${API}/profile/avatar`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      syncUser(res.data.user)
    } catch { /* تجاهل */ }
  }

  if (!token) {
    return (
      <div className="profile-container">
        <div className="no-profile">
          <h2>Please Login</h2>
          <p>You need to login to view your profile.</p>
        </div>
      </div>
    )
  }

  if (loading) return <div className="loading">Loading profile...</div>

  return (
    <div className="profile-container">
      <h1>حسابي 👤</h1>
      {message && <div className="profile-message">{message}</div>}

      {/* صورة البروفايل */}
      <div className="profile-section avatar-section">
        <div className="avatar-wrap">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Profile" className="avatar-img" />
          ) : (
            <div className="avatar-placeholder">{(user?.name || '؟').charAt(0)}</div>
          )}
          <button
            type="button"
            className="avatar-edit-btn"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            title="تغيير الصورة"
          >
            📷
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          hidden
          onChange={handleAvatar}
        />
        <div className="avatar-actions">
          <strong>{user?.name}</strong>
          <span>{uploading ? 'جاري الرفع...' : 'JPG / PNG / WEBP — حتى 2MB'}</span>
          {avatarUrl && <button className="link-danger" onClick={removeAvatar}>حذف الصورة</button>}
        </div>
      </div>

      {/* الملف الشخصي */}
      <div className="profile-section">
        <div className="section-head">
          <h2>الملف الشخصي</h2>
          {!editing && (
            <button onClick={() => setEditing(true)} className="btn btn-primary btn-sm">تعديل</button>
          )}
        </div>

        {!editing ? (
          <div className="profile-info">
            <div className="info-item"><span className="info-label">الاسم:</span><span className="info-value">{user?.name}</span></div>
            <div className="info-item"><span className="info-label">البريد الإلكتروني:</span><span className="info-value">{user?.email}</span></div>
            <div className="info-item"><span className="info-label">الهاتف المحمول:</span><span className="info-value">{user?.phone || 'لم يتم الإضافة'}</span></div>
            <div className="info-item"><span className="info-label">المدينة:</span><span className="info-value">{user?.location?.city || 'لم تتم الإضافة'}</span></div>
            <div className="info-item"><span className="info-label">العنوان:</span><span className="info-value">{user?.location?.address || 'ليس لديك عنوان محفوظ'}</span></div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="profile-form">
            <div className="form-row">
              <div className="form-group">
                <label>الاسم</label>
                <input name="name" value={form.name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>البريد الإلكتروني</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>رقم التلفون</label>
                <input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="05xxxxxxxx" />
              </div>
              <div className="form-group">
                <label>المدينة</label>
                <input name="city" value={form.city} onChange={handleChange} placeholder="مثال: الناصرة" />
              </div>
            </div>
            <div className="form-group">
              <label>العنوان</label>
              <input name="address" value={form.address} onChange={handleChange} placeholder="الشارع، رقم البناية..." />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">حفظ التعديلات</button>
              <button type="button" onClick={() => setEditing(false)} className="btn btn-secondary">إلغاء</button>
            </div>
          </form>
        )}
      </div>

      {/* بروفايل الجمال */}
      {beauty && (
        <div className="profile-section">
          <h2>بروفايل الجمال 💜</h2>
          <div className="profile-info">
            <div className="info-item"><span className="info-label">نوع البشرة:</span><span className="info-value">{beauty.skinType}</span></div>
            <div className="info-item"><span className="info-label">نوع الشعر:</span><span className="info-value">{beauty.hairType}</span></div>
            <div className="info-item"><span className="info-label">الميزانية:</span><span className="info-value">₪{beauty.budget}</span></div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile