import { useEffect, useState } from 'react';
import axios from 'axios';
import './Dashboard.css';

function UserDashboard({ token, user }) {
  const [profile, setProfile] = useState(null);
  const [recommendations, setRecommendations] = useState({ routine: [], products: [], services: [] });
  const [favorites, setFavorites] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;

      try {
        const [profileRes, recommendationsRes, favoritesRes, bookingsRes, notificationsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/profile', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5000/api/profile/recommendations', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5000/api/favorites', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5000/api/bookings/my-bookings', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5000/api/notifications', { headers: { Authorization: `Bearer ${token}` } })
        ]);

        setProfile(profileRes.data || null);
        setRecommendations(recommendationsRes.data || { routine: [], products: [], services: [] });
        setFavorites(favoritesRes.data || []);
        setBookings(bookingsRes.data || []);
        setNotifications(notificationsRes.data || []);
      } catch (error) {
        console.error('Error loading user dashboard', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const recentOrders = bookings.slice(0, 3);
  const nextBooking = bookings.find((booking) => booking.status !== 'cancelled') || bookings[0];
  const unreadNotifications = notifications.filter((item) => !item.read).length;

  if (!token) {
    return (
      <div className="dashboard-container">
        <div className="no-dashboard">
          <h2>Please Login</h2>
          <p>You need to login to access your dashboard.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <p className="dashboard-kicker">Overview</p>
          <h1>Welcome back, {user?.name || 'Beauty Lover'} 👋</h1>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card accent-pink">
          <div className="stat-icon">💗</div>
          <div>
            <span className="stat-label">Wishlist</span>
            <strong>{favorites.length}</strong>
          </div>
        </div>

        <div className="stat-card accent-purple">
          <div className="stat-icon">📦</div>
          <div>
            <span className="stat-label">Orders</span>
            <strong>{bookings.length}</strong>
          </div>
        </div>

        <div className="stat-card accent-green">
          <div className="stat-icon">📅</div>
          <div>
            <span className="stat-label">Bookings</span>
            <strong>{bookings.length}</strong>
          </div>
        </div>

        <div className="stat-card accent-gold">
          <div className="stat-icon">🔔</div>
          <div>
            <span className="stat-label">Alerts</span>
            <strong>{unreadNotifications}</strong>
          </div>
        </div>
      </div>

      <div className="dashboard-panel-grid">
        <section className="dashboard-panel">
          <div className="panel-header">
            <h2>Recent Orders</h2>
            <span>Latest</span>
          </div>

          {recentOrders.length === 0 ? (
            <p className="panel-empty">No recent orders yet.</p>
          ) : (
            recentOrders.map((booking) => (
              <div key={booking._id} className="list-row">
                <div>
                  <strong>Order #{booking._id?.slice(-4) || 'New'}</strong>
                  <p>{booking.serviceId?.name || 'Beauty Service'}</p>
                </div>
                <span className={`status-pill ${booking.status || 'pending'}`}>
                  {booking.status || 'Pending'}
                </span>
              </div>
            ))
          )}
        </section>

        <section className="dashboard-panel">
          <div className="panel-header">
            <h2>Upcoming Booking</h2>
            <span>Next</span>
          </div>

          {nextBooking ? (
            <div className="booking-preview">
              <div className="booking-badge">💇</div>
              <div>
                <strong>{nextBooking.serviceId?.name || 'Beauty Service'}</strong>
                <p>{new Date(nextBooking.date).toLocaleDateString()} • {nextBooking.time}</p>
              </div>
            </div>
          ) : (
            <p className="panel-empty">No upcoming bookings.</p>
          )}
        </section>
      </div>

      <section className="dashboard-panel wide-panel">
        <div className="panel-header">
          <h2>Recommended For You</h2>
          <span>Curated</span>
        </div>

        <div className="recommendation-list">
          {(recommendations.products || []).slice(0, 3).map((product) => (
            <div key={product._id} className="recommend-card">
              <div className="recommend-thumb">✨</div>
              <strong>{product.name}</strong>
              <p>{product.brand}</p>
            </div>
          ))}

          {(recommendations.services || []).slice(0, 2).map((service) => (
            <div key={service._id} className="recommend-card">
              <div className="recommend-thumb">💆</div>
              <strong>{service.name}</strong>
              <p>{service.category}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="dashboard-panel wide-panel">
        <div className="panel-header">
          <h2>Beauty Routine</h2>
          <span>Personalized</span>
        </div>

        <div className="routine-list">
          {(recommendations.routine || []).map((item, index) => (
            <div key={`${item.step}-${index}`} className="routine-item">
              <strong>{item.step}</strong>
              <p>{item.product} • {item.time}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;
