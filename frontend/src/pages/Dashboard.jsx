import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import './Dashboard.css'

function Dashboard({ user, token }) {
  const [favorites, setFavorites] = useState([])
  const [bookings, setBookings] = useState([])
  const [notifications, setNotifications] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const headers = { Authorization: `Bearer ${token}` }

        // Fetch favorites
        try {
          const favRes = await axios.get('http://localhost:5000/api/favorites', { headers })
          setFavorites(favRes.data || [])
        } catch (err) {
          console.log('Favorites fetch error:', err.message)
        }

        // Fetch bookings
        try {
          const bookRes = await axios.get('http://localhost:5000/api/bookings/my-bookings', { headers })
          setBookings(bookRes.data || [])
        } catch (err) {
          console.log('Bookings fetch error:', err.message)
        }

        // Fetch notifications
        try {
          const notifRes = await axios.get('http://localhost:5000/api/notifications', { headers })
          setNotifications(notifRes.data || [])
        } catch (err) {
          console.log('Notifications fetch error:', err.message)
        }

        // Fetch recommended products
        try {
          const prodRes = await axios.get('http://localhost:5000/api/products?limit=4', { headers })
          setRecommendations(prodRes.data || [])
        } catch (err) {
          console.log('Products fetch error:', err.message)
        }

        setError(null)
      } catch (err) {
        setError('Failed to load dashboard data')
        console.error('Dashboard fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [token])

  if (!token) {
    return (
      <div className="dashboard-container">
        <div className="no-dashboard">
          <h2>Please Login</h2>
          <p>You need to login to view your dashboard.</p>
          <Link to="/login" className="btn btn-primary">Login</Link>
        </div>
      </div>
    )
  }

  // Get upcoming bookings (next 3)
  const upcomingBookings = bookings
    .filter(b => b.status !== 'cancelled')
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 3)

  // Get unread notifications (first 5)
  const unreadNotifications = notifications
    .filter(n => !n.read)
    .slice(0, 5)

  // Count stats
  const confirmedCount = bookings.filter(b => b.status === 'confirmed').length
  const pendingCount = bookings.filter(b => b.status === 'pending').length
  const notificationCount = notifications.filter(n => !n.read).length

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="dashboard-kicker">Welcome Back</div>
        <h1>Dashboard 📊</h1>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Stats Cards */}
      <div className="stat-grid">
        <div className="stat-card accent-pink">
          <div className="stat-icon">❤️</div>
          <div>
            <span className="stat-label">Wishlist</span>
            <strong>{favorites.length}</strong>
          </div>
        </div>

        <div className="stat-card accent-purple">
          <div className="stat-icon">📅</div>
          <div>
            <span className="stat-label">Confirmed Bookings</span>
            <strong>{confirmedCount}</strong>
          </div>
        </div>

        <div className="stat-card accent-green">
          <div className="stat-icon">⏳</div>
          <div>
            <span className="stat-label">Pending Bookings</span>
            <strong>{pendingCount}</strong>
          </div>
        </div>

        <div className="stat-card accent-gold">
          <div className="stat-icon">🔔</div>
          <div>
            <span className="stat-label">Notifications</span>
            <strong>{notificationCount}</strong>
          </div>
        </div>
      </div>

      {/* Main Panels Grid */}
      <div className="dashboard-panel-grid">
        {/* Upcoming Bookings */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <h2>📅 Upcoming Bookings</h2>
            <Link to="/bookings" className="link-btn">View All</Link>
          </div>
          {upcomingBookings.length > 0 ? (
            <div className="booking-list">
              {upcomingBookings.map(booking => (
                <div key={booking._id} className="booking-preview">
                  <strong>{booking.serviceId?.name || 'Service'}</strong>
                  <p>📅 {new Date(booking.date).toLocaleDateString()} at {booking.time}</p>
                  <p>📍 {booking.location?.city || 'TBA'}</p>
                  <span className={`status-badge status-${booking.status}`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="panel-empty">No upcoming bookings yet. <Link to="/services">Book a service</Link></p>
          )}
        </div>

        {/* Recent Notifications */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <h2>🔔 Notifications</h2>
            <Link to="/notifications" className="link-btn">View All</Link>
          </div>
          {unreadNotifications.length > 0 ? (
            <div className="notification-list">
              {unreadNotifications.map(notif => (
                <div key={notif._id} className="notification-item">
                  <strong>{notif.title}</strong>
                  <p>{notif.message}</p>
                  <small>{new Date(notif.createdAt).toLocaleDateString()}</small>
                </div>
              ))}
            </div>
          ) : (
            <p className="panel-empty">All caught up! No new notifications.</p>
          )}
        </div>
      </div>

      {/* Recommended Products */}
      <div className="dashboard-panel wide-panel">
        <div className="panel-header">
          <h2>✨ Recommended Products</h2>
          <Link to="/products" className="link-btn">Browse All</Link>
        </div>
        {recommendations.length > 0 ? (
          <div className="products-grid-dashboard">
            {recommendations.map(product => (
              <Link key={product._id} to={`/products?id=${product._id}`} className="product-card-dashboard">
                <div className="product-image">
                  <img src={product.image || '💄'} alt={product.name} />
                </div>
                <h4>{product.name}</h4>
                <p className="product-description">{product.category}</p>
                <p className="product-price">₪{product.price}</p>
              </Link>
            ))}
          </div>
        ) : (
          <p className="panel-empty">No products available yet.</p>
        )}
      </div>

      {/* Quick Links */}
      <div className="dashboard-panel wide-panel">
        <div className="panel-header">
          <h2>Quick Links</h2>
        </div>
        <div className="dashboard-grid">
          <Link to="/profile" className="dashboard-card">
            <div className="dashboard-icon">👤</div>
            <h3>My Profile</h3>
            <p>View and edit your beauty profile</p>
          </Link>

          <Link to="/favorites" className="dashboard-card">
            <div className="dashboard-icon">❤️</div>
            <h3>Favorites ({favorites.length})</h3>
            <p>Your saved items</p>
          </Link>

          <Link to="/bookings" className="dashboard-card">
            <div className="dashboard-icon">📅</div>
            <h3>All Bookings</h3>
            <p>Manage appointments</p>
          </Link>

          <Link to="/quiz" className="dashboard-card">
            <div className="dashboard-icon">💕</div>
            <h3>Beauty Quiz</h3>
            <p>Get recommendations</p>
          </Link>

          <Link to="/products" className="dashboard-card">
            <div className="dashboard-icon">💄</div>
            <h3>Shop Products</h3>
            <p>Browse all products</p>
          </Link>

          <Link to="/services" className="dashboard-card">
            <div className="dashboard-icon">💇‍♀️</div>
            <h3>Beauty Services</h3>
            <p>Book professionals</p>
          </Link>
        </div>
      </div>

      {/* Welcome Section */}
      <div className="welcome-section">
        <h2>Welcome back, {user?.name}! 💕</h2>
        <p>Discover personalized beauty recommendations tailored to your unique style and needs.</p>
        <Link to="/quiz" className="btn btn-primary">Take Beauty Quiz</Link>
      </div>
    </div>
  )
}

export default Dashboard