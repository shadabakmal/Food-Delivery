import React, { useState } from 'react';
import './Navbar.css';
import { assets } from '../../assets/admin_assets/assets';
import { LogOut, ShieldCheck, User, ChevronDown } from 'lucide-react';
import { toast } from 'react-toastify';

export default function Navbar({ setShowLogin, adminToken, setAdminToken, adminName, setAdminName }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminName");
    setAdminToken("");
    setAdminName("");
    setDropdownOpen(false);
    toast.info("Admin logged out");
  };

  return (
    <div className='navbar'>
      <div className="brand-left">
        <span className="logo-text" style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>
          Crave<span style={{ color: '#ff4757' }}>Dash</span><span style={{ color: '#ffa502' }}>.</span>
        </span>
        <span className="admin-title-badge">
          <ShieldCheck size={14} color="#ff4757" /> ADMIN PORTAL
        </span>
      </div>

      <div className="admin-profile-section">
        {adminToken ? (
          <div className="profile-pill-wrapper">
            <div className="profile-pill" onClick={() => setDropdownOpen(!dropdownOpen)}>
              <img 
                src={assets.profile_image} 
                alt="Admin Profile" 
                className="profile-img" 
              />
              <div className="profile-text-col">
                <span className="profile-name">{adminName || "Shadab Akmal"}</span>
                <span className="profile-role">Super Admin</span>
              </div>
              <ChevronDown size={14} className={`chevron-icon ${dropdownOpen ? 'open' : ''}`} />
            </div>

            {dropdownOpen && (
              <div className="admin-dropdown-menu">
                <div className="dropdown-user-header">
                  <p className="user-email">admin@cravedash.com</p>
                  <span className="status-online">● Active Admin</span>
                </div>
                <hr />
                <button className="logout-btn" onClick={handleLogout}>
                  <LogOut size={16} /> Logout / Switch Account
                </button>
              </div>
            )}
          </div>
        ) : (
          <button className="admin-signin-btn" onClick={() => setShowLogin(true)}>
            <User size={16} /> Admin Sign In
          </button>
        )}
      </div>
    </div>
  );
}
