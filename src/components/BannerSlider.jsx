import React from "react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import "../styles/bannerSlider.css";

const BannerSlider = ({ banners }) => {
  console.log("📸 Banners from props:", banners);

  return (
    <div className="banner-slider-container">
      <Carousel
        showThumbs={false}
        autoPlay
        infiniteLoop
        showStatus={false}
        interval={4000}
        stopOnHover={true}
        swipeable
        emulateTouch
      >
        {banners.map((banner, index) => (
          <div
            key={index}
            className="banner-slide"
            onClick={() => {
              if (banner.redirectUrl) {
                window.location.href = banner.redirectUrl;
              }
            }}
            style={{ cursor: banner.redirectUrl ? "pointer" : "default" }}
          >
            <img
              src={banner.imageUrl} // ✅ direct full URL
              alt={`Banner ${index + 1}`}
              className="banner-image"
            />
          </div>
        ))}
      </Carousel>
    </div>
  );
};

export default BannerSlider;
