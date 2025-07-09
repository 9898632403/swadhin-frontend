import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Products from "./pages/Products";
import ProductDetail from "./pages/productDetail";
import Contact from "./pages/Contact";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { CartProvider } from "./context/CartContext";
import { UserProvider } from "./context/UserContext";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import UserInfo from "./pages/UserInfo";
import Auth from "./pages/Auth";
import OrderConfirmation from "./pages/OrderConfirmation";
import OrderHistory from "./pages/OrderHistory";
// import Chatbot from "./components/Chatbot";
import ProductForm from "./components/ProductForm";
import StyleQuiz from "./pages/StyleQuiz";
import ProtectedRoute from "./components/ProtectedRoute";
import UserGallery from './pages/UserGallery';
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";

// ✅ Admin Pages
import AddCoupon from './pages/admin/AddCoupon';
import AllCoupons from './pages/admin/AllCoupons';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import HeroForm from "./components/HeroSlideForm"; // ya jaha bhi file hai
import TestimonialForm from "./components/TestimonialForm";
import GalleryTileForm from "./components/GalleryTileForm";



// ✅ Google OAuth
import { GoogleOAuthProvider } from '@react-oauth/google';

function App() {
  return (
    <GoogleOAuthProvider clientId="514242313773-ic3td639ucmhu1493eh5m35r9pi5s7pp.apps.googleusercontent.com">
      <UserProvider>
        <CartProvider>
          <Router>
            <Navbar />
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/products" element={<Products />} />
              <Route path="/product/:productId" element={<ProductDetail />} />
              <Route path="/gallery" element={<UserGallery />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/style-quiz" element={<StyleQuiz />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />

              {/* 🔒 Protected User Routes */}
              <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
              <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
              <Route path="/userinfo" element={<ProtectedRoute><UserInfo /></ProtectedRoute>} />
              <Route path="/orderhistory" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
               {/* 🛠️ Admin-only Routes */}
              <Route path="/admin/add-product" element={<ProtectedRoute adminOnly={true}><ProductForm /></ProtectedRoute>} />
              <Route path="/admin/add-coupon" element={<ProtectedRoute adminOnly={true}><AddCoupon /></ProtectedRoute>} />
              <Route path="/admin/all-coupons" element={<ProtectedRoute adminOnly={true}><AllCoupons /></ProtectedRoute>} />
              <Route path="/admin/dashboard" element={<ProtectedRoute adminOnly={true}><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute adminOnly={true}><AdminUsers /></ProtectedRoute>} />
              <Route path="/admin/hero-form" element={<ProtectedRoute adminOnly={true}><HeroForm /></ProtectedRoute>} />
              <Route path="/admin/testimonial-form" element={<ProtectedRoute adminOnly={true}><TestimonialForm /></ProtectedRoute>} />
              <Route path="/admin/gallery-form" element={<ProtectedRoute adminOnly={true}><GalleryTileForm /></ProtectedRoute>} />

              {/* Fallback */}
              <Route path="*" element={<div>Page not found</div>} />
            </Routes>
            {/* <Chatbot /> */}
            <Footer />
          </Router>
        </CartProvider>
      </UserProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
