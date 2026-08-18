import { useEffect, useState } from 'react';
import axios from 'axios';

function OrderHistory({ token }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    const fetchOrders = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/bookings/my-bookings', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrders(response.data || []);
      } catch (error) {
        console.error('Error fetching order history', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

  if (!token) {
    return <div className="dashboard-container"><div className="no-dashboard"><h2>Please Login</h2><p>You need to login to view your order history.</p></div></div>;
  }

  if (loading) return <div className="loading">Loading order history...</div>;

  return (
    <div className="dashboard-container">
      <h1>Order History 🧾</h1>

      {orders.length === 0 ? (
        <div className="no-bookings">
          <p>You have no order history yet.</p>
        </div>
      ) : (
        <div className="bookings-list">
          {orders.map((order) => (
            <div key={order._id} className="booking-card">
              <div className="booking-header">
                <h3>{order.serviceId?.name || 'Beauty Service'}</h3>
                <span className="booking-status" style={{ backgroundColor: order.status === 'cancelled' ? '#ff6b6b' : '#51cf66' }}>
                  {order.status}
                </span>
              </div>

              <div className="booking-details">
                <div className="booking-info">
                  <p>📅 {new Date(order.date).toLocaleDateString()}</p>
                  <p>⏰ {order.time}</p>
                  <p>💰 ₪{order.totalPrice}</p>
                </div>

                {order.serviceId?.description && (
                  <div className="booking-description">
                    <p>{order.serviceId.description}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default OrderHistory;
