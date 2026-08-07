import React, { useContext, useState, useEffect } from 'react';
import './Cart.css';
import { StoreContext } from '../../Context/StoreContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { User, MapPin, Wallet, CheckCircle2, HelpCircle, Plus, Minus, Tag, ShieldCheck } from 'lucide-react';
import { assets } from '../../assets/frontend_assets/assets';

export default function Cart({ setShowLogin }) {
  const { cartItems, food_list, addToCart, removeFromCart, getTotalCartAmount, token, url } = useContext(StoreContext);
  const navigate = useNavigate();

  const [selectedAddress, setSelectedAddress] = useState('home');
  const [suggestions, setSuggestions] = useState('');
  const [noContact, setNoContact] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);

  const [addressData, setAddressData] = useState({
    firstName: "Shadab",
    lastName: "Akmal",
    email: "akmal@gmail.com",
    street: "B29, Govindpur Road, Sardar Patel Nagar",
    city: "Dhanbad",
    state: "Jharkhand",
    pincode: "826001",
    country: "India",
    phone: "9876543210"
  });

  const cartHasItems = food_list.some(item => cartItems[item._id] > 0);
  const subTotal = getTotalCartAmount();
  const deliveryFee = subTotal === 0 ? 0 : 40;
  const discount = couponApplied ? Math.min(subTotal * 0.15, 150) : 0;
  const gstCharges = subTotal === 0 ? 0 : Math.round(subTotal * 0.05);
  const finalTotal = subTotal === 0 ? 0 : Math.max(0, subTotal + deliveryFee + gstCharges - discount);

  const handlePlaceOrder = async (e) => {
    if (e) e.preventDefault();
    if (!token) {
      if (setShowLogin) setShowLogin(true);
      return;
    }

    let orderItems = [];
    food_list.forEach((item) => {
      if (cartItems[item._id] > 0) {
        orderItems.push({ ...item, quantity: cartItems[item._id] });
      }
    });

    let orderData = {
      address: addressData,
      items: orderItems,
      amount: finalTotal
    };

    try {
      let response = await axios.post(
        url + "api/order/place",
        orderData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        const { session_url } = response.data;
        window.location.replace(session_url);
      } else {
        alert("Error placing order: " + (response.data.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Order placement error:", err);
      alert("Order placement failed. Please try again.");
    }
  };

  // Swiggy Empty Cart View (Screenshot 5)
  if (!cartHasItems) {
    return (
      <div className="swiggy-checkout-page">
        {/* Header Bar */}
        <header className="swiggy-checkout-header">
          <div className="header-inner">
            <div className="brand-left">
              <Link to="/" className="swiggy-brand-logo">
                <span className="brand-icon">🍊</span>
                <span className="brand-title">SECURE CHECKOUT</span>
              </Link>
            </div>
            <div className="header-right-nav">
              <span className="help-link"><HelpCircle size={18} /> Help</span>
              <span className="user-link">
                <User size={18} /> {token ? "Shadab Akmal" : "Sign In"}
              </span>
            </div>
          </div>
        </header>

        {/* Empty Cart Center Display */}
        <div className="swiggy-empty-cart-container">
          <div className="cooking-pan-illustration">
            <div className="pan-handle"></div>
            <div className="pan-body">
              <div className="flame-glow"></div>
              <span className="cooking-veggies">🌶️ 🥦 🧄</span>
            </div>
          </div>

          <h2 className="empty-title">Your cart is empty</h2>
          <p className="empty-subtext">You can go to home page to view more restaurants</p>
          
          <button className="see-restaurants-btn" onClick={() => navigate('/')}>
            SEE RESTAURANTS NEAR YOU
          </button>
        </div>
      </div>
    );
  }

  // Active Swiggy Checkout View (Screenshots 1, 2, 3)
  return (
    <div className="swiggy-checkout-page">
      {/* Header Bar */}
      <header className="swiggy-checkout-header">
        <div className="header-inner">
          <div className="brand-left">
            <Link to="/" className="swiggy-brand-logo">
              <span className="brand-icon">🍊</span>
              <span className="brand-title">SECURE CHECKOUT</span>
            </Link>
          </div>
          <div className="header-right-nav">
            <span className="help-link"><HelpCircle size={18} /> Help</span>
            <span className="user-link">
              <User size={18} /> {token ? "Shadab Akmal" : "Sign In"}
            </span>
          </div>
        </div>
      </header>

      <div className="swiggy-checkout-main">
        {/* Left Column: Vertical Timeline Stepper */}
        <div className="swiggy-stepper-column">
          
          {/* STEP 1: ACCOUNT */}
          <div className="stepper-block">
            <div className="step-timeline-icon active">
              <User size={18} />
            </div>
            <div className="step-card-content">
              {token ? (
                <div className="logged-in-box">
                  <div className="step-title-row">
                    <h3>Logged in</h3>
                    <CheckCircle2 color="#2a9d8f" size={20} />
                  </div>
                  <p className="user-info-text">Shadab Akmal | 9876543210</p>
                </div>
              ) : (
                <div className="account-prompt-box">
                  <h3>Account</h3>
                  <p className="step-desc">To place your order now, log in to your existing account or sign up.</p>
                  <div className="auth-btn-row">
                    <button className="auth-btn-outline" onClick={() => setShowLogin && setShowLogin(true)}>
                      Have an account?<br/><strong>LOG IN</strong>
                    </button>
                    <button className="auth-btn-solid" onClick={() => setShowLogin && setShowLogin(true)}>
                      New to Tomato?<br/><strong>SIGN UP</strong>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="vertical-timeline-line"></div>

          {/* STEP 2: DELIVERY ADDRESS */}
          <div className="stepper-block">
            <div className="step-timeline-icon active">
              <MapPin size={18} />
            </div>
            <div className="step-card-content">
              <div className="step-title-row">
                <h3>Choose a delivery address</h3>
                <span className="sub-title-text">Multiple addresses in this location</span>
              </div>

              <div className="address-cards-grid">
                {/* Home Address Card */}
                <div className={`address-card ${selectedAddress === 'home' ? 'selected' : ''}`}>
                  <div className="addr-icon"><span className="addr-emoji">🏠</span> <strong>Home</strong></div>
                  <p className="addr-text">B29, Govindpur Road, Sardar Patel Nagar, Dhanbad, Jharkhand 826001</p>
                  <span className="eta-tag">25 MINS</span>
                  <button className="deliver-here-btn" onClick={() => setSelectedAddress('home')}>
                    DELIVER HERE
                  </button>
                </div>

                {/* Hostel Address Card */}
                <div className={`address-card ${selectedAddress === 'hostel' ? 'selected' : ''}`}>
                  <div className="addr-icon"><span className="addr-emoji">📍</span> <strong>Hostel</strong></div>
                  <p className="addr-text">Aquamarine Hostel, IIT ISM Dhanbad, Govindpur Road, Jharkhand</p>
                  <span className="eta-tag">25 MINS</span>
                  <button className="deliver-here-btn" onClick={() => setSelectedAddress('hostel')}>
                    DELIVER HERE
                  </button>
                </div>

                {/* Add New Address */}
                <div className="address-card add-new">
                  <div className="addr-icon"><Plus size={20} color="#2a9d8f" /> <strong>Add New Address</strong></div>
                  <button className="add-new-btn">+ ADD NEW</button>
                </div>
              </div>
            </div>
          </div>

          <div className="vertical-timeline-line"></div>

          {/* STEP 3: PAYMENT */}
          <div className="stepper-block">
            <div className="step-timeline-icon">
              <Wallet size={18} />
            </div>
            <div className="step-card-content">
              <h3 className="payment-title">Payment</h3>
              <p className="payment-sub">Choose payment method to complete order</p>
            </div>
          </div>
        </div>

        {/* Right Column: Swiggy Order Summary Sidebar */}
        <div className="swiggy-sidebar-column">
          <div className="swiggy-order-summary-card">
            
            {/* Restaurant Header */}
            <div className="summary-restaurant-header">
              <img src={assets.food_1} alt="Restaurant" className="summary-rest-img" />
              <div>
                <h4>Tomato Kitchen Hub</h4>
                <p>Connaught Place, New Delhi</p>
              </div>
            </div>

            {/* Selected Items List */}
            <div className="summary-items-list">
              {food_list.map((item) => {
                if (cartItems[item._id] > 0) {
                  return (
                    <div key={item._id} className="summary-item-row">
                      <div className="item-name-box">
                        <span className="veg-icon">🟢</span>
                        <span className="item-name-str">{item.name}</span>
                      </div>

                      <div className="item-qty-control">
                        <button onClick={() => removeFromCart(item._id)}><Minus size={12} /></button>
                        <span>{cartItems[item._id]}</span>
                        <button onClick={() => addToCart(item._id)}><Plus size={12} /></button>
                      </div>

                      <span className="item-price-str">₹{item.price * cartItems[item._id]}</span>
                    </div>
                  );
                }
                return null;
              })}
            </div>

            {/* Suggestions Box */}
            <div className="suggestions-box">
              <input 
                type="text" 
                placeholder="“ Any suggestions? We will pass it on... ”" 
                value={suggestions}
                onChange={(e) => setSuggestions(e.target.value)}
              />
            </div>

            {/* No-contact Delivery Checkbox */}
            <div className="no-contact-box">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={noContact} 
                  onChange={(e) => setNoContact(e.target.checked)} 
                />
                <div>
                  <strong>Opt in for No-contact Delivery</strong>
                  <p>Partner will safely place the order outside your door.</p>
                </div>
              </label>
            </div>

            {/* Apply Coupon Box */}
            <div className="coupon-box">
              <div className="coupon-input-row">
                <Tag size={16} color="#e63946" />
                <input 
                  type="text" 
                  placeholder="Apply Coupon (Use SWIGGY15)" 
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                />
                <button onClick={() => setCouponApplied(!couponApplied)}>
                  {couponApplied ? 'APPLIED' : 'APPLY'}
                </button>
              </div>
            </div>

            {/* Bill Details */}
            <div className="bill-details-section">
              <h5>Bill Details</h5>

              <div className="bill-row">
                <span>Item Total</span>
                <span>₹{subTotal}</span>
              </div>

              <div className="bill-row">
                <span>Delivery Fee | 4.2 kms</span>
                <span className="delivery-free-str">₹40 <span className="free-badge">FREE</span></span>
              </div>

              {couponApplied && (
                <div className="bill-row discount">
                  <span>Item Discount</span>
                  <span className="discount-val">- ₹{discount}</span>
                </div>
              )}

              <div className="bill-row">
                <span>GST & Other Charges</span>
                <span>₹{gstCharges}</span>
              </div>

              <div className="bill-row total-pay-row">
                <span>TO PAY</span>
                <span className="final-pay-amount">₹{finalTotal}</span>
              </div>
            </div>

            {/* Proceed to Payment Action Button */}
            <button className="swiggy-pay-btn" onClick={handlePlaceOrder}>
              {token ? `PAY ₹${finalTotal} & PLACE ORDER` : 'LOGIN TO PROCEED'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
