import React, { useContext } from 'react';
import './ItemAddedBar.css';
import { StoreContext } from '../../Context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';

export default function ItemAddedBar() {
  const { getTotalCartCount, getTotalCartAmount } = useContext(StoreContext);
  const navigate = useNavigate();
  const count = getTotalCartCount();

  if (count === 0) return null;

  return (
    <div className="swiggy-item-added-bar-wrapper">
      <div className="swiggy-item-added-bar">
        <div className="item-count-text">
          <span>{count} {count === 1 ? 'item' : 'items'} added</span>
          <span className="cart-total-preview">| ₹{getTotalCartAmount()}</span>
        </div>
        <button className="view-cart-btn" onClick={() => navigate('/cart')}>
          VIEW CART <ShoppingBag size={18} />
        </button>
      </div>
    </div>
  );
}
