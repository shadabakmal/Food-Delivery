import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { StoreContext } from '../../Context/StoreContext';
import { Phone, ShieldCheck, Clock, CheckCircle2, Bike, ArrowLeft, Utensils, MapPin } from 'lucide-react';
import './TrackOrder.css';

export default function TrackOrder() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { url } = useContext(StoreContext);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = async () => {
    try {
      const res = await axios.get(`${url}api/order/${orderId}`);
      if (res.data.success) {
        setOrder(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching order details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 4000);
    return () => clearInterval(interval);
  }, [orderId]);

  if (loading) {
    return (
      <div className="track-loading">
        <div className="spinner"></div>
        <p>Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="track-error">
        <h2>Order Not Found</h2>
        <button onClick={() => navigate('/myorders')}>Back to My Orders</button>
      </div>
    );
  }

  const steps = [
    { title: "Order Placed", desc: "We received your order", active: true },
    { title: "Preparing Food", desc: "Kitchen is preparing your food", active: ["Food Processing", "Order Confirmed", "Out for Delivery", "Delivered"].includes(order.status) },
    { title: "Delivery Assigned", desc: order.deliveryBoy?.name ? `Assigned to ${order.deliveryBoy.name}` : "Finding nearby rider...", active: !!order.deliveryBoy?.name },
    { title: "Out for Delivery", desc: "Rider is on the way to your door", active: ["Out for Delivery", "Delivered"].includes(order.status) },
    { title: "Delivered", desc: "Order completed. Enjoy your meal!", active: order.status === "Delivered" }
  ];

  return (
    <div className="zomato-track-container clean-no-map">
      {/* Header Bar */}
      <div className="zomato-track-header">
        <button className="back-btn" onClick={() => navigate('/myorders')}>
          <ArrowLeft size={18} /> Back to My Orders
        </button>
        <div className="order-title">
          <h2>Order Status & Tracking</h2>
          <span className="order-id">Order #{order._id?.substring(order._id.length - 6)}</span>
        </div>
        <div className="eta-badge">
          <Clock size={18} />
          <span>{order.status === 'Delivered' ? 'Delivered' : 'ETA: 18 - 25 Mins'}</span>
        </div>
      </div>

      <div className="single-column-track-layout">
        
        {/* Rider Info Card */}
        {order.deliveryBoy?.name ? (
          <div className="rider-card">
            <div className="rider-header">
              <img 
                src={order.deliveryBoy.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"} 
                alt={order.deliveryBoy.name} 
                className="rider-avatar"
              />
              <div className="rider-details">
                <h4>{order.deliveryBoy.name}</h4>
                <p className="vehicle">{order.deliveryBoy.vehicle}</p>
                <div className="rider-rating">⭐ 4.9 • 1,200+ Deliveries Completed</div>
              </div>
              <a href={`tel:${order.deliveryBoy.phone}`} className="call-btn">
                <Phone size={16} /> Call Rider ({order.deliveryBoy.phone})
              </a>
            </div>
            <div className="safety-badge">
              <ShieldCheck size={16} color="#2a9d8f" />
              <span>Delivery partner is wearing mask & following temperature check standards</span>
            </div>
          </div>
        ) : (
          <div className="rider-card unassigned">
            <div className="pulse-icon"><Bike size={24} /></div>
            <div>
              <h4>Assigning Delivery Valet</h4>
              <p>Matching the nearest rider for your food order...</p>
            </div>
          </div>
        )}

        {/* Live Progress Stepper */}
        <div className="stepper-card">
          <h3>Order Progress</h3>
          <div className="stepper">
            {steps.map((step, idx) => (
              <div key={idx} className={`step-item ${step.active ? 'active' : ''}`}>
                <div className="step-marker">
                  {step.active ? <CheckCircle2 size={22} color="#e63946" /> : <div className="step-dot" />}
                </div>
                <div className="step-content">
                  <h4>{step.title}</h4>
                  <p>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Address Card */}
        {order.address && (
          <div className="address-summary-card">
            <h3><MapPin size={18} color="#e63946" /> Delivery Address</h3>
            <p className="address-str">
              <strong>{order.address.firstName} {order.address.lastName}</strong><br/>
              {order.address.street}, {order.address.area ? order.address.area + ',' : ''} {order.address.city}, {order.address.state} ({order.address.phone})
            </p>
          </div>
        )}

        {/* Item Details Card */}
        <div className="items-summary-card">
          <h3><Utensils size={18} color="#e63946" /> Items in Order ({order.items?.length})</h3>
          <div className="items-list">
            {order.items?.map((item, idx) => (
              <div key={idx} className="item-row">
                <span className="qty">{item.quantity}x</span>
                <span className="name">{item.name}</span>
                <span className="price">₹{(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="total-row">
            <span>Total Paid</span>
            <span className="total-amount">₹{order.amount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
