
import React, { useState } from 'react'
import Navbar from './components/Navbar/Navbar'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home/Home'
import Cart from './pages/Cart/Cart'
import PlaceOrder from './pages/PlaceOrder/PlaceOrder'
import Footer from './Footer/Footer'
import LoginPopup from './components/LoginPopup/LoginPopup'
import Verify from './pages/verify/Verify'
import MyOrders from './pages/MyOrders/MyOrders'
import TrackOrder from './pages/TrackOrder/TrackOrder'

import ItemAddedBar from './components/ItemAddedBar/ItemAddedBar'

export default function App() {
  const [showLogin,setShowLogin] = useState(false)
  return (
    <>
    {showLogin && <LoginPopup setShowLogin={setShowLogin} />}

    <div className='app'>
      <Navbar setShowLogin={setShowLogin}/>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/cart' element={<Cart setShowLogin={setShowLogin} />}/>
        <Route path='/order' element={<PlaceOrder setShowLogin={setShowLogin} />}/>
        <Route path='/verify' element={<Verify/>}/>
        <Route path='/myorders' element={<MyOrders/>}/>
        <Route path='/track/:orderId' element={<TrackOrder/>}/>
      </Routes>
    </div>
    <ItemAddedBar />
    <Footer/>
    </>
)
}



