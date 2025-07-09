import React, { useState, useContext, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { UserContext } from '../context/UserContext';
import { FiSearch, FiShoppingCart, FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
import { RiAdminLine } from 'react-icons/ri';
import { BiErrorCircle, BiSad } from 'react-icons/bi';
import '../styles/product.css';

function Products() {
  const binaryRainRef = useRef(null);
  const [search, setSearch] = useState('');
  const [productsList, setProductsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { cart, addToCart } = useContext(CartContext);
  const { userInfo } = useContext(UserContext);

  const isAdmin = userInfo?.email === 'admin@example.com';

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('http://localhost:5000/api/products');
        if (!res.ok) throw new Error('Failed to fetch products');
        const data = await res.json();
        setProductsList(data);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleDelete = async (productId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this product?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`http://localhost:5000/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': userInfo?.email,
        },
      });

      if (!res.ok) throw new Error('Failed to delete product');

      setProductsList(productsList.filter((p) => p._id !== productId));
      alert("Product deleted successfully!");
    } catch (err) {
      console.error('Delete error:', err);
      alert(err.message);
    }
  };

  const filteredProducts = productsList.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddToCart = (product) => {
    addToCart(product);
    // Visual feedback
    const button = document.querySelector(`.add-btn[data-id="${product._id}"]`);
    if (button) {
      button.innerHTML = '<FiPlus className="btn-icon" /> Added!';
      setTimeout(() => {
        button.innerHTML = '<FiPlus className="btn-icon" /> Add to Cart';
      }, 1500);
    }
  };

  // Helper function to get correct image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/static')) return `http://localhost:5000${imagePath}`;
    return `http://localhost:5000/static/uploads/products/${imagePath}`;
  };

  if (isLoading) return (
    <div className="loading-state">
      <div className="binary-rain" ref={binaryRainRef}></div>
      <div className="cyber-spinner"></div>
      <div className="loading-text">Loading</div>
      <div className="hacking-text">Initializing secure connection...</div>
    </div>
  );

  if (error) return (
    <div className="error-state">
      <BiErrorCircle className="error-icon" />
      <h3 className="error-heading">Loading Failed</h3>
      <p className="error-message">{error}</p>
      <button className="retry-btn" onClick={() => window.location.reload()}>Retry</button>
    </div>
  );

  return (
    <div className="products-container">
      <div className="products-header">
        <div className="header-content">
          <h1 className="main-title">Premium Collection</h1>
          <p className="subtitle">Discover our exclusive products</p>
        </div>

        <div className="controls-wrapper">
          <div className="search-wrapper">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search products..."
              className="search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="cart-wrapper">
            <Link to="/cart" className="cart-btn">
              <FiShoppingCart className="cart-icon" />
              {cart.length > 0 && <span className="cart-counter">{cart.length}</span>}
            </Link>
          </div>
        </div>
      </div>

      <div className="products-content">
        {filteredProducts.length > 0 ? (
          <div className="products-grid">
            {filteredProducts.map((product) => (
              <div key={product._id} className="product-card">
                <div className="card-image-container">
                  <Link to={`/product/${product._id}`} className="image-link">
                    <img
                      src={getImageUrl(product.image)}
                      alt={product.name}
                      className="product-image"
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = '/placeholder-image.jpg'; // Fallback image
                      }}
                    />
                    <div className="image-hover-effect">
                      <span className="view-text">View Details</span>
                    </div>
                  </Link>

                  {isAdmin && (
                    <div className="admin-tag">
                      <RiAdminLine className="admin-icon" />
                      <span>Admin</span>
                    </div>
                  )}

                  {product.discount && (
                    <div className="discount-badge">-{product.discount}%</div>
                  )}
                </div>

                <div className="card-body">
                  <div className="product-info">
                    <Link to={`/product/${product._id}`} className="product-link">
                      <h3 className="product-name">{product.name}</h3>
                    </Link>

                    <div className="price-container">
                      <span className="current-price">₹{product.price.toLocaleString()}</span>
                      {product.originalPrice && (
                        <span className="original-price">₹{product.originalPrice.toLocaleString()}</span>
                      )}
                    </div>

                    <p className="product-description">
                      {product.description.substring(0, 70)}...
                    </p>
                  </div>

                  <div className="card-footer">
                    {isAdmin ? (
                      <div className="admin-actions">
                        <Link to={`/admin/edit-product/${product._id}`} className="edit-btn">
                          <FiEdit2 className="btn-icon" />
                          Edit
                        </Link>
                        <button onClick={() => handleDelete(product._id)} className="delete-btn">
                          <FiTrash2 className="btn-icon" />
                          Delete
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => handleAddToCart(product)} className="add-btn" data-id={product._id}>
                        <FiPlus className="btn-icon" />
                        Add to Cart
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <BiSad className="empty-icon" />
            <h3 className="empty-title">No Products Found</h3>
            <p className="empty-message">Try adjusting your search or check back later</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Products;