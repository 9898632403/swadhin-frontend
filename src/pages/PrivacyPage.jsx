import React, { useEffect, useState, useRef } from "react";
import "../styles/PolicyPages.css";
import { useNavigate } from "react-router-dom";

const PrivacyPopup = ({ onClose, showAcceptButton = true }) => {
  const navigate = useNavigate();
  const [showAccept, setShowAccept] = useState(showAcceptButton);
  const popupRef = useRef(null);

  // Cookie management functions
  const setCookie = (name, value, days) => {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/`;
  };

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  };

  // Check for existing acceptance on initial render
  useEffect(() => {
    const isAccepted = getCookie("policyAccepted") === "true";
    setShowAccept(showAcceptButton && !isAccepted);
  }, [showAcceptButton]);

  const handleAccept = () => {
    setCookie("policyAccepted", "true", 365); // Store for 1 year
    triggerVibration();
    setTimeout(handleClose, 300);
  };

  const triggerVibration = () => {
    if (popupRef.current) {
      popupRef.current.classList.add("vibrate");
      setTimeout(() => {
        if (popupRef.current) {
          popupRef.current.classList.remove("vibrate");
        }
      }, 300);
    }
  };

  const handleClose = () => {
    if (popupRef.current) {
      popupRef.current.classList.add("closing");
      setTimeout(() => {
        onClose?.();
        navigate(-1);
      }, 400); // Match with CSS animation duration
    } else {
      onClose?.();
      navigate(-1);
    }
  };

  return (
    <div className="policyPopup" onClick={handleClose}>
      <div 
        className="popupContent" 
        onClick={(e) => e.stopPropagation()}
        ref={popupRef}
      >
        <button className="closeBtn" onClick={handleClose}>
          <span>×</span>
        </button>
        <h1>Privacy Policy</h1>
        <div className="policyText">
          <section>
            <h2>1. Information We Collect</h2>
            <p>We collect personal information including your name, email address, shipping address, and payment details to process orders. This data is collected only with your explicit consent during checkout.</p>
            <p><strong>Extended Clause:</strong> We may collect device information (IP address, browser type) for security and analytics purposes, anonymized where possible.</p>
          </section>

          <section>
            <h2>2. Data Usage</h2>
            <p>Your personal data is used exclusively for:</p>
            <ul>
              <li>Order processing and fulfillment</li>
              <li>Customer support communications</li>
              <li>Legal compliance and fraud prevention</li>
              <li>Service improvement (aggregated analytics)</li>
            </ul>
          </section>

          <section>
            <h2>3. Payment Security</h2>
            <p>All payments are processed through PCI-DSS compliant services (Razorpay). We never store complete payment information on our servers.</p>
            <p><strong>Extended Clause:</strong> Transaction data is encrypted using TLS 1.2+ protocols and stored with tokenization where required.</p>
          </section>

          <section>
            <h2>4. Data Retention</h2>
            <p>We retain order information for 7 years to comply with tax regulations. Inactive account data is deleted after 3 years.</p>
          </section>

          <section>
            <h2>5. Your Rights</h2>
            <p>Under GDPR and other privacy laws, you have the right to:</p>
            <ul>
              <li>Access your personal data</li>
              <li>Request correction or deletion</li>
              <li>Withdraw consent</li>
              <li>Lodge complaints with authorities</li>
            </ul>
            <p>Contact our Data Protection Officer at <a href="mailto:privacy@swadhinsupport.com">privacy@swadhinsupport.com</a>.</p>
          </section>

          <section>
            <h2>6. Third-Party Services</h2>
            <p>We use trusted services for:</p>
            <ul>
              <li>Payment processing (Razorpay)</li>
              <li>Analytics (Google Analytics, anonymized)</li>
              <li>Hosting (AWS/GCP with data locality options)</li>
            </ul>
            <p>All vendors comply with adequate data protection standards.</p>
          </section>

          <section>
            <h2>7. Policy Updates</h2>
            <p>This policy may be updated annually or as needed. Significant changes will be notified via email 30 days in advance.</p>
            <p><em>Last updated: {new Date().toLocaleDateString()}</em></p>
          </section>
        </div>
        
        {showAccept && (
          <div className="policyActions">
            <button className="acceptPolicy" onClick={handleAccept}>
              Accept Policy
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrivacyPopup;