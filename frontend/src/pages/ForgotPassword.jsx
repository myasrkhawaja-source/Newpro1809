import { useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import './Auth.css'

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await axios.post('http://localhost:5000/api/auth/forgot-password', { email })
      setSent(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to send reset link')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="auth-container">
      <h2>Reset Password</h2>

      {!sent ? (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="btn btn-primary auth-submit" disabled={isSubmitting}>
            {isSubmitting ? 'Sending...' : 'Send reset link'}
          </button>
        </form>
      ) : (
        <div className="auth-success-box">
          <p>✅ If an account exists for this email, a reset link has been sent.</p>
        </div>
      )}

      <p className="auth-secondary-link">
        <Link to="/login">Back to login</Link>
      </p>
    </div>
  )
}

export default ForgotPassword
