import React, { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { useNavigate, Link } from "react-router-dom";
import { FiShoppingCart, FiTrash2, FiArrowLeft, FiChevronRight } from "react-icons/fi";
import { FaCartArrowDown } from "react-icons/fa";
import "../styles/Cart.css";

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, clearCart } = useContext(CartContext);
  const navigate = useNavigate();

  const totalPrice = cart.reduce(
    (sum, item) => sum + parseFloat(item.price || 0) * item.quantity,
    0
  ).toFixed(2);

  const handleRemove = (cartId) => {
    if (window.confirm("Are you sure you want to remove this item?")) {
      removeFromCart(cartId);
    }
  };

  const handleQuantityChange = (cartId, e) => {
    const newQty = parseInt(e.target.value);
    if (!isNaN(newQty) && newQty > 0) {
      updateQuantity(cartId, newQty);
    }
  };

  const handleCheckout = () => {
    navigate("/checkout");
  };

  return (
    <main className="cart">
      <div className="cart__header">
        <h1 className="cart__title">
          <FiShoppingCart className="cart__title-icon" /> Your Shopping Cart
        </h1>
        {cart.length > 0 && (
          <span className="cart__item-count">
            {cart.length} {cart.length === 1 ? "item" : "items"}
          </span>
        )}
      </div>

      {cart.length === 0 ? (
        <div className="cart__empty">
          <div className="cart__empty-icon">
            <FaCartArrowDown size={64} />
          </div>
          <h2 className="cart__empty-title">Your cart is empty</h2>
          <p className="cart__empty-text">
            Looks like you haven't added anything to your cart yet
          </p>
          <Link to="/products" className="cart__continue-btn">
            <FiArrowLeft className="btn-icon" /> Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="cart__content">
          <div className="cart__items">
            {cart.map((item) => (
              <article key={item.cartId} className="cart-item">
                <div className="cart-item__image-container">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="cart-item__image"
                    loading="lazy"
                  />
                </div>

                <div className="cart-item__details">
                  <h2 className="cart-item__name">
                    <Link to={`/products/${item.id}`} className="cart-item__link">
                      {item.name} <FiChevronRight className="link-icon" />
                    </Link>
                  </h2>

                  <div className="cart-item__meta">
                    <div className="cart-item__attribute">
                      <span className="cart-item__attribute-label">Color:</span>
                      <span className="cart-item__attribute-value">{item.color}</span>
                    </div>
                    <div className="cart-item__attribute">
                      <span className="cart-item__attribute-label">Size:</span>
                      <span className="cart-item__attribute-value">{item.size}</span>
                    </div>
                  </div>

                  <div className="cart-item__price">
                    ₹{parseFloat(item.price || 0).toFixed(2)}
                  </div>

                  <div className="cart-item__quantity">
                    <label htmlFor={`qty-${item.cartId}`} className="cart-item__quantity-label">
                      Quantity:
                    </label>
                    <input
                      id={`qty-${item.cartId}`}
                      type="number"
                      min="1"
                      max="10"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(item.cartId, e)}
                      className="cart-item__quantity-input"
                      aria-label={`Update quantity for ${item.name}`}
                    />
                  </div>

                  <button
                    onClick={() => handleRemove(item.cartId)}
                    className="cart-item__remove-btn"
                    aria-label={`Remove ${item.name} from cart`}
                  >
                    <FiTrash2 className="btn-icon" /> Remove
                  </button>
                </div>
              </article>
            ))}
          </div>

          <div className="cart__summary">
            <div className="cart__total">
              <span className="cart__total-label">Subtotal:</span>
              <span className="cart__total-value">₹{totalPrice}</span>
            </div>
            <p className="cart__tax-note">Taxes and shipping calculated at checkout</p>

            <div className="cart__actions">
              <button
                onClick={handleCheckout}
                className="cart__checkout-btn"
                disabled={cart.length === 0}
              >
                Proceed to Checkout <FiChevronRight className="btn-icon" />
              </button>

              <button
                onClick={clearCart}
                className="cart__clear-btn"
                disabled={cart.length === 0}
              >
                <FiTrash2 className="btn-icon" /> Clear Cart
              </button>

              <Link to="/products" className="cart__continue-link">
                <FiArrowLeft className="btn-icon" /> Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Cart;