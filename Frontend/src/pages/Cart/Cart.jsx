import React, { useContext, useState, useEffect } from 'react';
import './Cart.css';
import { StoreContext } from '../../Context/StoreContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { User, MapPin, Wallet, CheckCircle2, HelpCircle, Plus, Minus, Tag, Utensils, X } from 'lucide-react';
import { assets } from '../../assets/frontend_assets/assets';

export default function Cart({ setShowLogin }) {
  const { cartItems, food_list, addToCart, removeFromCart, getTotalCartAmount, token, url } = useContext(StoreContext);
  const navigate = useNavigate();

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [suggestions, setSuggestions] = useState('');
  const [noContact, setNoContact] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');

  // New Address Form State
  const [newAddr, setNewAddr] = useState({
    type: "Home",
    firstName: "",
    lastName: "",
    phone: "",
    street: "",
    area: "",
    city: "",
    state: "",
    pincode: ""
  });

  const cartHasItems = food_list.some(item => cartItems[item._id] > 0);
  const subTotal = getTotalCartAmount();
  const deliveryFee = subTotal === 0 ? 0 : 40;
  const discount = couponApplied ? Math.min(Math.round(subTotal * 0.15), 150) : 0;
  const gstCharges = subTotal === 0 ? 0 : Math.round(subTotal * 0.05);
  const finalTotal = subTotal === 0 ? 0 : Math.max(0, subTotal + deliveryFee + gstCharges - discount);

  // Fetch saved addresses from backend database or localStorage
  const fetchAddresses = async () => {
    if (token) {
      try {
        const res = await axios.get(url + "api/user/address/get", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success && res.data.addresses && res.data.addresses.length > 0) {
          setSavedAddresses(res.data.addresses);
          setSelectedAddressId(res.data.addresses[0].id || '0');
          return;
        }
      } catch (err) {
        console.warn("Error fetching user addresses:", err.message);
      }
    }

    // Check localStorage fallback
    const local = localStorage.getItem("user_addresses");
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (parsed && parsed.length > 0) {
          setSavedAddresses(parsed);
          setSelectedAddressId(parsed[0].id || '0');
          return;
        }
      } catch (e) {}
    }

    setSavedAddresses([]);
  };

  useEffect(() => {
    fetchAddresses();
  }, [token]);

  // Handle saving new address to database & local state
  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!newAddr.firstName || !newAddr.phone || !newAddr.street || !newAddr.city) {
      alert("Please fill in all required address fields.");
      return;
    }

    const createdAddress = {
      ...newAddr,
      id: Date.now().toString()
    };

    const updatedList = [...savedAddresses, createdAddress];
    setSavedAddresses(updatedList);
    setSelectedAddressId(createdAddress.id);
    localStorage.setItem("user_addresses", JSON.stringify(updatedList));

    if (token) {
      try {
        await axios.post(
          url + "api/user/address/add",
          { address: createdAddress },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (err) {
        console.error("Save address API error:", err);
      }
    }

    setShowAddressModal(false);
    setNewAddr({
      type: "Home",
      firstName: "",
      lastName: "",
      phone: "",
      street: "",
      area: "",
      city: "",
      state: "",
      pincode: ""
    });
  };

  const handleApplyCoupon = () => {
    if (couponCode.trim().toUpperCase() === "TOMATO15") {
      setCouponApplied(true);
      setCouponError('');
    } else {
      setCouponApplied(false);
      setCouponError('Invalid coupon! Try TOMATO15');
    }
  };

  const selectedAddressObj = savedAddresses.find(a => a.id === selectedAddressId) || savedAddresses[0] || null;

  const handlePlaceOrder = async (e) => {
    if (e) e.preventDefault();
    if (!token) {
      if (setShowLogin) setShowLogin(true);
      return;
    }

    if (!selectedAddressObj) {
      alert("Please add and select a delivery address.");
      setShowAddressModal(true);
      return;
    }

    let orderItems = [];
    food_list.forEach((item) => {
      if (cartItems[item._id] > 0) {
        orderItems.push({ ...item, quantity: cartItems[item._id] });
      }
    });

    let orderData = {
      address: selectedAddressObj,
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

  // Image URL Helper with Fallback
  const getImageUrl = (item) => {
    if (!item.image) return assets.food_1;
    if (typeof item.image === 'object') return item.image;
    if (typeof item.image === 'string') {
      if (item.image.startsWith('http') || item.image.startsWith('data:')) return item.image;
      return url + 'images/' + item.image;
    }
    return assets.food_1;
  };

  // Swiggy Empty Cart View
  if (!cartHasItems) {
    return (
      <div className="swiggy-checkout-page">
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
        {/* Left Column: Vertical Stepper */}
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
                <span className="sub-title-text">
                  {savedAddresses.length > 0 ? `${savedAddresses.length} addresses available` : 'No saved address found'}
                </span>
              </div>

              {savedAddresses.length === 0 ? (
                <div className="no-saved-addr-prompt">
                  <p>No saved delivery address found in database.</p>
                  <button className="add-new-btn-green" onClick={() => setShowAddressModal(true)}>
                    + ADD NEW ADDRESS FORM
                  </button>
                </div>
              ) : (
                <div className="address-cards-grid">
                  {savedAddresses.map((addr) => (
                    <div 
                      key={addr.id} 
                      className={`address-card ${selectedAddressId === addr.id ? 'selected' : ''}`}
                      onClick={() => setSelectedAddressId(addr.id)}
                    >
                      <div className="addr-icon">
                        <span className="addr-emoji">{addr.type === 'Home' ? '🏠' : addr.type === 'Work' ? '🏢' : '📍'}</span> 
                        <strong>{addr.type || 'Address'}</strong>
                      </div>
                      <p className="addr-text">
                        {addr.street}, {addr.area ? addr.area + ',' : ''} {addr.city}, {addr.state} ({addr.phone})
                      </p>
                      <span className="eta-tag">25 MINS</span>
                      <button 
                        className={`deliver-here-btn ${selectedAddressId === addr.id ? 'active' : ''}`}
                        onClick={(e) => { e.stopPropagation(); setSelectedAddressId(addr.id); }}
                      >
                        {selectedAddressId === addr.id ? 'SELECTED' : 'DELIVER HERE'}
                      </button>
                    </div>
                  ))}

                  {/* Add New Address Trigger Card (Screenshot 2) */}
                  <div className="address-card add-new-card-swiggy" onClick={() => setShowAddressModal(true)}>
                    <div className="add-new-header-row">
                      <div className="location-plus-icon-badge">
                        <MapPin size={22} color="#0f172a" />
                        <span className="plus-badge">+</span>
                      </div>
                      <span className="add-new-title">Add New Address</span>
                    </div>
                    <div className="add-new-btn-wrapper">
                      <button className="swiggy-add-new-outline-btn">ADD NEW</button>
                    </div>
                  </div>
                </div>
              )}
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

        {/* Right Sidebar Column */}
        <div className="swiggy-sidebar-column">
          <div className="swiggy-order-summary-card">
            
            {/* Restaurant Header */}
            <div className="summary-restaurant-header">
              <div className="rest-icon-badge">
                <Utensils size={22} color="#e63946" />
              </div>
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
                        <img 
                          src={getImageUrl(item)} 
                          onError={(e) => { e.target.onerror = null; e.target.src = assets.food_1; }} 
                          alt={item.name} 
                          className="item-thumb-img" 
                        />
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

            {/* Apply Coupon Box (TOMATO15) */}
            <div className="coupon-box">
              <div className="coupon-input-row">
                <Tag size={16} color="#e63946" />
                <input 
                  type="text" 
                  placeholder="Apply Coupon (Use TOMATO15)" 
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                />
                <button onClick={handleApplyCoupon}>
                  {couponApplied ? 'APPLIED' : 'APPLY'}
                </button>
              </div>
              {couponError && <p className="coupon-error-text">{couponError}</p>}
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
                  <span>Item Discount (TOMATO15)</span>
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

            {/* Proceed to Payment Button */}
            <button className="swiggy-pay-btn" onClick={handlePlaceOrder}>
              {token ? `PAY ₹${finalTotal} & PLACE ORDER` : 'LOGIN TO PROCEED'}
            </button>
          </div>
        </div>
      </div>

      {/* Add New Address Form Modal */}
      {showAddressModal && (
        <div className="address-modal-overlay">
          <div className="address-modal-card">
            <div className="modal-header">
              <h3>Save Delivery Address</h3>
              <X size={20} className="close-modal" onClick={() => setShowAddressModal(false)} />
            </div>

            <form onSubmit={handleSaveAddress} className="address-form-grid">
              <div className="form-group full">
                <label>Address Tag</label>
                <div className="tag-select-buttons">
                  {['Home', 'Work', 'Other'].map(type => (
                    <button 
                      type="button" 
                      key={type} 
                      className={newAddr.type === type ? 'active' : ''}
                      onClick={() => setNewAddr({ ...newAddr, type })}
                    >
                      {type === 'Home' ? '🏠 Home' : type === 'Work' ? '🏢 Work' : '📍 Other'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>First Name *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Shadab"
                  value={newAddr.firstName}
                  onChange={(e) => setNewAddr({ ...newAddr, firstName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Last Name</label>
                <input 
                  type="text" 
                  placeholder="Akmal"
                  value={newAddr.lastName}
                  onChange={(e) => setNewAddr({ ...newAddr, lastName: e.target.value })}
                />
              </div>

              <div className="form-group full">
                <label>Phone Number *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="9876543210"
                  value={newAddr.phone}
                  onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                />
              </div>

              <div className="form-group full">
                <label>Street / Flat / Building No *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Flat B29, Sardar Patel Nagar"
                  value={newAddr.street}
                  onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Area / Locality</label>
                <input 
                  type="text" 
                  placeholder="Govindpur Road"
                  value={newAddr.area}
                  onChange={(e) => setNewAddr({ ...newAddr, area: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>City *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Dhanbad"
                  value={newAddr.city}
                  onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>State *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Jharkhand"
                  value={newAddr.state}
                  onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Pincode *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="826001"
                  value={newAddr.pincode}
                  onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                />
              </div>

              <div className="form-actions full">
                <button type="button" className="cancel-btn" onClick={() => setShowAddressModal(false)}>Cancel</button>
                <button type="submit" className="save-addr-btn">SAVE ADDRESS & DELIVER</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
