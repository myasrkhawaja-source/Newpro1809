import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

function ServiceDetails({ addToCart }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [service, setService] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchService = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/services/${id}`)
        setService(response.data)
      } catch (err) {
        setError('Service not found or could not be loaded.')
      } finally {
        setLoading(false)
      }
    }

    fetchService()
  }, [id])

  const handleBookNow = () => {
    addToCart(service, 'service')
    navigate('/cart')
  }

  if (loading) return <div className="loading">Loading service details...</div>
  if (error) return <div className="error">{error}</div>
  if (!service) return null

  return (
    <div className="detail-page">
      <div className="detail-card">
        <div className="detail-image-wrap">
          {service.images?.[0] ? (
            <img src={service.images[0]} alt={service.name} className="detail-image" />
          ) : (
            <div className="detail-placeholder">💇‍♀️</div>
          )}
        </div>

        <div className="detail-content">
          <p className="detail-category">{service.category}</p>
          <h1>{service.name}</h1>
          <div className="detail-price-row">
            <span className="detail-price">₪{service.price}</span>
            <span className="detail-duration">⏱️ {service.duration} min</span>
          </div>

          <p className="detail-description">{service.description}</p>

          <div className="detail-meta-grid">
            <div>
              <strong>Provider</strong>
              <p>{service.providerId?.name || 'Beauty Professional'}</p>
            </div>
            <div>
              <strong>Location</strong>
              <p>{service.location?.city || 'City available'}</p>
            </div>
            <div>
              <strong>Rating</strong>
              <p>⭐ {service.rating || 0} ({service.reviewCount || 0} reviews)</p>
            </div>
            <div>
              <strong>Availability</strong>
              <p>{service.available === false ? 'Unavailable' : 'Available now'}</p>
            </div>
          </div>

          {service.location?.address && (
            <div className="detail-section">
              <h3>Address</h3>
              <p>{service.location.address}</p>
            </div>
          )}

          <div className="detail-actions">
            <button className="btn btn-primary" onClick={handleBookNow}>Book Now</button>
            <Link to="/services" className="btn btn-secondary">Back to Services</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ServiceDetails
