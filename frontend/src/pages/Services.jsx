import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import './Services.css'

function Services({ addToCart, token, user }) {
  const [services, setServices] = useState([])
  const [filteredServices, setFilteredServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [city, setCity] = useState('')
  const [bookingModal, setBookingModal] = useState(null)
  const [bookingData, setBookingData] = useState({
    date: '',
    time: '',
    city: '',
    notes: ''
  })
  const [bookingLoading, setBookingLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchServices()
  }, [])

  useEffect(() => {
    filterServices()
  }, [search, category, city, services])

  const fetchServices = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/services')
      setServices(response.data)
      setFilteredServices(response.data)
      setLoading(false)
    } catch (err) {
      setError('Error fetching services')
      setLoading(false)
    }
  }

  const filterServices = () => {
    let filtered = services

    if (search) {
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(search.toLowerCase()) ||
        service.description.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (category) {
      filtered = filtered.filter(service => service.category === category)
    }

    if (city) {
      filtered = filtered.filter(service => service.location?.city === city)
    }

    setFilteredServices(filtered)
  }

  const handleBookNow = (service) => {
    if (!token) {
      navigate('/login')
      return
    }
    setBookingModal(service)
    setBookingData({ date: '', time: '', city: '', notes: '' })
  }

  const handleBookingSubmit = async (e) => {
    e.preventDefault()
    if (!bookingModal || !token) return

    setBookingLoading(true)
    try {
      const bookingPayload = {
        serviceId: bookingModal._id,
        date: bookingData.date,
        time: bookingData.time,
        location: {
          city: bookingData.city || bookingModal.location?.city || ''
        },
        notes: bookingData.notes
      }

      const response = await axios.post('http://localhost:5000/api/bookings', bookingPayload, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.status === 201) {
        setBookingModal(null)
        setBookingData({ date: '', time: '', city: '', notes: '' })
        navigate('/bookings')
      }
    } catch (err) {
      console.error('Booking error:', err)
      alert('Failed to create booking. Please try again.')
    } finally {
      setBookingLoading(false)
    }
  }

  if (loading) return <div className="loading">Loading services...</div>
  if (error) return <div className="error">{error}</div>

  return (
    <div className="services-page">
      <h1>Beauty Services 💇‍♀️</h1>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search services..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="filters">
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          <option value="makeup">Makeup</option>
          <option value="nails">Nails</option>
          <option value="hair">Hair</option>
          <option value="skincare">Skincare</option>
          <option value="massage">Massage</option>
        </select>

        <select value={city} onChange={(e) => setCity(e.target.value)}>
          <option value="">All Cities</option>
          <option value="Nazareth">Nazareth</option>
          <option value="Haifa">Haifa</option>
          <option value="Tel Aviv">Tel Aviv</option>
          <option value="Jerusalem">Jerusalem</option>
        </select>
      </div>

      {filteredServices.length === 0 ? (
        <div className="no-services">
          <p>No services found matching your criteria.</p>
        </div>
      ) : (
        <div className="services-grid">
          {filteredServices.map(service => (
            <div key={service._id} className="service-card">
              <div className="service-image">
                {service.images?.[0] ? (
                  <img src={service.images[0]} alt={service.name} />
                ) : (
                  <div className="placeholder-image">💄</div>
                )}
              </div>
              <div className="service-content">
                <h3>{service.name}</h3>
                <p className="service-category">{service.category}</p>
                <p className="service-description">{service.description}</p>
                <div className="service-details">
                  <span className="service-price">₪{service.price}</span>
                  <span className="service-duration">⏱️ {service.duration} min</span>
                </div>
                <div className="service-provider">
                  <p>👤 {service.providerId?.name || 'Beauty Professional'}</p>
                  {service.location?.city && (
                    <p>📍 {service.location.city}</p>
                  )}
                </div>
                <div className="service-rating">
                  <span className="rating">⭐ {service.rating || 0}</span>
                  <span className="reviews">({service.reviewCount || 0} reviews)</span>
                </div>
                <div className="service-actions">
                  <Link to={`/services/${service._id}`} className="btn btn-secondary service-link-button">
                    View Details
                  </Link>
                  <button className="btn btn-primary service-button" onClick={() => handleBookNow(service)}>
                    📅 Book Service
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {bookingModal && (
        <div className="booking-modal-overlay" onClick={() => setBookingModal(null)}>
          <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
            <button className="booking-modal-close" onClick={() => setBookingModal(null)}>×</button>

            <div className="booking-modal-header">
              <h2>Book {bookingModal.name}</h2>
              <p className="booking-service-info">⏱️ {bookingModal.duration} min • ₪{bookingModal.price}</p>
            </div>

            <form onSubmit={handleBookingSubmit} className="booking-form">
              <div className="form-group">
                <label htmlFor="date">📅 Date</label>
                <input
                  id="date"
                  type="date"
                  value={bookingData.date}
                  onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="time">⏰ Time</label>
                <input
                  id="time"
                  type="time"
                  value={bookingData.time}
                  onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="city">📍 Location / City</label>
                <select
                  id="city"
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
                <label htmlFor="notes">📝 Notes (optional)</label>
                <textarea
                  id="notes"
                  placeholder="Any special requests or preferences..."
                  value={bookingData.notes}
                  onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                  rows="3"
                />
              </div>

              <div className="booking-modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setBookingModal(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={bookingLoading}
                >
                  {bookingLoading ? 'Booking...' : 'Confirm Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Services