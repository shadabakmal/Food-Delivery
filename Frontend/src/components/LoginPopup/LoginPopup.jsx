import React, { useContext, useEffect, useState } from 'react';
import './LoginPopup.css';
import { assets } from '../../assets/frontend_assets/assets';
import { StoreContext } from '../../Context/StoreContext';
import axios from 'axios';

export default function LoginPopup({ setShowLogin }) {
  const [currState, setCurrState] = useState("Sign Up");
  const { url, setToken, token, setUserName } = useContext(StoreContext);
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
  });

  // Automatically close login modal if user is already logged in
  useEffect(() => {
    if (token) {
      setShowLogin(false);
    }
  }, [token, setShowLogin]);

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData({ ...data, [name]: value });
  };

  const login = async (event) => {
    event.preventDefault();
    const actionPath = currState === 'Login' ? 'api/user/login' : 'api/user/register';
    const primaryEndpoint = `${url.replace(/\/$/, '')}/${actionPath}`;
    const fallbackEndpoint = `/${actionPath}`;

    let response = null;
    try {
      response = await axios.post(primaryEndpoint, data);
    } catch (primaryErr) {
      console.warn("Primary endpoint failed, trying fallback proxy:", primaryErr.message);
      try {
        response = await axios.post(fallbackEndpoint, data);
      } catch (fallbackErr) {
        console.error("Both authentication endpoints failed:", fallbackErr.message);
        alert(
          fallbackErr.response?.data?.message || 
          primaryErr.response?.data?.message || 
          "Connection issue with authentication server. Please try again."
        );
        return;
      }
    }

    if (response && response.data) {
      if (response.data.success) {
        const displayName = response.data.name || data.name || (data.email ? data.email.split('@')[0] : "User");
        setToken(response.data.token);
        if (setUserName) setUserName(displayName);
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userName", displayName);
        setShowLogin(false);
      } else {
        alert(response.data.message || "Authentication failed.");
      }
    }
  };

  return (
    <div className='login-popup'>
      <form onSubmit={login} className="login-popup-container">
        <div className="login-popup-title">
          <h2>{currState}</h2>
          <img onClick={() => setShowLogin(false)} src={assets.cross_icon} alt="Close" />
        </div>
        <div className="login-popup-inputs">
          {currState === "Login" ? null : (
            <input 
              name='name' 
              onChange={onChangeHandler} 
              value={data.name} 
              type="text" 
              placeholder='Your name' 
              required 
            />
          )}
          <input 
            name='email' 
            type="email" 
            onChange={onChangeHandler} 
            value={data.email} 
            placeholder='Your email' 
            required 
          />
          <input 
            name='password' 
            onChange={onChangeHandler} 
            value={data.password} 
            type="password" 
            placeholder="Password" 
            required 
          />
        </div>

        <button type='submit'>{currState === "Sign Up" ? "Create account" : "Login"}</button>
        
        <div className="login-popup-condition">
          <input type="checkbox" required />
          <p>By continuing, I agree to the terms of use & privacy policy.</p>
        </div>

        {currState === "Login" ? (
          <p>Create a new account? <span onClick={() => setCurrState("Sign Up")}>Click here</span></p>
        ) : (
          <p>Already have an account? <span onClick={() => setCurrState("Login")}>Login here</span></p>
        )}
      </form>
    </div>
  );
}
