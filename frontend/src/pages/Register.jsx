import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import './Auth.css'
import './Social.css'
import { API_BASE, API_ORIGIN } from '../config'

const BACKEND = API_ORIGIN
const SOCIAL_MESSAGES = {
  not_configured: '⚠️ تسجيل الدخول عبر {p} غير مفعّل على السيرفر حالياً — سجّل بالبريد الإلكتروني، أو أضف مفاتيح API في ملف .env لتفعيله.',
  failed: '❌ تعذّر إكمال تسجيل الدخول عبر {p}، حاول مرة أخرى.',
  no_email: '⚠️ حساب {p} لم يشارك البريد الإلكتروني — اسمح بالوصول للإيميل وحاول مجدداً.'
}

function Register({ setUser, setToken }) {
  const [searchParams] = useSearchParams()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  // رسالة نتيجة محاولة الدخول الاجتماعي (لو في)
  const socialParam = searchParams.get('social')
  const provider = searchParams.get('provider')
  const socialNotice = socialParam && SOCIAL_MESSAGES[socialParam]
    ? SOCIAL_MESSAGES[socialParam].replace('{p}', provider === 'facebook' ? 'فيسبوك' : 'جوجل')
    : ''

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const response = await axios.post(`${API_BASE}/auth/register`, formData)
      const { token, user } = response.data

      localStorage.setItem('token', token)
      setToken(token)
      setUser(user)
      navigate('/profile')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="auth-container">
      <h2>Join Beauty Hub</h2>

      {socialNotice && <div className="social-notice">{socialNotice}</div>}
      {error && <div className="error">{error}</div>}

      {/* تسجيل اجتماعي */}
      <div className="social-buttons">
        <a className="social-btn google" href={`${BACKEND}/api/auth/google`}>
          <span className="social-icon">G</span> المتابعة مع Google
        </a>
        <a className="social-btn facebook" href={`${BACKEND}/api/auth/facebook`}>
          <span className="social-icon">f</span> المتابعة مع Facebook
        </a>
      </div>

      <div className="social-divider"><span>أو سجّل بالبريد الإلكتروني</span></div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
          />
        </div>
        <div className="form-group">
          <label>Phone (optional)</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
          />
        </div>
        <button type="submit" className="btn btn-primary auth-submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account...' : 'Register'}
        </button>
      </form>
      <p className="auth-secondary-link">
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  )
}

export default Register