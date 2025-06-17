import React, { useContext } from 'react';
import './Cart.css';
import { StoreContext } from '../../Context/StoreContext';
import { assets } from '../../assets/frontend_assets/assets';
import { useNavigate } from 'react-router-dom';

export default function Cart() {
  const { cartItems, food_list, removeFromCart, getTotalCartAmount } = useContext(StoreContext);

  const cartHasItems = food_list.some(item => cartItems[item._id] > 0);
  const navigate = useNavigate();

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
            <br />
            <hr />

            {food_list.map((item) => {
              if (cartItems[item._id] > 0) {
                return (
                  <div key={item._id}>
                    <div className="cart-items-title cart-items-item">
                      <img src={item.image} alt={item.name} />
                      <p>{item.name}</p>
                      <p>${item.price}</p>
                      <p>{cartItems[item._id]}</p>
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
              <div>
                <div className="cart-total-details">
                  <p>SubTotal</p>
                  <p>${getTotalCartAmount().toFixed(2)}</p>
                </div>
                <hr/>
                <div className="cart-total-details">
                  <p>Delivery Fee</p>
                  <p>$2.00</p>
                </div>
                <hr />
                <div className="cart-total-details">
                  <b>Total</b>
                  <b>${(getTotalCartAmount() + 2).toFixed(2)}</b>
                </div>
              </div>
              <button onClick={()=>navigate('/order')}>PROCEED TO CHECKOUT</button>
            </div>

            <div className="cart-promocode">
              <p>If you have promo code, Enter it here.</p>
              <div className="cart-promocode-input">
                <input type="text" placeholder="Promo Code" />
                <button>Submit</button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="cart-empty">
          <img src={assets.empty_cart} alt="Cart is empty" />
          <h2>Your cart is empty</h2>
        </div>
      )}
    </div>
  );
}
