import { useState, useEffect } from 'react';
import './App.css';

// Read API URL from environment variable (.env) or fallback to localhost:5000
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function App() {
  // State variables
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Search and Sort query state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('');

  // Form State (used for both Add and Edit)
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    quantity: '1'
  });
  const [editingId, setEditingId] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Helper to show temporary success messages
  const notifySuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => {
      setSuccessMessage(null);
    }, 4000);
  };

  // ============================================================
  // 1. Fetch Products (Read) - Supports query strings (search, sort)
  // ============================================================
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);

    try {
      // Build query string
      const params = new URLSearchParams();
      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }
      if (sortBy) {
        params.append('sort', sortBy);
      }

      const queryString = params.toString() ? `?${params.toString()}` : '';
      const response = await fetch(`${API_URL}/products${queryString}`);

      if (!response.ok) {
        throw new Error(`Server returned status: ${response.status} (${response.statusText})`);
      }

      const data = await response.json();
      setProducts(data);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(`Cannot connect to API server at ${API_URL}. Please ensure the backend is running.`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on initial mount and whenever search / sort changes
  useEffect(() => {
    fetchProducts();
  }, [searchTerm, sortBy]);

  // Handle Form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    if (formError) setFormError(null);
  };

  // ============================================================
  // 2. Submit Form (Create or Update)
  // ============================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError(null);

    // Basic frontend validation
    if (!formData.name.trim()) {
      setFormError('Please enter a product name.');
      setFormSubmitting(false);
      return;
    }
    if (formData.price === '' || Number(formData.price) < 0) {
      setFormError('Please enter a valid non-negative price.');
      setFormSubmitting(false);
      return;
    }

    const payload = {
      name: formData.name.trim(),
      price: parseFloat(formData.price),
      quantity: parseInt(formData.quantity || 1, 10)
    };

    try {
      if (editingId) {
        // --- UPDATE (PUT /products/:id) ---
        const response = await fetch(`${API_URL}/products/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to update product');
        }

        // Update local state without reloading the page
        setProducts((prev) =>
          prev.map((item) => (item.id === editingId ? data : item))
        );

        notifySuccess(`Updated "${data.name}" successfully!`);
        cancelEditing();
      } else {
        // --- CREATE (POST /products) ---
        const response = await fetch(`${API_URL}/products`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to add product');
        }

        // Append new product to state without reload
        setProducts((prev) => [data, ...prev]);

        notifySuccess(`Added "${data.name}" successfully!`);
        // Reset form
        setFormData({
          name: '',
          price: '',
          quantity: '1'
        });
      }
    } catch (err) {
      console.error('Submission error:', err);
      setFormError(err.message || 'Something went wrong while saving product.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // ============================================================
  // 3. Edit Action: Populate Form
  // ============================================================
  const startEditing = (product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      quantity: product.quantity.toString()
    });
    setFormError(null);
    // Smooth scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setFormData({
      name: '',
      price: '',
      quantity: '1'
    });
    setFormError(null);
  };

  // ============================================================
  // 4. Delete Action (DELETE /products/:id)
  // ============================================================
  const handleDelete = async (id, name) => {
    const confirmed = window.confirm(`Are you sure you want to delete "${name}"?`);
    if (!confirmed) return;

    try {
      const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete product');
      }

      // Remove item from state without page reload
      setProducts((prev) => prev.filter((item) => item.id !== id));
      notifySuccess(`Deleted "${name}" successfully.`);

      // If we were editing this item, cancel editing
      if (editingId === id) {
        cancelEditing();
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert(`Error deleting product: ${err.message}`);
    }
  };

  // Calculate summary stats
  const totalItemsCount = products.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const totalValue = products.reduce((sum, item) => sum + item.price * (item.quantity || 0), 0);

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo-group">
            <span className="logo-icon">🛒</span>
            <div>
              <h1 className="header-title">Shopping Cart Inventory</h1>
              <p className="header-subtitle">Fullstack Express & React Management Dashboard</p>
            </div>
          </div>
          <div className="api-badge">
            <span className={`status-dot ${error ? 'offline' : 'online'}`}></span>
            <span>API: {API_URL}</span>
          </div>
        </div>
      </header>

      {/* Notification Toast */}
      {successMessage && (
        <div className="toast-banner success-toast">
          <span>✅ {successMessage}</span>
          <button className="toast-close" onClick={() => setSuccessMessage(null)}>×</button>
        </div>
      )}

      {/* Main Content Layout */}
      <main className="main-content">
        {/* Left / Top Column: Add/Edit Form & Stats */}
        <section className="sidebar-section">
          {/* Summary Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-label">Unique Products</span>
              <span className="stat-value">{products.length}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Total Quantity</span>
              <span className="stat-value">{totalItemsCount}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Inventory Value</span>
              <span className="stat-value highlight">${totalValue.toFixed(2)}</span>
            </div>
          </div>

          {/* Form Card */}
          <div className="card form-card">
            <div className="card-header">
              <h2>{editingId ? '✏️ Edit Product' : '➕ Add New Product'}</h2>
              {editingId && (
                <button type="button" className="btn-secondary btn-sm" onClick={cancelEditing}>
                  Cancel Edit
                </button>
              )}
            </div>

            {formError && (
              <div className="alert-box error-alert">
                <span>⚠️ {formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="product-form">
              <div className="form-group">
                <label htmlFor="name">Product Name *</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="e.g., Mechanical Keyboard"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="price">Price ($) *</label>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="quantity">Quantity *</label>
                  <input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="1"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={formSubmitting}
                >
                  {formSubmitting
                    ? 'Saving...'
                    : editingId
                    ? 'Update Product'
                    : 'Add to Inventory'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={cancelEditing}
                  >
                    Discard Changes
                  </button>
                )}
              </div>
            </form>
          </div>
        </section>

        {/* Right / Bottom Column: Product List */}
        <section className="list-section">
          {/* Search and Sort Toolbar */}
          <div className="toolbar card">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search products by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  type="button"
                  className="clear-search"
                  onClick={() => setSearchTerm('')}
                >
                  ✕
                </button>
              )}
            </div>

            <div className="sort-box">
              <label htmlFor="sortBy">Sort By:</label>
              <select
                id="sortBy"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="">Default (Unsorted)</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Error Message when server is unavailable */}
          {error && (
            <div className="card alert-card">
              <div className="alert-icon">🚫</div>
              <div className="alert-text">
                <h3>Connection Error</h3>
                <p>{error}</p>
                <button className="btn-secondary btn-sm retry-btn" onClick={fetchProducts}>
                  🔄 Try Again
                </button>
              </div>
            </div>
          )}

          {/* Loading Indicator */}
          {loading && (
            <div className="loading-state card">
              <div className="spinner"></div>
              <p>Fetching products from Express API...</p>
            </div>
          )}

          {/* Product Items List */}
          {!loading && !error && products.length === 0 && (
            <div className="card empty-state">
              <div className="empty-icon">📦</div>
              <h3>No products found</h3>
              <p>
                {searchTerm
                  ? `No product matches "${searchTerm}". Try another search term.`
                  : 'Your inventory is currently empty. Add your first product using the form!'}
              </p>
            </div>
          )}

          {!loading && !error && products.length > 0 && (
            <div className="products-grid">
              {products.map((product) => (
                <article key={product.id} className="product-card card">
                  <div className="product-card-top">
                    <span className="product-badge">ID: {product.id}</span>
                    <span className="quantity-tag">
                      {product.quantity} in stock
                    </span>
                  </div>

                  <h3 className="product-name">{product.name}</h3>

                  <div className="product-meta">
                    <div className="meta-item">
                      <span className="meta-label">Unit Price</span>
                      <span className="meta-value price-tag">
                        ${Number(product.price).toFixed(2)}
                      </span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Subtotal</span>
                      <span className="meta-value subtotal-tag">
                        ${(Number(product.price) * (product.quantity || 1)).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="product-card-actions">
                    <button
                      type="button"
                      className="btn-action edit-btn"
                      onClick={() => startEditing(product)}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      type="button"
                      className="btn-action delete-btn"
                      onClick={() => handleDelete(product.id, product.name)}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
