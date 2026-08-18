import { useEffect, useState } from 'react';
import axios from 'axios';
import './Dashboard.css';

const emptyProduct = {
  name: '',
  brand: '',
  category: 'skincare',
  subcategory: '',
  price: '',
  originalPrice: '',
  description: '',
  ingredients: '',
  skinTypes: '',
  image: '',
  inStock: true
};

function AdminDashboard({ user, token }) {
  const [stats, setStats] = useState({ productCount: 0, userCount: 0, bookingCount: 0 });
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productForm, setProductForm] = useState(emptyProduct);
  const [editingId, setEditingId] = useState(null);

  const API = 'http://localhost:5000/api/admin';

  const getAuthConfig = () => ({
    headers: { Authorization: `Bearer ${token}` }
  });

  const fetchAdminData = async () => {
    try {
      const [statsRes, productsRes, usersRes, ordersRes] = await Promise.all([
        axios.get(`${API}/stats`, getAuthConfig()),
        axios.get(`${API}/products`, getAuthConfig()),
        axios.get(`${API}/users`, getAuthConfig()),
        axios.get(`${API}/orders`, getAuthConfig())
      ]);

      setStats(statsRes.data);
      setProducts(productsRes.data);
      setUsers(usersRes.data);
      setOrders(ordersRes.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && user?.role === 'admin') {
      fetchAdminData();
    }
  }, [token, user]);

  const handleProductChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProductForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...productForm,
      price: Number(productForm.price),
      originalPrice: productForm.originalPrice ? Number(productForm.originalPrice) : undefined,
      ingredients: productForm.ingredients ? productForm.ingredients.split(',').map((item) => item.trim()).filter(Boolean) : [],
      skinTypes: productForm.skinTypes ? productForm.skinTypes.split(',').map((item) => item.trim()).filter(Boolean) : [],
      inStock: Boolean(productForm.inStock)
    };

    try {
      if (editingId) {
        await axios.put(`${API}/products/${editingId}`, payload, getAuthConfig());
      } else {
        await axios.post(`${API}/products`, payload, getAuthConfig());
      }

      setProductForm(emptyProduct);
      setEditingId(null);
      fetchAdminData();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleEditProduct = (product) => {
    setEditingId(product._id);
    setProductForm({
      name: product.name,
      brand: product.brand,
      category: product.category,
      subcategory: product.subcategory || '',
      price: product.price,
      originalPrice: product.originalPrice || '',
      description: product.description,
      ingredients: (product.ingredients || []).join(', '),
      skinTypes: (product.skinTypes || []).join(', '),
      image: product.image || '',
      inStock: product.inStock
    });
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await axios.delete(`${API}/products/${id}`, getAuthConfig());
      fetchAdminData();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleUserRoleChange = async (userId, role) => {
    try {
      await axios.put(`${API}/users/${userId}/role`, { role }, getAuthConfig());
      fetchAdminData();
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Delete this user?')) return;

    try {
      await axios.delete(`${API}/users/${userId}`, getAuthConfig());
      fetchAdminData();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  if (!token) {
    return <div className="dashboard-container"><div className="no-dashboard"><h2>Admin Access Required</h2><p>Please log in as an admin.</p></div></div>;
  }

  if (user?.role !== 'admin') {
    return <div className="dashboard-container"><div className="no-dashboard"><h2>Forbidden</h2><p>This page is available only for administrators.</p></div></div>;
  }

  if (loading) {
    return <div className="loading">Loading admin dashboard...</div>;
  }

  return (
    <div className="dashboard-container">
      <h1>Admin Dashboard</h1>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="dashboard-icon">📦</div>
          <h3>Products</h3>
          <p>{stats.productCount} total items</p>
        </div>
        <div className="dashboard-card">
          <div className="dashboard-icon">👥</div>
          <h3>Users</h3>
          <p>{stats.userCount} registered users</p>
        </div>
        <div className="dashboard-card">
          <div className="dashboard-icon">🧾</div>
          <h3>Orders</h3>
          <p>{stats.bookingCount} total bookings</p>
        </div>
      </div>

      <div className="admin-panel">
        <h2>Add / Edit Product</h2>
        <form onSubmit={handleProductSubmit} className="admin-form">
          <div className="admin-form-grid">
            <input name="name" placeholder="Product name" value={productForm.name} onChange={handleProductChange} required />
            <input name="brand" placeholder="Brand" value={productForm.brand} onChange={handleProductChange} required />
            <select name="category" value={productForm.category} onChange={handleProductChange}>
              <option value="skincare">Skincare</option>
              <option value="makeup">Makeup</option>
              <option value="haircare">Haircare</option>
              <option value="fragrance">Fragrance</option>
              <option value="tools">Tools</option>
            </select>
            <input name="subcategory" placeholder="Subcategory" value={productForm.subcategory} onChange={handleProductChange} />
            <input type="number" name="price" placeholder="Price" value={productForm.price} onChange={handleProductChange} required />
            <input type="number" name="originalPrice" placeholder="Original price" value={productForm.originalPrice} onChange={handleProductChange} />
            <input name="image" placeholder="Image URL" value={productForm.image} onChange={handleProductChange} />
            <label className="checkbox-row">
              <input type="checkbox" name="inStock" checked={productForm.inStock} onChange={handleProductChange} />
              In stock
            </label>
          </div>

          <textarea name="description" placeholder="Description" value={productForm.description} onChange={handleProductChange} required />
          <div className="admin-form-grid">
            <input name="ingredients" placeholder="Ingredients (comma separated)" value={productForm.ingredients} onChange={handleProductChange} />
            <input name="skinTypes" placeholder="Skin types (comma separated)" value={productForm.skinTypes} onChange={handleProductChange} />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">{editingId ? 'Update Product' : 'Add Product'}</button>
            {editingId && (
              <button type="button" className="btn btn-secondary" onClick={() => { setEditingId(null); setProductForm(emptyProduct); }}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="admin-panel">
        <h2>Products Management</h2>
        <div className="admin-list">
          {products.map((product) => (
            <div key={product._id} className="admin-item">
              <div>
                <strong>{product.name}</strong>
                <p>{product.brand} • {product.category} • ₪{product.price}</p>
              </div>
              <div className="admin-actions">
                <button className="btn btn-secondary small-btn" onClick={() => handleEditProduct(product)}>Edit</button>
                <button className="btn btn-danger small-btn" onClick={() => handleDeleteProduct(product._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="admin-panel">
        <h2>Users Management</h2>
        <div className="admin-list">
          {users.map((item) => (
            <div key={item._id} className="admin-item">
              <div>
                <strong>{item.name}</strong>
                <p>{item.email} • {item.role}</p>
              </div>
              <div className="admin-actions">
                <select value={item.role} onChange={(e) => handleUserRoleChange(item._id, e.target.value)}>
                  <option value="user">User</option>
                  <option value="provider">Provider</option>
                  <option value="admin">Admin</option>
                </select>
                {item._id !== user?.id && (
                  <button className="btn btn-danger small-btn" onClick={() => handleDeleteUser(item._id)}>Delete</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="admin-panel">
        <h2>Orders / Bookings</h2>
        <div className="admin-list">
          {orders.map((order) => (
            <div key={order._id} className="admin-item">
              <div>
                <strong>{order.serviceId?.name || 'Service'}</strong>
                <p>{order.userId?.name || 'User'} • {order.status} • ₪{order.totalPrice}</p>
              </div>
              <div className="admin-status">
                <span>{new Date(order.date).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
