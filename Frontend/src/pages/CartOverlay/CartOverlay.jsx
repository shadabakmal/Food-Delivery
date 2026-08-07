import React, { useMemo } from 'react';
import './CartOverlay.css'; // Don't forget to create this CSS file

export default function CartOverlay({ cartItems }) {
  // 1. Context or Prop for Cart Items
  // This could come from a central Context Provider instead of being passed as a prop
  // e.g., const { cartItems } = useContext(CartContext);

  // 2. Efficiently calculate total quantity
  const totalCartQuantity = useMemo(() => {
    return Object.values(cartItems).reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  // 3. --- The Key Conditonal Check ---
  // If no items, render nothing (return null)
  if (totalCartQuantity === 0) {
    return null;
  }

  // 4. --- The UI Check (only renders if totalCartQuantity > 0) ---
  return (
    <div className="cart-container-wrapper">
      <div className="cart-container">
        <div className="cart-info">
          {/* Circular image placeholder (optional, can omit for simplicity) */}
          <div className="restaurant-thumb-wrapper">
             <div className="restaurant-thumb-img" />
          </div>
          <p>
            {/* Display the total count */}
            <b>{totalCartQuantity} {totalCartQuantity === 1 ? 'item' : 'items'} added</b>
          </p>
        </div>
        <button className="view-cart-btn">VIEW CART</button>
      </div>
    </div>
  );
}