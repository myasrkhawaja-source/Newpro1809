import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { API_BASE } from '../config'

function ProductDetails({ addToCart, token }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reviews, setReviews] = useState([])
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' })

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`${API_BASE}/products/${id}`)
        setProduct(response.data)
        const reviewResponse = await axios.get(`${API_BASE}/reviews/product/${id}`)
        setReviews(reviewResponse.data)
      } catch (err) {
        setError('Product not found or could not be loaded.')
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  const handleAddToCart = () => {
    addToCart(product, 'product')
    navigate('/cart')
  }

  const handleAddToFavorites = async () => {
    if (!token) {
      navigate('/login', { state: { from: `/products/${id}` } })
      return
    }
    try {
      await axios.post(`${API_BASE}/favorites`, {
        itemId: id,
        itemType: 'product'
      }, { headers: { Authorization: `Bearer ${token}` } })
      alert('Added to your favorites ❤️')
    } catch (err) {
      alert(err.response?.data?.message || 'Could not add to favorites')
    }
  }

  const handleReviewSubmit = async (event) => {
    event.preventDefault()

    if (!token) {
      navigate('/login', { state: { from: `/products/${id}` } })
      return
    }

    try {
      await axios.post(`${API_BASE}/reviews`, {
        targetType: 'product',
        targetId: id,
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      const reviewResponse = await axios.get(`${API_BASE}/reviews/product/${id}`)
      setReviews(reviewResponse.data)
      setReviewForm({ rating: 5, comment: '' })
    } catch (err) {
      setError('Unable to submit your review right now.')
    }
  }

  if (loading) return <div className="loading">Loading product details...</div>
  if (error) return <div className="error">{error}</div>
  if (!product) return null

  return (
    <div className="detail-page">
      <div className="detail-card">
        <div className="detail-image-wrap">
          {product.image ? (
            <img src={product.image} alt={product.name} className="detail-image" />
          ) : (
            <div className="detail-placeholder">💄</div>
          )}
        </div>

        <div className="detail-content">
          <p className="detail-category">{product.category}</p>
          <h1>{product.name}</h1>
          <p className="detail-brand">{product.brand}</p>
          <div className="detail-price-row">
            <span className="detail-price">₪{product.price}</span>
            {product.originalPrice && (
              <span className="detail-original-price">₪{product.originalPrice}</span>
            )}
          </div>

          <p className="detail-description">{product.description}</p>

          <div className="detail-meta-grid">
            <div>
              <strong>Rating</strong>
              <p>⭐ {product.rating || 0} ({product.reviewCount || 0} reviews)</p>
            </div>
            <div>
              <strong>Availability</strong>
              <p>{product.inStock === false ? 'Out of stock' : 'In stock'}</p>
            </div>
          </div>

          {product.ingredients?.length > 0 && (
            <div className="detail-section">
              <h3>Ingredients</h3>
              <ul>
                {product.ingredients.map((ingredient, index) => (
                  <li key={`${ingredient}-${index}`}>{ingredient}</li>
                ))}
              </ul>
            </div>
          )}

          {product.skinTypes?.length > 0 && (
            <div className="detail-section">
              <h3>Suitable for</h3>
              <div className="tag-list">
                {product.skinTypes.map((type, index) => (
                  <span key={`${type}-${index}`} className="tag">{type}</span>
                ))}
              </div>
            </div>
          )}

          <div className="detail-actions">
            <button className="btn btn-primary" onClick={handleAddToCart}>Add to Cart</button>
            <button className="btn btn-secondary" onClick={handleAddToFavorites}>❤ Favorite</button>
            <Link to="/products" className="btn btn-secondary">Back to Products</Link>
          </div>
        </div>
      </div>

      <div className="detail-card" style={{ marginTop: '24px', padding: '24px' }}>
        <div style={{ width: '100%' }}>
          <h2 style={{ marginBottom: '16px' }}>Customer Reviews</h2>

          <form onSubmit={handleReviewSubmit} style={{ marginBottom: '24px' }}>
            <div className="form-group">
              <label htmlFor="rating">Your rating</label>
              <select id="rating" value={reviewForm.rating} onChange={(e) => setReviewForm({ ...reviewForm, rating: e.target.value })}>
                <option value="5">5 - Excellent</option>
                <option value="4">4 - Very Good</option>
                <option value="3">3 - Good</option>
                <option value="2">2 - Fair</option>
                <option value="1">1 - Poor</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="comment">Your review</label>
              <textarea id="comment" rows="4" value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} placeholder="Tell others what you liked..." required />
            </div>

            <button type="submit" className="btn btn-primary">Submit Review</button>
          </form>

          {reviews.length === 0 ? (
            <p>No reviews yet. Be the first to review this product.</p>
          ) : (
            <div style={{ display: 'grid', gap: '12px' }}>
              {reviews.map((review) => (
                <div key={review._id} style={{ padding: '16px', borderRadius: '12px', background: '#f6f3ff', border: '1px solid #e6e0ff' }}>
                  <strong>{review.userId?.name || 'Customer'}</strong>
                  <p style={{ margin: '8px 0', color: '#5d4ee8' }}>⭐ {review.rating}/5</p>
                  <p>{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductDetails
