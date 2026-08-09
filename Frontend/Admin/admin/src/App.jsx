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
import { Lock, ShieldAlert } from 'lucide-react';

export default function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [adminToken, setAdminToken] = useState(localStorage.getItem("adminToken") || "");
  const [adminName, setAdminName] = useState(localStorage.getItem("adminName") || "");

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

      {!adminToken && (
        <div style={{
          background: '#fff1f2',
          borderBottom: '1px solid #fecdd3',
          padding: '12px 4%',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#e63946', fontSize: '13px', fontWeight: '700' }}>
            <ShieldAlert size={18} />
            <span>AUTHENTICATION REQUIRED: You are currently viewing in Read-Only Mode. Log in to make changes.</span>
          </div>
          <button 
            onClick={() => setShowLogin(true)}
            style={{
              background: '#e63946',
              color: 'white',
              border: 'none',
              padding: '6px 14px',
              borderRadius: '20px',
              fontWeight: '700',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            LOG IN NOW
          </button>
        </div>
      )}

      <div className="app-content">
        <Sidebar />
        <Routes>
          <Route path='/' element={<Order url={url} adminToken={adminToken} setShowLogin={setShowLogin} />} />
          <Route path='/add' element={<Add url={url} adminToken={adminToken} setShowLogin={setShowLogin} />} />
          <Route path='/list' element={<List url={url} adminToken={adminToken} setShowLogin={setShowLogin} />} />
          <Route path='/order' element={<Order url={url} adminToken={adminToken} setShowLogin={setShowLogin} />} />
        </Routes>
      </div>
    </div>
  );
}
