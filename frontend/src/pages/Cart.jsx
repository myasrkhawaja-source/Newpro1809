import { Link } from 'react-router-dom'

function Cart({ cart, updateCartItem, removeFromCart, token, clearCart }) {
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  if (cart.length === 0) {
    return (
      <div className="cart-empty">
        <h1>Your Cart is Empty 🛍️</h1>
        <p>Add a product or service to get started.</p>
        <Link to="/products" className="btn btn-primary">Browse Products</Link>
      </div>
    )
  }

  return (
    <div className="cart-page">
      <h1>Your Cart 🛍️</h1>

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
              <p className="cart-item-type">{item.type === 'product' ? 'Product' : 'Service'}</p>
              {item.duration && <p>⏱️ {item.duration} min</p>}
              <p>{item.details}</p>
            </div>

            <div className="cart-item-controls">
              <div className="quantity-box">
                <button onClick={() => updateCartItem(item.id, item.type, -1)}>-</button>
                <span>{item.quantity}</span>
                <button onClick={() => updateCartItem(item.id, item.type, 1)}>+</button>
              </div>
              <p className="cart-item-price">₪{item.price * item.quantity}</p>
              <button className="btn btn-secondary small-btn" onClick={() => removeFromCart(item.id, item.type)}>
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="cart-summary">
        <div>
          <span>Total</span>
          <strong>₪{total}</strong>
        </div>
        <Link to={token ? '/checkout' : '/login'} state={token ? undefined : { from: '/checkout' }} className="btn btn-primary">
          Checkout
        </Link>
      </div>
    </div>
  )
}

export default Cart
