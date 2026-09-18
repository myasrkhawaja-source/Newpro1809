import { useState, useEffect } from 'react'
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Header from './Header';
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetails from './pages/ProductDetails'
import Services from './pages/Services'
import ServiceDetails from './pages/ServiceDetails'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import BeautyQuiz from './pages/BeautyQuiz'
import Recommendations from './pages/Recommendations'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Profile from './pages/Profile'
import Favorites from './pages/Favorites'
import Bookings from './pages/Bookings'
import Dashboard from './pages/Dashboard'
import UserDashboard from './pages/UserDashboard'
import NotificationCenter from './pages/NotificationCenter'
import OrderHistory from './pages/OrderHistory'
import SocialCallback from './pages/SocialCallback'
import AdminDashboard from './pages/AdminDashboard'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import AIAssistant from './components/AIAssistant'

function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('beautyhub-user') || 'null')
    } catch {
      return null
    }
  })
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('beautyhub-cart') || '[]')
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem('beautyhub-cart', JSON.stringify(cart))
  }, [cart])

  useEffect(() => {
    if (user) {
      localStorage.setItem('beautyhub-user', JSON.stringify(user))
    } else {
      localStorage.removeItem('beautyhub-user')
    }
  }, [user])

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token')
          localStorage.removeItem('beautyhub-user')
          setToken(null)
          setUser(null)

          const protectedRoutes = [
            '/profile',
            '/favorites',
            '/bookings',
            '/dashboard',
            '/user-dashboard',
            '/notifications',
            '/order-history',
            '/admin'
          ]
          if (protectedRoutes.includes(location.pathname)) {
            navigate('/login', { state: { from: location.pathname } })
          }
        }

        return Promise.reject(error)
      }
    )

    return () => axios.interceptors.response.eject(interceptor)
  }, [location.pathname, navigate])

  const addToCart = (item, type) => {
    const normalizedItem = {
      id: item._id,
      type,
      name: item.name,
      price: Number(item.price) || 0,
      image: item.image || item.images?.[0] || '',
      quantity: 1,
      details: item.description || item.category || '',
      location: item.location || null,
      duration: item.duration || null,
      category: item.category || null
    }

    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (entry) => entry.id === normalizedItem.id && entry.type === normalizedItem.type
      )

      if (existingItem) {
        return currentCart.map((entry) =>
          entry.id === normalizedItem.id && entry.type === normalizedItem.type
            ? { ...entry, quantity: entry.quantity + 1 }
            : entry
        )
      }

      return [...currentCart, normalizedItem]
    })
  }

  const updateCartItem = (id, type, change) => {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.id === id && item.type === type
            ? { ...item, quantity: Math.max(0, item.quantity + change) }
            : item
        )
        .filter((item) => item.quantity > 0)
    )
  }

  const removeFromCart = (id, type) => {
    setCart((currentCart) => currentCart.filter((item) => !(item.id === id && item.type === type)))
  }

  const clearCart = () => {
    setCart([])
  }

  return (
    <div className="App">
      <Header user={user} setUser={setUser} token={token} setToken={setToken} cart={cart} />
      <div className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products addToCart={addToCart} token={token} />} />
          <Route path="/products/:id" element={<ProductDetails addToCart={addToCart} token={token} />} />
          <Route path="/services" element={<Services addToCart={addToCart} token={token} user={user} />} />
          <Route path="/services/:id" element={<ServiceDetails addToCart={addToCart} token={token} />} />
          <Route path="/cart" element={<Cart cart={cart} updateCartItem={updateCartItem} removeFromCart={removeFromCart} clearCart={clearCart} token={token} />} />
          <Route path="/checkout" element={<Checkout cart={cart} token={token} clearCart={clearCart} />} />
          <Route path="/quiz" element={<BeautyQuiz />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/login" element={<Login setUser={setUser} setToken={setToken} />} />
          <Route path="/register" element={<Register setUser={setUser} setToken={setToken} />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/profile" element={<ProtectedRoute token={token}><Profile user={user} setUser={setUser} token={token} /></ProtectedRoute>} />
          <Route path="/social-callback" element={<SocialCallback setUser={setUser} setToken={setToken} />} />
          <Route path="/favorites" element={<ProtectedRoute token={token}><Favorites token={token} /></ProtectedRoute>} />
          <Route path="/bookings" element={<ProtectedRoute token={token}><Bookings token={token} /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute token={token}><Dashboard user={user} token={token} /></ProtectedRoute>} />
          <Route path="/user-dashboard" element={<ProtectedRoute token={token}><UserDashboard user={user} token={token} /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute token={token}><NotificationCenter token={token} /></ProtectedRoute>} />
          <Route path="/order-history" element={<ProtectedRoute token={token}><OrderHistory token={token} /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute token={token}><AdminDashboard user={user} token={token} /></ProtectedRoute>} />
        </Routes>
      </div>
      <AIAssistant token={token} user={user} />
      <Footer />
    </div>
  )
}

export default App