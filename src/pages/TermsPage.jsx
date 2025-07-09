import React from "react";
import "../styles/Term.css";
import { useNavigate } from "react-router-dom";

const TermsPopup = ({ onClose }) => {
  const navigate = useNavigate();

  const handleClose = () => {
    onClose?.();
    navigate(-1);
  };

  return (
    <div className="policyPopup" onClick={handleClose}>
      <div className="popupContent" onClick={(e) => e.stopPropagation()}>
        <button className="closeBtn" onClick={handleClose}>×</button>
        <h1>Terms & Conditions</h1>
        
        <section>
          <h2>1. Order Processing</h2>
          <p><strong>Product Availability:</strong> Orders are fulfilled based on product availability. Customized items require 7-10 business days for production before shipping.</p>
          <p><strong>Order Confirmation:</strong> You will receive an order confirmation email within 24 hours. Custom orders require explicit approval via email before production begins.</p>
        </section>

        <section>
          <h2>2. Payment Terms</h2>
          <p><strong>Payment Methods:</strong> We accept all major credit/debit cards, UPI, and net banking through secure payment gateways.</p>
          <p><strong>Custom Order Deposits:</strong> Custom designs require 50% non-refundable deposit upon ordering, with balance due before shipment.</p>
          <p><strong>Currency:</strong> All transactions are processed in INR. International customers may see converted amounts based on current exchange rates.</p>
        </section>

        <section>
          <h2>3. Shipping & Delivery</h2>
          <p><strong>Processing Time:</strong> Ready-to-ship items dispatch within 1-2 business days. Custom items ship within 7-10 business days after design approval.</p>
          <p><strong>Shipping Partners:</strong> We use Delhivery, FedEx, and India Post with tracking provided for all orders.</p>
          <p><strong>International Orders:</strong> Subject to additional customs fees and import taxes which are the customer's responsibility.</p>
        </section>

        <section>
          <h2>4. Returns & Refunds</h2>
          <p><strong>Standard Returns:</strong> Non-custom items may be returned within 7 days of delivery for store credit or exchange.</p>
          <p><strong>Custom Order Policy:</strong></p>
          <ul>
            <li>Same-day cancellation: Full refund (minus payment processing fees)</li>
            <li>2-3 days after order: 40% refund (covers material and design costs)</li>
            <li>After production begins: No refunds possible</li>
          </ul>
          <p><strong>Defective Items:</strong> Contact us within 48 hours of delivery with photos for replacement consideration.</p>
        </section>

        <section>
          <h2>5. Intellectual Property</h2>
          <p><strong>Design Rights:</strong> All custom designs remain intellectual property of Swadhin Fashion. Clients receive limited license for personal use only.</p>
          <p><strong>Photography:</strong> We reserve the right to use product photos for marketing, excluding client-provided personal images.</p>
        </section>

        <section>
          <h2>6. Liability</h2>
          <p><strong>Fit Guarantee:</strong> We provide size charts but cannot guarantee perfect fit for online orders. Alteration services available at additional cost.</p>
          <p><strong>Force Majeure:</strong> Not liable for delays due to events beyond our control including pandemics, natural disasters, or supply chain disruptions.</p>
        </section>

        <section>
          <h2>7. Dispute Resolution</h2>
          <p>All disputes will be resolved through arbitration in [Your City], India under Indian law. By placing an order, you waive rights to class action lawsuits.</p>
          <p>For any concerns, contact our Customer Relations Team at <a href="mailto:disputes@swadhinsupport.com">disputes@swadhinsupport.com</a>.</p>
        </section>

        <section className="last-updated">
          <p><em>Effective Date: {new Date().toLocaleDateString('en-IN')}</em></p>
          <p><em>These terms supersede all prior agreements.</em></p>
        </section>
      </div>
    </div>
  );
};

export default TermsPopup;