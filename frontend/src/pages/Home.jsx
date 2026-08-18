import { Link } from 'react-router-dom'
import './Home.css'

function Home() {
  return (
    <div className="home">
      <div className="hero">
        <h1>Welcome to Beauty Hub 💕</h1>
        <p>Your personal beauty companion - discover products, services, and personalized recommendations</p>
        <div className="hero-buttons">
          <Link to="/quiz" className="btn btn-primary">Take Beauty Quiz</Link>
          <Link to="/products" className="btn btn-secondary">Shop Products</Link>
        </div>
      </div>

      <div className="features">
        <div className="feature-card">
          <div className="feature-icon">🧴</div>
          <h3>Personalized Products</h3>
          <p>Get product recommendations based on your skin type, hair type, and preferences</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">💄</div>
          <h3>Beauty Services</h3>
          <p>Book appointments with top beauty professionals near you</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">✨</div>
          <h3>Custom Routines</h3>
          <p>Receive a complete beauty routine tailored just for you</p>
        </div>
      </div>

      <div className="cta-section">
        <h2>Ready to discover your perfect beauty routine?</h2>
        <Link to="/quiz" className="btn btn-primary">Start Quiz Now</Link>
      </div>
    </div>
  )
}

export default Home