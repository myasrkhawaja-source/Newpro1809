import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Checkout({ cart, token, clearCart }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    if (!token) {
      navigate('/login', { state: { from: '/cart' } });
      return;
    }

    if (!cart.length) {
      setMessage('Your cart is empty');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      for (const item of cart) {
        if (item.type === 'service') {
          await axios.post(
            'http://localhost:5000/api/bookings',
            {
              serviceId: item.id,
              date: new Date().toISOString(),
              time: '10:00',
              notes: 'Checked out from cart'
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
      }

      clearCart();
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

      <div className="cart-summary">
        <div>
          <span>Total</span>
          <strong>₪{total}</strong>
        </div>
        {message && <p className="error-message">{message}</p>}
        <button className="btn btn-primary" onClick={handleCheckout} disabled={loading}>
          {loading ? 'Processing...' : 'Confirm Order'}
        </button>
      </div>
    </div>
  );
}

export default Checkout;
