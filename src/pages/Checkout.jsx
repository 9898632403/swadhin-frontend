import React, { useContext, useState, useEffect } from "react";
import { CartContext } from "../context/CartContext";
import { UserContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../config";
import "../styles/Checkout.css";

const Checkout = () => {
  const { cart, clearCart } = useContext(CartContext);
  const { userInfo } = useContext(UserContext);
  const navigate = useNavigate();

  const [address, setAddress] = useState(userInfo?.address || "");
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");

  const totalAmount = cart.reduce(
    (acc, item) => acc + item.price * (item.quantity || 1),
    0
  );

  useEffect(() => {
    if (!userInfo?.email) {
      navigate("/login");
    } else if (!userInfo?.address || !userInfo?.name || !userInfo?.phone) {
      navigate("/userinfo");
    }
  }, [userInfo, navigate]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (!address.trim()) {
      alert("Please enter a delivery address");
      return;
    }

    setLoading(true);

    try {
      const razorpayLoaded = await loadRazorpayScript();
      if (!razorpayLoaded) {
        throw new Error("Razorpay SDK failed to load");
      }

      const orderResponse = await fetch(`${BASE_URL}/api/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: totalAmount }),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.error || "Failed to create payment order");
      }

      const orderData = await orderResponse.json();

      const options = {
        key: "rzp_test_Bb1uJViwCuwrdz",
        amount: orderData.amount,
        currency: orderData.currency,
        name: "SWADHIN",
        description: "Fashion Order Payment",
        image: "/logo192.png",
        order_id: orderData.order_id,
        handler: async function (response) {
          try {
            const formattedItems = cart.map((item) => ({
              id: item._id,
              name: item.name,
              price: item.price,
              image: item.image,
              color: item.color,
              size: item.size,
              quantity: item.quantity,
            }));

            const saveOrderResponse = await fetch(`${BASE_URL}/api/orders`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: userInfo.token, // <-- Added token here
              },
              body: JSON.stringify({
                email: userInfo.email,
                items: formattedItems,
                total: totalAmount,
                deliveryAddress: address,
                status: "Paid",
                orderDate: new Date().toISOString(),
                orderId: response.razorpay_order_id,
                coupon_code: couponCode || undefined,
              }),
            });

            if (!saveOrderResponse.ok) {
              throw new Error("Failed to save order");
            }

            const newOrder = {
              email: userInfo.email,
              items: formattedItems,
              total: totalAmount,
              deliveryAddress: address,
              status: "Paid",
              orderDate: new Date().toISOString(),
              orderId: response.razorpay_order_id,
              coupon_code: couponCode || undefined,
            };

            const prevOrders = JSON.parse(localStorage.getItem("orders")) || [];
            const updatedOrders = [...prevOrders, newOrder];
            localStorage.setItem("orders", JSON.stringify(updatedOrders));

            clearCart();
            navigate(`/order-confirmation/${response.razorpay_order_id}`);
          } catch (error) {
            console.error("Order save error:", error);
            alert("Payment succeeded but order saving failed. Please contact support.");
          }
        },
        prefill: {
          name: userInfo?.name || "",
          email: userInfo?.email || "",
          contact: userInfo?.phone || "",
        },
        theme: {
          color: "#D5A6BD",
        },
        modal: {
          ondismiss: () => {
            alert("Payment cancelled. You can try again.");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment Error:", error);
      alert(error.message || "Payment processing failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="checkoutContainer">
      <h1 className="checkoutTitle">Checkout</h1>

      {cart.length === 0 ? (
        <div className="emptyCart">
          <p className="emptyMsg">Your cart is empty!</p>
          <button
            className="continueShoppingBtn"
            onClick={() => navigate("/")}
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <>
          <div className="orderSummary">
            <h2 className="sectionTitle">Order Summary</h2>
            {cart.map((item) => (
              <div key={item._id || item.id} className="orderItem">
                <div>
                  <p className="itemName">{item.name}</p>
                  <p>Quantity: {item.quantity || 1}</p>
                  <p>Price: ₹{item.price * (item.quantity || 1)}</p>
                </div>
              </div>
            ))}
            <div className="couponSection">
              <input
                type="text"
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="couponInput"
              />
            </div>
            <p className="totalAmount">Total: ₹{totalAmount}</p>
          </div>

          <div className="addressSection">
            <label htmlFor="address" className="addressLabel">
              Delivery Address:
            </label>
            <textarea
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter your complete delivery address"
              className="addressInput"
              required
              rows={4}
            />
          </div>

          <button
            onClick={handlePayment}
            disabled={!address.trim() || loading || cart.length === 0}
            className={`payBtn ${
              !address.trim() || loading || cart.length === 0 ? "disabled" : ""
            }`}
          >
            {loading ? "Processing Payment..." : `Pay ₹${totalAmount}`}
          </button>
        </>
      )}
    </main>
  );
};

export default Checkout;
