import React, { useState, useContext, useEffect } from 'react';
import './MyOrders.css';
import { StoreContext } from '../../Context/StoreContext';
import axios from 'axios';
import { assets } from '../../assets/frontend_assets/assets';
import { useNavigate } from 'react-router-dom';

export default function MyOrders() {
  const { url, token } = useContext(StoreContext);
  const [data, setData] = useState([]);
  const navigate = useNavigate();

  const syncCancelledStorage = (targetId) => {
    const userKey = token ? `user_orders_${token}` : 'recent_orders';
    try {
      const stored = localStorage.getItem(userKey);
      if (stored) {
        const parsed = JSON.parse(stored).map(o => String(o._id) === String(targetId) ? { ...o, status: "Cancelled" } : o);
        localStorage.setItem(userKey, JSON.stringify(parsed));
      }
    } catch (e) {}
  };

  const fetchOrders = async () => {
    // 1. Authenticated User flow (100% Isolated to this specific logged-in user account token)
    if (token) {
      const userKey = `user_orders_${token}`;
      let localUserOrders = [];

      try {
        const storedUser = localStorage.getItem(userKey);
        if (storedUser) {
          localUserOrders = JSON.parse(storedUser);
        }
      } catch (e) {
        console.warn("User local orders parse error:", e);
      }

      // Immediately render this account's local orders
      setData(localUserOrders);

      // Query Backend API for server-synced orders belonging to this account token
      try {
        const response = await axios.post(
          url + "api/order/userorders",
          {},
          { headers: { Authorization: `Bearer ${token}` }, timeout: 3500 }
        );

        if (response.data && response.data.success && Array.isArray(response.data.data)) {
          const apiOrders = response.data.data;
          const finalCombined = [...apiOrders];
          
          // Merge local status updates for this specific user account
          localUserOrders.forEach(loc => {
            const matchIdx = finalCombined.findIndex(o => String(o._id) === String(loc._id));
            if (matchIdx !== -1) {
              if (loc.status === 'Cancelled') {
                finalCombined[matchIdx].status = 'Cancelled';
              }
            } else {
              finalCombined.push(loc);
            }
          });

          localStorage.setItem(userKey, JSON.stringify(finalCombined));
          setData(finalCombined);
          return;
        }
      } catch (error) {
        console.warn("Backend orders API check:", error.message);
      }

      setData(localUserOrders);
      return;
    }

    // 2. Unauthenticated Guest flow
    let guestOrders = [];
    try {
      const stored = localStorage.getItem('recent_orders');
      if (stored) {
        guestOrders = JSON.parse(stored);
      }
    } catch (e) {}

    setData(guestOrders);
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    // Instantly sync local state & storage for this user
    syncCancelledStorage(orderId);
    setData(prev => prev.map(o => String(o._id) === String(orderId) ? { ...o, status: "Cancelled" } : o));

    try {
      const response = await axios.post(url + "api/order/cancel", { 
        orderId, 
        reason: "Cancelled by Customer" 
      });

      if (response.data && response.data.success) {
        alert("Order cancelled successfully!");
      }
    } catch (err) {
      console.warn("Backend order cancel notice:", err.message);
    } finally {
      fetchOrders();
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [token]);

  return (
    <div className='my-orders'>
      <h2>My Orders</h2>
      <div className="container">
        {data.length === 0 ? (
          <div className="no-orders">
            <p>No orders placed yet!</p>
            <button className="refresh-btn" onClick={() => navigate('/')} style={{ marginTop: '14px' }}>
              Order Food Now
            </button>
          </div>
        ) : (
          data.map((order, index) => {
            const isCancelled = order.status === 'Cancelled';
            const isDelivered = order.status === 'Delivered';
            const canCancel = !isCancelled && !isDelivered;

            return (
              <div key={order._id || index} className="my-orders-order">
                <img src={assets.parcel_icon} alt="Parcel Icon" className="parcel-img" />
                
                <p className="items-summary">
                  {order.items && order.items.map((item, idx) => {
                    if (idx === order.items.length - 1) {
                      return item.name + " x " + item.quantity;
                    } else {
                      return item.name + " x " + item.quantity + ', ';
                    }
                  })}
                </p>
                
                <p className="amount">₹{order.amount}</p>
                
                <p className="items-count">Items: {order.items ? order.items.length : 1}</p>
                
                <p className="status-badge">
                  <span className={isDelivered ? 'status-dot delivered' : isCancelled ? 'status-dot cancelled' : 'status-dot active'}>&#x25cf;</span> 
                  <b className={isCancelled ? 'status-text-cancelled' : ''}>{order.status || 'Food Processing'}</b>
                </p>

                <div className="order-actions">
                  <button onClick={fetchOrders} className="refresh-btn">Refresh</button>
                  
                  {!isCancelled && (
                    <button 
                      onClick={() => navigate(`/track/${order._id}`)} 
                      className="live-map-btn"
                    >
                      🛵 Track
                    </button>
                  )}

                  {canCancel && (
                    <button 
                      onClick={() => handleCancelOrder(order._id)} 
                      className="cancel-order-btn"
                      title="Cancel Order"
                    >
                      ❌ Cancel
                    </button>
                  )}

                  {isCancelled && (
                    <span className="cancelled-pill">Cancelled</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
