import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { UserContext } from "../context/UserContext";
import "../styles/HeroSlideForm.css"; // reuse same styles

const TestimonialForm = () => {
  const { userInfo } = useContext(UserContext);
  const userEmail = userInfo?.email || userInfo?.user?.email || "";

  const initialForm = {
    quote: "",
    author: "",
    location: "",
    type: "customer",
    visible: true,
  };

  const [formData, setFormData] = useState(initialForm);
  const [testimonials, setTestimonials] = useState([]);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const res = await axios.get("http://localhost:5000/admin/testimonial", {
        headers: { "X-User-Email": userEmail },
      });
      setTestimonials(res.data.testimonials || []);
    } catch (err) {
      console.error("❌ Failed to fetch testimonials", err);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.quote.trim()) newErrors.quote = "Quote is required";
    if (!formData.author.trim()) newErrors.author = "Author is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });
    if (!userEmail) return setMessage({ text: "Admin not authenticated", type: "error" });
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await axios.post("http://localhost:5000/admin/testimonial", formData, {
        headers: { "Content-Type": "application/json", "X-User-Email": userEmail },
      });
      setMessage({ text: "✅ Testimonial added successfully!", type: "success" });
      setFormData(initialForm);
      fetchTestimonials();
    } catch (err) {
      console.error(err);
      setMessage({
        text: err.response?.data?.message || "❌ Failed to add testimonial",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteTestimonial = async (id) => {
    if (!window.confirm("Are you sure you want to delete this testimonial?")) return;
    try {
      await axios.delete(`http://localhost:5000/admin/testimonial/${id}`, {
        headers: { "X-User-Email": userEmail },
      });
      setTestimonials((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      console.error("❌ Delete failed", err);
    }
  };

  if (!userEmail) {
    return <div className="alert alert-warning">Please log in as admin to manage testimonials.</div>;
  }

  return (
    <div className="product-form-container">
      <form onSubmit={handleSubmit} className="product-form">
        <h2 className="form-title">Add Testimonial</h2>

        {message.text && (
          <div className={`alert alert-${message.type === "error" ? "danger" : "success"}`}>
            {message.text}
          </div>
        )}

        <div className="form-group">
          <label>Quote*</label>
          <textarea
            name="quote"
            value={formData.quote}
            onChange={handleChange}
            rows={3}
            className={`form-control ${errors.quote ? "is-invalid" : ""}`}
            placeholder="Enter testimonial quote"
          />
          {errors.quote && <div className="invalid-feedback">{errors.quote}</div>}
        </div>

        <div className="form-group">
          <label>Author*</label>
          <input
            type="text"
            name="author"
            value={formData.author}
            onChange={handleChange}
            className={`form-control ${errors.author ? "is-invalid" : ""}`}
            placeholder="e.g. Priya M., Textile Conservator"
          />
          {errors.author && <div className="invalid-feedback">{errors.author}</div>}
        </div>

        <div className="form-group">
          <label>Location (optional)</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="form-control"
            placeholder="e.g. Jaipur"
          />
        </div>

        <div className="form-group">
          <label>Type</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="form-control"
          >
            <option value="customer">Customer</option>
            <option value="founder">Founder</option>
            <option value="festival">Festival</option>
            <option value="brand">Brand Thought</option>
          </select>
        </div>

        <div className="form-group form-check">
          <input
            type="checkbox"
            name="visible"
            checked={formData.visible}
            onChange={handleChange}
            className="form-check-input"
            id="visibleToggle"
          />
          <label className="form-check-label" htmlFor="visibleToggle">Visible</label>
        </div>

        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Add Testimonial"}
        </button>
      </form>

      {testimonials.length > 0 && (
        <div className="mt-4">
          <h4 className="mb-3">All Testimonials</h4>
          <table className="table table-bordered table-hover">
            <thead>
              <tr>
                <th>Quote</th>
                <th>Author</th>
                <th>Location</th>
                <th>Type</th>
                <th>Visible</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {testimonials.map((t) => (
                <tr key={t._id}>
                  <td>{t.quote}</td>
                  <td>{t.author}</td>
                  <td>{t.location || "-"}</td>
                  <td>{t.type}</td>
                  <td>{t.visible ? "Yes" : "No"}</td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => deleteTestimonial(t._id)}
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
  );
};

export default TestimonialForm;
