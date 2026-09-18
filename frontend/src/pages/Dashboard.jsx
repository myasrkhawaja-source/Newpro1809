import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import './Dashboard.css'
import { API_BASE } from '../config'

const API_URL = API_BASE

function Dashboard({ user, token }) {
  const [stats, setStats] = useState({
    productCount: 0,
    userCount: 0,
    bookingCount: 0
  })

  const [products, setProducts] = useState([])
  const [users, setUsers] = useState([])
  const [orders, setOrders] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [lastUpdated, setLastUpdated] = useState(null)

  const fetchDashboardData = async () => {
    if (!token) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError('')

      const headers = {
        Authorization: `Bearer ${token}`
      }

      const [statsResponse, productsResponse, usersResponse, ordersResponse] =
        await Promise.all([
          axios.get(`${API_URL}/admin/stats`, { headers }),
          axios.get(`${API_URL}/admin/products`, { headers }),
          axios.get(`${API_URL}/admin/users`, { headers }),
          axios.get(`${API_URL}/admin/orders`, { headers })
        ])

      setStats(statsResponse.data || {})
      setProducts(productsResponse.data || [])
      setUsers(usersResponse.data || [])
      setOrders(ordersResponse.data || [])
      setLastUpdated(new Date())
    } catch (err) {
      console.error('Dashboard error:', err)

      if (err.response?.status === 403) {
        setError('You do not have permission to access the admin dashboard.')
      } else if (err.response?.status === 401) {
        setError('Your session has expired. Please login again.')
      } else {
        setError(
          err.response?.data?.message ||
          'Failed to load dashboard data.'
        )
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [token])

  // -----------------------------
  // Calculations
  // -----------------------------

  const totalRevenue = orders.reduce((total, order) => {
    const price = Number(order.serviceId?.price || order.price || 0)
    return total + price
  }, 0)

  const confirmedOrders = orders.filter(
    order => order.status === 'confirmed'
  ).length

  const pendingOrders = orders.filter(
    order => order.status === 'pending'
  ).length

  const cancelledOrders = orders.filter(
    order => order.status === 'cancelled'
  ).length

  const completedOrders = orders.filter(
    order =>
      order.status === 'completed' ||
      order.status === 'complete'
  ).length

  const recentOrders = orders.slice(0, 5)
  const recentUsers = users.slice(0, 5)
  const recentProducts = products.slice(0, 5)

  // -----------------------------
  // Loading
  // -----------------------------

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <h2>Loading Dashboard...</h2>
          <p>Fetching the latest Beauty Hub statistics.</p>
        </div>
      </div>
    )
  }

  // -----------------------------
  // Authentication
  // -----------------------------

  if (!token) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-message">
          <div className="message-icon">🔐</div>
          <h2>Please Login</h2>
          <p>You need to login to access the dashboard.</p>

          <Link to="/login" className="btn btn-primary">
            Login
          </Link>
        </div>
      </div>
    )
  }

  // -----------------------------
  // Admin authorization
  // -----------------------------

  if (user?.role !== 'admin') {
    return (
      <div className="dashboard-container">
        <div className="dashboard-message">
          <div className="message-icon">🚫</div>
          <h2>Admin Access Required</h2>
          <p>
            This dashboard is available only for administrators.
          </p>

          <Link to="/user-dashboard" className="btn btn-primary">
            Go To My Dashboard
          </Link>
        </div>
      </div>
    )
  }

  // -----------------------------
  // Dashboard
  // -----------------------------

  return (
    <div className="dashboard-container">

      {/* Header */}
      <div className="dashboard-header">
        <div>
          <div className="dashboard-kicker">
            BEAUTY HUB ADMIN
          </div>

          <h1>Dashboard 📊</h1>

          <p>
            Welcome back, {user?.name || 'Admin'}.
            Here is what is happening in your Beauty Hub.
          </p>
        </div>

        <button
          type="button"
          className="refresh-button"
          onClick={fetchDashboardData}
        >
          🔄 Refresh
        </button>
      </div>

      {lastUpdated && (
        <div className="last-updated">
          Last updated:{' '}
          {lastUpdated.toLocaleTimeString()}
        </div>
      )}

      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      {/* Main Stats */}
      <div className="admin-stat-grid">

        <div className="admin-stat-card products-stat">
          <div className="admin-stat-icon">
            💄
          </div>

          <div>
            <span>Products</span>
            <strong>{stats.productCount || 0}</strong>
            <small>Total products</small>
          </div>
        </div>

        <div className="admin-stat-card orders-stat">
          <div className="admin-stat-icon">
            🛒
          </div>

          <div>
            <span>Orders</span>
            <strong>{orders.length}</strong>
            <small>Total orders</small>
          </div>
        </div>

        <div className="admin-stat-card bookings-stat">
          <div className="admin-stat-icon">
            📅
          </div>

          <div>
            <span>Bookings</span>
            <strong>{stats.bookingCount || 0}</strong>
            <small>Total bookings</small>
          </div>
        </div>

        <div className="admin-stat-card users-stat">
          <div className="admin-stat-icon">
            👥
          </div>

          <div>
            <span>Users</span>
            <strong>{stats.userCount || 0}</strong>
            <small>Registered users</small>
          </div>
        </div>

      </div>

      {/* Revenue */}
      <div className="revenue-card">
        <div>
          <span className="revenue-label">
            Estimated Revenue
          </span>

          <h2>
            ₪{totalRevenue.toLocaleString()}
          </h2>

          <p>
            Calculated from service prices in bookings.
          </p>
        </div>

        <div className="revenue-icon">
          💰
        </div>
      </div>

      {/* Order Status */}
      <div className="dashboard-section">
        <div className="section-title">
          <div>
            <span className="dashboard-kicker">
              ORDERS OVERVIEW
            </span>
            <h2>Order Status</h2>
          </div>

          <Link to="/admin" className="link-btn">
            Manage Orders →
          </Link>
        </div>

        <div className="status-grid">

          <div className="status-card confirmed">
            <span>Confirmed</span>
            <strong>{confirmedOrders}</strong>
          </div>

          <div className="status-card pending">
            <span>Pending</span>
            <strong>{pendingOrders}</strong>
          </div>

          <div className="status-card completed">
            <span>Completed</span>
            <strong>{completedOrders}</strong>
          </div>

          <div className="status-card cancelled">
            <span>Cancelled</span>
            <strong>{cancelledOrders}</strong>
          </div>

        </div>
      </div>

      {/* Recent Orders + Users */}
      <div className="dashboard-two-columns">

        {/* Recent Orders */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <span className="dashboard-kicker">
                RECENT ACTIVITY
              </span>

              <h2>Recent Orders</h2>
            </div>

            <Link to="/admin" className="link-btn">
              View All
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="empty-state">
              🛒
              <p>No orders found.</p>
            </div>
          ) : (
            <div className="data-list">

              {recentOrders.map(order => (
                <div
                  key={order._id}
                  className="data-row"
                >
                  <div className="data-main">
                    <strong>
                      {order.serviceId?.name || 'Beauty Service'}
                    </strong>

                    <span>
                      {order.userId?.name ||
                        order.userId?.email ||
                        'Unknown user'}
                    </span>
                  </div>

                  <div className="data-side">
                    <strong>
                      ₪
                      {Number(
                        order.serviceId?.price ||
                        order.price ||
                        0
                      ).toLocaleString()}
                    </strong>

                    <span
                      className={`status-badge ${
                        order.status || 'pending'
                      }`}
                    >
                      {order.status || 'pending'}
                    </span>
                  </div>
                </div>
              ))}

            </div>
          )}
        </div>

        {/* Recent Users */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <span className="dashboard-kicker">
                USERS
              </span>

              <h2>Recent Users</h2>
            </div>

            <Link to="/admin" className="link-btn">
              Manage
            </Link>
          </div>

          {recentUsers.length === 0 ? (
            <div className="empty-state">
              👥
              <p>No users found.</p>
            </div>
          ) : (
            <div className="data-list">

              {recentUsers.map(currentUser => (
                <div
                  key={currentUser._id}
                  className="data-row"
                >
                  <div className="user-avatar">
                    {currentUser.name
                      ?.charAt(0)
                      ?.toUpperCase() || 'U'}
                  </div>

                  <div className="data-main">
                    <strong>
                      {currentUser.name || 'Unnamed User'}
                    </strong>

                    <span>
                      {currentUser.email}
                    </span>
                  </div>

                  <span
                    className={`role-badge ${
                      currentUser.role || 'user'
                    }`}
                  >
                    {currentUser.role || 'user'}
                  </span>
                </div>
              ))}

            </div>
          )}
        </div>

      </div>

      {/* Products */}
      <div className="dashboard-panel wide-panel">

        <div className="panel-header">
          <div>
            <span className="dashboard-kicker">
              CATALOG
            </span>

            <h2>Recent Products</h2>
          </div>

          <Link to="/products" className="link-btn">
            View Products
          </Link>
        </div>

        {recentProducts.length === 0 ? (
          <div className="empty-state">
            💄
            <p>No products found.</p>
          </div>
        ) : (
          <div className="admin-products-grid">

            {recentProducts.map(product => (
              <div
                key={product._id}
                className="admin-product-card"
              >
                <div className="admin-product-image">

                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                    />
                  ) : (
                    <span>💄</span>
                  )}

                </div>

                <div className="admin-product-info">
                  <h3>{product.name}</h3>

                  <p>
                    {product.category || 'Beauty Product'}
                  </p>

                  <strong>
                    ₪
                    {Number(product.price || 0).toLocaleString()}
                  </strong>
                </div>
              </div>
            ))}

          </div>
        )}

      </div>

      {/* Quick Actions */}
      <div className="dashboard-section">

        <div className="section-title">
          <div>
            <span className="dashboard-kicker">
              MANAGEMENT
            </span>

            <h2>Quick Actions</h2>
          </div>
        </div>

        <div className="quick-actions">

          <Link to="/admin" className="quick-action">
            <span>🛠️</span>
            <div>
              <strong>Admin Panel</strong>
              <p>Manage the whole platform</p>
            </div>
          </Link>

          <Link to="/products" className="quick-action">
            <span>💄</span>
            <div>
              <strong>Products</strong>
              <p>View and manage products</p>
            </div>
          </Link>

          <Link to="/bookings" className="quick-action">
            <span>📅</span>
            <div>
              <strong>Bookings</strong>
              <p>View customer bookings</p>
            </div>
          </Link>

          <Link to="/user-dashboard" className="quick-action">
            <span>👤</span>
            <div>
              <strong>User Dashboard</strong>
              <p>Open the customer dashboard</p>
            </div>
          </Link>

        </div>

      </div>

    </div>
  )
}

export default Dashboard