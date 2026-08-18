import { useState, useEffect } from 'react'
import axios from 'axios'
import './Profile.css'

function Profile({ user, token }) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    skinType: '',
    hairType: '',
    budget: '',
    preferences: {
      style: '',
      occasion: '',
      concerns: []
    }
  })

  useEffect(() => {
    if (token) {
      fetchProfile()
    }
  }, [token])

  const fetchProfile = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/profile', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setProfile(response.data)
      if (response.data) {
        setFormData({
          skinType: response.data.skinType || '',
          hairType: response.data.hairType || '',
          budget: response.data.budget || '',
          preferences: response.data.preferences || { style: '', occasion: '', concerns: [] }
        })
      }
      setLoading(false)
    } catch (err) {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post('http://localhost:5000/api/profile', formData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setProfile(response.data)
      setEditing(false)
    } catch (err) {
      console.error('Error updating profile:', err)
    }
  }

  if (!token) {
    return (
      <div className="profile-container">
        <div className="no-profile">
          <h2>Please Login</h2>
          <p>You need to login to view your profile.</p>
        </div>
      </div>
    )
  }

  if (loading) return <div className="loading">Loading profile...</div>

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>My Profile 👤</h1>
        {!editing && (
          <button onClick={() => setEditing(true)} className="btn btn-primary">Edit Profile</button>
        )}
      </div>

      {!editing ? (
        <div className="profile-content">
          <div className="profile-section">
            <h2>Personal Information</h2>
            <div className="profile-info">
              <div className="info-item">
                <span className="info-label">Name:</span>
                <span className="info-value">{user?.name}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Email:</span>
                <span className="info-value">{user?.email}</span>
              </div>
            </div>
          </div>

          {profile && (
            <div className="profile-section">
              <h2>Beauty Profile</h2>
              <div className="profile-info">
                <div className="info-item">
                  <span className="info-label">Skin Type:</span>
                  <span className="info-value">{profile.skinType}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Hair Type:</span>
                  <span className="info-value">{profile.hairType}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Budget:</span>
                  <span className="info-value">₪{profile.budget}</span>
                </div>
                {profile.preferences && (
                  <>
                    <div className="info-item">
                      <span className="info-label">Style:</span>
                      <span className="info-value">{profile.preferences.style}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Occasion:</span>
                      <span className="info-value">{profile.preferences.occasion}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label>Skin Type</label>
            <select
              value={formData.skinType}
              onChange={(e) => setFormData({...formData, skinType: e.target.value})}
              required
            >
              <option value="">Select skin type</option>
              <option value="oily">Oily</option>
              <option value="dry">Dry</option>
              <option value="combination">Combination</option>
              <option value="sensitive">Sensitive</option>
              <option value="normal">Normal</option>
            </select>
          </div>

          <div className="form-group">
            <label>Hair Type</label>
            <select
              value={formData.hairType}
              onChange={(e) => setFormData({...formData, hairType: e.target.value})}
              required
            >
              <option value="">Select hair type</option>
              <option value="straight">Straight</option>
              <option value="wavy">Wavy</option>
              <option value="curly">Curly</option>
              <option value="coily">Coily</option>
              <option value="damaged">Damaged</option>
            </select>
          </div>

          <div className="form-group">
            <label>Monthly Budget (₪)</label>
            <input
              type="number"
              value={formData.budget}
              onChange={(e) => setFormData({...formData, budget: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>Preferred Style</label>
            <select
              value={formData.preferences.style}
              onChange={(e) => setFormData({
                ...formData,
                preferences: {...formData.preferences, style: e.target.value}
              })}
            >
              <option value="">Select style</option>
              <option value="natural">Natural</option>
              <option value="glamorous">Glamorous</option>
              <option value="bold">Bold/Edgy</option>
              <option value="classic">Classic</option>
            </select>
          </div>

          <div className="form-group">
            <label>Occasion</label>
            <select
              value={formData.preferences.occasion}
              onChange={(e) => setFormData({
                ...formData,
                preferences: {...formData.preferences, occasion: e.target.value}
              })}
            >
              <option value="">Select occasion</option>
              <option value="university">University/Daily</option>
              <option value="party">Party</option>
              <option value="wedding">Wedding</option>
              <option value="work">Work</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">Save Changes</button>
            <button type="button" onClick={() => setEditing(false)} className="btn btn-secondary">Cancel</button>
          </div>
        </form>
      )}
    </div>
  )
}

export default Profile