import React from 'react';
import './Header.css';
import { useNavigate } from 'react-router-dom';
import { Film } from 'lucide-react';

export default function Header() {
  const navigate = useNavigate();

  const scrollToMenu = () => {
    const menuSection = document.getElementById("explore-menu");
    if (menuSection) {
      menuSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="header">
      <div className="header-contents">
        <h2>Order your favourite food from here</h2>
        <p>
          Choose from a diverse menu featuring a delectable array of dishes crafted with the finest ingredients and culinary expertise. Our mission is to satisfy your cravings and elevate your dining experience, one meal at a time.
        </p>
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
          <button onClick={scrollToMenu}>View Menu</button>
          <button 
            onClick={() => navigate('/reels')}
            style={{
              background: 'linear-gradient(135deg, #ff4757 0%, #ff6b81 100%)',
              color: 'white',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 16px rgba(255, 71, 87, 0.4)'
            }}
          >
            <Film size={18} /> Watch CraveReels
          </button>
        </div>
      </div>
    </div>
  );
}
