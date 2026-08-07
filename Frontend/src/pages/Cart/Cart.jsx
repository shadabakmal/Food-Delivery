import React, { useContext, useEffect } from 'react';
import './Cart.css';
import { StoreContext } from '../../Context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { assets } from '../../assets/frontend_assets/assets';

export default function Cart() {
  const { cartItems, food_list, removeFromCart, getTotalCartAmount, url } = useContext(StoreContext);
  const navigate = useNavigate();

  const cartHasItems = food_list.some(item => cartItems[item._id] > 0);

  const getImageUrl = (item) => {
    if (!item.image) return assets.food_1;
    if (typeof item.image === 'object') return item.image;
    if (typeof item.image === 'string') {
      if (item.image.startsWith('http') || item.image.startsWith('data:')) return item.image;
      return url + 'images/' + item.image;
    }
    return assets.food_1;
  };

  const deliveryFee = getTotalCartAmount() === 0 ? 0 : 40;

  return (
    <div className="cart">
      {cartHasItems ? (
        <>
          <div className="cart-items">
            <div className="cart-items-title">
              <p>Items</p>
              <p>Title</p>
              <p>Price</p>
              <p>Quantity</p>
              <p>Total</p>
              <p>Remove</p>
            </div>
            <br /><hr />

            {food_list.map((item) => {
              if (cartItems[item._id] > 0) {
                return (
                  <div key={item._id}>
                    <div className="cart-items-title cart-items-item">
                      <img 
                        src={getImageUrl(item)} 
                        onError={(e) => { e.target.onerror = null; e.target.src = assets.food_1; }} 
                        alt={item.name} 
                        className="cart-item-image" 
                      />
                      <p>{item.name}</p>
                      <p>₹{item.price}</p>
                      <p className="quantity-badge">{cartItems[item._id]}</p>
                      <p>₹{(cartItems[item._id] * item.price)}</p>
                      <p onClick={() => removeFromCart(item._id)} className="cross">✕</p>
                    </div>
                    <hr />
                  </div>
                );
              }
              return null;
            })}
          </div>

          <div className="cart-bottom">
            <div className="cart-total">
              <h2>Cart Totals</h2>
              <div className="cart-total-details">
                <p>SubTotal</p>
                <p>₹{getTotalCartAmount()}</p>
              </div>
              <hr />
              <div className="cart-total-details">
                <p>Delivery Fee</p>
                <p>₹{deliveryFee}</p>
              </div>
              <hr />
              <div className="cart-total-details">
                <b>Total</b>
                <b>₹{getTotalCartAmount() + deliveryFee}</b>
              </div>
              <button onClick={() => navigate('/order')}>PROCEED TO CHECKOUT</button>
            </div>
          </div>
        </>
      ) : (
        <div className="cart-empty">
          <img src={assets.empty_cart || assets.food_1} alt="Empty Cart" />
          <h2>Your cart is empty</h2>
          <button className="explore-menu-btn" onClick={() => navigate('/')}>Explore Dishes</button>
        </div>
      )}
    </div>
  );
}
