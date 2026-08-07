import React, { useContext } from 'react';
import './FoodItem.css';
import { assets } from '../assets/frontend_assets/assets';
import { StoreContext } from '../Context/StoreContext';
import { Star, Plus, Minus } from 'lucide-react';

export default function FoodItem({ id, name, description, image, price, rating, reviews }) {
  const { cartItems, addToCart, removeFromCart, url } = useContext(StoreContext);

  // Smart image URL handler with fallback
  const getImageUrl = () => {
    if (!image) return assets.food_1;
    if (typeof image === 'object') return image;
    if (typeof image === 'string') {
      if (image.startsWith('http') || image.startsWith('data:')) return image;
      return url + 'images/' + image;
    }
    return assets.food_1;
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = assets.food_1;
  };

  const itemRating = rating || "4.8";
  const itemReviews = reviews || "120";

  return (
    <div className="food-item-card">
      <div className="food-item-img-wrap">
        <img 
          className="food-item-img" 
          src={getImageUrl()} 
          onError={handleImageError} 
          alt={name} 
        />
        
        {/* Rating Badge Overlay */}
        <div className="rating-badge-overlay">
          <Star size={12} fill="#ffb703" color="#ffb703" />
          <span>{itemRating} ({itemReviews})</span>
        </div>

        {/* Cart Counter / Add Button */}
        {!cartItems[id] ? (
          <button className="add-btn-round" onClick={() => addToCart(id)} title="Add to Cart">
            <Plus size={18} />
          </button>
        ) : (
          <div className="food-counter-pill">
            <button className="count-btn minus" onClick={() => removeFromCart(id)}>
              <Minus size={14} />
            </button>
            <span className="count-val">{cartItems[id]}</span>
            <button className="count-btn plus" onClick={() => addToCart(id)}>
              <Plus size={14} />
            </button>
          </div>
        )}
      </div>

      <div className="food-item-info-wrap">
        <div className="food-item-title-row">
          <h3>{name}</h3>
          <img src={assets.rating_starts} alt="Rating Stars" className="stars-img" />
        </div>
        
        <p className="food-item-desc">{description}</p>
        
        <div className="food-item-price-row">
          <span className="price-tag">₹{price}</span>
          <span className="free-delivery-tag">⚡ Fast Delivery</span>
        </div>
      </div>
    </div>
  );
}
