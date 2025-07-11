import React, { useContext, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { UserContext } from "../context/UserContext";
import { motion, AnimatePresence } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, FreeMode } from "swiper/modules";
import {
  Home,
  ShoppingBag,
  Plus,
  Tag,
  BarChart2,
  Users,
  Clock,
  User,
  LogIn,
  LogOut,
  Menu,
  X,
  Settings,
  ShoppingCart
} from "react-feather";
import "../styles/Navbar.css";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/free-mode";
import { BASE_URL } from "../config";

const Navbar = () => {
  const { cart } = useContext(CartContext);
  const { userInfo, setUserInfo } = useContext(UserContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [activeLink, setActiveLink] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);

  useEffect(() => {
    setActiveLink(location.pathname);
  }, [location]);

  const getActiveRouteName = () => {
    switch(location.pathname) {
      case '/': return 'Home';
      case '/products': return 'Products';
      case '/cart': return 'Cart';
      default: return '';
    }
  };

  const handleScroll = (e, id) => {
    if (location.pathname === "/") {
      e.preventDefault();
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const handleLogout = () => {
    fetch(`${BASE_URL}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then(() => {
        setUserInfo(null);
        localStorage.removeItem("token");
        navigate("/auth");
      })
      .catch((err) => console.error(err));
  };

  const userEmail = userInfo?.email || userInfo?.user?.email || "";
  const userName = userInfo?.name || userEmail.split("@")[0] || "Guest";
  const isAdmin = userEmail === "admin@example.com";

  const navLinks = [
    { path: "/", name: "Home", icon: Home, scrollId: "hero" },
    { path: "/products", name: "Products", icon: ShoppingBag },
    { path: "/cart", name: "Cart", icon: ShoppingCart },
    { path: "/orderhistory", name: "History", icon: Clock }
  ];

  const adminLinks = [
    { path: "/admin/add-product", name: "Add Product", icon: Plus },
    { path: "/admin/add-coupon", name: "Coupons", icon: Tag },
    { path: "/admin/dashboard", name: "Dashboard", icon: BarChart2 },
    { path: "/admin/users", name: "Users", icon: Users },
    { path: "/admin/hero-form", name: "Hero Banner", icon: Plus },
    { path: "/admin/gallery-form", name: "Gallery", icon: Plus },
    { path: "/admin/testimonial-form", name: "Testimonials", icon: Users }
  ];

  return (
    <nav className="luxury-navbar">
      <div className="navbar-container">
        {/* Logo Section */}
        <motion.div 
          className="navbar-logo"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <Link to="/" className="logo-link">
            <motion.span 
              className="logo-text"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{
                scale: 1.05,
                textShadow: "0 0 12px rgba(219, 193, 172, 0.7)"
              }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              Swadhin
              <span className="lg:hidden ml-2 text-sm font-normal">
                {getActiveRouteName()}
              </span>
            </motion.span>
            <motion.div
              className="logo-shimmer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              transition={{
                repeat: Infinity,
                repeatType: "reverse",
                duration: 3,
                ease: "easeInOut"
              }}
            />
          </Link>
        </motion.div>

        {/* Desktop Navigation */}
        <div className="desktop-nav">
          <ul className="nav-links">
            {navLinks.map((link) => (
              <motion.li 
                key={link.path} 
                whileHover={{ y: -2 }}
                className="nav-item"
              >
                <Link
                  to={link.path}
                  onClick={(e) => link.scrollId && handleScroll(e, link.scrollId)}
                  className={`nav-link ${activeLink === link.path ? "active" : ""}`}
                  aria-label={link.name}
                >
                  <link.icon size={18} className="nav-icon" />
                  <span>{link.name}</span>
                  {link.path === "/cart" && (
                    <motion.span
                      className="cart-badge"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      whileTap={{ scale: 0.8 }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 500,
                        damping: 15
                      }}
                    >
                      {cart.length}
                    </motion.span>
                  )}
                </Link>
                {activeLink === link.path && (
                  <motion.div
                    className="nav-underline"
                    layoutId="navUnderline"
                    transition={{ 
                      type: "spring", 
                      stiffness: 300, 
                      damping: 25,
                      mass: 0.5
                    }}
                  />
                )}
              </motion.li>
            ))}

            {isAdmin && (
              <motion.li 
                className="admin-menu"
                whileHover={{ y: -2 }}
              >
                <motion.button
                  className={`admin-toggle ${isAdminMenuOpen ? "active" : ""}`}
                  onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Admin menu"
                >
                  <Settings size={18} className="nav-icon" />
                  <span>Admin</span>
                </motion.button>

                <AnimatePresence>
                  {isAdminMenuOpen && (
                    <motion.div
                      className="admin-dropdown"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      {adminLinks.map((link, index) => (
                        <motion.div
                          key={link.path}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Link
                            to={link.path}
                            className="admin-link"
                            onClick={() => setIsAdminMenuOpen(false)}
                            aria-label={link.name}
                          >
                            <link.icon size={16} />
                            <span>{link.name}</span>
                          </Link>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.li>
            )}
          </ul>
        </div>

        {/* User Section */}
        <div className="user-section">
          {userEmail ? (
            <motion.div
              className="user-greeting"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <motion.div
                className="user-badge"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <User size={18} className="user-icon" />
                <span className="user-name">Hi, {userName}</span>
              </motion.div>
              <motion.button
                className="logout-btn"
                onClick={handleLogout}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Logout"
              >
                <LogOut size={18} />
              </motion.button>
            </motion.div>
          ) : (
            <Link to="/auth" className="auth-link">
              <LogIn size={18} />
              <span>Login</span>
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <motion.button
          className="mobile-menu-btn"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Menu"
        >
          {isMenuOpen ? (
            <X size={24} className="menu-icon" />
          ) : (
            <Menu size={24} className="menu-icon" />
          )}
        </motion.button>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className="mobile-nav"
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              transition={{ 
                type: "spring", 
                damping: 25,
                stiffness: 300
              }}
            >
              <div className="mobile-nav-header">
                <motion.div
                  className="user-avatar"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <User size={24} />
                </motion.div>
                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  {userName}
                </motion.span>
              </div>

              <Swiper
                modules={[Navigation, FreeMode]}
                spaceBetween={16}
                slidesPerView={3}
                freeMode={true}
                navigation
                className="mobile-swiper-nav"
              >
                {navLinks.map((link, index) => (
                  <SwiperSlide key={link.path}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + index * 0.05 }}
                    >
                      <Link
                        to={link.path}
                        onClick={(e) => {
                          link.scrollId && handleScroll(e, link.scrollId);
                          setIsMenuOpen(false);
                        }}
                        className={`mobile-nav-link ${activeLink === link.path ? "active" : ""}`}
                        aria-label={link.name}
                      >
                        <link.icon size={18} />
                        <span>{link.name}</span>
                        {link.path === "/cart" && (
                          <motion.span
                            className="mobile-cart-badge"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ 
                              type: "spring", 
                              stiffness: 500,
                              delay: 0.3 + index * 0.05
                            }}
                          >
                            {cart.length}
                          </motion.span>
                        )}
                      </Link>
                    </motion.div>
                  </SwiperSlide>
                ))}
              </Swiper>

              {isAdmin && (
                <div className="mobile-admin-section">
                  <motion.h4
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    Admin Tools
                  </motion.h4>
                  <div className="mobile-admin-links">
                    {adminLinks.map((link, index) => (
                      <motion.div
                        key={link.path}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.45 + index * 0.05 }}
                      >
                        <Link
                          to={link.path}
                          className="mobile-admin-link"
                          onClick={() => setIsMenuOpen(false)}
                          aria-label={link.name}
                        >
                          <link.icon size={16} />
                          <span>{link.name}</span>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mobile-auth-section">
                {userEmail ? (
                  <motion.button
                    className="mobile-logout-btn"
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    aria-label="Logout"
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </motion.button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <Link
                      to="/auth"
                      className="mobile-login-btn"
                      onClick={() => setIsMenuOpen(false)}
                      aria-label="Login"
                    >
                      <LogIn size={18} />
                      <span>Login / Signup</span>
                    </Link>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;