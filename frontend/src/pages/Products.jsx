import { useState, useEffect } from 'react'
import axios from 'axios'
import './Products.css'

function Products() {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [priceRange, setPriceRange] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    filterProducts()
  }, [search, category, priceRange, products])

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/products')
      setProducts(response.data)
      setFilteredProducts(response.data)
      setLoading(false)
    } catch (err) {
      setError('Error fetching products')
      setLoading(false)
    }
  }

  const filterProducts = () => {
    let filtered = products

    if (search) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.brand.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (category) {
      filtered = filtered.filter(product => product.category === category)
    }

    if (priceRange) {
      const [min, max] = priceRange.split('-').map(Number)
      filtered = filtered.filter(product => {
        if (max) {
          return product.price >= min && product.price <= max
        } else {
          return product.price >= min
        }
      })
    }

    setFilteredProducts(filtered)
  }

  if (loading) return <div className="loading">Loading products...</div>
  if (error) return <div className="error">{error}</div>

  return (
    <div className="products-page">
      <h1>Beauty Products 💄</h1>
      
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="filters">
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          <option value="skincare">Skincare</option>
          <option value="makeup">Makeup</option>
          <option value="haircare">Haircare</option>
          <option value="fragrance">Fragrance</option>
          <option value="tools">Tools</option>
        </select>

        <select value={priceRange} onChange={(e) => setPriceRange(e.target.value)}>
          <option value="">All Prices</option>
          <option value="0-50">Under 50₪</option>
          <option value="50-100">50₪ - 100₪</option>
          <option value="100-200">100₪ - 200₪</option>
          <option value="200-500">200₪ - 500₪</option>
          <option value="500">500₪+</option>
        </select>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="no-products">
          <p>No products found matching your criteria.</p>
        </div>
      ) : (
        <div className="products-grid">
          {filteredProducts.map(product => (
            <div key={product._id} className="product-card">
              <div className="product-image">
                {product.image ? (
                  <img src={product.image} alt={product.name} />
                ) : (
                  <div className="placeholder-image">💄</div>
                )}
              </div>
              <div className="product-info">
                <h3>{product.name}</h3>
                <p className="product-brand">{product.brand}</p>
                <p className="product-category">{product.category}</p>
                <p className="product-description">{product.description}</p>
                <div className="product-footer">
                  <span className="product-price">₪{product.price}</span>
                  {product.originalPrice && (
                    <span className="product-original-price">₪{product.originalPrice}</span>
                  )}
                </div>
                <button className="btn btn-primary" style={{width: '100%', marginTop: '10px'}}>
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


