import React from "react";
import { Link } from "react-router-dom";

const ProductCard = ({ product }) => {
  return (
    <div className="product-card">
      <Link to={`/product/${product.slug}`}>
        <div className="product-image-container">
          <img src={product.images[0]} alt={product.name} className="product-image" />
          <div className="product-actions">
            <button className="quick-view">Quick View</button>
            <button className="add-to-cart">Add to Cart</button>
          </div>
        </div>
      </Link>
      <div className="product-details">
        <h3 className="product-title">{product.name}</h3>
        <p className="product-price">₹{product.price}</p>
      </div>
    </div>
  );
};

export default ProductCard;