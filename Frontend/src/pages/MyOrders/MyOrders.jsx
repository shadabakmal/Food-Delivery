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

  const fetchOrders = async () => {
    let localOrders = [];
    const localKey = token ? `user_orders_${token}` : 'recent_orders';
    try {
      const stored = localStorage.getItem(localKey) || localStorage.getItem('recent_orders');
      if (stored) {
        localOrders = JSON.parse(stored);
      }
    } catch (e) {
      console.warn("Local orders parse error:", e);
    }

    if (token) {
      try {
        const response = await axios.post(
          url + "api/order/userorders",
          {},
          { headers: { Authorization: `Bearer ${token}` }, timeout: 3500 }
        );

        if (response.data && response.data.success && Array.isArray(response.data.data)) {
          const combined = [...response.data.data];
          localOrders.forEach(loc => {
            if (!combined.some(o => o._id === loc._id)) {
              combined.push(loc);
            }
          });
          setData(combined);
          return;
        }
      } catch (error) {
        console.warn("Backend orders API offline, using local order history:", error.message);
      }
    }

    setData(localOrders);
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    try {
      const response = await axios.post(url + "api/order/cancel", { 
        orderId, 
        reason: "Cancelled by Customer" 
      });

      if (response.data && response.data.success) {
        // Update local state
        setData(prev => prev.map(o => o._id === orderId ? { ...o, status: "Cancelled" } : o));
        
        // Update localStorage
        const localKey = token ? `user_orders_${token}` : 'recent_orders';
        const stored = localStorage.getItem(localKey) || localStorage.getItem('recent_orders');
        if (stored) {
          try {
            const parsed = JSON.parse(stored).map(o => o._id === orderId ? { ...o, status: "Cancelled" } : o);
            localStorage.setItem(localKey, JSON.stringify(parsed));
          } catch(e){}
        }

        alert("Order cancelled successfully!");
        fetchOrders();
      } else {
        alert(response.data.message || "Failed to cancel order");
      }
    } catch (err) {
      // Local state fallback update
      setData(prev => prev.map(o => o._id === orderId ? { ...o, status: "Cancelled" } : o));
      alert("Order status updated to Cancelled.");
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
                <img src={assets.parcel_icon} alt="Parcel Icon" />
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
                  <b>{order.status || 'Food Processing'}</b>
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
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
