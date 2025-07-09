import React from "react";
import "../styles/couponPopup.css";

const CouponPopup = ({ coupons, onClose }) => {
  return (
    <div className="quizPopupOverlay">
      <div className="couponPopupCard">
        <button className="closeBtn" onClick={onClose}>
          &times;
        </button>
        <h2 className="popupTitle">🎁 Surprise Coupons Just for You!</h2>

        <div className="couponList">
          {coupons.map((coupon, index) => (
            <div key={index} className="scratchCard">
              <p className="couponCode">Code: <strong>{coupon.code}</strong></p>
              <p className="couponDetails">
                {coupon.discount_type === "percent"
                  ? `${coupon.amount}% OFF`
                  : `₹${coupon.amount} OFF`}
              </p>
              {coupon.applies_to === "product" && coupon.product_ids?.length > 0 && (
                <p className="couponTag">Applicable on selected products</p>
              )}
              {coupon.expiry_date && (
                <p className="couponExpiry">Valid till: {coupon.expiry_date}</p>
              )}
            </div>
          ))}
        </div>

        <p className="footerNote">Apply these at checkout and save big! 🛍️</p>
      </div>
    </div>
  );
};

export default CouponPopup;
