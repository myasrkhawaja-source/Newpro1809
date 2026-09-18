import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import './Auth.css'
import './Social.css'
import { API_BASE, API_ORIGIN } from '../config'

const BACKEND = API_ORIGIN

function Login({ setUser, setToken }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const response = await axios.post(`${API_BASE}/auth/login`, formData)
      const { token, user } = response.data

      localStorage.setItem('token', token)
      setToken(token)
      setUser(user)

      const redirectTo = location.state?.from || '/profile'
      navigate(redirectTo)
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="auth-container">
      <h2>Login to Beauty Hub</h2>

      <div className="social-buttons">
        <a className="social-btn google" href={`${BACKEND}/api/auth/google`}>
          <span className="social-icon">G</span> المتابعة مع Google
        </a>
        <a className="social-btn facebook" href={`${BACKEND}/api/auth/facebook`}>
          <span className="social-icon">f</span> المتابعة مع Facebook
        </a>
      </div>

      <div className="social-divider"><span>أو سجّل الدخول بالبريد</span></div>

      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
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
        <button type="submit" className="btn btn-primary auth-submit" disabled={isSubmitting}>
          {isSubmitting ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p className="auth-secondary-link">
        <Link to="/forgot-password">Forgot password?</Link>
      </p>
      <p className="auth-secondary-link">
        Don't have an account? <Link to="/register">Register</Link>
      </p>
    </div>
  )
}

export default Login