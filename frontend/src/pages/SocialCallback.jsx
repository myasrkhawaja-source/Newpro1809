import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { API_BASE } from '../config'

// صفحة استقبال توكن تسجيل الدخول الاجتماعي (Google / Facebook)
function SocialCallback({ setUser, setToken }) {
  const navigate = useNavigate()
  const [params] = useSearchParams()

  useEffect(() => {
    const token = params.get('token')
    if (!token) {
      navigate('/login')
      return
    }

    localStorage.setItem('token', token)
    setToken(token)

    // نجيب بيانات المستخدم بالتوكن الجديد
    fetch(`${API_BASE}/profile/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((u) => {
        setUser(u)
        localStorage.setItem('beautyhub-user', JSON.stringify(u))
        navigate('/profile')
      })
      .catch(() => navigate('/login'))
  }, [])

  return <div className="loading">جاري تسجيل الدخول... ⏳</div>
}

export default SocialCallback