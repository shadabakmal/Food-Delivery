import React, { useContext, useState, useEffect } from 'react';
import './ItemAddedBar.css';
import { StoreContext } from '../../Context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, ChevronRight, X } from 'lucide-react';

export default function ItemAddedBar() {
  const { getTotalCartCount, getTotalCartAmount } = useContext(StoreContext);
  const navigate = useNavigate();
  const count = getTotalCartCount();
  const amount = getTotalCartAmount();
  const [isDismissed, setIsDismissed] = useState(false);

  // Reset dismissed state when new items are added
  useEffect(() => {
    if (count > 0) {
      setIsDismissed(false);
    }
  }, [count]);

  if (count === 0 || isDismissed) return null;

  return (
    <div className="item-added-bar-container">
      <div className="item-added-bar-card" onClick={() => navigate('/cart')}>
        <div className="bar-left-info">
          <div className="cart-badge-icon">
            <ShoppingBag size={18} color="#059669" />
          </div>
          <div className="item-summary-text">
            <span className="items-count-tag">{count} {count === 1 ? 'item' : 'items'} added</span>
            <span className="divider-dot">•</span>
            <span className="items-price-tag">₹{amount}</span>
          </div>
        </div>

        <div className="bar-right-actions">
          <button 
            className="view-cart-action-btn" 
            onClick={(e) => { e.stopPropagation(); navigate('/cart'); }}
          >
            <span>VIEW CART</span>
            <ChevronRight size={16} />
          </button>
          
          <button 
            className="close-bar-cross-btn" 
            onClick={(e) => { e.stopPropagation(); setIsDismissed(true); }}
            title="Close cart notification"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
