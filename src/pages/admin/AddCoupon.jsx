import React from "react";
import CouponForm from "../../components/CouponForm";

export default function AddCoupon() {
  return (
    <div style={{ padding: "20px" }}>
      <h2>🛍️ Admin: Add New Coupon</h2>
      <CouponForm />
    </div>
  );
}
