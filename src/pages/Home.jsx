import React, { useEffect, useState } from "react";
import { BASE_URL } from "../config";
import HeroSection from "../components/HeroSection";
import AISection from "../components/AISection";
import ScratchCardPopup from "../components/ScratchCardPopup";

const Home = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [userCoupon, setUserCoupon] = useState(null);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const userEmail = userInfo?.email || "";

    const hasUsedWelcome = localStorage.getItem(`welcomeUsed_${userEmail}`) === "true";

    if (!hasUsedWelcome && userInfo) {
      fetch(`${BASE_URL}/api/coupons`)
        .then((res) => res.json())
        .then((data) => {
          const welcomeCoupon = data.find((c) => c.is_welcome_coupon === true);
          if (welcomeCoupon) {
            setUserCoupon(welcomeCoupon);
            setShowPopup(true);
            localStorage.setItem(`coupon_${userEmail}`, JSON.stringify(welcomeCoupon));
          }
        });
    }

    // 🧠 Unlock autoplay
    const playSilentAudio = () => {
      const dummy = new Audio();
      dummy.muted = true;
      dummy.play().catch(() => {});
    };
    document.body.addEventListener("click", playSilentAudio, { once: true });
  }, []);

  const handleClose = () => setShowPopup(false);

  const handleReveal = () => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const userEmail = userInfo?.email || "";
    localStorage.setItem(`scratchRevealed_${userEmail}`, "true");

    if (userCoupon?.code) {
      localStorage.setItem(`usedCoupon_${userEmail}`, userCoupon.code);
    }
  };

  return (
    <main>
      {/* 🎁 Scratch popup */}
      {showPopup && userCoupon && (
        <ScratchCardPopup
          coupon={userCoupon}
          onClose={handleClose}
          onReveal={handleReveal}
        />
      )}

      <HeroSection />
      <AISection />
    </main>
  );
};

export default Home;