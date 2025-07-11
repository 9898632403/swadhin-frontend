import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import { BASE_URL } from "../config";
import jsPDF from "jspdf";
import TrackOrderModal from "../components/TrackOrderModal";
import "../styles/OrderHistory.css";

const OrderHistory = () => {
  const { userInfo } = useContext(UserContext);
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [emailFilter, setEmailFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [trackingOrder, setTrackingOrder] = useState(null);

  const isAdmin = userInfo?.email === "admin@example.com";

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const url = isAdmin
        ? `${BASE_URL}/api/orders`
        : `${BASE_URL}/api/orders/${userInfo.email}`;

      const options = isAdmin
        ? { headers: { "X-User-Email": userInfo.email } }
        : {};

      const res = await fetch(url, options);
      const data = await res.json();

      if (res.ok) {
        setOrders(Array.isArray(data) ? data.reverse() : []);
      } else {
        setError(data.error || "Failed to load orders.");
      }
    } catch (err) {
      console.error("Fetch Error ❌", err);
      setError("Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const generateBill = (order) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("SWADHIN - Invoice/Bill", 20, 20);
    doc.setFontSize(12);
    doc.text(`Order ID: ${order.orderId || order._id}`, 20, 35);
    doc.text(
      `Order Date: ${order.orderDate || new Date(order.timestamp).toLocaleString()}`,
      20,
      45
    );
    doc.text(`Customer Email: ${order.email}`, 20, 55);
    doc.text(`Delivery Address: ${order.deliveryAddress || "N/A"}`, 20, 65);
    doc.text("Items:", 20, 80);
    let y = 90;
    order.items.forEach((item, i) => {
      doc.text(`${i + 1}. ${item.name} × ${item.quantity} - ₹${item.price * item.quantity}`, 25, y);
      y += 10;
    });
    doc.text(`Total Amount: ₹${order.total}`, 20, y + 10);
    if (order.coupon_code) {
      doc.text(`Coupon Applied: ${order.coupon_code}`, 20, y + 20);
    }
    doc.setFontSize(11);
    doc.text("Note: Your order will be delivered in 7-8 days.", 20, y + 35);
    doc.save(`SWADHIN_Bill_${order.orderId || order._id}.pdf`);
  };

  useEffect(() => {
    if (userInfo?.email) {
      fetchOrders();
    }
  }, [userInfo]);

  const isWithinLastNDays = (dateStr, days = 15) => {
    const now = new Date();
    const date = new Date(dateStr || new Date()); // fallback to now if invalid
    const diff = (now - date) / (1000 * 60 * 60 * 24);
    return diff <= days;
  };

  const filteredOrders = orders
    .filter((order) =>
      order.items?.some((item) =>
        item.name?.toLowerCase().includes(search.toLowerCase())
      )
    )
    .filter((order) =>
      isAdmin
        ? (!emailFilter ||
            order.email.toLowerCase().includes(emailFilter.toLowerCase())) &&
          (!dateFilter || (order.orderDate || "").includes(dateFilter))
        : isWithinLastNDays(order.orderDate || order.timestamp)
    );

  return (
    <main className="orderHistoryContainer">
      <h1>{isAdmin ? "All Customer Orders" : "Your Order History"}</h1>
      {error && <p className="error">{error}</p>}
      {loading && <p>Loading orders...</p>}

      {orders.length > 0 && (
        <input
          type="text"
          placeholder="Search by product name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="searchInput"
        />
      )}

      {isAdmin && (
        <div className="filterBar">
          <input
            type="text"
            placeholder="Filter by Email"
            value={emailFilter}
            onChange={(e) => setEmailFilter(e.target.value)}
          />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>
      )}

      {!loading && filteredOrders.length === 0 ? (
        <>
          <p>No orders found.</p>
          {!isAdmin && <Link to="/">Start shopping</Link>}
        </>
      ) : (
        <>
          {filteredOrders.map((order) => (
            <div key={order._id} className="orderCard">
              <h3>Order ID: {order.orderId || order._id}</h3>
              <p>Date: {order.orderDate || new Date(order.timestamp).toLocaleString()}</p>
              <p>Total: ₹{order.total}</p>
              {order.coupon_code && <p>Coupon: {order.coupon_code}</p>}
              {isAdmin && <p><strong>User Email:</strong> {order.email}</p>}

              <ul className="orderItems">
                {order.items?.map((item, idx) => (
                  <li key={idx} className="orderItem">
                    <Link to={`/product/${item.id || item._id || item.productId}`} className="productLink">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="productThumb"
                        loading="lazy"
                      />
                      <div className="productInfo">
                        <p className="productName">{item.name}</p>
                        <p className="productQtyPrice">Qty: {item.quantity} × ₹{item.price}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>

              <p><strong>Address:</strong> {order.deliveryAddress || "N/A"}</p>
              <p><strong>Status:</strong> {order.status || "Pending ⏳"}</p>
              {order.statusUpdatedAt && (
                <p><em>Last updated: {new Date(order.statusUpdatedAt).toLocaleString()}</em></p>
              )}

              <div className="orderActions">
                {isAdmin && (
                  <select
                    value={order.status || ""}
                    onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                  >
                    <option value="">-- Update Status --</option>
                    <option value="Pending">⏳ Pending</option>
                    <option value="Packed">📦 Packed</option>
                    <option value="Out for Delivery">🚚 Out for Delivery</option>
                    <option value="Delivered">✅ Delivered</option>
                  </select>
                )}

                <button className="trackBtn" onClick={() => setTrackingOrder(order._id)}>
                  Track Order
                </button>
                <button className="downloadBtn" onClick={() => generateBill(order)}>
                  Download Bill
                </button>
              </div>

              {trackingOrder === order._id && (
                <TrackOrderModal
                  status={order.status}
                  onClose={() => setTrackingOrder(null)}
                  statusUpdatedAt={order.statusUpdatedAt}
                />
              )}
            </div>
          ))}
        </>
      )}
    </main>
  );
};

export default OrderHistory;