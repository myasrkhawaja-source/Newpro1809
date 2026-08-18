import { useState, useEffect } from 'react'
import axios from 'axios'
import './Bookings.css'

function Bookings({ token }) {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)
  const [reviewModal, setReviewModal] = useState(null)
  const [reviewData, setReviewData] = useState({ rating: 5, text: '' })
  const [paymentModal, setPaymentModal] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('card')

  useEffect(() => {
    if (token) {
      fetchBookings()
    }
  }, [token])

  const fetchBookings = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/bookings/my-bookings', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setBookings(response.data)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching bookings:', err)
      setLoading(false)
    }
  }

  const cancelBooking = async (id) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await axios.delete(`http://localhost:5000/api/bookings/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setBookings(bookings.map(b => b._id === id ? { ...b, status: 'cancelled' } : b))
      } catch (err) {
        alert('Error cancelling booking: ' + err.response?.data?.message)
      }
    }
  }

  const handleReviewSubmit = async (bookingId) => {
    try {
      await axios.post(`http://localhost:5000/api/bookings/${bookingId}/review`, reviewData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setBookings(bookings.map(b => 
        b._id === bookingId ? { ...b, review: reviewData } : b
      ))
      setReviewModal(null)
      setReviewData({ rating: 5, text: '' })
    } catch (err) {
      alert('Error submitting review: ' + err.response?.data?.message)
    }
  }

  const handlePayment = async (bookingId) => {
    try {
      await axios.post(`http://localhost:5000/api/bookings/${bookingId}/payment`, 
        { paymentMethod },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setBookings(bookings.map(b => 
        b._id === bookingId ? { ...b, paymentStatus: 'paid', status: 'confirmed' } : b
      ))
      setPaymentModal(null)
      setPaymentMethod('card')
    } catch (err) {
      alert('Error processing payment: ' + err.response?.data?.message)
    }
  }

  if (!token) {
    return (
      <div className="bookings-container">
        <div className="no-bookings">
          <h2>Please Login</h2>
          <p>You need to login to view your bookings.</p>
        </div>
      </div>
    )
  }

  if (loading) return <div className="loading">Loading bookings...</div>

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: '#fff3cd', text: '#856404', icon: '⏳' },
      confirmed: { bg: '#d4edda', text: '#155724', icon: '✅' },
      completed: { bg: '#cce5ff', text: '#004085', icon: '✨' },
      cancelled: { bg: '#f8d7da', text: '#721c24', icon: '❌' }
    }
    return badges[status] || badges.pending
  }

  return (
    <div className="bookings-container">
      <div className="bookings-header">
        <div>
          <h1>My Bookings 📅</h1>
          <p className="bookings-subtitle">Manage your service bookings and appointments</p>
        </div>
        <div className="booking-stats">
          <div className="stat">
            <span className="stat-number">{bookings.filter(b => b.status === 'confirmed').length}</span>
            <span className="stat-label">Confirmed</span>
          </div>
          <div className="stat">
            <span className="stat-number">{bookings.filter(b => b.status === 'pending').length}</span>
            <span className="stat-label">Pending</span>
          </div>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="no-bookings">
          <p>You haven't made any bookings yet.</p>
          <a href="/services" className="btn btn-primary">Browse Services</a>
        </div>
      ) : (
        <div className="bookings-grid">
          {bookings.map(booking => {
            const statusBadge = getStatusBadge(booking.status)
            const isExpanded = expandedId === booking._id
            return (
              <div key={booking._id} className={`booking-card ${booking.status}`}>
                <div className="booking-card-header">
                  <div>
                    <h3>{booking.serviceId?.name || 'Beauty Service'}</h3>
                    <p className="booking-date-time">
                      📅 {new Date(booking.date).toLocaleDateString()} • ⏰ {booking.time}
                    </p>
                  </div>
                  <div 
                    className="status-badge" 
                    style={{ backgroundColor: statusBadge.bg, color: statusBadge.text }}
                  >
                    {statusBadge.icon} {booking.status}
                  </div>
                </div>

                <div className="booking-card-content">
                  <div className="booking-info-grid">
                    <div className="info-item">
                      <span className="info-label">Duration</span>
                      <span className="info-value">⏱️ {booking.serviceId?.duration || '—'} min</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Price</span>
                      <span className="info-value price">₪{booking.totalPrice}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Location</span>
                      <span className="info-value">📍 {booking.location?.city || 'TBA'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Payment</span>
                      <span className={`payment-status ${booking.paymentStatus}`}>
                        {booking.paymentStatus === 'paid' ? '✅ Paid' : '⏳ Pending'}
                      </span>
                    </div>
                  </div>

                  {booking.providerId && (
                    <div className="provider-info">
                      <p>👤 Provider: <strong>{booking.providerId.name}</strong></p>
                      <p>📧 {booking.providerId.email}</p>
                    </div>
                  )}

                  {booking.notes && (
                    <div className="booking-notes">
                      <p className="notes-label">📝 Notes:</p>
                      <p>{booking.notes}</p>
                    </div>
                  )}

                  {isExpanded && (
                    <div className="expanded-section">
                      <div className="section-divider"></div>
                      
                      {booking.review ? (
                        <div className="review-section">
                          <h4>Your Review</h4>
                          <div className="review-rating">
                            {'⭐'.repeat(booking.review.rating)}
                            <span className="rating-text"> ({booking.review.rating}/5)</span>
                          </div>
                          <p>{booking.review.text}</p>
                          <p className="review-date">
                            Reviewed on {new Date(booking.review.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      ) : (
                        booking.status === 'completed' && (
                          <button
                            onClick={() => setReviewModal(booking._id)}
                            className="btn btn-secondary"
                          >
                            ⭐ Add Review
                          </button>
                        )
                      )}
                    </div>
                  )}
                </div>

                <div className="booking-actions">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : booking._id)}
                    className="btn btn-secondary"
                  >
                    {isExpanded ? 'Collapse' : 'Details'}
                  </button>

                  {booking.paymentStatus === 'pending' && booking.status !== 'cancelled' && (
                    <button
                      onClick={() => setPaymentModal(booking._id)}
                      className="btn btn-primary"
                    >
                      💳 Pay Now
                    </button>
                  )}

                  {booking.status === 'pending' && (
                    <button
                      onClick={() => cancelBooking(booking._id)}
                      className="btn btn-danger"
                    >
                      ❌ Cancel
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Review Modal */}
      {reviewModal && (
        <div className="modal-overlay" onClick={() => setReviewModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setReviewModal(null)}>×</button>
            <h3>Share Your Review ⭐</h3>
            
            <div className="rating-selector">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => setReviewData({ ...reviewData, rating: star })}
                  className={`star-btn ${reviewData.rating >= star ? 'active' : ''}`}
                >
                  ⭐
                </button>
              ))}
            </div>

            <textarea
              placeholder="Share your experience with this service..."
              value={reviewData.text}
              onChange={(e) => setReviewData({ ...reviewData, text: e.target.value })}
              rows="4"
            />

            <div className="modal-actions">
              <button onClick={() => setReviewModal(null)} className="btn btn-secondary">
                Cancel
              </button>
              <button 
                onClick={() => handleReviewSubmit(reviewModal)} 
                className="btn btn-primary"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {paymentModal && (
        <div className="modal-overlay" onClick={() => setPaymentModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setPaymentModal(null)}>×</button>
            <h3>Complete Payment 💳</h3>
            
            <div className="payment-info">
              <p>Amount: <strong>₪{bookings.find(b => b._id === paymentModal)?.totalPrice}</strong></p>
            </div>

            <div className="payment-methods">
              <label className="payment-method">
                <input
                  type="radio"
                  name="method"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                💳 Credit Card
              </label>
              <label className="payment-method">
                <input
                  type="radio"
                  name="method"
                  value="paypal"
                  checked={paymentMethod === 'paypal'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                🅿️ PayPal
              </label>
              <label className="payment-method">
                <input
                  type="radio"
                  name="method"
                  value="wallet"
                  checked={paymentMethod === 'wallet'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                👛 Digital Wallet
              </label>
            </div>

            <div className="modal-actions">
              <button onClick={() => setPaymentModal(null)} className="btn btn-secondary">
                Cancel
              </button>
              <button 
                onClick={() => handlePayment(paymentModal)} 
                className="btn btn-primary"
              >
                Pay ₪{bookings.find(b => b._id === paymentModal)?.totalPrice}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Bookings