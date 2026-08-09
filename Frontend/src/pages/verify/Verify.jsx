import React, { useContext, useEffect } from 'react';
import './verify.css';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { StoreContext } from '../../Context/StoreContext';
import axios from 'axios';

export default function Verify() {
  const [searchParam] = useSearchParams();
  const success = searchParam.get("success");
  const orderId = searchParam.get("orderId");
  const navigate = useNavigate();
  const { url, setCartItems } = useContext(StoreContext);

  const verifyPayment = async () => {
    // Clear cart upon completing order
    if (setCartItems) setCartItems({});

    if (success === "true" || success === true || success === "1") {
      try {
        await axios.post(
          url + 'api/order/verify',
          { success, orderId },
          { timeout: 3000 }
        );
      } catch (err) {
        console.warn("Order verification API warning, proceeding to orders page:", err.message);
      }
      setTimeout(() => {
        navigate("/myorders");
      }, 600);
    } else {
      setTimeout(() => {
        navigate("/cart");
      }, 600);
    }
  };

  useEffect(() => {
    verifyPayment();

    // Absolute fallback safety timer (1.5 seconds max spinner duration)
    const timer = setTimeout(() => {
      if (success === "true" || success === true || success === "1") {
        navigate("/myorders");
      } else {
        navigate("/cart");
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [success, orderId]);

  return (
    <div className='verify'>
      <div className="spinner"></div>
      <p style={{ marginTop: '16px', color: '#475569', fontWeight: '700' }}>
        {success === "true" || success === true ? "Order placed successfully! Redirecting..." : "Processing payment..."}
      </p>
    </div>
  );
}
