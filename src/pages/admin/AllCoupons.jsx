import React, { useEffect, useState } from "react";
import { BASE_URL } from "../../config";


export default function AllCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  const ADMIN_EMAIL = "admin@example.com"; // ✅ Update this if needed

  const fetchCoupons = () => {
    console.log("🔄 Fetching admin coupons...");
    fetch(`${BASE_URL}/api/admin/coupons`, {
      headers: {
        "X-User-Email": ADMIN_EMAIL
      }
    })
      .then((res) => {
        console.log("📥 Status:", res.status);
        return res.json();
      })
      .then((data) => {
        console.log("✅ Coupons fetched:", data);
        if (Array.isArray(data)) {
          setCoupons(data);
        } else {
          console.warn("⚠️ Unexpected response:", data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Failed to fetch coupons:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleDelete = (code) => {
    const confirmed = window.confirm(`Are you sure to delete coupon: ${code}?`);
    if (!confirmed) return;

    fetch(`${BASE_URL}/api/admin/coupons/${code}`, {
      method: "DELETE",
      headers: {
        "X-User-Email": ADMIN_EMAIL
      }
    })
      .then((res) => {
        if (res.ok) {
          alert("✅ Coupon deleted!");
          fetchCoupons(); // Refresh
        } else {
          alert("❌ Failed to delete coupon.");
        }
      })
      .catch((err) => {
        console.error("❌ Error deleting coupon:", err);
        alert("Error while deleting.");
      });
  };

  if (loading) return <p>Loading coupons...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>🎯 Admin: All Coupons</h2>
      {coupons.length === 0 ? (
        <p>No coupons available.</p>
      ) : (
        <table
          border="1"
          cellPadding="10"
          style={{ width: "100%", marginTop: "20px", borderCollapse: "collapse" }}
        >
          <thead>
            <tr>
              <th>Code</th>
              <th>Discount</th>
              <th>Applies To</th>
              <th>Product IDs</th>
              <th>Expiry</th>
              <th>Min Order</th>
              <th>Welcome?</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c, i) => (
              <tr key={i}>
                <td><strong>{c.code}</strong></td>
                <td>{c.discount_type === "percentage" ? `${c.amount}%` : `₹${c.amount}`}</td>
                <td>{c.applies_to}</td>
                <td>{(c.product_ids || []).join(", ") || "All"}</td>
                <td>{c.expiry_date || "None"}</td>
                <td>{c.min_order_price ? `₹${c.min_order_price}` : "-"}</td>
                <td>{c.is_welcome_coupon ? "✅" : "❌"}</td>
                <td>
                  <button style={{ color: "red" }} onClick={() => handleDelete(c.code)}>
                    ❌ Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}