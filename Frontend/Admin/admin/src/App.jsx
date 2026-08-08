import React, { useState } from 'react';
import Navbar from './components/Navbar/Navbar';
import Sidebar from './components/Sidebar/Sidebar';
import { Routes, Route } from 'react-router-dom';
import Add from './pages/Add/Add';
import List from './pages/List/List';
import Order from './pages/Order/Order';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AdminLoginPopup from './components/AdminLoginPopup/AdminLoginPopup';

export default function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [adminToken, setAdminToken] = useState(localStorage.getItem("adminToken") || "admin_session_active");
  const [adminName, setAdminName] = useState(localStorage.getItem("adminName") || "Shadab Akmal");

  const url = (import.meta.env.VITE_BACKEND_URL || "https://food-delivery-backend-psi-lac.vercel.app/").replace(/\/?$/, '/');

  return (
    <div>
      <ToastContainer position="top-right" autoClose={3000} />
      
      {showLogin && (
        <AdminLoginPopup 
          setShowLogin={setShowLogin} 
          setAdminToken={setAdminToken} 
          setAdminName={setAdminName} 
        />
      )}

      <Navbar 
        setShowLogin={setShowLogin} 
        adminToken={adminToken} 
        setAdminToken={setAdminToken} 
        adminName={adminName} 
        setAdminName={setAdminName} 
      />
      <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: 0 }} />

      <div className="app-content">
        <Sidebar />
        <Routes>
          <Route path='/' element={<Order url={url} />} />
          <Route path='/add' element={<Add url={url} />} />
          <Route path='/list' element={<List url={url} />} />
          <Route path='/order' element={<Order url={url} />} />
        </Routes>
      </div>
    </div>
  );
}
