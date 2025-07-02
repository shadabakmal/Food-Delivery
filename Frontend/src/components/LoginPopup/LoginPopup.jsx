import React, { useContext, useEffect, useState } from 'react'
import './LoginPopup.css'
import { assets } from '../../assets/frontend_assets/assets';
import { StoreContext } from '../../Context/StoreContext';
import axios from 'axios'
export default function LoginPopup({setShowLogin}) {
    const [currState,setCurrState] = useState("Sign Up");
    const {url,setToken,token} = useContext(StoreContext)
    const [data,setdata] = useState({
        name:"",
        email:"",
        password:"",

    })
    const onChangeHandler = (event)=>{
        const name = event.target.name;
        const value = event.target.value;
        setdata({ ...data, [name]: value });
;
    }
    const login = async (event) => {
    event.preventDefault();
    let newUrl = url;
    if (currState === 'Login') {
        newUrl += 'api/user/login';
    } else {
        newUrl += 'api/user/register';
    }

    try {
        const response = await axios.post(newUrl, data);
        console.log("Response from server:", response);

        if (response.data.success) {
            console.log("Login/register success");
            setToken(response.data.token);
            localStorage.setItem("token", response.data.token);
            setShowLogin(false);
        } else {
            console.log("Backend returned failure:", response.data.message);
            alert(response.data.message || "Something went wrong.");
        }
    } catch (err) {
        console.error("Axios error:", err);
        alert(err.response?.data?.message || "Server error or URL issue.");
    }
};

    
  return (
    <div className='login-popup'>
        <form onSubmit={login} className="login-popup-container">
            <div className="login-popup-title">
                <h2>{currState}</h2>
                <img onClick={()=>setShowLogin(false)}src={assets.cross_icon} alt="" />
            </div>
            <div className="login-popup-inputs">
                {currState==="Login"?<></>:<input name='name' onChange={onChangeHandler} value={data.name} type="text" placeholder='Your name' required />}
                <input name='email' type="email" onChange={onChangeHandler} value={data.email} placeholder='Your email' required />
                <input name='password' onChange={onChangeHandler} value={data.password} type="password" placeholder="Password" required />

            </div>
            <button type='submit'>{currState==="Sign Up"?"Create account":"Login"}</button>
            <div className="login-popup-condition">
                <input type="checkbox" required />
                <p>By continuing, I agree to the terms of use & privacy policy.</p>
            </div>
            {currState==="Login"?
                <p>create a new account? <span onClick={()=>setCurrState("Sign Up")}>Click here</span></p>:
                <p>Already Login? <span onClick={()=>setCurrState("Login")}>Login here</span></p>
            }           
        </form>
    </div>
  )
}
