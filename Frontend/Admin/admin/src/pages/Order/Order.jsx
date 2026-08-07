import React, { useEffect, useState } from 'react';
import './Order.css';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Bike, CheckCircle, Clock, MapPin, Package, UserCheck, Play } from 'lucide-react';

export default function Order({ url }) {
  const [orders, setOrders] = useState([]);
  const [deliveryBoys, setDeliveryBoys] = useState([]);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(url + "api/order/list");
      if (response.data.success) {
        setOrders(response.data.data);
      } else {
        toast.error("Failed to fetch orders");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error fetching orders");
    }
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

  const statusHandler = async (event, orderId) => {
    try {
      const response = await axios.post(url + "api/order/status", {
        orderId,
        status: event.target.value
      });
      if (response.data.success) {
        toast.success("Order status updated!");
        await fetchOrders();
      }
    } catch (err) {
      toast.error("Error updating status");
    }
  };

  const assignDeliveryBoyHandler = async (orderId, deliveryBoyId) => {
    if (!deliveryBoyId) return;
    try {
      const response = await axios.post(url + "api/order/assign", {
        orderId,
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
          orders.map((order, index) => (
            <div key={index} className="admin-order-card">
              <div className="card-top">
                <div className="order-id-tag">
                  <strong>Order #{order._id?.substring(order._id.length - 6)}</strong>
                  <span className="order-date">{new Date(order.date).toLocaleString()}</span>
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

                {/* Amount & Payment Status */}
                <div className="payment-col">
                  <div className="amount-box">
                    <span className="amount-label">Total Amount</span>
                    <span className="amount-val">${order.amount?.toFixed(2)}</span>
                  </div>
                  <span className={`payment-tag ${order.payment ? 'paid' : 'pending'}`}>
                    {order.payment ? "✓ Paid via Stripe" : "⏳ Payment Pending"}
                  </span>
                </div>

                {/* Delivery Boy Assignment */}
                <div className="delivery-col">
                  <h4><Bike size={16} /> Delivery Partner</h4>
                  {order.deliveryBoy?.name ? (
                    <div className="assigned-boy-box">
                      <img 
                        src={order.deliveryBoy.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"} 
                        alt={order.deliveryBoy.name}
                      />
                      <div>
                        <strong>{order.deliveryBoy.name}</strong>
                        <p>{order.deliveryBoy.vehicle}</p>
                        <small>{order.deliveryBoy.phone}</small>
                      </div>
                    </div>
                  ) : (
                    <div className="assign-select-wrap">
                      <select 
                        onChange={(e) => assignDeliveryBoyHandler(order._id, e.target.value)}
                        defaultValue=""
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
                  {order.deliveryBoy?.name && (
                    <select 
                      className="reassign-select"
                      onChange={(e) => assignDeliveryBoyHandler(order._id, e.target.value)}
                      defaultValue=""
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
                    onChange={(e) => statusHandler(e, order._id)} 
                    value={order.status}
                  >
                    <option value="Food Processing">Food Processing</option>
                    <option value="Order Confirmed">Order Confirmed</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                  </select>

                  {order.deliveryBoy?.name && order.status !== 'Delivered' && (
                    <button 
                      className="admin-sim-btn"
                      onClick={() => simulateRiderMovement(order)}
                    >
                      <Play size={14} /> Run Live GPS Simulation
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
