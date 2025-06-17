import React from 'react'
import './Footer.css'
import { assets } from '../assets/frontend_assets/assets'
export default function Footer() {
  return (
    <div className="footer" id="footer">
        <div className="footer-content">
        <div className="footer-content-left">
            <img src={assets.logo} alt=""/>
            <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Expedita accusantium laudantium aut, explicabo, dolore minima praesentium a corporis excepturi architecto, consectetur commodi recusandae non.Lorem ipsum dolor sit amet consectetur, adipisicing elit. Expedita accusantium laudantium aut, explicabo, dolore minima praesentium a corporis excepturi architecto, consectetur commodi recusandae non.</p>
            <div className="footer-social-icon">
                <img src={assets.facebook_icon} alt=""  />
                <img src={assets.linkedin_icon} alt=""  />
                <img src={assets.twitter_icon} alt=""  />
            </div>
        </div>
        <div className="footer-content-center">
            <h2>COMPANY</h2>
            <ul>
                <li>Home</li>
                <li>About us</li>
                <li>Delivery</li>
                <li>Privacy policy</li>
            </ul>
        </div>
        <div className="footer-content-right">
            <h2>Get in Touch</h2>
            <ul>
                <li>+1-245-756-3244</li>
                <li>contact@tomato.com</li>
            </ul>
        </div>
    </div>
    <hr />
    <p className="footer-copyright">copyright 2025 @ Tomato.com- All Right Reserved.</p>
    </div>
  )
}
