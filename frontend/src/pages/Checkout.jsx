import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE } from '../config';

function Checkout({ cart, token, clearCart }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [appointment, setAppointment] = useState({ date: '', time: '' });
  const navigate = useNavigate();

  const productItems = cart.filter((item) => item.type === 'product');
  const serviceItems = cart.filter((item) => item.type === 'service');
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    if (!token) {
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }

    if (!cart.length) {
      setMessage('Your cart is empty');
      return;
    }

    if (serviceItems.length > 0 && (!appointment.date || !appointment.time)) {
      setMessage('Please choose a date and time for your service bookings');
      return;
    }

    setLoading(true);
    setMessage('');

    const errors = [];

    try {
      // 1) شراء المنتجات — طلب واحد لكل المنتجات
      if (productItems.length > 0) {
        try {
          await axios.post(
            `${API_BASE}/orders`,
            {
              items: productItems.map((item) => ({ productId: item.id, quantity: item.quantity })),
              paymentMethod
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } catch (err) {
          errors.push('Products: ' + (err.response?.data?.message || 'order failed'));
        }
      }

      // 2) حجز الخدمات — حجز لكل خدمة بالموعد المختار
      for (const item of serviceItems) {
        try {
          await axios.post(
            `${API_BASE}/bookings`,
            {
              serviceId: item.id,
              date: appointment.date,
              time: appointment.time,
              location: { city: item.location?.city || '' },
              notes: 'Booked from checkout'
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } catch (err) {
          errors.push(`${item.name}: ${err.response?.data?.message || 'booking failed'}`);
        }
      }

      if (errors.length > 0 && errors.length === productItems.length + serviceItems.length) {
        setMessage(errors.join(' | '));
        return;
      }

      clearCart();

      if (errors.length > 0) {
        setMessage('Partially completed: ' + errors.join(' | '));
        navigate('/bookings');
        return;
      }

      navigate('/bookings');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  if (!cart.length) {
    return (
      <div className="cart-empty">
        <h1>Your Cart is Empty 🛍️</h1>
        <p>Add a product or service before checkout.</p>
        <Link to="/products" className="btn btn-primary">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1>Checkout 💳</h1>

      <div className="cart-list">
        {cart.map((item) => (
          <div key={`${item.type}-${item.id}`} className="cart-item">
            <div className="cart-item-image-wrap">
              {item.image ? (
                <img src={item.image} alt={item.name} className="cart-item-image" />
              ) : (
                <div className="cart-item-placeholder">{item.type === 'product' ? '💄' : '💇‍♀️'}</div>
              )}
            </div>
            <div className="cart-item-info">
              <h3>{item.name}</h3>
              <p>{item.type === 'product' ? 'Product' : 'Service'}</p>
            </div>
            <div className="cart-item-controls">
              <span>{item.quantity} x ₪{item.price}</span>
              <p className="cart-item-price">₪{item.price * item.quantity}</p>
            </div>
          </div>
        ))}
      </div>

      {serviceItems.length > 0 && (
        <div className="detail-section" style={{ marginTop: '24px', display: 'grid', gap: '14px' }}>
          <h3 style={{ margin: 0 }}>📅 Appointment for your services</h3>
          <p style={{ margin: 0, color: '#666' }}>
            Choose one date and time — it will be applied to all {serviceItems.length} service booking(s).
          </p>

          <div className="form-group">
            <label htmlFor="checkout-date">📅 Date</label>
            <input
              id="checkout-date"
              type="date"
              value={appointment.date}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setAppointment({ ...appointment, date: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="checkout-time">⏰ Time (working hours 09:00 - 20:00)</label>
            <input
              id="checkout-time"
              type="time"
              value={appointment.time}
              min="09:00"
              max="20:00"
              onChange={(e) => setAppointment({ ...appointment, time: e.target.value })}
              required
            />
          </div>
        </div>
      )}

      <div className="detail-section" style={{ marginTop: '24px' }}>
        <h3>💳 Payment Method</h3>
        <div className="form-group">
          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
            <option value="card">💳 Credit Card</option>
            <option value="paypal">🅿️ PayPal</option>
            <option value="wallet">👛 Digital Wallet</option>
            <option value="cash">💵 Cash on Delivery</option>
          </select>
        </div>
      </div>

      <div className="cart-summary">
        <div>
          <span>Total</span>
          <strong>₪{total}</strong>
        </div>
        {message && <p className="error-message">{message}</p>}
        <button className="btn btn-primary" onClick={handleCheckout} disabled={loading}>
          {loading ? 'Processing...' : `Confirm Order (₪${total})`}
        </button>
      </div>
    </div>
  );
}

export default Checkout;
