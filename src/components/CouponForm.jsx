import React, { useState, useContext, useEffect } from "react";
import { UserContext } from "../context/UserContext";
import { format, parseISO } from "date-fns";
import { toast } from "react-toastify";
import "../styles/CouponForm.css";
import "react-toastify/dist/ReactToastify.css";

export default function CouponForm() {
  const { userInfo } = useContext(UserContext);
  const [form, setForm] = useState({
    code: "",
    discount_type: "percentage",
    amount: "",
    applies_to: "all",
    product_ids: "",
    expiry_date: "",
    min_order_price: "",
    min_likes_to_unlock: "",
    max_uses: "",
    single_use: true,
    description: "",
    active: true
  });

  const [allCoupons, setAllCoupons] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const validateForm = () => {
    const errors = {};

    if (!form.code.trim()) {
      errors.code = "Coupon code is required";
    } else if (!/^[A-Z0-9_\-]+$/i.test(form.code)) {
      errors.code = "Only letters, numbers, hyphens and underscores allowed";
    }

    if (!form.amount) {
      errors.amount = "Amount is required";
    } else if (isNaN(form.amount)) {
      errors.amount = "Must be a number";
    } else if (form.discount_type === "percentage" && (form.amount < 1 || form.amount > 100)) {
      errors.amount = "Percentage must be between 1-100";
    } else if (form.discount_type === "fixed" && form.amount < 1) {
      errors.amount = "Fixed amount must be positive";
    }

    if (form.applies_to === "product" && !form.product_ids.trim()) {
      errors.product_ids = "Product IDs required";
    }

    if (form.expiry_date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const expiryDate = new Date(form.expiry_date);

      if (expiryDate < today) {
        errors.expiry_date = "Expiry date cannot be in the past";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const fetchCoupons = async () => {
    try {
      setLoadingCoupons(true);
      const res = await fetch("http://localhost:5000/api/admin/coupons", {
        headers: {
          "X-User-Email": userInfo?.email || "",
        },
      });

      if (!res.ok) throw new Error("Failed to fetch coupons");

      const data = await res.json();
      setAllCoupons(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoadingCoupons(false);
    }
  };

  useEffect(() => {
    if (userInfo?.email) fetchCoupons();
  }, [userInfo?.email]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);

    const payload = {
      ...form,
      amount: parseFloat(form.amount),
      product_ids: form.applies_to === "product" 
        ? form.product_ids.split(",").map(id => id.trim()).filter(id => id)
        : [],
      min_order_price: parseFloat(form.min_order_price || 0),
      min_likes_to_unlock: parseInt(form.min_likes_to_unlock || 0),
      max_uses: parseInt(form.max_uses || 0),
    };

    try {
      const res = await fetch("http://localhost:5000/api/admin/coupons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Email": userInfo?.email || "",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Coupon created successfully!");
        window.scrollTo({ top: 0, behavior: "smooth" });
        setForm({
          code: "",
          discount_type: "percentage",
          amount: "",
          applies_to: "all",
          product_ids: "",
          expiry_date: "",
          min_order_price: "",
          min_likes_to_unlock: "",
          max_uses: "",
          single_use: true,
          description: "",
          active: true
        });
        fetchCoupons();
      } else {
        throw new Error(data.error || "Failed to create coupon");
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (code) => {
    if (!window.confirm(`Are you sure you want to delete coupon: ${code}?`)) return;

    try {
      const res = await fetch(`http://localhost:5000/api/admin/coupons/${encodeURIComponent(code)}`, {
        method: "DELETE",
        headers: {
          "X-User-Email": userInfo?.email || "",
        },
      });

      if (res.ok) {
        toast.success("Coupon deleted successfully");
        fetchCoupons();
      } else {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete coupon");
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const toggleCouponStatus = async (code, currentStatus) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/coupons/${encodeURIComponent(code)}/toggle`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-User-Email": userInfo?.email || "",
        },
      });

      if (res.ok) {
        toast.success(`Coupon ${currentStatus ? "deactivated" : "activated"}`);
        fetchCoupons();
      } else {
        const data = await res.json();
        throw new Error(data.error || "Failed to update coupon status");
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="coupon-management">
      <div className="coupon-form-container">
        <h2>Create New Coupon</h2>
        
        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label>Coupon Code *</label>
            <input
              type="text"
              name="code"
              placeholder="e.g. SUMMER20"
              value={form.code}
              onChange={handleChange}
              className={validationErrors.code ? "error" : ""}
            />
            {validationErrors.code && (
              <span className="error-message">{validationErrors.code}</span>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Discount Type *</label>
              <select 
                name="discount_type" 
                value={form.discount_type} 
                onChange={handleChange}
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>

            <div className="form-group">
              <label>
                {form.discount_type === "percentage" ? "Percentage *" : "Amount *"}
              </label>
              <input
                type="number"
                name="amount"
                placeholder={form.discount_type === "percentage" ? "10" : "100"}
                value={form.amount}
                onChange={handleChange}
                className={validationErrors.amount ? "error" : ""}
                min={form.discount_type === "percentage" ? 1 : 0.01}
                step={form.discount_type === "percentage" ? 1 : 0.01}
              />
              {validationErrors.amount && (
                <span className="error-message">{validationErrors.amount}</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>Applies To *</label>
            <select 
              name="applies_to" 
              value={form.applies_to} 
              onChange={handleChange}
            >
              <option value="all">All Products</option>
              <option value="product">Specific Products</option>
            </select>
          </div>

          {form.applies_to === "product" && (
            <div className="form-group">
              <label>Product IDs *</label>
              <input
                type="text"
                name="product_ids"
                placeholder="Comma separated product IDs"
                value={form.product_ids}
                onChange={handleChange}
                className={validationErrors.product_ids ? "error" : ""}
              />
              {validationErrors.product_ids && (
                <span className="error-message">{validationErrors.product_ids}</span>
              )}
              <small>Enter comma-separated product IDs (e.g., prod1, prod2)</small>
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label>Minimum Order Price</label>
              <input
                type="number"
                name="min_order_price"
                placeholder="0"
                value={form.min_order_price}
                onChange={handleChange}
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label>Minimum Likes to Unlock</label>
              <input
                type="number"
                name="min_likes_to_unlock"
                placeholder="0"
                value={form.min_likes_to_unlock}
                onChange={handleChange}
                min="0"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Maximum Uses</label>
              <input
                type="number"
                name="max_uses"
                placeholder="0 for unlimited"
                value={form.max_uses}
                onChange={handleChange}
                min="0"
              />
            </div>

            <div className="form-group">
              <label>Expiry Date</label>
              <input
                type="date"
                name="expiry_date"
                value={form.expiry_date}
                onChange={handleChange}
                min={format(new Date(), "yyyy-MM-dd")}
                className={validationErrors.expiry_date ? "error" : ""}
              />
              {validationErrors.expiry_date && (
                <span className="error-message">{validationErrors.expiry_date}</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <input
              type="text"
              name="description"
              placeholder="Optional description"
              value={form.description}
              onChange={handleChange}
            />
          </div>

          <div className="form-checkbox-group">
            <label>
              <input
                type="checkbox"
                name="single_use"
                checked={form.single_use}
                onChange={handleChange}
              />
              Single Use (Customer can only use once)
            </label>
          </div>

          <div className="form-checkbox-group">
            <label>
              <input
                type="checkbox"
                name="active"
                checked={form.active}
                onChange={handleChange}
              />
              Active
            </label>
          </div>

          <button 
            type="submit" 
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create Coupon"}
          </button>
        </form>
      </div>

      <div className="coupons-list-container">
        <h2>Existing Coupons</h2>
        
        {loadingCoupons ? (
          <div className="loading">Loading coupons...</div>
        ) : allCoupons.length === 0 ? (
          <div className="empty-state">No coupons available</div>
        ) : (
          <div className="table-responsive">
            <table className="coupons-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Discount</th>
                  <th>Applies To</th>
                  <th>Min Order</th>
                  <th>Uses</th>
                  <th>Expiry</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {allCoupons.map((coupon) => (
                  <tr key={coupon._id}>
                    <td>
                      <strong>{coupon.code}</strong>
                      {coupon.description && <div className="coupon-description">{coupon.description}</div>}
                    </td>
                    <td>
                      {coupon.discount_type === "percentage" 
                        ? `${coupon.amount}%` 
                        : `$${coupon.amount.toFixed(2)}`}
                    </td>
                    <td>
                      {coupon.applies_to === "product" 
                        ? `${coupon.product_ids?.length || 0} products` 
                        : "All products"}
                    </td>
                    <td>
                      {coupon.min_order_price > 0 
                        ? `$${coupon.min_order_price.toFixed(2)}` 
                        : "None"}
                    </td>
                    <td>
                      {coupon.max_uses > 0 
                        ? `${coupon.current_uses || 0}/${coupon.max_uses}` 
                        : coupon.current_uses || 0}
                    </td>
                    <td>
                      {coupon.expiry_date 
                        ? format(parseISO(coupon.expiry_date), "MMM dd, yyyy") 
                        : "No expiry"}
                    </td>
                    <td>
                      <span 
                        className={`status-badge ${coupon.active ? "active" : "inactive"}`}
                        onClick={() => toggleCouponStatus(coupon.code, coupon.active)}
                      >
                        {coupon.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="delete-button"
                        onClick={() => handleDelete(coupon.code)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style jsx>{`
  .coupon-management {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    color: #1a202c;
  }
  
  .coupon-form-container, .coupons-list-container {
    background: #ffffff;
    border-radius: 12px;
    padding: 2rem;
    margin-bottom: 2rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    border: 1px solid #edf2f7;
  }
  
  h2 {
    color: #2d3748;
    margin-bottom: 1.5rem;
    font-size: 1.5rem;
    font-weight: 600;
    letter-spacing: -0.025em;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 0.75rem;
  }
  
  .form {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }
  
  .form-row {
    display: flex;
    gap: 1.25rem;
  }
  
  .form-row .form-group {
    flex: 1;
  }
  
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  label {
    font-weight: 500;
    color: #4a5568;
    font-size: 0.875rem;
  }
  
  input, select {
    padding: 0.75rem;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 0.9375rem;
    transition: all 0.15s ease;
    background-color: #f8fafc;
  }
  
  input:focus, select:focus {
    outline: none;
    border-color: #4299e1;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.16);
    background-color: #fff;
  }
  
  input.error {
    border-color: #fc8181;
    background-color: #fff5f5;
  }
  
  .error-message {
    color: #e53e3e;
    font-size: 0.75rem;
    margin-top: 0.25rem;
    font-weight: 500;
  }
  
  .form-checkbox-group {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin: 0.5rem 0;
  }
  
  .form-checkbox-group input[type="checkbox"] {
    width: 18px;
    height: 18px;
    accent-color: #4299e1;
    cursor: pointer;
  }
  
  .submit-button {
    background: #4299e1;
    color: white;
    border: none;
    padding: 0.875rem 1.5rem;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    font-size: 0.9375rem;
    transition: all 0.2s ease;
    margin-top: 0.5rem;
    letter-spacing: 0.025em;
  }
  
  .submit-button:hover {
    background: #3182ce;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  }
  
  .submit-button:disabled {
    background: #cbd5e0;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  
  .table-responsive {
    overflow-x: auto;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
  }
  
  .coupons-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.875rem;
  }
  
  .coupons-table th, .coupons-table td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid #e2e8f0;
  }
  
  .coupons-table th {
    background: #f8fafc;
    font-weight: 600;
    color: #4a5568;
    text-transform: uppercase;
    font-size: 0.75rem;
    letter-spacing: 0.05em;
  }
  
  .coupons-table tr:hover {
    background-color: #f8fafc;
  }
  
  .coupon-description {
    font-size: 0.8125rem;
    color: #718096;
    margin-top: 0.25rem;
    line-height: 1.4;
  }
  
  .status-badge {
    display: inline-flex;
    align-items: center;
    padding: 0.375rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  
  .status-badge.active {
    background: #ebf8ff;
    color: #2b6cb0;
  }
  
  .status-badge.inactive {
    background: #fff5f5;
    color: #c53030;
  }
  
  .status-badge:hover {
    transform: translateY(-1px);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  }
  
  .delete-button {
    background: #fff5f5;
    color: #c53030;
    border: 1px solid #fed7d7;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.8125rem;
    font-weight: 500;
    transition: all 0.15s ease;
  }
  
  .delete-button:hover {
    background: #fed7d7;
    transform: translateY(-1px);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }
  
  .loading, .empty-state {
    text-align: center;
    padding: 2rem;
    color: #718096;
    font-size: 0.9375rem;
  }
  
  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.75rem;
  }
  
  @media (max-width: 768px) {
    .form-row {
      flex-direction: column;
      gap: 1rem;
    }
    
    .coupon-management {
      padding: 1rem;
    }
    
    .coupon-form-container, .coupons-list-container {
      padding: 1.5rem;
    }
    
    .coupons-table th, .coupons-table td {
      padding: 0.75rem;
    }
  }
`}</style>
    </div>
  );
}