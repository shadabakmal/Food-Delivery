import React, { useState } from 'react';
import Navbar from './components/Navbar/Navbar';
import { Route, Routes, useLocation } from 'react-router-dom';
import Home from './pages/Home/Home';
import Cart from './pages/Cart/Cart';
import PlaceOrder from './pages/PlaceOrder/PlaceOrder';
import Footer from './Footer/Footer';
import LoginPopup from './components/LoginPopup/LoginPopup';
import Verify from './pages/verify/Verify';
import MyOrders from './pages/MyOrders/MyOrders';
import TrackOrder from './pages/TrackOrder/TrackOrder';
import ItemAddedBar from './components/ItemAddedBar/ItemAddedBar';
import StripeCheckout from './pages/StripeCheckout/StripeCheckout';

export default function App() {
  const [showLogin, setShowLogin] = useState(false);
  const location = useLocation();
  const isCheckoutPage = location.pathname === '/cart' || location.pathname === '/order' || location.pathname === '/stripe-checkout';

  return (
    <>
      {showLogin && <LoginPopup setShowLogin={setShowLogin} />}

      <div className='app'>
        {/* Hide main Navbar on Checkout page as requested */}
        {!isCheckoutPage && <Navbar setShowLogin={setShowLogin} />}

        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/cart' element={<Cart setShowLogin={setShowLogin} />} />
          <Route path='/order' element={<PlaceOrder setShowLogin={setShowLogin} />} />
          <Route path='/verify' element={<Verify />} />
          <Route path='/myorders' element={<MyOrders />} />
          <Route path='/track/:orderId' element={<TrackOrder />} />
          <Route path='/stripe-checkout' element={<StripeCheckout />} />
        </Routes>
      </div>

      {/* Hide sticky item added bar on checkout page */}
      {!isCheckoutPage && <ItemAddedBar />}
      {!isCheckoutPage && <Footer />}
    </>
  );
}
