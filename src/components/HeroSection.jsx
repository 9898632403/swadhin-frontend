import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Parallax } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/parallax";
import "../styles/HeroSection.css";

const HeroSection = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });
  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  const [activeSlide, setActiveSlide] = useState(0);
  const [slides, setSlides] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [galleryTiles, setGalleryTiles] = useState([]);

  useEffect(() => {
    const brandStory = document.querySelector(".brand-story-section");

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          brandStory.classList.add("brand-story-visible");
        }
      },
      { threshold: 0.3 }
    );

    if (brandStory) observer.observe(brandStory);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    fetch("http://localhost:5000/hero-slides", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setSlides(data.slides || []))
      .catch((err) => console.error("❌ Hero slides fetch failed:", err));
  }, []);

  useEffect(() => {
    fetch("http://localhost:5000/api/products/trending")
      .then((res) => res.json())
      .then((data) => setTrendingProducts(data))
      .catch((err) => console.error("❌ Trending fetch failed:", err));
  }, []);

  useEffect(() => {
    fetch("http://localhost:5000/testimonials")
      .then(res => res.json())
      .then(data => {
        setTestimonials(data.testimonials || []);
      })
      .catch(err => {
        console.error("❌ Testimonials fetch failed:", err);
      });
  }, []);

  useEffect(() => {
    fetch("http://localhost:5000/gallery")
      .then((res) => {
        if (!res.ok) throw new Error(`Gallery fetch failed: ${res.status}`);
        return res.json();
      })
      .then((data) => setGalleryTiles(data.tiles || []))
      .catch(err => console.error("❌ Gallery tiles fetch failed:", err));
  }, []);

  return (
    <section className="hero-luxury" ref={containerRef}>
      {/* HERO SLIDES */}
      <div className="hero-slider-container">
        <Swiper
          modules={[Autoplay, EffectFade, Parallax]}
          effect="fade"
          speed={2000}
          parallax={true}
          autoplay={{ delay: 8500, disableOnInteraction: false }}
          loop={true}
          className="luxury-swiper"
          onSlideChange={(swiper) => setActiveSlide(swiper.realIndex)}
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={slide._id || index}>
              <motion.div className="hero-slide" style={{ y: yBg }}>
                {slide.type === "video" ? (
                  <video
                    className="hero-bg-media"
                    src={slide.src}
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                ) : (
                  <img
                    src={slide.src}
                    alt=""
                    className="hero-bg-media"
                    loading="eager"
                  />
                )}
                <div
                  className="overlay-tint"
                  style={{ backgroundColor: slide.overlayColor }}
                />
                <motion.div
                  className="hero-text-layer"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="text-container">
                    <motion.h1
                      className="serif-display"
                      data-swiper-parallax="-300"
                      data-swiper-parallax-duration="600"
                    >
                      {slide.text}
                    </motion.h1>
                    <motion.p
                      className="subtitle sans-serif"
                      data-swiper-parallax="-200"
                      data-swiper-parallax-duration="800"
                    >
                      {slide.subtitle}
                    </motion.p>
                  </div>
                </motion.div>
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="slide-indicator">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`indicator-dot ${index === activeSlide ? "active" : ""}`}
            />
          ))}
        </div>
      </div>

      {/* CTA BUTTONS */}
      <motion.div
        className="hero-cta-layer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.8, duration: 1.5 }}
      >
        <div className="cta-container">
          <button className="cta-button solid" onClick={() => navigate("/products")}>Explore Collection →</button>
          <div className="cta-divider"></div>
          <button className="cta-button outline" onClick={() => navigate("/gallery")}>View User Gallery ↗</button>
        </div>
      </motion.div>

      {/* TRENDING SECTION */}
      <div className="curated-section">
        <div className="section-header">
          <h2 className="serif-heading">Trending Now</h2>
          <p className="section-subtitle sans-serif">Discover what's captivating our community</p>
        </div>
        <div className="curated-grid">
          {trendingProducts.map((prod) => (
            <motion.div
              key={prod._id}
              className="curated-card"
              whileHover={{ y: -8 }}
              onClick={() => navigate(`/product/${prod._id}`)}
            >
              <div className="product-image-container">
                <img src={prod.image} alt={prod.name} className="product-image" />
                {prod.category && <div className="product-badge">{prod.category}</div>}
              </div>
              <div className="product-info">
                <h3 className="serif-subhead">{prod.name}</h3>
                <p className="product-price sans-serif">₹{prod.price}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* BRAND STORY */}
      <div className="brand-story-section">
        <div className="story-container">
          <div className="story-content">
            <span className="section-tag sans-serif">Heritage</span>
            <h2 className="serif-heading">The SWADHIN Narrative</h2>
            <div className="story-columns">
              <p className="lead-paragraph serif-body">
                In the quiet villages of India, where time moves to the rhythm of artisan hands, SWADHIN finds its soul.
              </p>
              <div className="column-group">
                <p className="serif-body">
                  Born from a reverence for traditional craftsmanship and sustainable practices, each collection tells a story of cultural preservation.
                </p>
                <p className="serif-body">
                  This is not merely fashion—it's wearable art with conscience.
                </p>
              </div>
            </div>
            <motion.button className="story-cta" whileHover={{ x: 4 }} onClick={() => navigate("/about")}>Discover Our Craft ⟶</motion.button>
          </div>
          <div className="story-visual">
            <div className="story-image-wrapper">
              <img src="/images/story-bg.jpg" alt="Artisans at work" className="story-image" />
              <div className="image-overlay"></div>
            </div>
            <div className="story-accent"></div>
          </div>
        </div>
      </div>

      {/* TESTIMONIAL SECTION */}
      <div className="testimonial-section">
        <div className="section-header">
          <h2 className="serif-heading">Voices of Appreciation</h2>
          <p className="section-subtitle sans-serif">From those who cherish authenticity</p>
        </div>
        <div className="testimonial-slider">
          <Swiper
            slidesPerView="auto"
            spaceBetween={40}
            centeredSlides={true}
            loop={true}
            autoplay={{ delay: 6000, disableOnInteraction: false }}
            className="testimonial-swiper"
          >
            {testimonials.length === 0 ? (
              <SwiperSlide>
                <div className="testimonial-card">
                  <div className="quote-mark serif-display">"</div>
                  <blockquote className="testimonial-quote serif-body">
                    No testimonials yet. Be the first to share your SWADHIN story.
                  </blockquote>
                  <div className="testimonial-author sans-serif">
                    <span className="author-name">Team SWADHIN</span>
                    <span className="author-location">India</span>
                  </div>
                </div>
              </SwiperSlide>
            ) : (
              testimonials.map((t, i) => {
                const raw = t.quote || "";
                const clean = raw.replace(/^["“”']+|["“”']+$/g, "").trim();
                return (
                  <SwiperSlide key={`${t._id}-${i}`} className="testimonial-slide">
                    <div className="testimonial-card">
                      {t.src && (
                        <div className="media-preview">
                          {t.type === "video" ? (
                            <video
                              src={t.src}
                              controls
                              muted
                              className="testimonial-media"
                            />
                          ) : (
                            <img
                              src={t.src}
                              alt={t.caption || "testimonial"}
                              className="testimonial-media"
                            />
                          )}
                        </div>
                      )}
                      <div className="quote-mark serif-display">"</div>
                      <blockquote className="testimonial-quote serif-body">
                        {clean || "No message provided."}
                      </blockquote>
                      <div className="testimonial-author sans-serif">
                        <span className="author-name">{t.author}</span>
                        {t.location && <span className="author-location">{t.location}</span>}
                      </div>
                      {t.caption && (
                        <p className="testimonial-caption sans-serif">{t.caption}</p>
                      )}
                    </div>
                  </SwiperSlide>
                );
              })
            )}
          </Swiper>
        </div>
      </div>

      {/* GALLERY SECTION */}
      <div className="gallery-section">
        <div className="section-header">
          <h2 className="serif-heading">The Artisan Journey</h2>
          <p className="section-subtitle sans-serif">Witness the hands behind each creation</p>
        </div>
        <div className="gallery-grid">
          {galleryTiles.length === 0 ? (
            <p className="sans-serif" style={{ textAlign: "center" }}>
              No gallery tiles available yet.
            </p>
          ) : (
            galleryTiles.map((tile) => (
              <motion.div
                key={tile._id}
                className="gallery-tile"
                whileHover={{ scale: 0.98 }}
                transition={{ duration: 0.4 }}
              >
                {tile.type === "video" ? (
                  <video
                    src={tile.src}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="tile-image"
                  />
                ) : (
                  <img
                    src={tile.src}
                    alt={tile.caption || "Gallery Tile"}
                    className="tile-image"
                  />
                )}
                <div className="tile-overlay">
                  <p className="tile-caption sans-serif">{tile.caption}</p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
