import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../config";
import "../styles/Contact.css";
import { X, Mail, Phone, Calendar, FileText, MessageSquare, User, Image } from "react-feather";

const Contact = () => {
  const navigate = useNavigate();
  const [queryType, setQueryType] = useState("general");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    mobile: "",
    orderDate: "",
    reason: "",
    bill: null,
    productImage: null,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    const fileValue = files ? files[0] : null;
    setFormData({
      ...formData,
      [name]: files ? fileValue : value,
    });
    if (errors[name]) setErrors({ ...errors, [name]: null });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Please provide your full name";
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (queryType === "general") {
      if (!formData.message.trim()) newErrors.message = "Please describe your inquiry";
    } else {
      if (!formData.mobile.trim()) newErrors.mobile = "Contact number is required";
      if (!formData.reason.trim()) newErrors.reason = "Please specify the reason";
      if (!formData.orderDate) newErrors.orderDate = "Order date is required";
      if (!formData.bill) newErrors.bill = "Invoice copy is required for verification";

      if (queryType === "return" && !formData.productImage)
        newErrors.productImage = "Product image is required for assessment";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    const formToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value) formToSend.append(key, value);
    });
    formToSend.append("type", queryType);

    try {
      const res = await fetch(`${BASE_URL}/api/contact`, {
        method: "POST",
        body: formToSend,
      });
      if (res.ok) {
        alert("Thank you for contacting us. Your request has been submitted successfully. Our team will respond to you within 24-48 hours.");
        setFormData({
          name: "",
          email: "",
          message: "",
          mobile: "",
          orderDate: "",
          reason: "",
          bill: null,
          productImage: null,
        });
        setQueryType("general");
        setErrors({});
      } else {
        const errorData = await res.json();
        alert(errorData.message || "Submission unsuccessful. Please review your information and try again.");
      }
    } catch (err) {
      alert("We encountered a network issue. Please check your internet connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => navigate("/");

  return (
    <div className="contact-container">
      <div className="contact-header">
        <h2>Customer Support Center</h2>
        <button className="close-button" onClick={handleClose} aria-label="Close contact form">
          <X size={24} />
        </button>
      </div>

      <p className="contact-intro">
        Our dedicated support team is here to assist you. Please complete the form below with detailed 
        information about your inquiry, and we'll ensure a prompt response.
      </p>

      <form onSubmit={handleSubmit} encType="multipart/form-data" noValidate>
        <div className="form-group">
          <label><MessageSquare size={14} /> Inquiry Type:</label>
          <select
            value={queryType}
            onChange={(e) => {
              setQueryType(e.target.value);
              setErrors({});
            }}
          >
            <option value="general">General Inquiry / Customization Request</option>
            <option value="cancel">Order Cancellation Request</option>
            <option value="return">Return/Exchange Request</option>
          </select>
        </div>

        <div className="form-group">
          <label><User size={14} /> Full Name:</label>
          <input
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            className={errors.name ? "error-input" : ""}
            placeholder="As per your order details"
          />
          {errors.name && <p className="error-text">{errors.name}</p>}
        </div>

        <div className="form-group">
          <label><Mail size={14} /> Email Address:</label>
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className={errors.email ? "error-input" : ""}
            placeholder="Your primary contact email"
          />
          {errors.email && <p className="error-text">{errors.email}</p>}
        </div>

        {queryType === "general" && (
          <div className="form-group">
            <label><MessageSquare size={14} /> Your Inquiry:</label>
            <textarea
              name="message"
              rows="4"
              value={formData.message}
              onChange={handleChange}
              className={errors.message ? "error-input" : ""}
              placeholder="Please provide detailed information about your request..."
            />
            {errors.message && <p className="error-text">{errors.message}</p>}
          </div>
        )}

        {(queryType === "cancel" || queryType === "return") && (
          <>
            <div className="form-group">
              <label><Phone size={14} /> Contact Number:</label>
              <input
                name="mobile"
                type="text"
                value={formData.mobile}
                onChange={handleChange}
                className={errors.mobile ? "error-input" : ""}
                placeholder="For order verification purposes"
              />
              {errors.mobile && <p className="error-text">{errors.mobile}</p>}
            </div>

            <div className="form-group">
              <label><Calendar size={14} /> Order Date:</label>
              <input
                name="orderDate"
                type="date"
                value={formData.orderDate}
                onChange={handleChange}
                className={errors.orderDate ? "error-input" : ""}
              />
              {errors.orderDate && <p className="error-text">{errors.orderDate}</p>}
            </div>

            <div className="form-group">
              <label><MessageSquare size={14} /> Detailed Reason:</label>
              <textarea
                name="reason"
                rows="3"
                value={formData.reason}
                onChange={handleChange}
                className={errors.reason ? "error-input" : ""}
                placeholder={queryType === "return"
                  ? "Please describe the issue (damage, incorrect item, quality concerns, etc.)"
                  : "Please explain why you wish to cancel this order"}
              />
              {errors.reason && <p className="error-text">{errors.reason}</p>}
            </div>

            <div className="form-group">
              <label><FileText size={14} /> Order Invoice (Required):</label>
              <input
                name="bill"
                type="file"
                accept="image/*,.pdf"
                onChange={handleChange}
                className={errors.bill ? "error-input" : ""}
              />
              {errors.bill && <p className="error-text">{errors.bill}</p>}
              <small className="file-hint">Accepted formats: JPEG, PNG, PDF (Max 5MB). Ensure invoice details are clearly visible.</small>
            </div>

            {queryType === "return" && (
              <>
                <div className="form-group">
                  <label><Image size={14} /> Product Images (Required):</label>
                  <input
                    name="productImage"
                    type="file"
                    accept="image/*"
                    onChange={handleChange}
                    className={errors.productImage ? "error-input" : ""}
                  />
                  {errors.productImage && <p className="error-text">{errors.productImage}</p>}
                  <small className="file-hint">Upload clear images showing any defects or discrepancies. Include multiple angles if necessary.</small>
                </div>

                <div className="return-policy">
                  <h4>Return Policy Guidelines</h4>
                  <div className="policy-highlights">
                    <div className="policy-item">
                      <strong>Eligibility Window:</strong>
                      <p>Return requests must be submitted within 48 hours of delivery confirmation.</p>
                    </div>
                    <div className="policy-item">
                      <strong>Acceptable Conditions:</strong>
                      <ul>
                        <li>• Manufacturing defects or quality issues</li>
                        <li>• Incorrect item received</li>
                        <li>• Significant damage during transit</li>
                      </ul>
                    </div>
                    <div className="policy-item">
                      <strong>Non-Returnable Items:</strong>
                      <ul>
                        <li>• Products altered from original condition</li>
                        <li>• Items without original packaging</li>
                        <li>• Personalized/custom-made products</li>
                      </ul>
                    </div>
                  </div>
                  <p className="policy-note">
                    Note: Our quality team will review your submission within 1-2 business days. 
                    Approved returns will include prepaid return shipping instructions.
                  </p>
                </div>
              </>
            )}
          </>
        )}

        <button type="submit" disabled={isSubmitting} className="submit-button">
          {isSubmitting ? "Processing Your Request..." : "Submit Request"}
        </button>
      </form>
    </div>
  );
};

export default Contact;