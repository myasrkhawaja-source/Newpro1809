import { useLocation } from 'react-router-dom'
import './Recommendations.css'

function Recommendations() {
  const location = useLocation()
  const profile = location.state?.profile

  if (!profile) {
    return (
      <div className="recommendations-container">
        <div className="no-profile">
          <h2>No Profile Found</h2>
          <p>Please complete the beauty quiz first to get personalized recommendations.</p>
          <a href="/quiz" className="btn btn-primary">Take Quiz</a>
        </div>
      </div>
    )
  }

  // Generate routine based on profile
  const generateRoutine = () => {
    const routine = []
    
    routine.push({ step: 'Cleanser', product: 'Gentle Cleanser', time: 'Morning & Night' })
    
    if (profile.skinType === 'oily') {
      routine.push({ step: 'Toner', product: 'Oil-Control Toner', time: 'Morning & Night' })
    } else if (profile.skinType === 'dry') {
      routine.push({ step: 'Serum', product: 'Hydrating Serum', time: 'Morning & Night' })
    } else if (profile.skinType === 'sensitive') {
      routine.push({ step: 'Serum', product: 'Calming Serum', time: 'Morning & Night' })
    }
    
    routine.push({ step: 'Moisturizer', product: 'Daily Moisturizer', time: 'Morning & Night' })
    routine.push({ step: 'Sunscreen', product: 'SPF 30+', time: 'Morning only' })

    if (profile.preferences?.occasion === 'Wedding' || profile.preferences?.style === 'Glamorous') {
      routine.push({ step: 'Primer', product: 'Makeup Primer', time: 'Before makeup' })
      routine.push({ step: 'Foundation', product: 'Full Coverage Foundation', time: 'Morning' })
      routine.push({ step: 'Mascara', product: 'Volumizing Mascara', time: 'Morning' })
      routine.push({ step: 'Blush', product: 'Powder Blush', time: 'Morning' })
      routine.push({ step: 'Lip Gloss', product: 'Long-lasting Lip Gloss', time: 'Morning' })
    } else if (profile.preferences?.occasion === 'Party') {
      routine.push({ step: 'Foundation', product: 'Long-wear Foundation', time: 'Morning' })
      routine.push({ step: 'Eyeshadow', product: 'Shimmer Eyeshadow', time: 'Morning' })
      routine.push({ step: 'Mascara', product: 'Waterproof Mascara', time: 'Morning' })
      routine.push({ step: 'Lipstick', product: 'Matte Lipstick', time: 'Morning' })
    } else {
      routine.push({ step: 'Foundation', product: 'Light Coverage Foundation', time: 'Morning' })
      routine.push({ step: 'Mascara', product: 'Natural Mascara', time: 'Morning' })
      routine.push({ step: 'Blush', product: 'Tinted Moisturizer with Blush', time: 'Morning' })
      routine.push({ step: 'Lip Balm', product: 'Tinted Lip Balm', time: 'Morning' })
    }

    return routine
  }

  const routine = generateRoutine()

  // Calculate estimated cost
  const estimatedCost = routine.length * 25 // Rough estimate per product

  return (
    <div className="recommendations-container">
      <div className="recommendations-header">
        <h1>Your Beauty Routine 💕</h1>
        <p>Personalized based on your {profile.skinType} skin and {profile.preferences?.occasion || 'daily'} needs</p>
      </div>

      <div className="recommendations-content">
        <div className="routine-section">
          <h2>🧴 Skincare Routine</h2>
          {routine.filter(item => ['Cleanser', 'Toner', 'Serum', 'Moisturizer', 'Sunscreen'].includes(item.step)).map((item, index) => (
            <div key={index} className="routine-item">
              <div className="routine-step">{item.step}</div>
              <div className="routine-product">{item.product}</div>
              <div className="routine-time">{item.time}</div>
            </div>
          ))}
        </div>

        <div className="routine-section">
          <h2>💄 Makeup Routine</h2>
          {routine.filter(item => ['Primer', 'Foundation', 'Eyeshadow', 'Mascara', 'Blush', 'Lipstick', 'Lip Gloss', 'Lip Balm'].includes(item.step)).map((item, index) => (
            <div key={index} className="routine-item">
              <div className="routine-step">{item.step}</div>
              <div className="routine-product">{item.product}</div>
              <div className="routine-time">{item.time}</div>
            </div>
          ))}
        </div>

        <div className="budget-section">
          <h3>💰 Estimated Total: ~{estimatedCost}₪</h3>
          <p>Your budget: {profile.budget}₪</p>
          {estimatedCost > profile.budget && (
            <p className="budget-warning">This exceeds your budget. Consider prioritizing essential items.</p>
          )}
        </div>

        <div className="actions">
          <a href="/products" className="btn btn-primary">Shop These Products</a>
          <a href="/services" className="btn btn-secondary">Book Beauty Services</a>
        </div>
      </div>
    </div>
  )
}

export default Recommendations