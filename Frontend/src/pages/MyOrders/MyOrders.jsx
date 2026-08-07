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
        try {
            const response = await axios.post(
                url + "api/order/userorders",
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.success) {
                setData(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching user orders:", error);
        }
    };

    useEffect(() => {
        if (token) fetchOrders();
    }, [token]);

    return (
        <div className='my-orders'>
            <h2>My Orders</h2>
            <div className="container">
                {data.length === 0 ? (
                    <div className="no-orders">
                        <p>No orders placed yet!</p>
                    </div>
                ) : (
                    data.map((order, index) => {
                        return (
                            <div key={index} className="my-orders-order">
                                <img src={assets.parcel_icon} alt="Parcel Icon" />
                                <p className="items-summary">
                                    {order.items.map((item, idx) => {
                                        if (idx === order.items.length - 1) {
                                            return item.name + " x " + item.quantity;
                                        } else {
                                            return item.name + " x " + item.quantity + ', ';
                                        }
                                    })}
                                </p>
                                <p className="amount">₹{order.amount}</p>
                                <p className="items-count">Items: {order.items.length}</p>
                                <p className="status-badge">
                                    <span className={order.status === 'Delivered' ? 'status-dot delivered' : 'status-dot active'}>&#x25cf;</span> 
                                    <b>{order.status}</b>
                                </p>

                                <div className="order-actions">
                                    <button onClick={fetchOrders} className="refresh-btn">Track Status</button>
                                    <button 
                                        onClick={() => navigate(`/track/${order._id}`)} 
                                        className="live-map-btn"
                                    >
                                        🛵 Live Tracking
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
