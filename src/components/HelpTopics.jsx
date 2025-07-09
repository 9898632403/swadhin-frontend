import React, { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import {
  X, Package, RefreshCw, CreditCard, User, Mail, Phone,
  HelpCircle, ChevronDown, Lock, Info, ShoppingBag,
  Headphones, Key, AlertCircle, CheckCircle, Shield,
  ArrowRight, ExternalLink
} from "react-feather";
import TrackOrderModal from "./TrackOrderModal";

const HelpTopics = ({ onClose = () => {} }) => {
  const { userInfo } = useContext(UserContext);
  const [activeCategory, setActiveCategory] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const navigate = useNavigate();

 useEffect(() => {
    if (userInfo?.email) {
      fetch(`http://localhost:5000/api/orders/${userInfo.email}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            const lastFiveOrders = data
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .slice(0, 5);
            setRecentOrders(lastFiveOrders);
            setSelectedOrderId(lastFiveOrders[0]?.orderId || lastFiveOrders[0]?._id);
          }
        })
        .catch(console.error);
    }
  }, [userInfo]);

  const faqs = [
    {
      question: "How can I track my order status?",
      answer: "Track your order in the Help Center under 'Where is my order?' section by selecting your recent order and clicking Track Package.",
      action: {
        text: "Go to tracking",
        icon: <ExternalLink size={14} />,
        onClick: () => setActiveCategory("order")
      }
    },
    {
      question: "How long does delivery usually take?",
      answer: "Standard delivery takes 3-7 business days depending on your location.",
    },
    {
      question: "Can I return or exchange a product?",
      answer: "Yes, within 48 hours for damaged or incorrect items. Submit a return request via Contact form.",
      action: {
        text: "Return a product",
        icon: <ExternalLink size={14} />,
        onClick: () => navigate("/contact?type=return")
      }
    },
  ];

  const categories = [
    {
      id: "order",
      title: "Order Assistance",
      icon: <Package size={18} />,
      options: [
        {
          label: "Where is my order?",
          content: (
            <div className="ai-help-content">
              <h4>Select Order</h4>
              {recentOrders?.length > 0 ? (
                <>
                  <select
                    onChange={(e) => setSelectedOrderId(e.target.value)}
                    className="ai-select"
                    value={selectedOrderId}
                  >
                    {recentOrders.map((order) => (
                      <option key={order.orderId || order._id} value={order.orderId || order._id}>
                        Order #{order.orderId || order._id} - {new Date(order.createdAt).toLocaleDateString()}
                      </option>
                    ))}
                  </select>
                  <div className="ai-order-status">
                    <p>Order #{selectedOrderId}</p>
                    <p>
                      Status: <span className={`status-${recentOrders.find(o => (o.orderId || o._id) === selectedOrderId)?.status.toLowerCase()}`}>
                        {recentOrders.find(o => (o.orderId || o._id) === selectedOrderId)?.status || "Processing"}
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={() => setShowTrackModal(true)}
                    className="ai-action-button"
                  >
                    <RefreshCw size={14} /> Track Package
                  </button>
                </>
              ) : (
                <div className="ai-no-orders">
                  <p>No recent orders found</p>
                  <button
                    onClick={() => navigate("/products")}
                    className="ai-action-button"
                  >
                    <ShoppingBag size={14} /> Start Shopping
                  </button>
                </div>
              )}
            </div>
          )
        },
        {
          label: "Need to modify or cancel my order",
          content: (
            <div className="ai-help-content">
              <div className="ai-info-box">
                <p>Contact our team with your order details for modifications or cancellations</p>
              </div>
              <button
                onClick={() => navigate("/contact?type=order-help")}
                className="ai-action-button"
              >
                <Headphones size={14} /> Contact Support
              </button>
            </div>
          )
        }
      ]
    },
    {
      id: "payment",
      title: "Payment & Billing",
      icon: <CreditCard size={18} />,
      options: [
        {
          label: "Payment status and issues",
          content: (
            <div className="space-y-4">
              <p className="text-gray-700">
                If you're facing payment issues such as deduction without confirmation, incorrect billing, or delay in payment update — we’re here to help.
              </p>
              <button
                onClick={() => {
                  onClose();
                  navigate("/contact?type=payment");
                }}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm flex items-center justify-center gap-2"
              >
                <HelpCircle size={14} /> Contact Support
              </button>
            </div>
          )
        }
      ]
    },
    {
      id: "account",
      title: "Account & Security",
      icon: <User size={18} />,
      options: [
        {
          label: "Account access issues",
          content: (
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg text-gray-700">
                <p>Can't log in? No worries — we recommend resetting your password using the option below.</p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  navigate("/auth");
                }}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm flex items-center justify-center gap-2"
              >
                <Key size={14} /> Reset Password
              </button>
            </div>
          )
        }
      ]
    },
    {
      id: "contact",
      title: "Contact Support",
      icon: <Headphones size={18} />,
      options: [
        {
          label: "Need more help?",
          content: (
            <div className="space-y-4">
              <div className="bg-indigo-50 p-4 rounded-lg text-indigo-700">
                Our dedicated support team is always ready to assist you. Please feel free to reach out.
              </div>
              <button
                onClick={() => {
                  onClose();
                  navigate("/contact");
                }}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2"
              >
                <HelpCircle size={16} /> Submit Support Request
              </button>
            </div>
          )
        }
      ]
    },
    {
      id: "faq",
      title: "Frequently Asked Questions",
      icon: <HelpCircle size={18} />,
      options: [
        {
          label: "Browse common questions",
          content: (
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="border-b border-gray-100 pb-3">
                  <button
                    onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                    className="w-full flex justify-between items-center text-left py-2"
                  >
                    <span className="font-medium text-gray-800">{faq.question}</span>
                    <motion.span
                      animate={{ rotate: activeFaq === index ? 180 : 0 }}
                      className="text-gray-500"
                    >
                      <ChevronDown size={18} />
                    </motion.span>
                  </button>
                  <AnimatePresence>
                    {activeFaq === index && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pl-1 text-sm text-gray-600 mt-2">
                          {faq.answer}
                          {faq.action && (
                            <button
                              onClick={faq.action.onClick}
                              className="mt-2 text-indigo-600 flex items-center gap-1 hover:underline"
                            >
                              {faq.action.text} {faq.action.icon}
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          )
        }
      ]
    }
  ];

  return (
    <div className="ai-chat-content">
      <h4>Help & Support</h4>
      
      <div className="ai-help-container">
        {categories.map((category) => (
          <motion.div
            key={category.id}
            className="ai-help-category"
          >
            <button
              onClick={() => setActiveCategory(activeCategory === category.id ? null : category.id)}
              className="ai-category-button"
            >
              <span>{category.icon}</span>
              <span>{category.title}</span>
              <motion.span
                animate={{ rotate: activeCategory === category.id ? 180 : 0 }}
              >
                ▼
              </motion.span>
            </button>

            <AnimatePresence>
              {activeCategory === category.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="ai-category-content"
                >
                  {category.options.map((option, i) => (
                    <div key={i} className="ai-option">
                      <h5>{option.label}</h5>
                      <div>{option.content}</div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {showTrackModal && selectedOrderId && (
        <TrackOrderModal
          orderId={selectedOrderId}
          onClose={() => setShowTrackModal(false)}
        />
      )}
    </div>
  );
};

export default HelpTopics;