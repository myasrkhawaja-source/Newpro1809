import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE } from '../config';

function OrderHistory({ token }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    const fetchOrders = async () => {
      try {
        const response = await axios.get(`${API_BASE}/orders/my-orders`, {
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
          <a href="/products" className="btn btn-primary">Browse Products</a>
        </div>
      ) : (
        <div className="bookings-list">
          {orders.map((order) => (
            <div key={order._id} className="booking-card">
              <div className="booking-header">
                <h3>🛍️ Order #{order._id?.slice(-6)}</h3>
                <span
                  className="booking-status"
                  style={{ backgroundColor: order.status === 'cancelled' ? '#ff6b6b' : '#51cf66' }}
                >
                  {order.status}
                </span>
              </div>

              <div className="booking-details">
                {order.items?.map((item, index) => (
                  <div className="booking-info" key={`${item.product}-${index}`}>
                    <p>💄 {item.name}</p>
                    <p>{item.quantity} × ₪{item.price} = ₪{item.price * item.quantity}</p>
                  </div>
                ))}

                <div className="booking-info" style={{ borderTop: '1px solid #e6e0ff', paddingTop: '8px' }}>
                  <p><strong>Total: ₪{order.totalPrice}</strong></p>
                  <p>💳 {order.paymentMethod || 'card'} • {order.paymentStatus}</p>
                  <p>📅 {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default OrderHistory;

