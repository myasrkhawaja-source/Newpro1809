import { useState } from 'react'
import { Link } from 'react-router-dom'
import './Header.css'

function Header({ user, setUser, token, setToken, cart }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('beautyhub-user')
    setToken(null)
    setUser(null)
    setAccountMenuOpen(false)
  }

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0)

  const navLinks = (
    <>
      <Link to="/">Home</Link>
      <Link to="/products">Products</Link>
      <Link to="/services">Services</Link>
      <Link to="/quiz">Quiz</Link>
      <Link to="/cart">Cart {cartCount > 0 ? `(${cartCount})` : ''}</Link>
    </>
  )

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">💄 Beauty Hub</Link>

        <button
          type="button"
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation"
        >
          ☰
        </button>

        <nav className={`nav-links ${mobileMenuOpen ? 'open' : ''}`}>
          {navLinks}

          {token ? (
            <div className="account-menu">
              <button
                type="button"
                className="account-trigger"
                onClick={() => setAccountMenuOpen(!accountMenuOpen)}
              >
                Account ▾
              </button>

              {accountMenuOpen && (
                <div className="account-dropdown">
                  <Link to="/user-dashboard" onClick={() => setAccountMenuOpen(false)}>Dashboard</Link>
                  <Link to="/profile" onClick={() => setAccountMenuOpen(false)}>Profile</Link>
                  <Link to="/favorites" onClick={() => setAccountMenuOpen(false)}>Favorites</Link>
                  <Link to="/bookings" onClick={() => setAccountMenuOpen(false)}>Bookings</Link>
                  <Link to="/order-history" onClick={() => setAccountMenuOpen(false)}>Orders</Link>
                  <Link to="/notifications" onClick={() => setAccountMenuOpen(false)}>Notifications</Link>
                  {user?.role === 'admin' && (
                    <Link to="/admin" onClick={() => setAccountMenuOpen(false)}>Admin</Link>
                  )}
                  <button onClick={handleLogout} className="logout-button">Logout</button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register" className="btn btn-primary">Sign Up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Header