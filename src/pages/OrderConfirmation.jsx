import React, { useEffect, useState, useContext, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import "../styles/OrderInfo.css";

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const { userInfo } = useContext(UserContext);
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const [order, setOrder] = useState(null);
  const [showQuizPopup, setShowQuizPopup] = useState(false);

  // Add smoke effect
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const createSmoke = () => {
      const smoke = document.createElement('div');
      smoke.className = 'smoke';
      
      // Random position within container
      const left = Math.random() * 80 + 10; // 10-90%
      const top = Math.random() * 80 + 10; // 10-90%
      
      smoke.style.left = `${left}%`;
      smoke.style.top = `${top}%`;
      
      // Random size
      const size = Math.random() * 100 + 50; // 50-150px
      smoke.style.width = `${size}px`;
      smoke.style.height = `${size}px`;
      
      // Random animation duration
      const duration = Math.random() * 15 + 10; // 10-25s
      smoke.style.animationDuration = `${duration}s`;
      
      container.appendChild(smoke);
      
      // Remove smoke element after animation completes
      setTimeout(() => {
        if (smoke.parentNode) {
          smoke.parentNode.removeChild(smoke);
        }
      }, duration * 1000);
    };

    // Create initial smoke elements
    for (let i = 0; i < 5; i++) {
      createSmoke();
    }

    // Continue creating smoke at intervals
    const smokeInterval = setInterval(createSmoke, 3000);

    return () => {
      clearInterval(smokeInterval);
      // Clean up any remaining smoke elements
      const smokeElements = container.getElementsByClassName('smoke');
      while (smokeElements.length > 0) {
        smokeElements[0].parentNode.removeChild(smokeElements[0]);
      }
    };
  }, []);

  useEffect(() => {
    const savedOrders = JSON.parse(localStorage.getItem("orders")) || [];
    const foundOrder = savedOrders.find((o) => o.orderId === orderId);

    if (foundOrder) {
      setOrder(foundOrder);
      // Remove from localStorage once displayed
      const updatedOrders = savedOrders.filter((o) => o.orderId !== orderId);
      localStorage.setItem("orders", JSON.stringify(updatedOrders));
      
      // Add celebration effects
      if (containerRef.current) {
        containerRef.current.classList.add("celebrate");
        setTimeout(() => {
          if (containerRef.current) {
            containerRef.current.classList.remove("celebrate");
          }
        }, 2000);
      }
    }
  }, [orderId]);

  useEffect(() => {
    const quizCompleted = localStorage.getItem("quizCompleted");
    if (!quizCompleted) {
      const timer = setTimeout(() => {
        setShowQuizPopup(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!order) {
    return (
      <main className="orderConfirmationContainer">
        <h2>Order not found.</h2>
        <Link to="/">Go back to home</Link>
      </main>
    );
  }

  return (
    <main 
      ref={containerRef}
      className={`orderConfirmationContainer ${showQuizPopup ? "blurred" : ""}`}
    >
      <h1>Order Placed Successfully! 🎉</h1>
      <h3>Order ID: {order.orderId}</h3>
      <p>Order Date: {new Date(order.orderDate).toLocaleString()}</p>
      <h2>Order Summary</h2>
      <ul className="orderItems">
        {order.items.map((item) => (
          <li key={item.cartId || item.id} className="orderItem">
            <span className="itemName">{item.name}</span>
            <span className="itemDetails">
              Qty: {item.quantity || 1} - ₹{item.price * (item.quantity || 1)}
            </span>
          </li>
        ))}
      </ul>
      <p className="orderTotal"><strong>Total: ₹{order.total}</strong></p>
      <div className="deliveryInfo">
        <h3>Delivery Address:</h3>
        <p>{order.deliveryAddress}</p>
      </div>
      <p className="orderStatus">Status: {order.status}</p>

      <div className="orderConfirmationButtons">
        <Link to="/" className="continueShoppingBtn">
          Continue Shopping
        </Link>
      </div>

      {showQuizPopup && (
        <div className="quizPopupOverlay">
          <div className="quizPopup">
            <h2 className="quizTitle">🎯 Boost Your Style!</h2>
            <p className="quizMsg">Take a quick quiz to personalize your fashion picks!</p>
            <div className="quizBtns">
              <button
                className="quizTakeBtn"
                onClick={() => {
                  localStorage.setItem("fromOrderConfirmation", "true");
                  navigate("/style-quiz");
                }}
              >
                Take Quiz
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default OrderConfirmation;