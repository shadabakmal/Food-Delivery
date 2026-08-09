import React from 'react';
import './Footer.css';
import { assets } from '../assets/frontend_assets/assets';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer" id="footer">
      <div className="footer-content">
        <div className="footer-content-left">
          <div className="footer-logo">
            <span className="logo-text">Tomato<span className="logo-dot">.</span></span>
          </div>
          <p>
            Delivering hot, fresh, and delicious meals straight to your doorstep with speed and safety. Experience fine dining at home with Tomato.
          </p>
          <div className="footer-social-icon">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" title="Facebook">
              <img src={assets.facebook_icon} alt="Facebook" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" title="Twitter/X">
              <img src={assets.twitter_icon} alt="Twitter" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" title="LinkedIn">
              <img src={assets.linkedin_icon} alt="LinkedIn" />
            </a>
          </div>
        </div>
        <div className="footer-content-center">
          <h2>COMPANY</h2>
          <ul>
            <li><a href="#explore-menu">Menu</a></li>
            <li><a href="#app-download">Mobile App</a></li>
            <li><Link to="/myorders">My Orders</Link></li>
            <li><a href="#footer">Privacy Policy</a></li>
          </ul>
        </div>
        <div className="footer-content-right">
          <h2>GET IN TOUCH</h2>
          <ul>
            <li>📞 +91 98765 43210</li>
            <li>✉️ support@tomato.com</li>
            <li>📍 Connaught Place, New Delhi, India</li>
          </ul>
        </div>
      </div>
      <hr />
      <p className="footer-copyright">Copyright 2026 © Tomato.com - All Rights Reserved.</p>
    </footer>
  );
}
