import React, { useContext, useState } from 'react';
import './Navbar.css';
import { assets } from '../../assets/frontend_assets/assets';
import { Link, useNavigate } from 'react-router-dom';
import { StoreContext } from '../../Context/StoreContext';
import { Search, ShoppingBag, User, LogOut, Package, X } from 'lucide-react';

function Navbar({ setShowLogin }) {
  const [menu, setMenu] = useState("home");
  const [showSearchInput, setShowSearchInput] = useState(false);
  const { token, setToken, getTotalCartAmount, getTotalCartCount, searchTerm, setSearchTerm } = useContext(StoreContext);
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    navigate("/");
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    // Smooth scroll to food display section when typing search
    const exploreSection = document.getElementById("food-display");
    if (exploreSection && e.target.value.trim() !== "") {
      exploreSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className='navbar-wrapper'>
      <nav className='navbar-container'>
        {/* Brand Logo */}
        <Link to='/' className="navbar-logo-link">
          <span className="logo-text">Tomato<span className="logo-dot">.</span></span>
        </Link>

        {/* Navigation Links */}
        <ul className="navbar-menu-items">
          <li>
            <Link to='/' onClick={() => setMenu("home")} className={menu === "home" ? "active" : ""}>
              Home
            </Link>
          </li>
          <li>
            <a href="#explore-menu" onClick={() => setMenu("menu")} className={menu === "menu" ? "active" : ""}>
              Menu
            </a>
          </li>
          <li>
            <a href="#app-download" onClick={() => setMenu("mobile-app")} className={menu === "mobile-app" ? "active" : ""}>
              App
            </a>
          </li>
          <li>
            <a href='#footer' onClick={() => setMenu("contact-us")} className={menu === "contact-us" ? "active" : ""}>
              Contact Us
            </a>
          </li>
        </ul>

        {/* Navbar Right Actions */}
        <div className="navbar-right-section">
          {/* Interactive Search Bar */}
          <div className={`navbar-search-box ${showSearchInput || searchTerm ? 'expanded' : ''}`}>
            <Search className="search-icon" size={18} onClick={() => setShowSearchInput(!showSearchInput)} />
            <input 
              type="text"
              placeholder="Search pizza, burger, rolls..." 
              value={searchTerm} 
              onChange={handleSearchChange}
              className="search-input"
            />
            {searchTerm && (
              <X className="clear-search" size={16} onClick={() => setSearchTerm("")} />
            )}
          </div>

          {/* Shopping Cart Icon with Badge & Price */}
          <Link to='/cart' className='navbar-cart-btn'>
            <div className="cart-icon-wrapper">
              <ShoppingBag size={20} />
              {getTotalCartCount() > 0 && (
                <span className="cart-badge-count">{getTotalCartCount()}</span>
              )}
            </div>
            {getTotalCartAmount() > 0 && (
              <span className="cart-total-badge">₹{getTotalCartAmount()}</span>
            )}
          </Link>

          {/* User Profile / Auth Button */}
          {!token ? (
            <button className="navbar-signin-btn" onClick={() => setShowLogin(true)}>
              Sign In
            </button>
          ) : (
            <div className='navbar-profile-dropdown-wrapper'>
              <div className="profile-icon-pill">
                <User size={18} />
              </div>
              <ul className="nav-profile-dropdown-menu">
                <li onClick={() => navigate('/myorders')}>
                  <Package size={16} /> <p>My Orders</p>
                </li>
                <hr />
                <li onClick={logout}>
                  <LogOut size={16} /> <p>Logout</p>
                </li>
              </ul>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}

export default Navbar;