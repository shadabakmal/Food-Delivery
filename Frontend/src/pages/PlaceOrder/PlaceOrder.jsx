import React, { useState,useContext, useEffect } from 'react'
import './PlaceOrder.css'
import { StoreContext } from '../../Context/StoreContext'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
export default function PlaceOrder() {
  const {getTotalCartAmount,token,food_list,cartItems,url} = useContext(StoreContext)
  const [data,setData] = useState({
    firstName:"",
    lastName:"",
    email:"",
    state:"",
    city:"",
    pincode:"",
    country:"",
    phone:"",
    street:""
  })
  const onChangeHandler = (event)=>{
   const name = event.target.name;
   const value = event.target.value;
    setData(data=>({...data,[name]:value}))
  }
  const placeOrder = async (event)=>{
    event.preventDefault();
    let orderItems = [];
    food_list.map((item)=>{
        if (cartItems[item._id] && cartItems[item._id] > 0) {
      let itemInfo = { ...item, quantity: cartItems[item._id] };
      orderItems.push(itemInfo);
    }

      
    })
    let orderData = {
      address: data,
      items: orderItems,
      amount: getTotalCartAmount() + 2
    }
        console.log("Cart Amount:", getTotalCartAmount());
    console.log("Cart Items:", cartItems);
    console.log("Order Items:", orderItems);
    console.log("Sending token:", token);

    try {
  let response = await axios.post(
    url + "api/order/place",
    orderData,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (response.data.success) {
    const { session_url } = response.data;
    window.location.replace(session_url);
  } else {
    alert("Error placing order");
  }
} catch (err) {
  console.error("Order placement failed:", err);
  alert("Something went wrong. Please try again.");
}
  }
  const navigate = useNavigate()
  useEffect(()=>{
    if(!token){
      navigate('/cart');
    }else if(getTotalCartAmount()===0){
      navigate('/cart')
    }
  },[token])
  return (
    <form onSubmit={placeOrder} className='place-order'>
      <div className="place-order-left">
        <p className="title">Delivery Information</p>
        <div className="multi-fields">
          <input required name='firstName' onChange={onChangeHandler} value={data.firstName} type="text" placeholder='First Name'/>
          <input  required name='lastName' onChange={onChangeHandler} value = {data.lastName}type="text" placeholder='Last Name'/>
        </div>
        <input required name='email' onChange={onChangeHandler} value={data.email} type="email"  placeholder='Email Address'/>
        <input required name='street' onChange={onChangeHandler} value ={data.street}type="text" placeholder='Street'/>
         <div className="multi-fields">
          <input required name='city' onChange={onChangeHandler} value={data.city} type="text" placeholder='City'/>
          <input required name='state' onChange={onChangeHandler} value={data.state} type="text" placeholder='State'/>
        </div>
         <div className="multi-fields">
          <input required name='pincode'  onChange={onChangeHandler} value={data.pincode} type="text" placeholder='Pin code'/>
          <input required name="country" onChange={onChangeHandler} value={data.country} type="text" placeholder='Country'/>
        </div>
        <input required name="phone" onChange={onChangeHandler} value={data.phone} type="text" placeholder='Phone' />
      </div>
      <div className="place-order-right">
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
                  <p>${getTotalCartAmount()===0?0:2}</p>
                </div>
                <hr />
                <div className="cart-total-details">
                  <b>Total</b>
                  <b>${(getTotalCartAmount()===0?0:getTotalCartAmount() + 2)}</b>
                </div>
              </div>
              <button type='submit'>PROCEED TO PAYMENT</button>
            </div>
            </div>
      </div>
    </form>
  )
}
