import React, { useEffect, useState, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { StoreContext } from '../../Context/StoreContext';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Phone, Navigation, ShieldCheck, Clock, CheckCircle2, Bike, Store, Home, ArrowLeft } from 'lucide-react';
import './TrackOrder.css';

// Custom Map Markers using SVG Data URIs
const createCustomIcon = (svgString, size = [36, 36]) => {
  return L.divIcon({
    html: svgString,
    className: 'custom-leaflet-icon',
    iconSize: size,
    iconAnchor: [size[0] / 2, size[1] / 2]
  });
};

const restaurantIconSvg = `
  <div style="background:#e63946; color:white; width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow: 0 4px 12px rgba(230,57,70,0.5); border:3px solid white;">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/></svg>
  </div>
`;

const userIconSvg = `
  <div style="background:#2a9d8f; color:white; width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow: 0 4px 12px rgba(42,157,143,0.5); border:3px solid white;">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  </div>
`;

const deliveryIconSvg = `
  <div class="scooter-pulse-marker" style="background:#ffb703; color:#1d3557; width:46px; height:46px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow: 0 6px 16px rgba(255,183,3,0.7); border:3px solid #1d3557;">
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="18.5" cy="17.5" r="2.5"/><circle cx="5.5" cy="17.5" r="2.5"/><path d="M12 17.5V14l-3-3 4-3 2 3h3"/></svg>
  </div>
`;

const restaurantIcon = createCustomIcon(restaurantIconSvg, [40, 40]);
const userIcon = createCustomIcon(userIconSvg, [40, 40]);
const deliveryIcon = createCustomIcon(deliveryIconSvg, [46, 46]);

// Map recentering helper component
const MapRecenter = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center.lat && center.lng) {
      map.setView([center.lat, center.lng], map.getZoom(), { animate: true });
    }
  }, [center, map]);
  return null;
};

export default function TrackOrder() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { url } = useContext(StoreContext);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const simulationRef = useRef(null);

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

  // Handle live movement simulation
  const startSimulation = () => {
    if (!order || !order.restaurantLocation || !order.userLocation) return;
    setSimulating(true);

    const start = order.restaurantLocation;
    const end = order.userLocation;
    let step = 0;
    const totalSteps = 40;

    if (simulationRef.current) clearInterval(simulationRef.current);

    simulationRef.current = setInterval(async () => {
      step++;
      const currentLat = start.lat + ((end.lat - start.lat) * (step / totalSteps));
      const currentLng = start.lng + ((end.lng - start.lng) * (step / totalSteps));

      setOrder(prev => ({
        ...prev,
        deliveryBoyLocation: { lat: currentLat, lng: currentLng },
        status: step >= totalSteps ? "Delivered" : "Out for Delivery"
      }));

      // Push update to backend
      try {
        await axios.post(`${url}api/order/update-location`, {
          orderId: order._id,
          lat: currentLat,
          lng: currentLng
        });
        if (step >= totalSteps) {
          await axios.post(`${url}api/order/status`, { orderId: order._id, status: "Delivered" });
        }
      } catch (e) {
        console.error("Location update failed", e);
      }

      if (step >= totalSteps) {
        clearInterval(simulationRef.current);
        setSimulating(false);
      }
    }, 800);
  };

  if (loading) {
    return (
      <div className="track-loading">
        <div className="spinner"></div>
        <p>Loading live tracking...</p>
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

  const restLoc = order.restaurantLocation || { lat: 28.6315, lng: 77.2167 };
  const userLoc = order.userLocation || { lat: 28.6450, lng: 77.2280 };
  const devLoc = order.deliveryBoyLocation || restLoc;

  const polylineCoords = [
    [restLoc.lat, restLoc.lng],
    [devLoc.lat, devLoc.lng],
    [userLoc.lat, userLoc.lng]
  ];

  const steps = [
    { title: "Order Placed", desc: "We received your order", active: true },
    { title: "Preparing Food", desc: "Kitchen is preparing your food", active: ["Food Processing", "Order Confirmed", "Out for Delivery", "Delivered"].includes(order.status) },
    { title: "Delivery Assigned", desc: order.deliveryBoy?.name ? `Assigned to ${order.deliveryBoy.name}` : "Finding nearby rider...", active: !!order.deliveryBoy?.name },
    { title: "Out for Delivery", desc: "Rider is on the way", active: ["Out for Delivery", "Delivered"].includes(order.status) },
    { title: "Delivered", desc: "Enjoy your meal!", active: order.status === "Delivered" }
  ];

  return (
    <div className="zomato-track-container">
      {/* Header Bar */}
      <div className="zomato-track-header">
        <button className="back-btn" onClick={() => navigate('/myorders')}>
          <ArrowLeft size={20} /> Back to Orders
        </button>
        <div className="order-title">
          <h2>Live Delivery Tracking</h2>
          <span className="order-id">Order #{order._id?.substring(order._id.length - 6)}</span>
        </div>
        <div className="eta-badge">
          <Clock size={18} />
          <span>{order.status === 'Delivered' ? 'Delivered' : 'ETA: 18 - 25 Mins'}</span>
        </div>
      </div>

      <div className="zomato-track-grid">
        {/* Left Column: Live Map */}
        <div className="map-card">
          <div className="map-header">
            <h3><Navigation size={18} /> Real-time GPS Location</h3>
            <button 
              className={`simulate-btn ${simulating ? 'active' : ''}`}
              onClick={startSimulation}
              disabled={simulating}
            >
              {simulating ? "Simulating Live Movement..." : "▶ Simulate Rider Movement"}
            </button>
          </div>
          
          <div className="map-wrapper">
            <MapContainer 
              center={[devLoc.lat, devLoc.lng]} 
              zoom={14} 
              scrollWheelZoom={false}
              className="leaflet-map-element"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              <MapRecenter center={devLoc} />

              {/* Restaurant Marker */}
              <Marker position={[restLoc.lat, restLoc.lng]} icon={restaurantIcon}>
                <Popup><b>Restaurant</b><br/>Food Preparation Hub</Popup>
              </Marker>

              {/* Customer Marker */}
              <Marker position={[userLoc.lat, userLoc.lng]} icon={userIcon}>
                <Popup><b>Delivery Address</b><br/>{order.address?.street}, {order.address?.city}</Popup>
              </Marker>

              {/* Delivery Rider Marker */}
              {order.deliveryBoy?.name && (
                <Marker position={[devLoc.lat, devLoc.lng]} icon={deliveryIcon}>
                  <Popup>
                    <b>{order.deliveryBoy.name}</b><br/>
                    {order.deliveryBoy.vehicle}<br/>
                    📞 {order.deliveryBoy.phone}
                  </Popup>
                </Marker>
              )}

              <Polyline 
                positions={polylineCoords} 
                color="#e63946" 
                weight={4} 
                opacity={0.8} 
                dashArray="8, 8" 
              />
            </MapContainer>
          </div>
        </div>

        {/* Right Column: Status & Rider Details */}
        <div className="info-column">
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
                  <div className="rider-rating">⭐ 4.9 • 1,200+ Deliveries</div>
                </div>
                <a href={`tel:${order.deliveryBoy.phone}`} className="call-btn">
                  <Phone size={18} /> Call Rider
                </a>
              </div>
              <div className="safety-badge">
                <ShieldCheck size={16} color="#2a9d8f" />
                <span>Rider is vaccinated & following hygiene standards</span>
              </div>
            </div>
          ) : (
            <div className="rider-card unassigned">
              <div className="pulse-icon"><Bike size={24} /></div>
              <div>
                <h4>Assigning Delivery Valet</h4>
                <p>We are matching the nearest rider for your order...</p>
              </div>
            </div>
          )}

          {/* Live Progress Stepper */}
          <div className="stepper-card">
            <h3>Order Status</h3>
            <div className="stepper">
              {steps.map((step, idx) => (
                <div key={idx} className={`step-item ${step.active ? 'active' : ''}`}>
                  <div className="step-marker">
                    {step.active ? <CheckCircle2 size={20} /> : <div className="step-dot" />}
                  </div>
                  <div className="step-content">
                    <h4>{step.title}</h4>
                    <p>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Item Details Card */}
          <div className="items-summary-card">
            <h3>Items in Order ({order.items?.length})</h3>
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
    </div>
  );
}
