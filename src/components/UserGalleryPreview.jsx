import React, { useEffect, useState, useContext } from 'react';
import '../styles/userGallery.css';
import { UserContext } from '../context/UserContext';
import { 
  Heart, 
  Share2, 
  ShoppingBag, 
  Trash2, 
  X, 
  Copy, 
  Gift, 
  AlertCircle,
  Loader,
  User as UserIcon,
  MessageCircle,
  Facebook,
  Twitter,
  Link
} from 'react-feather';

// Import Swiper components and styles
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const UserGalleryPreview = () => {
  const { userInfo } = useContext(UserContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likeStatus, setLikeStatus] = useState({});
  const [unlockedCoupons, setUnlockedCoupons] = useState([]);
  const [showShareMenu, setShowShareMenu] = useState({ 
    visible: false, 
    post: null 
  });

  const isAdmin = userInfo?.email === "admin@example.com";

  useEffect(() => {
    fetchGallery();
  }, []);

  useEffect(() => {
    if (userInfo?.email) {
      fetch(`http://localhost:5000/api/user/unlocked-coupons/${userInfo.email}`)
        .then(res => res.json())
        .then(data => {
          const newCoupons = Array.isArray(data)
            ? data.filter(coupon => !coupon.seen)
            : [];

          if (newCoupons.length > 0) {
            setUnlockedCoupons(newCoupons);

            fetch("http://localhost:5000/api/user/mark-coupons-seen", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: userInfo.email,
                codes: newCoupons.map(c => c.code),
              }),
            });
          }
        })
        .catch(err => console.error("Coupon fetch error:", err));
    }
  }, [userInfo]);

  const fetchGallery = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/lookbook');
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setPosts(data);
        const likedMap = {};
        data.forEach((post) => {
          if (post.likes?.includes(userInfo?.email)) {
            likedMap[post._id] = true;
          }
        });
        setLikeStatus(likedMap);
      } else {
        console.error('API response error:', data);
      }
    } catch (err) {
      console.error('Gallery fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const isVideo = (url) => {
    const lowered = url?.toLowerCase();
    return lowered?.endsWith('.mp4') || lowered?.includes('video');
  };

  const toggleLike = async (postId) => {
    if (!userInfo?.email) {
      alert("Please log in to like posts");
      return;
    }

    const isLiked = likeStatus[postId];

    try {
      const res = await fetch('http://localhost:5000/api/lookbook/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId,
          email: userInfo.email,
          action: isLiked ? 'unlike' : 'like',
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setLikeStatus((prev) => ({
          ...prev,
          [postId]: !isLiked,
        }));

        setPosts((prev) =>
          prev.map((post) =>
            post._id === postId
              ? {
                  ...post,
                  likes: isLiked
                    ? post.likes.filter((e) => e !== userInfo.email)
                    : [...(post.likes || []), userInfo.email],
                }
              : post
          )
        );

        if (data.unlocked_coupons && data.unlocked_coupons.length > 0) {
          setUnlockedCoupons(data.unlocked_coupons);
          await fetch("http://localhost:5000/api/user/unlocked-coupons", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              email: userInfo.email,
              codes: data.unlocked_coupons.map(c => c.code) 
            }),
          });
        }
      } else {
        alert(data.error || "Like action failed");
      }
    } catch (error) {
      console.error("Like error:", error);
      alert("Network error");
    }
  };

  const handleDelete = async (postId) => {
    const confirmDel = window.confirm("Delete this post permanently?");
    if (!confirmDel) return;

    try {
      const res = await fetch(`http://localhost:5000/api/lookbook/${postId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p._id !== postId));
        alert("Post deleted");
      } else {
        const data = await res.json();
        alert(data.error || "Deletion failed");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Server error");
    }
  };

  const handleShare = async (post) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Check out this look',
          text: `"${post.caption}" - shared by ${post.email}`,
          url: post.imageUrl,
        });
        return;
      }
      setShowShareMenu({ visible: true, post });
    } catch (err) {
      console.log('Share cancelled', err);
    }
  };

  const shareOnWhatsapp = () => {
    const text = encodeURIComponent(`Check this look: "${showShareMenu.post.caption}" ${showShareMenu.post.imageUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
    setShowShareMenu({ visible: false, post: null });
  };

  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(showShareMenu.post.imageUrl)}`, '_blank');
    setShowShareMenu({ visible: false, post: null });
  };

  const shareOnTwitter = () => {
    const text = encodeURIComponent(`"${showShareMenu.post.caption}" - Check out this look`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(showShareMenu.post.imageUrl)}`, '_blank');
    setShowShareMenu({ visible: false, post: null });
  };

  const copyLink = () => {
    navigator.clipboard.writeText(showShareMenu.post.imageUrl);
    alert('Link copied!');
    setShowShareMenu({ visible: false, post: null });
  };

  const copyCouponCode = (code) => {
    navigator.clipboard.writeText(code);
    alert('Coupon code copied!');
  };

  const redirectToProducts = () => {
    window.location.href = "/products";
  };

  // Determine post sections
  const staticPosts = posts.slice(0, 3);
  const manualSwiperPosts = posts.length > 3 ? posts.slice(3, Math.min(8, posts.length)) : [];
  const autoSwiperPosts = posts.length >= 9 ? posts.slice(8) : [];

  return (
    <div className="gallery-preview-section">
      <h2>Community Style Gallery</h2>
      <p className="subtitle">Discover authentic looks from our community</p>

      {unlockedCoupons.length > 0 && (
        <div className="coupon-popup-overlay">
          <div className="coupon-modal">
            <div className="coupon-header">
              <Gift size={24} className="gift-icon" />
              <h3>Congratulations!</h3>
              <button 
                onClick={() => setUnlockedCoupons([])} 
                className="close-modal-btn"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="coupon-body">
              <p>You've unlocked an exclusive discount:</p>
              <div className="coupon-code">
                {unlockedCoupons[0].code}
                <button 
                  onClick={() => copyCouponCode(unlockedCoupons[0].code)} 
                  className="copy-coupon"
                >
                  <Copy size={16} />
                </button>
              </div>
              
              {unlockedCoupons[0].amount && (
                <p className="discount-value">
                  {unlockedCoupons[0].discount_type === 'percentage'
                    ? `${unlockedCoupons[0].amount}% OFF`
                    : `₹${unlockedCoupons[0].amount} OFF`}
                </p>
              )}
            </div>
            
            <div className="coupon-actions">
              <button onClick={redirectToProducts} className="primary-action">
                <ShoppingBag size={16} /> Shop Now
              </button>
              <button onClick={() => setUnlockedCoupons([])} className="secondary-action">
                Continue Browsing
              </button>
            </div>
          </div>
        </div>
      )}

      {showShareMenu.visible && (
        <div className="share-menu-overlay">
          <div className="share-menu">
            <div className="share-menu-header">
              <h3>Share This Look</h3>
              <button onClick={() => setShowShareMenu({ visible: false, post: null })}>
                <X size={18} />
              </button>
            </div>
            <div className="share-platforms">
              <button onClick={shareOnWhatsapp}>
                <MessageCircle size={24} />
                WhatsApp
              </button>
              <button onClick={shareOnFacebook}>
                <Facebook size={24} />
                Facebook
              </button>
              <button onClick={shareOnTwitter}>
                <Twitter size={24} />
                Twitter
              </button>
              <button onClick={copyLink}>
                <Link size={24} />
                Copy Link
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-state">
          <Loader size={32} className="spinner" />
          <p>Loading gallery...</p>
        </div>
      ) : (
        <>
          {/* Static Grid Section (First 3 posts) */}
          {posts.length > 0 && (
            <div className="gallery-grid static-grid">
              {staticPosts.map((post) => (
                <div key={post._id} className="gallery-card">
                  <div className="media-container">
                    {isVideo(post.imageUrl) ? (
                      <video controls src={post.imageUrl} />
                    ) : (
                      <img src={post.imageUrl} alt={`Style by ${post.email}`} loading="lazy" />
                    )}
                  </div>
                  
                  <div className="card-content">
                    <blockquote className="caption">"{post.caption}"</blockquote>
                    <div className="user-info">
                      <UserIcon size={14} />
                      <span>{post.email}</span>
                    </div>
                  </div>

                  <div className="card-actions">
                    <button
                      onClick={() => toggleLike(post._id)}
                      className={`action-btn like-btn ${likeStatus[post._id] ? 'liked' : ''}`}
                    >
                      <Heart 
                        size={18} 
                        fill={likeStatus[post._id] ? 'currentColor' : 'none'} 
                      />
                      <span>{post.likes?.length || 0}</span>
                    </button>
                    
                    <button 
                      onClick={() => handleShare(post)} 
                      className="action-btn share-btn"
                    >
                      <Share2 size={18} />
                    </button>
                    
                    <button 
                      onClick={redirectToProducts} 
                      className="action-btn shop-btn"
                    >
                      <ShoppingBag size={18} />
                    </button>

                    {isAdmin && (
                      <button 
                        onClick={() => handleDelete(post._id)} 
                        className="action-btn delete-btn"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Manual Swiper Section (Posts 4-8) */}
          {manualSwiperPosts.length > 0 && (
            <div className="swiper-section">
              <h3 className="swiper-section-title">Featured Looks</h3>
              <Swiper
                modules={[Navigation, Pagination]}
                spaceBetween={20}
                slidesPerView={1}
                navigation
                pagination={{ clickable: true }}
                breakpoints={{
                  640: {
                    slidesPerView: 2,
                  }
                }}
              >
                {manualSwiperPosts.map((post) => (
                  <SwiperSlide key={post._id}>
                    <div className="gallery-card">
                      <div className="media-container">
                        {isVideo(post.imageUrl) ? (
                          <video controls src={post.imageUrl} />
                        ) : (
                          <img src={post.imageUrl} alt={`Style by ${post.email}`} loading="lazy" />
                        )}
                      </div>
                      
                      <div className="card-content">
                        <blockquote className="caption">"{post.caption}"</blockquote>
                        <div className="user-info">
                          <UserIcon size={14} />
                          <span>{post.email}</span>
                        </div>
                      </div>

                      <div className="card-actions">
                        <button
                          onClick={() => toggleLike(post._id)}
                          className={`action-btn like-btn ${likeStatus[post._id] ? 'liked' : ''}`}
                        >
                          <Heart 
                            size={18} 
                            fill={likeStatus[post._id] ? 'currentColor' : 'none'} 
                          />
                          <span>{post.likes?.length || 0}</span>
                        </button>
                        
                        <button 
                          onClick={() => handleShare(post)} 
                          className="action-btn share-btn"
                        >
                          <Share2 size={18} />
                        </button>
                        
                        <button 
                          onClick={redirectToProducts} 
                          className="action-btn shop-btn"
                        >
                          <ShoppingBag size={18} />
                        </button>

                        {isAdmin && (
                          <button 
                            onClick={() => handleDelete(post._id)} 
                            className="action-btn delete-btn"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          )}

          {/* Auto Swiper Section (Posts 9+) */}
          {autoSwiperPosts.length > 0 && (
            <div className="swiper-section">
              <h3 className="swiper-section-title">More Styles</h3>
              <Swiper
                modules={[Autoplay, Pagination]}
                spaceBetween={20}
                slidesPerView={1}
                loop={true}
                autoplay={{
                  delay: 3000,
                  disableOnInteraction: false,
                }}
                pagination={{
                  clickable: true,
                  dynamicBullets: true,
                }}
                breakpoints={{
                  640: {
                    slidesPerView: 2,
                  },
                  1024: {
                    slidesPerView: 3,
                  }
                }}
              >
                {autoSwiperPosts.map((post) => (
                  <SwiperSlide key={post._id}>
                    <div className="gallery-card">
                      <div className="media-container">
                        {isVideo(post.imageUrl) ? (
                          <video controls src={post.imageUrl} />
                        ) : (
                          <img src={post.imageUrl} alt={`Style by ${post.email}`} loading="lazy" />
                        )}
                      </div>
                      
                      <div className="card-content">
                        <blockquote className="caption">"{post.caption}"</blockquote>
                        <div className="user-info">
                          <UserIcon size={14} />
                          <span>{post.email}</span>
                        </div>
                      </div>

                      <div className="card-actions">
                        <button
                          onClick={() => toggleLike(post._id)}
                          className={`action-btn like-btn ${likeStatus[post._id] ? 'liked' : ''}`}
                        >
                          <Heart 
                            size={18} 
                            fill={likeStatus[post._id] ? 'currentColor' : 'none'} 
                          />
                          <span>{post.likes?.length || 0}</span>
                        </button>
                        
                        <button 
                          onClick={() => handleShare(post)} 
                          className="action-btn share-btn"
                        >
                          <Share2 size={18} />
                        </button>
                        
                        <button 
                          onClick={redirectToProducts} 
                          className="action-btn shop-btn"
                        >
                          <ShoppingBag size={18} />
                        </button>

                        {isAdmin && (
                          <button 
                            onClick={() => handleDelete(post._id)} 
                            className="action-btn delete-btn"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          )}

          {/* Empty State */}
          {posts.length === 0 && (
            <div className="empty-state">
              <AlertCircle size={48} />
              <p>No looks shared yet</p>
              <p>Be the first to showcase your style!</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UserGalleryPreview;