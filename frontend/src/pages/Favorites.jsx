import { useState, useEffect } from 'react'
import axios from 'axios'
import './Favorites.css'
import { API_BASE } from '../config'

function Favorites({ token }) {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      fetchFavorites()
    }
  }, [token])

  const fetchFavorites = async () => {
    try {
      const response = await axios.get(`${API_BASE}/favorites`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setFavorites(response.data)
      setLoading(false)
    } catch (err) {
      setLoading(false)
    }
  }

  const removeFavorite = async (id) => {
    try {
      await axios.delete(`${API_BASE}/favorites/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setFavorites(favorites.filter(fav => fav._id !== id))
    } catch (err) {
      console.error('Error removing favorite:', err)
    }
  }

  if (!token) {
    return (
      <div className="favorites-container">
        <div className="no-favorites">
          <h2>Please Login</h2>
          <p>You need to login to view your favorites.</p>
        </div>
      </div>
    )
  }

  if (loading) return <div className="loading">Loading favorites...</div>

  return (
    <div className="favorites-container">
      <h1>My Favorites ❤️</h1>
      
      {favorites.length === 0 ? (
        <div className="no-favorites">
          <p>You haven't added any favorites yet.</p>
          <a href="/products" className="btn btn-primary">Browse Products</a>
        </div>
      ) : (
        <div className="favorites-grid">
          {favorites.map(favorite => (
            <div key={favorite._id} className="favorite-card">
              <div className="favorite-item">
                <h3>{favorite.itemId?.name || 'Item'}</h3>
                <p className="favorite-type">{favorite.itemType}</p>
                {favorite.itemId?.price && (
                  <p className="favorite-price">₪{favorite.itemId.price}</p>
                )}
                <button 
                  onClick={() => removeFavorite(favorite._id)}
                  className="btn btn-secondary"
                  style={{width: '100%', marginTop: '10px'}}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Favorites