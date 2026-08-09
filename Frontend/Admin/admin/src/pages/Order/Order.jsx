import React, { useEffect, useState } from 'react';
import './Order.css';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Bike, CheckCircle, Clock, MapPin, Package, UserCheck, Play, Lock, XCircle, ShieldCheck } from 'lucide-react';

export default function Order({ url, adminToken, setShowLogin }) {
  const [orders, setOrders] = useState([]);
  const [deliveryBoys, setDeliveryBoys] = useState([]);

  const checkAuth = (actionName) => {
    if (!adminToken) {
      toast.error(`🔒 Access Denied: Please log in as Admin to ${actionName}!`);
      if (setShowLogin) setShowLogin(true);
      return false;
    }
    return true;
  };

  const fetchOrders = async () => {
    let dbOrders = [];
    try {
      const response = await axios.get(url + "api/order/list");
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        dbOrders = response.data.data;
      }
    } catch (err) {
      console.error("Admin order list API notice:", err);
    }

    let localOrders = [];
    try {
      const storedRecent = localStorage.getItem('recent_orders');
      if (storedRecent) localOrders = JSON.parse(storedRecent);
    } catch (e) {}

    const combined = [...dbOrders];
    localOrders.forEach(loc => {
      if (!combined.some(o => o._id === loc._id || (o._id && String(o._id).substring(o._id.length - 6) === String(loc._id).substring(loc._id.length - 6)))) {
        combined.push(loc);
      }
    });

    setOrders(combined);
  };

  const fetchDeliveryBoys = async () => {
    try {
      const response = await axios.get(url + "api/order/delivery-boys");
      if (response.data.success) {
        setDeliveryBoys(response.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const statusHandler = async (event, order) => {
    if (!checkAuth("update order status")) return;
    if (order.status === 'Delivered' || order.status === 'Cancelled') {
      toast.warn(`Order #${order._id.substring(order._id.length - 6)} is ${order.status}. Status cannot be changed!`);
      return;
    }

    try {
      const response = await axios.post(url + "api/order/status", {
        orderId: order._id,
        status: event.target.value
      });
      if (response.data.success) {
        toast.success("Order status updated!");
        await fetchOrders();
      } else {
        toast.error(response.data.message || "Failed to update status");
      }
    } catch (err) {
      toast.error("Error updating status");
    }
  };

  const cancelOrderHandler = async (order) => {
    if (!checkAuth("cancel order")) return;
    if (order.status === 'Delivered') {
      toast.warn("Delivered orders cannot be cancelled!");
      return;
    }
    if (order.status === 'Cancelled') {
      toast.warn("Order is already cancelled!");
      return;
    }

    if (!window.confirm("Are you sure you want to cancel this order as Admin?")) return;

    try {
      const response = await axios.post(url + "api/order/cancel", { 
        orderId: order._id, 
        reason: "Cancelled by Admin" 
      });
      if (response.data && response.data.success) {
        toast.success("Order cancelled successfully!");
        await fetchOrders();
      } else {
        toast.error(response.data.message || "Error cancelling order");
      }
    } catch (err) {
      toast.error("Error cancelling order");
    }
  };

  const assignDeliveryBoyHandler = async (order, deliveryBoyId) => {
    if (!checkAuth("assign delivery riders")) return;
    if (order.status === 'Delivered' || order.status === 'Cancelled') {
      toast.warn("Cannot re-assign riders for completed or cancelled orders!");
      return;
    }
    if (!deliveryBoyId) return;

    try {
      const response = await axios.post(url + "api/order/assign", {
        orderId: order._id,
        deliveryBoyId
      });
      if (response.data.success) {
        toast.success(response.data.message);
        await fetchOrders();
      } else {
        toast.error(response.data.message);
      }
    } catch (err) {
      toast.error("Error assigning delivery boy");
    }
  };

  // Simulate rider movement from Admin dashboard
  const simulateRiderMovement = async (order) => {
    if (!checkAuth("run GPS live simulation")) return;
    if (order.status === 'Delivered' || order.status === 'Cancelled') return;
    if (!order.restaurantLocation || !order.userLocation) return;

    toast.info(`Simulating live movement for Order #${order._id.substring(order._id.length - 6)}`);

    const start = order.restaurantLocation;
    const end = order.userLocation;
    const totalSteps = 25;
    let step = 0;

    const interval = setInterval(async () => {
      step++;
      const lat = start.lat + ((end.lat - start.lat) * (step / totalSteps));
      const lng = start.lng + ((end.lng - start.lng) * (step / totalSteps));

      try {
        await axios.post(url + "api/order/update-location", {
          orderId: order._id,
          lat,
          lng
        });
        if (step >= totalSteps) {
          await axios.post(url + "api/order/status", {
            orderId: order._id,
            status: "Delivered"
          });
          toast.success("Order delivered successfully!");
          clearInterval(interval);
          fetchOrders();
        }
      } catch (err) {
        clearInterval(interval);
      }
    }, 1000);
  };

  useEffect(() => {
    fetchOrders();
    fetchDeliveryBoys();
  }, []);

  return (
    <div className="admin-order-container">
      {!adminToken && (
        <div style={{
          background: '#fff1f2',
          border: '1px solid #fecdd3',
          padding: '12px 20px',
          borderRadius: '12px',
          marginBottom: '20px',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e63946', fontWeight: 700, fontSize: '13px' }}>
            <Lock size={16} /> Order Status Updates & Delivery Rider Assignments are LOCKED. Log in to manage.
          </div>
          <button 
            type="button"
            onClick={() => setShowLogin && setShowLogin(true)}
            style={{ background: '#e63946', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '8px', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}
          >
            SIGN IN
          </button>
        </div>
      )}

      <div className="admin-order-header">
        <h2><Package size={24} /> Order Management & Delivery Assignment</h2>
        <span className="order-count">{orders.length} Active Orders</span>
      </div>

      <div className="admin-order-list">
        {orders.length === 0 ? (
          <div className="no-orders-card">
            <p>No orders placed yet!</p>
          </div>
        ) : (
          orders.map((order, index) => {
            const isDelivered = order.status === 'Delivered';
            const isCancelled = order.status === 'Cancelled';
            const isLocked = isDelivered || isCancelled;

            return (
              <div key={index} className="admin-order-card">
                <div className="card-top">
                  <div className="order-id-tag">
                    <strong>Order #{order._id?.substring(order._id.length - 6)}</strong>
                    <span className="order-date">{order.date ? new Date(order.date).toLocaleString() : 'Just now'}</span>
                  </div>
                  <div className="status-badge-wrap">
                    <span className={`status-pill ${order.status.toLowerCase().replace(/\s+/g, '-')}`}>
                      {order.status}
                    </span>
                  </div>
                </div>

                <div className="card-body">
                  {/* Items & Address */}
                  <div className="order-details-col">
                    <h4>Items Ordered</h4>
                    <p className="order-items-str">
                      {order.items?.map((item, i) => `${item.name} x ${item.quantity}`).join(', ')}
                    </p>
                    <div className="customer-info">
                      <p className="customer-name">
                        <strong>Customer:</strong> {order.address?.firstName} {order.address?.lastName}
                      </p>
                      <p className="customer-address">
                        <MapPin size={14} /> {order.address?.street}, {order.address?.city}, {order.address?.state} ({order.address?.phone})
                      </p>
                    </div>
                  </div>

                  {/* Amount in Rupees & Payment Status */}
                  <div className="payment-col">
                    <div className="amount-box">
                      <span className="amount-label">Total Amount</span>
                      <span className="amount-val" style={{ color: '#e63946', fontWeight: 800 }}>
                        ₹{order.amount}
                      </span>
                    </div>
                    <span className={`payment-tag ${order.payment ? 'paid' : 'pending'}`}>
                      {order.paymentMethod === 'cod' || !order.payment ? "💵 Cash on Delivery (COD)" : "✓ Paid via Stripe"}
                    </span>
                  </div>

                  {/* Delivery Boy Assignment */}
                  <div className="delivery-col">
                    <h4><Bike size={16} /> Delivery Partner</h4>
                    {order.deliveryBoy?.name ? (
                      <div className="assigned-boy-box">
                        <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', width: '38px', height: '38px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Bike size={20} color="#e63946" />
                        </div>
                        <div>
                          <strong>{order.deliveryBoy.name}</strong>
                          <p>{order.deliveryBoy.vehicle}</p>
                          <small>{order.deliveryBoy.phone}</small>
                        </div>
                      </div>
                    ) : (
                      <div className="assign-select-wrap">
                        <select 
                          onChange={(e) => assignDeliveryBoyHandler(order, e.target.value)}
                          defaultValue=""
                          disabled={!adminToken || isLocked}
                          style={{ cursor: (adminToken && !isLocked) ? 'pointer' : 'not-allowed', opacity: (adminToken && !isLocked) ? 1 : 0.5 }}
                        >
                          <option value="" disabled>-- Select Rider to Assign --</option>
                          {deliveryBoys.map((boy) => (
                            <option key={boy.id} value={boy.id}>
                              {boy.name} ({boy.vehicle})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Re-assign option */}
                    {order.deliveryBoy?.name && !isLocked && (
                      <select 
                        className="reassign-select"
                        onChange={(e) => assignDeliveryBoyHandler(order, e.target.value)}
                        defaultValue=""
                        disabled={!adminToken}
                        style={{ cursor: adminToken ? 'pointer' : 'not-allowed', opacity: adminToken ? 1 : 0.6 }}
                      >
                        <option value="" disabled>Change Delivery Partner...</option>
                        {deliveryBoys.map((boy) => (
                          <option key={boy.id} value={boy.id}>
                            {boy.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Actions & Status Change */}
                  <div className="actions-col">
                    <h4>Update Status</h4>
                    <select 
                      className="status-select" 
                      onChange={(e) => statusHandler(e, order)} 
                      value={order.status}
                      disabled={!adminToken || isLocked}
                      style={{ 
                        cursor: (adminToken && !isLocked) ? 'pointer' : 'not-allowed', 
                        opacity: (adminToken && !isLocked) ? 1 : 0.6,
                        background: isLocked ? '#f1f5f9' : 'white'
                      }}
                    >
                      <option value="Food Processing">Food Processing</option>
                      <option value="Order Confirmed">Order Confirmed</option>
                      <option value="Out for Delivery">Out for Delivery</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>

                    {isLocked && (
                      <span style={{ fontSize: '11px', color: isDelivered ? '#16a34a' : '#ef4444', fontWeight: 700, marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Lock size={12} /> Status Locked ({order.status})
                      </span>
                    )}

                    {!isLocked && (
                      <button 
                        className="admin-cancel-btn"
                        onClick={() => cancelOrderHandler(order)}
                        disabled={!adminToken}
                        style={{
                          marginTop: '8px',
                          background: '#fff1f2',
                          border: '1px solid #fecdd3',
                          color: '#e63946',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontWeight: 700,
                          fontSize: '12px',
                          cursor: adminToken ? 'pointer' : 'not-allowed',
                          display: 'flex',
                          alignItems: 'center',
                          justify: 'center',
                          gap: '6px'
                        }}
                      >
                        <XCircle size={14} /> Cancel Order
                      </button>
                    )}

                    {order.deliveryBoy?.name && !isLocked && (
                      <button 
                        className="admin-sim-btn"
                        onClick={() => simulateRiderMovement(order)}
                        disabled={!adminToken}
                        style={{ cursor: adminToken ? 'pointer' : 'not-allowed', opacity: adminToken ? 1 : 0.6, marginTop: '6px' }}
                      >
                        <Play size={14} /> Run Live GPS Simulation
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
