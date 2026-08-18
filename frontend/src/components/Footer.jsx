import './Footer.css'

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-content">
        <div className="footer-brand">
          <h3>💄 Beauty Hub</h3>
          <p>Your beauty companion for smart choices, self-care, and confidence.</p>
        </div>

        <div className="footer-links">
          <div>
            <h4>Explore</h4>
            <ul>
              <li>Products</li>
              <li>Services</li>
              <li>Beauty Quiz</li>
            </ul>
          </div>

          <div>
            <h4>Support</h4>
            <ul>
              <li>Help Center</li>
              <li>Booking</li>
              <li>Privacy</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 Beauty Hub</span>
        <span>Made with care for your glow ✨</span>
      </div>
    </footer>
  )
}

export default Footer
