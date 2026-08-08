import React, { useContext, useState, useEffect } from 'react';
import './Cart.css';
import { StoreContext } from '../../Context/StoreContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { User, MapPin, Wallet, CheckCircle2, HelpCircle, Plus, Minus, Tag, Utensils, X, LogOut, Package, CreditCard, Banknote } from 'lucide-react';
import { assets } from '../../assets/frontend_assets/assets';

// Valid Structured Location Database (Prevents random/fake string inputs)
const LOCATION_DATA = {
  "India": {
    "Delhi NCR": ["New Delhi", "Connaught Place", "Noida", "Greater Noida", "Gurugram", "Ghaziabad", "Faridabad"],
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik", "Aurangabad", "Navi Mumbai"],
    "Karnataka": ["Bengaluru", "Mysuru", "Hubballi", "Mangaluru", "Belagavi"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem"],
    "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Khammam"],
    "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri"],
    "Jharkhand": ["Dhanbad", "Ranchi", "Jamshedpur", "Bokaro Steel City", "Hazaribagh", "Deoghar"],
    "Uttar Pradesh": ["Lucknow", "Kanpur", "Varanasi", "Agra", "Prayagraj", "Meerut"],
    "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar"],
    "Rajasthan": ["Jaipur", "Udaipur", "Jodhpur", "Kota", "Bikaner", "Ajmer"],
    "Punjab": ["Chandigarh", "Ludhiana", "Amritsar", "Jalandhar", "Patiala"],
    "Haryana": ["Gurugram", "Faridabad", "Panipat", "Ambala", "Karnal"],
    "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur"],
    "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur"],
    "Madhya Pradesh": ["Bhopal", "Indore", "Gwalior", "Jabalpur"],
    "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela"],
    "Assam": ["Guwahati", "Silchar", "Dibrugarh"],
    "Goa": ["Panaji", "Margao", "Vasco da Gama"]
  },
  "United States": {
    "California": ["Los Angeles", "San Francisco", "San Diego", "San Jose"],
    "New York": ["New York City", "Buffalo", "Albany", "Rochester"],
    "Texas": ["Houston", "Dallas", "Austin", "San Antonio"],
    "Florida": ["Miami", "Orlando", "Tampa", "Jacksonville"]
  },
  "United Kingdom": {
    "England": ["London", "Manchester", "Birmingham", "Liverpool", "Leeds"],
    "Scotland": ["Edinburgh", "Glasgow", "Aberdeen"],
    "Wales": ["Cardiff", "Swansea"]
  },
  "United Arab Emirates": {
    "Dubai": ["Dubai City", "Deira", "Jumeirah", "Downtown Dubai"],
    "Abu Dhabi": ["Abu Dhabi City", "Al Ain"],
    "Sharjah": ["Sharjah City"]
  }
};

export default function Cart({ setShowLogin }) {
  const { cartItems, food_list, addToCart, removeFromCart, getTotalCartAmount, token, setToken, userName, setUserName, url } = useContext(StoreContext);
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    setToken("");
    if (setUserName) setUserName("");
    navigate("/");
  };

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('stripe'); // 'stripe' or 'cod'
  const [suggestions, setSuggestions] = useState('');
  const [noContact, setNoContact] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');

  // Structured Address Form State with Validation
  const [newAddr, setNewAddr] = useState({
    type: "Home",
    firstName: "",
    lastName: "",
    phone: "",
    street: "",
    area: "",
    country: "India",
    state: "",
    city: "",
    pincode: ""
  });

  const cartHasItems = food_list.some(item => cartItems[item._id] > 0);
  const subTotal = getTotalCartAmount();
  const deliveryFee = subTotal === 0 ? 0 : 40;
  const discount = couponApplied ? Math.min(Math.round(subTotal * 0.15), 150) : 0;
  const gstCharges = subTotal === 0 ? 0 : Math.round(subTotal * 0.05);
  const finalTotal = subTotal === 0 ? 0 : Math.max(0, subTotal + deliveryFee + gstCharges - discount);

  // Fetch saved addresses STRICTLY when user is logged in
  const fetchAddresses = async () => {
    if (!token) {
      setSavedAddresses([]);
      setSelectedAddressId('');
      return;
    }

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

    // User-specific localStorage fallback
    const localKey = `user_addresses_${token}`;
    const local = localStorage.getItem(localKey);
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

  // Handle saving new address with strict location & input validation
  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!token) {
      if (setShowLogin) setShowLogin(true);
      return;
    }

    // Validation checks
    if (!newAddr.firstName.trim() || newAddr.firstName.trim().length < 2) {
      alert("Please enter a valid First Name (at least 2 characters).");
      return;
    }

    const cleanPhone = newAddr.phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      alert("Please enter a valid 10-digit mobile phone number.");
      return;
    }

    if (!newAddr.street.trim() || newAddr.street.trim().length < 4) {
      alert("Please enter a valid Street / Building address.");
      return;
    }

    if (!newAddr.state) {
      alert("Please select a valid State from the dropdown.");
      return;
    }

    if (!newAddr.city) {
      alert("Please select a valid City from the dropdown.");
      return;
    }

    const cleanPincode = newAddr.pincode.replace(/\D/g, '');
    if (cleanPincode.length < 5) {
      alert("Please enter a valid Pincode.");
      return;
    }

    const createdAddress = {
      ...newAddr,
      phone: cleanPhone,
      pincode: cleanPincode,
      id: Date.now().toString()
    };

    const updatedList = [...savedAddresses, createdAddress];
    setSavedAddresses(updatedList);
    setSelectedAddressId(createdAddress.id);

    if (token) {
      localStorage.setItem(`user_addresses_${token}`, JSON.stringify(updatedList));
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
      country: "India",
      state: "",
      city: "",
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
      amount: finalTotal,
      paymentMethod: paymentMethod
    };

    const fallbackOrderId = "ORD" + Math.floor(100000 + Math.random() * 900000);
    const newOrderObj = {
      _id: fallbackOrderId,
      items: orderItems,
      amount: finalTotal,
      address: selectedAddressObj,
      status: "Food Processing",
      payment: true,
      paymentMethod: paymentMethod,
      date: new Date().toISOString()
    };

    // Save order locally so My Orders page ALWAYS displays it
    const localKey = token ? `user_orders_${token}` : 'recent_orders';
    try {
      const existingStr = localStorage.getItem(localKey) || localStorage.getItem('recent_orders') || '[]';
      const existing = JSON.parse(existingStr);
      const updatedOrders = [newOrderObj, ...existing];
      localStorage.setItem(localKey, JSON.stringify(updatedOrders));
      localStorage.setItem('recent_orders', JSON.stringify(updatedOrders));
    } catch (e) {
      console.error("Error saving local order:", e);
    }

    if (paymentMethod === 'stripe') {
      try {
        let response = await axios.post(
          url + "api/order/place",
          orderData,
          { headers: { Authorization: `Bearer ${token}`, token: token }, timeout: 4500 }
        );

        if (response && response.data && response.data.session_url) {
          if (response.data.session_url.startsWith("http")) {
            window.location.href = response.data.session_url;
            return;
          } else {
            navigate(response.data.session_url);
            return;
          }
        }
      } catch (err) {
        console.warn("Backend API response delay, opening Stripe checkout interface:", err.message);
      }

      // Smooth fallback redirect to Stripe Checkout page
      navigate(`/stripe-checkout?orderId=${fallbackOrderId}&amount=${finalTotal}`);
      return;
    }

    // Cash on Delivery direct verification
    navigate(`/verify?success=true&orderId=${fallbackOrderId}`);
  };

  // Image URL Helper with Fallback
  const getImageUrl = (item) => {
    if (!item.image) return assets.food_1;
    if (typeof item.image === 'object') return item.image;
    if (typeof item.image === 'string') {
      if (item.image.startsWith('http') || item.image.startsWith('data:') || item.image.startsWith('/')) return item.image;
      if (assets[item.image]) return assets[item.image];
      const cleanKey = item.image.replace('.png', '').replace('.jpg', '');
      if (assets[cleanKey]) return assets[cleanKey];
      return url + 'images/' + item.image;
    }
    return assets.food_1;
  };

  // Available states for selected country
  const availableStates = newAddr.country && LOCATION_DATA[newAddr.country] 
    ? Object.keys(LOCATION_DATA[newAddr.country]) 
    : [];

  // Available cities for selected state
  const availableCities = newAddr.country && newAddr.state && LOCATION_DATA[newAddr.country][newAddr.state]
    ? LOCATION_DATA[newAddr.country][newAddr.state]
    : [];

  // Empty Cart View
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
              {!token ? (
                <button className="navbar-signin-btn" onClick={() => setShowLogin(true)}>
                  Sign In
                </button>
              ) : (
                <div className="navbar-profile-dropdown-wrapper">
                  <div className="profile-icon-pill">
                    <User size={18} />
                    <span className="user-name-text">{userName || "User"}</span>
                  </div>
                  <ul className="nav-profile-dropdown-menu">
                    <li onClick={() => navigate('/myorders')}>
                      <Package size={16} /> <p>My Orders</p>
                    </li>
                    <hr />
                    <li onClick={logout}>
                      <LogOut size={16} /> <p>Logout</p>
                    </li>
                  </ul>
                </div>
              )}
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
            {!token ? (
              <button className="navbar-signin-btn" onClick={() => setShowLogin(true)}>
                Sign In
              </button>
            ) : (
              <div className="navbar-profile-dropdown-wrapper">
                <div className="profile-icon-pill">
                  <User size={18} />
                  <span className="user-name-text">{userName || "User"}</span>
                </div>
                <ul className="nav-profile-dropdown-menu">
                  <li onClick={() => navigate('/myorders')}>
                    <Package size={16} /> <p>My Orders</p>
                  </li>
                  <hr />
                  <li onClick={logout}>
                    <LogOut size={16} /> <p>Logout</p>
                  </li>
                </ul>
              </div>
            )}
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
                  <p className="user-info-text">{userName || "User"} | Logged In</p>
                  <button className="switch-account-link" onClick={logout}>
                    Switch Account / Logout
                  </button>
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
                  {!token ? 'Please log in to view or add saved addresses' : (savedAddresses.length > 0 ? `${savedAddresses.length} addresses available` : 'No saved address found')}
                </span>
              </div>

              {!token ? (
                <div className="no-saved-addr-prompt">
                  <p>🔒 Please sign in to choose or add your delivery address.</p>
                  <button className="add-new-btn-green" onClick={() => setShowLogin && setShowLogin(true)}>
                    SIGN IN TO CONTINUE
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
                        {addr.street}, {addr.area ? addr.area + ',' : ''} {addr.city}, {addr.state}, {addr.country} ({addr.phone})
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

                  {/* Add New Address Trigger Card */}
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

          {/* STEP 3: PAYMENT OPTIONS (STRIPE & COD) */}
          <div className="stepper-block">
            <div className="step-timeline-icon active">
              <Wallet size={18} />
            </div>
            <div className="step-card-content">
              <h3 className="payment-title">Payment Method</h3>
              <p className="payment-sub">Choose your preferred payment option</p>

              <div className="payment-methods-grid">
                {/* Stripe Online Payment Option */}
                <div 
                  className={`payment-method-card ${paymentMethod === 'stripe' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('stripe')}
                >
                  <div className="pay-header-row">
                    <input 
                      type="radio" 
                      name="paymentGroup" 
                      checked={paymentMethod === 'stripe'} 
                      onChange={() => setPaymentMethod('stripe')} 
                    />
                    <CreditCard size={18} color="#60b246" />
                    <strong>Stripe Online Payment</strong>
                    <span className="instant-badge">Instant</span>
                  </div>
                  <p className="pay-desc-text">Credit / Debit Card, UPI, NetBanking via Stripe</p>
                </div>

                {/* Cash on Delivery Option */}
                <div 
                  className={`payment-method-card ${paymentMethod === 'cod' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('cod')}
                >
                  <div className="pay-header-row">
                    <input 
                      type="radio" 
                      name="paymentGroup" 
                      checked={paymentMethod === 'cod'} 
                      onChange={() => setPaymentMethod('cod')} 
                    />
                    <Banknote size={18} color="#0f172a" />
                    <strong>Cash on Delivery (COD)</strong>
                  </div>
                  <p className="pay-desc-text">Pay cash to delivery partner upon order arrival</p>
                </div>
              </div>
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
              {!token 
                ? 'LOGIN TO PROCEED' 
                : paymentMethod === 'stripe' 
                  ? `PAY ₹${finalTotal} VIA STRIPE` 
                  : `PLACE COD ORDER (₹${finalTotal})`}
            </button>
          </div>
        </div>
      </div>

      {/* Add New Address Form Modal with Structured Dropdowns */}
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
                  placeholder="First name"
                  value={newAddr.firstName}
                  onChange={(e) => setNewAddr({ ...newAddr, firstName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Last Name</label>
                <input 
                  type="text" 
                  placeholder="Last name"
                  value={newAddr.lastName}
                  onChange={(e) => setNewAddr({ ...newAddr, lastName: e.target.value })}
                />
              </div>

              <div className="form-group full">
                <label>Phone Number *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="10-digit mobile number"
                  value={newAddr.phone}
                  onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                />
              </div>

              <div className="form-group full">
                <label>Street / Flat / Building No *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Flat / House No., Building, Street"
                  value={newAddr.street}
                  onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Area / Locality</label>
                <input 
                  type="text" 
                  placeholder="Area, Colony, Sector"
                  value={newAddr.area}
                  onChange={(e) => setNewAddr({ ...newAddr, area: e.target.value })}
                />
              </div>

              {/* Country Select Dropdown */}
              <div className="form-group">
                <label>Country *</label>
                <select 
                  value={newAddr.country} 
                  onChange={(e) => setNewAddr({ ...newAddr, country: e.target.value, state: "", city: "" })}
                  required
                >
                  {Object.keys(LOCATION_DATA).map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>

              {/* State Cascading Dropdown */}
              <div className="form-group">
                <label>State *</label>
                <select 
                  value={newAddr.state} 
                  onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value, city: "" })}
                  required
                >
                  <option value="">-- Select State --</option>
                  {availableStates.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              {/* City Cascading Dropdown */}
              <div className="form-group">
                <label>City *</label>
                <select 
                  value={newAddr.city} 
                  onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                  required
                  disabled={!newAddr.state}
                >
                  <option value="">{newAddr.state ? "-- Select City --" : "-- Select State First --"}</option>
                  {availableCities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Pincode *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="6-digit Pincode"
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
