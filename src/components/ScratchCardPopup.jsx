import React, { useEffect, useState } from "react";
import "../styles/quizPopup.css";

const ScratchCardPopup = ({ coupon, onClose, onReveal }) => {
  const [revealed, setRevealed] = useState(false);

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const userEmail = userInfo?.email || "";

  useEffect(() => {
    const alreadyRevealed = localStorage.getItem(`scratchRevealed_${userEmail}`);
    if (alreadyRevealed === "true") {
      setRevealed(true);
    }
  }, [userEmail]);

  const handleReveal = () => {
    setRevealed(true);
    localStorage.setItem(`scratchRevealed_${userEmail}`, "true");

    // Save the coupon for this user (even if not used yet)
    localStorage.setItem(`coupon_${userEmail}`, JSON.stringify(coupon));

    // Let parent know
    onReveal();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(coupon.code);
    alert("🎉 Coupon copied: " + coupon.code);
  };

  return (
    <div className="quizPopupOverlay">
      <div className="quizPopupCard">
        <h2 className="popupTitle">🎉 You’ve got a Welcome Coupon!</h2>
        {!revealed ? (
          <button className="scratchButton" onClick={handleReveal}>
            ✨ Scratch to Reveal
          </button>
        ) : (
          <>
            <p className="couponCode">
              Coupon: <strong>{coupon.code}</strong>
            </p>
            <p className="couponDiscount">
              Discount:{" "}
              {coupon.discount_type === "percentage"
                ? `${coupon.amount}%`
                : `₹${coupon.amount}`}
            </p>
            <button className="copyButton" onClick={handleCopy}>📋 Copy Code</button>
            <button className="closeButton" onClick={onClose}>Close</button>
          </>
        )}
      </div>
    </div>
  );
};

export default ScratchCardPopup;
