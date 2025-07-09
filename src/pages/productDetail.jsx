import React, { useEffect, useState, useContext, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import ReviewSection from "../components/ReviewSection";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay, EffectFade, Pagination, Thumbs, FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/autoplay';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';
import 'swiper/css/thumbs';
import 'swiper/css/free-mode';
import "../styles/PruductDetail.css";

const ImageGallery = ({ images }) => {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/static')) return `http://localhost:5000${imagePath}`;
    return `http://localhost:5000/static/uploads/products/${imagePath}`;
  };

  return (
    <div className="product-images">
      <div className="main-swiper-container">
        <Swiper
          modules={[Navigation, Thumbs, EffectFade]}
          thumbs={{ swiper: thumbsSwiper }}
          navigation={{
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
          }}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          speed={800}
          spaceBetween={10}
          onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
          className="main-swiper"
        >
          {images.map((img, idx) => (
            <SwiperSlide key={`main-${idx}`}>
              <div className="swiper-zoom-container">
                <img
                  src={getImageUrl(img)}
                  alt={`product-${idx}`}
                  className="main-image"
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = '/placeholder-image.jpg';
                  }}
                />
              </div>
            </SwiperSlide>
          ))}
          
          {/* Custom navigation arrows */}
          <div className="swiper-button-prev">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 27 44">
              <path d="M0,22L22,0l2.1,2.1L4.2,22l19.9,19.9L22,44L0,22L0,22L0,22z" fill="#fff"/>
            </svg>
          </div>
          <div className="swiper-button-next">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 27 44">
              <path d="M27,22L5,44l-2.1-2.1L22.8,22L2.9,2.1L5,0L27,22L27,22L27,22z" fill="#fff"/>
            </svg>
          </div>
        </Swiper>
      </div>

      {images.length > 1 && (
        <div className="thumbnail-swiper-container">
          <Swiper
            modules={[FreeMode, Thumbs]}
            watchSlidesProgress
            onSwiper={setThumbsSwiper}
            spaceBetween={10}
            slidesPerView={5}
            freeMode={true}
            className="thumbnail-swiper"
          >
            {images.map((img, idx) => (
              <SwiperSlide key={`thumb-${idx}`}>
                <div className={`thumbnail-wrapper ${activeIndex === idx ? 'active' : ''}`}>
                  <img
                    src={getImageUrl(img)}
                    alt={`thumb-${idx}`}
                    className="thumbnail-image"
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = '/placeholder-image.jpg';
                    }}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}
    </div>
  );
};

const LuxuryProductCard = ({ product }) => {
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/static')) return `http://localhost:5000${imagePath}`;
    return `http://localhost:5000/static/uploads/products/${imagePath}`;
  };

  return (
    <Link 
      to={`/product/${product._id}`} 
      className="luxury-product-card"
      onClick={() => window.scrollTo(0, 0)}
    >
      <div className="luxury-image-container">
        <img 
          src={getImageUrl(product.image)} 
          alt={product.name} 
          className="luxury-product-image"
          loading="lazy"
          onError={(e) => {
            e.target.src = '/placeholder-image.jpg';
          }}
        />
      </div>
      <div className="luxury-product-info">
        <h5 className="luxury-product-name">{product.name}</h5>
        <p className="luxury-product-price">₹{product.price}</p>
      </div>
    </Link>
  );
};

const ProductDetail = () => {
  const { productId } = useParams();
  const { addToCart } = useContext(CartContext);

  const [product, setProduct] = useState(null);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [error, setError] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [allProducts, setAllProducts] = useState([]);

  const getUserInfo = () => {
    try {
      return JSON.parse(localStorage.getItem("userInfo")) || {};
    } catch {
      return {};
    }
  };

  const userEmail = getUserInfo().email || "";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (!productId) {
          throw new Error("Product ID not found in URL");
        }

        const [productRes, productsRes] = await Promise.all([
          fetch(`http://localhost:5000/api/products/${productId}`),
          fetch("http://localhost:5000/api/products")
        ]);

        if (!productRes.ok || !productsRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const [productData, productsData] = await Promise.all([
          productRes.json(),
          productsRes.json()
        ]);

        setProduct(productData);
        setAllProducts(productsData);

        if (productData.colors?.length > 0) {
          setSelectedColor(productData.colors[0]);
        }
        if (productData.sizes?.length > 0) {
          setSelectedSize(productData.sizes[0]);
        }

        if (userEmail) {
          const couponsRes = await fetch(
            `http://localhost:5000/api/user/coupons/available?email=${userEmail}`
          );
          if (couponsRes.ok) {
            const couponsData = await couponsRes.json();
            setCoupons(couponsData);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
        window.scrollTo(0, 0);
      }
    };

    fetchData();
  }, [productId, userEmail]);

  const handleApplyCoupon = async () => {
    try {
      const params = new URLSearchParams({
        code: couponCode.toUpperCase(),
        product_id: productId,
        user_email: userEmail
      });

      const response = await fetch(`http://localhost:5000/api/coupons/validate?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to validate coupon");
      }

      const couponData = await response.json();
      setAppliedCoupon(couponData);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleConfirmCouponUse = async (orderId) => {
    try {
      const response = await fetch("http://localhost:5000/api/coupons/confirm-use", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: appliedCoupon.code,
          user_email: userEmail,
          order_id: orderId
        })
      });

      if (!response.ok) {
        throw new Error("Failed to confirm coupon use");
      }
    } catch (err) {
      console.error("Coupon use confirmation failed:", err);
    }
  };

  const allImages = useMemo(() => [
    ...(product?.image ? [product.image] : []),
    ...(Array.isArray(product?.images) ? product.images : []),
  ].filter(Boolean), [product]);

  const finalPrice = useMemo(() => {
    if (!product) return 0;
    let price = product.price;
    if (appliedCoupon) {
      if (appliedCoupon.discount_type === "percentage") {
        price -= (price * appliedCoupon.amount) / 100;
      } else {
        price -= appliedCoupon.amount;
      }
    }
    return Math.round(price);
  }, [product, appliedCoupon]);

  const suggestedProducts = useMemo(() => 
    allProducts
      .filter(p => p._id !== product?._id && p.category === product?.category)
      .slice(0, 10)
  , [allProducts, product]);

  const handleAddToCart = () => {
    if (!selectedColor || !selectedSize) {
      alert("Please select both color and size");
      return;
    }

    const cartItem = {
      _id: product._id,
      name: product.name,
      price: finalPrice,
      originalPrice: product.price,
      discount: product.discount || 0,
      image: allImages[0],
      color: selectedColor,
      size: selectedSize,
      quantity,
      coupon_code: appliedCoupon?.code || null,
    };

    addToCart(cartItem);
    
    const tempOrderId = `temp_${Date.now()}`;
    if (appliedCoupon) {
      handleConfirmCouponUse(tempOrderId);
    }
    
    alert(`${quantity} ${quantity > 1 ? 'items' : 'item'} added to cart!`);
  };

  if (loading) return <div className="loading-spinner">Loading...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;
  if (!product) return <div>Product not found</div>;

  return (
    <div className="product-detail">
      <div className="product-main-section">
        <ImageGallery images={allImages} />

        <div className="product-info">
          <h2>{product.name}</h2>
          <p>{product.description}</p>

          <div className="price-section">
            <h4>
              ₹{finalPrice}
              {appliedCoupon && (
                <>
                  <span className="strikedPrice"> ₹{product.price}</span>
                  <span className="discountTag"> 🎁 Coupon Applied</span>
                </>
              )}
            </h4>
            {product.discount > 0 && !appliedCoupon && (
              <span className="original-price">₹{product.price + product.discount}</span>
            )}
          </div>

          {appliedCoupon && (
            <div className="applied-coupon-banner">
              🎉 You saved ₹{product.price - finalPrice} with <strong>{appliedCoupon.code}</strong>!
            </div>
          )}

          <div className="coupon-section">
            <input
              type="text"
              placeholder="Enter Coupon Code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              disabled={!!appliedCoupon}
            />
            {!appliedCoupon ? (
              <button onClick={handleApplyCoupon}>Apply</button>
            ) : (
              <button
                className="removeCouponBtn"
                onClick={() => {
                  setAppliedCoupon(null);
                  setCouponCode("");
                }}
              >
                Remove
              </button>
            )}
          </div>

          {coupons.length > 0 && (
            <div className="available-coupons">
              <p className="coupon-title">Available Coupons:</p>
              {coupons.map((c) => (
                <div
                  key={c.code}
                  className="coupon-item"
                  onClick={() => setCouponCode(c.code)}
                >
                  <strong>{c.code}</strong> - {c.discount_type === "percentage" 
                    ? `${c.amount}%` 
                    : `₹${c.amount}`} off
                  {c.min_order_price > 0 && ` (Min order: ₹${c.min_order_price})`}
                </div>
              ))}
            </div>
          )}

          <div className="quantity-selector">
            <h5>Quantity:</h5>
            <button 
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              disabled={quantity <= 1}
            >
              -
            </button>
            <span>{quantity}</span>
            <button 
              onClick={() => setQuantity(q => q + 1)}
              disabled={quantity >= 10}
            >
              +
            </button>
          </div>

          {product.colors?.length > 0 && (
            <div className="color-options">
              <h5>Colors:</h5>
              <div className="color-grid">
                {product.colors.map((color, idx) => (
                  <button
                    key={idx}
                    style={{ backgroundColor: color }}
                    className={`color-circle ${selectedColor === color ? "selected" : ""}`}
                    onClick={() => setSelectedColor(color)}
                    aria-label={`Select color ${color}`}
                  />
                ))}
              </div>
            </div>
          )}

          {product.sizes?.length > 0 && (
            <div className="size-options">
              <h5>Sizes:</h5>
              <div className="size-grid">
                {product.sizes.map((size, idx) => (
                  <button
                    key={idx}
                    className={`size-btn ${selectedSize === size ? "selected" : ""}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button 
            className="add-to-cart-btn" 
            onClick={handleAddToCart}
            disabled={!selectedColor || !selectedSize}
          >
            Add to Cart ({quantity})
          </button>
        </div>
      </div>

      <div className="review-container">
        <ReviewSection productId={product._id} />
      </div>

      {suggestedProducts.length > 0 && (
        <div className="luxury-suggested-section">
          <h3 className="luxury-section-title">You May Also Like</h3>
          
          {/* Manual Navigation Swiper */}
          <div className="luxury-swiper-container">
            <Swiper
              modules={[Navigation]}
              spaceBetween={24}
              slidesPerView={2}
              navigation
              breakpoints={{
                640: { slidesPerView: 3 },
                1024: { slidesPerView: 4 },
                1280: { slidesPerView: 5 }
              }}
              className="luxury-swiper manual-swiper"
            >
              {suggestedProducts.map((suggested) => (
                <SwiperSlide key={`manual-${suggested._id}`}>
                  <LuxuryProductCard product={suggested} />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {/* Auto-Sliding Swiper */}
          <div className="luxury-swiper-container">
            <Swiper
              modules={[Autoplay]}
              spaceBetween={20}
              slidesPerView={1.5}
              autoplay={{ delay: 3000, disableOnInteraction: false }}
              loop={suggestedProducts.length > 3}
              breakpoints={{
                480: { slidesPerView: 2.2 },
                640: { slidesPerView: 3 },
                1024: { slidesPerView: 4 },
                1280: { slidesPerView: 5 }
              }}
              className="luxury-swiper auto-swiper"
            >
              {suggestedProducts.map((suggested) => (
                <SwiperSlide key={`auto-${suggested._id}`}>
                  <LuxuryProductCard product={suggested} />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {/* Highlight Swiper */}
          <div className="luxury-swiper-container highlight-container">
            <Swiper
              modules={[EffectFade, Pagination]}
              effect="fade"
              fadeEffect={{ crossFade: true }}
              slidesPerView={1}
              spaceBetween={40}
              pagination={{ clickable: true }}
              className="luxury-swiper highlight-swiper"
            >
              {suggestedProducts.map((suggested) => (
                <SwiperSlide key={`highlight-${suggested._id}`}>
                  <LuxuryProductCard product={suggested} />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;