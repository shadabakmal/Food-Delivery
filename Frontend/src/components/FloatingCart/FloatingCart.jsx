import React, { useContext } from 'react'
import './FloatingCart.css'
import { StoreContext } from '../../Context/StoreContext'
import { useNavigate } from 'react-router-dom'

const FloatingCart = () => {
    const { cartItems, food_list, setCartItems } = useContext(StoreContext);
    const navigate = useNavigate();

    // Calculate total number of items
    const totalItems = food_list.reduce((acc, item) => {
        return acc + (cartItems[item._id] || 0);
    }, 0);

    // If no items, don't show the bar
    if (totalItems === 0) return null;

    const handleDismissCart = (e) => {
        e.stopPropagation();
        setCartItems({});
    };

    return (
        <div className="floating-cart-wrapper">
            <div className="floating-cart-bar">
                {/* Left Section: Generic Logo + Dynamic Item Count */}
                <div className="cart-left-section" onClick={() => navigate('/cart')}>
                    <div className="generic-food-logo">
                        <span role="img" aria-label="food">🥘</span>
                    </div>
                    <div className="cart-res-details">
                        <p className="res-name">{totalItems} {totalItems === 1 ? 'Item' : 'Items'} Added</p>
                        <p className="view-menu-link">View Menu <span className="arrow">▶</span></p>
                    </div>
                </div>

                {/* Right Section: Red Action Button + Gray Cross */}
                <div className="cart-right-section">
                    <button className="view-cart-btn" onClick={() => navigate('/cart')}>
                        <span>View Cart</span>
                        <small>{totalItems} item{totalItems > 1 ? 's' : ''}</small>
                    </button>
                    <div className="cart-close-btn" onClick={handleDismissCart}>
                        &times;
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FloatingCart;