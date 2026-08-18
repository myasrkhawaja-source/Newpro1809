import { useEffect, useState } from 'react';
import axios from 'axios';

function NotificationCenter({ token }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    const fetchNotifications = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/notifications', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotifications(response.data || []);
      } catch (error) {
        console.error('Error fetching notifications', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [token]);

  const markAsRead = async (id) => {
    if (!token) return;

    try {
      await axios.patch(`http://localhost:5000/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setNotifications((current) =>
        current.map((notification) =>
          notification._id === id ? { ...notification, read: true } : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read', error);
    }
  };

  if (!token) {
    return <div className="dashboard-container"><div className="no-dashboard"><h2>Please Login</h2><p>You need to login to view your notifications.</p></div></div>;
  }

  if (loading) return <div className="loading">Loading notifications...</div>;

  return (
    <div className="dashboard-container">
      <h1>Notifications 🔔</h1>

      {notifications.length === 0 ? (
        <div className="no-bookings">
          <p>You have no notifications yet.</p>
        </div>
      ) : (
        <div className="bookings-list">
          {notifications.map((notification) => (
            <div key={notification._id} className="booking-card" style={{ borderLeft: notification.read ? '4px solid #c7c5d5' : '4px solid #5d4ee8' }}>
              <div className="booking-header">
                <h3>{notification.title}</h3>
                {!notification.read && <span className="booking-status" style={{ backgroundColor: '#5d4ee8' }}>New</span>}
              </div>
              <p style={{ color: '#5b5870', marginTop: '10px' }}>{notification.message}</p>
              {!notification.read && (
                <button className="btn btn-secondary" style={{ marginTop: '15px' }} onClick={() => markAsRead(notification._id)}>
                  Mark as read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default NotificationCenter;
