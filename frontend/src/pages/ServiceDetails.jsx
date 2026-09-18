import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { API_BASE } from '../config'

function ServiceDetails({ addToCart, token }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [service, setService] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [bookingData, setBookingData] = useState({ date: '', time: '', city: '', notes: '' })
  const [bookingLoading, setBookingLoading] = useState(false)
  const [bookingError, setBookingError] = useState('')

  useEffect(() => {
    const fetchService = async () => {
      try {
        const response = await axios.get(`${API_BASE}/services/${id}`)
        setService(response.data)
      } catch (err) {
        setError('Service not found or could not be loaded.')
      } finally {
        setLoading(false)
      }
    }

    fetchService()
  }, [id])

  const handleAddToCart = () => {
    addToCart(service, 'service')
    navigate('/cart')
  }

  const handleAddToFavorites = async () => {
    if (!token) {
      navigate('/login', { state: { from: `/services/${id}` } })
      return
    }
    try {
      await axios.post(`${API_BASE}/favorites`, {
        itemId: id,
        itemType: 'service'
      }, { headers: { Authorization: `Bearer ${token}` } })
      alert('Added to your favorites ❤️')
    } catch (err) {
      alert(err.response?.data?.message || 'Could not add to favorites')
    }
  }

  const startBooking = () => {
    if (!token) {
      navigate('/login', { state: { from: `/services/${id}` } })
      return
    }
    setShowBookingForm(true)
    setBookingError('')
  }

  const handleBookingSubmit = async (e) => {
    e.preventDefault()
    if (!token) return

    setBookingLoading(true)
    setBookingError('')

    try {
      await axios.post(`${API_BASE}/bookings`, {
        serviceId: id,
        date: bookingData.date,
        time: bookingData.time,
        location: { city: bookingData.city || service.location?.city || '' },
        notes: bookingData.notes
      }, { headers: { Authorization: `Bearer ${token}` } })

      setShowBookingForm(false)
      navigate('/bookings')
    } catch (err) {
      setBookingError(err.response?.data?.message || 'Failed to create booking. Please try again.')
    } finally {
      setBookingLoading(false)
    }
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
            <button className="btn btn-primary" onClick={startBooking}>📅 Book Now</button>
            <button className="btn btn-secondary" onClick={handleAddToCart}>🛍️ Add to Cart</button>
            <button className="btn btn-secondary" onClick={handleAddToFavorites}>❤ Favorite</button>
            <Link to="/services" className="btn btn-secondary">Back</Link>
          </div>

          {showBookingForm && (
            <form onSubmit={handleBookingSubmit} className="detail-section" style={{ marginTop: '24px', display: 'grid', gap: '14px' }}>
              <h3 style={{ margin: 0 }}>📅 Choose Your Appointment</h3>
              {bookingError && <p className="error-message" style={{ margin: 0 }}>{bookingError}</p>}

              <div className="form-group">
                <label htmlFor="booking-date">📅 Date</label>
                <input
                  id="booking-date"
                  type="date"
                  value={bookingData.date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="booking-time">⏰ Time (working hours 09:00 - 20:00)</label>
                <input
                  id="booking-time"
                  type="time"
                  value={bookingData.time}
                  min="09:00"
                  max="20:00"
                  onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="booking-city">📍 City</label>
                <select
                  id="booking-city"
                  value={bookingData.city}
                  onChange={(e) => setBookingData({ ...bookingData, city: e.target.value })}
                  required
                >
                  <option value="">Select a city</option>
                  <option value="Nazareth">Nazareth</option>
                  <option value="Haifa">Haifa</option>
                  <option value="Tel Aviv">Tel Aviv</option>
                  <option value="Jerusalem">Jerusalem</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="booking-notes">📝 Notes (optional)</label>
                <textarea
                  id="booking-notes"
                  rows="3"
                  placeholder="Any special requests or preferences..."
                  value={bookingData.notes}
                  onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={bookingLoading}>
                {bookingLoading ? 'Booking...' : `Confirm Booking (₪${service.price})`}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default ServiceDetails
