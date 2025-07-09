import React from "react";
import { Link } from "react-router-dom";
import "../styles/Footer.css";

const Footer = () => {
  const currentYear = new Date().getFullYear(); // Dynamically get the current year

  return (
    <footer className="footer" role="contentinfo">
      <p>© {currentYear} SWADHIN. All rights reserved.</p>
      <ul className="footer-links">
        <li>
          <Link to="/privacy" className="footer-link">
            Privacy Policy
          </Link>
        </li>
        <li>
          <Link to="/terms" className="footer-link">
            Terms of Service
          </Link>
        </li>
        <li>
          <Link to="/contact" className="footer-link">
            Contact Us
          </Link>
        </li>
      </ul>
    </footer>
  );
};

export default Footer;