import React, { useState } from 'react';
import './AdminLoginPopup.css';
import { Lock, Mail, ShieldCheck, X } from 'lucide-react';
import { toast } from 'react-toastify';

export default function AdminLoginPopup({ setShowLogin, setAdminToken, setAdminName }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('Shadab Akmal');

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }
    if (password.length < 4) {
      toast.error("Password must be at least 4 characters");
      return;
    }

    const token = "admin_token_" + Date.now();
    const adminUser = name || email.split('@')[0] || "Admin";

    localStorage.setItem("adminToken", token);
    localStorage.setItem("adminName", adminUser);

    setAdminToken(token);
    setAdminName(adminUser);
    setShowLogin(false);
    toast.success(`Welcome back, ${adminUser}! Logged in as Admin.`);
  };

  return (
    <div className="admin-login-overlay">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <div className="admin-badge">
            <ShieldCheck size={20} color="#e63946" />
            <span>Admin Control Panel</span>
          </div>
          <X className="close-btn" size={20} onClick={() => setShowLogin(false)} />
        </div>

        <h2>Sign In to Admin Portal</h2>
        <p className="subtext">Manage restaurant orders, food menu items, and delivery riders.</p>

        <form onSubmit={handleLogin} className="admin-login-form">
          <div className="form-group">
            <label>Admin Full Name</label>
            <input 
              type="text" 
              placeholder="e.g. Shadab Akmal"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Admin Email</label>
            <div className="input-with-icon">
              <Mail size={16} color="#94a3b8" />
              <input 
                type="email" 
                required 
                placeholder="admin@tomato.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-with-icon">
              <Lock size={16} color="#94a3b8" />
              <input 
                type="password" 
                required 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="admin-submit-btn">
            ACCESS ADMIN PANEL
          </button>
        </form>
      </div>
    </div>
  );
}
