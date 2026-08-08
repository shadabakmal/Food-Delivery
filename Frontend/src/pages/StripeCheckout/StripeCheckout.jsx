import React, { useState, useEffect, useContext } from 'react';
import './StripeCheckout.css';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { StoreContext } from '../../Context/StoreContext';
import { CreditCard, ArrowLeft, ShieldCheck, Lock } from 'lucide-react';
import { assets } from '../../assets/frontend_assets/assets';

export default function StripeCheckout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { url, token } = useContext(StoreContext);

  const orderId = searchParams.get('orderId') || 'ORD' + Math.floor(100000 + Math.random() * 900000);
  const amount = searchParams.get('amount') || '229';

  // Stripe Card Form Inputs State
  const [email, setEmail] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardName, setCardName] = useState('');
  const [country, setCountry] = useState('India');
  const [saveInfo, setSaveInfo] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardType, setCardType] = useState('visa');

  // Format Card Number (4242 4242 4242 4242)
  const handleCardNumberChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 16);
    let formatted = val.replace(/(.{4})/g, '$1 ').trim();
    setCardNumber(formatted);
    if (val.startsWith('5')) setCardType('mastercard');
    else if (val.startsWith('3')) setCardType('amex');
    else setCardType('visa');
  };

  // Format Expiry (MM / YY)
  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (val.length >= 3) {
      val = val.slice(0, 2) + ' / ' + val.slice(2);
    }
    setExpiry(val);
  };

  // Format CVC
  const handleCvcChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCvc(val);
  };

  // Handle Form Submission
  const handleStripePay = (e) => {
    e.preventDefault();
    if (cardNumber.replace(/\s/g, '').length < 16) {
      alert("Please enter a valid 16-digit card number (e.g. 4242 4242 4242 4242)");
      return;
    }
    if (!expiry || expiry.length < 7) {
      alert("Please enter a valid expiration date (MM / YY)");
      return;
    }
    if (!cvc || cvc.length < 3) {
      alert("Please enter a valid CVC code");
      return;
    }

    setIsProcessing(true);

    // Simulate real Stripe payment processing delay
    setTimeout(() => {
      setIsProcessing(false);
      navigate(`/verify?success=true&orderId=${orderId}`);
    }, 1800);
  };

  return (
    <div className="stripe-checkout-page">
      <div className="stripe-checkout-container">
        
        {/* Left Column: Product & Order Summary (Matched to Screenshot 2) */}
        <div className="stripe-left-summary">
          <div className="stripe-back-row" onClick={() => navigate('/cart')}>
            <ArrowLeft size={16} />
            <span className="stripe-store-badge">
              <span className="store-icon">🛍️</span> Tomato Kitchen
            </span>
            <span className="test-mode-pill">TEST MODE</span>
          </div>

          <div className="summary-amount-block">
            <span className="summary-title-label">Tomato Food Order</span>
            <h1 className="summary-amount-val">₹{amount}.00</h1>
          </div>

          <div className="summary-hero-image-wrapper">
            <img 
              src={assets.food_1} 
              alt="Food Order" 
              className="summary-hero-img" 
            />
          </div>

          <div className="stripe-order-id-meta">
            <span>Order ID: <strong>#{orderId}</strong></span>
            <span><Lock size={12} /> Powered by Stripe</span>
          </div>
        </div>

        {/* Right Column: Stripe Interactive Payment Form (Matched to Screenshot 2) */}
        <div className="stripe-right-form-col">
          
          {/* Pay with Link Fast Button */}
          <button type="button" className="stripe-pay-link-btn" onClick={() => setEmail("user@example.com")}>
            Pay with <span className="link-bold">link</span>
          </button>

          <div className="stripe-divider-row">
            <span className="stripe-divider-line"></span>
            <span className="stripe-divider-text">Or</span>
            <span className="stripe-divider-line"></span>
          </div>

          <form onSubmit={handleStripePay} className="stripe-card-form">
            <div className="stripe-field-group">
              <label>Email</label>
              <input 
                type="email" 
                required 
                placeholder="email@example.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
              />
            </div>

            <div className="stripe-field-group">
              <label>Payment method</label>

              {/* Card Number Input with Visa/Mastercard Icons */}
              <div className="card-input-combined-box">
                <div className="card-number-row">
                  <input 
                    type="text" 
                    required 
                    placeholder="1234 1234 1234 1234" 
                    value={cardNumber} 
                    onChange={handleCardNumberChange} 
                  />
                  <div className="card-brand-logos">
                    <span className={`brand-chip ${cardType === 'visa' ? 'active' : ''}`}>VISA</span>
                    <span className={`brand-chip ${cardType === 'mastercard' ? 'active' : ''}`}>MC</span>
                    <span className="brand-chip">AMEX</span>
                  </div>
                </div>

                <div className="card-sub-fields-row">
                  <input 
                    type="text" 
                    required 
                    placeholder="MM / YY" 
                    value={expiry} 
                    onChange={handleExpiryChange} 
                    className="expiry-input"
                  />
                  <input 
                    type="text" 
                    required 
                    placeholder="CVC" 
                    value={cvc} 
                    onChange={handleCvcChange} 
                    className="cvc-input"
                  />
                  <CreditCard size={18} color="#94a3b8" className="cvc-icon" />
                </div>
              </div>
            </div>

            <div className="stripe-field-group">
              <label>Cardholder name</label>
              <input 
                type="text" 
                required 
                placeholder="Full name on card" 
                value={cardName} 
                onChange={(e) => setCardName(e.target.value)} 
              />
            </div>

            <div className="stripe-field-group">
              <label>Country or region</label>
              <select value={country} onChange={(e) => setCountry(e.target.value)}>
                <option value="India">India</option>
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="United Arab Emirates">United Arab Emirates</option>
                <option value="Canada">Canada</option>
                <option value="Australia">Australia</option>
              </select>
            </div>

            <div className="stripe-checkbox-row">
              <label className="stripe-custom-check">
                <input 
                  type="checkbox" 
                  checked={saveInfo} 
                  onChange={(e) => setSaveInfo(e.target.checked)} 
                />
                <div>
                  <strong>Save my information for faster checkout</strong>
                  <p>Pay securely on this site and everywhere Link is accepted.</p>
                </div>
              </label>
            </div>

            {/* Primary Stripe Pay Button */}
            <button 
              type="submit" 
              className={`stripe-submit-pay-btn ${isProcessing ? 'processing' : ''}`}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <span className="stripe-loader-span">Processing Payment...</span>
              ) : (
                `Pay ₹${amount}.00`
              )}
            </button>

            <p className="stripe-legal-disclaimer">
              Notwithstanding the logo displayed above, when paying with a co-branded eftpos debit card, your payment may be processed through either card network.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
