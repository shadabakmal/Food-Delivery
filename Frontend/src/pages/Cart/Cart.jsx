import React, { useContext, useEffect } from 'react';
import './Cart.css';
import { StoreContext } from '../../Context/StoreContext';
import { useNavigate } from 'react-router-dom';

export default function Cart() {
  const { cartItems, food_list, removeFromCart, getTotalCartAmount, url } = useContext(StoreContext);
  const navigate = useNavigate();

  const cartHasItems = food_list.some(item => cartItems[item._id] > 0);

  useEffect(() => {
    if (!cartHasItems) {
      const timer = setTimeout(() => {
        navigate('/');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [cartHasItems, navigate]);

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
                      {/* FIX: Ensure the image path is correct */}
                      <img src={item.image} alt={item.name} className="cart-item-image" />
                      <p>{item.name}</p>
                      <p>${item.price}</p>
                      <p className="quantity-badge">{cartItems[item._id]}</p>
                      <p>${(cartItems[item._id] * item.price).toFixed(2)}</p>
                      <p onClick={() => removeFromCart(item._id)} className="cross">x</p>
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
              <div className="cart-total-details"><p>SubTotal</p><p>${getTotalCartAmount().toFixed(2)}</p></div>
              <hr />
              <div className="cart-total-details"><p>Delivery Fee</p><p>$2.00</p></div>
              <hr />
              <div className="cart-total-details"><b>Total</b><b>${(getTotalCartAmount() + 2).toFixed(2)}</b></div>
              <button onClick={() => navigate('/order')}>PROCEED TO CHECKOUT</button>
            </div>
          </div>
        </>
      ) : (
        <div className="cart-empty">
          <img src="https://cdni.iconscout.com/illustration/premium/thumb/empty-cart-illustration-download-in-svg-png-gif-file-formats--wishlist-bucket-shopping-state-pack-design-development-illustrations-6430770.png" alt="Empty Cart" />
          <h2>Your cart is empty</h2>
          <p>Redirecting you to the menu...</p>
        </div>
      )}
    </div>
  );
}
