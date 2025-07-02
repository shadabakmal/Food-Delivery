import React from 'react'
import './Verify.css'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useContext } from 'react';
import { StoreContext } from '../../Context/StoreContext';
import axios from 'axios';
import { useEffect } from 'react';
export default function Verify() {
    const [searchParam,setSearchParam] = useSearchParams();
    const success = searchParam.get("success");
     const orderId = searchParam.get("orderId");
     console.log(orderId);
     console.log(success);
     const navigate = useNavigate();
     const {url} = useContext(StoreContext)
    const verifyPayment = async ()=>{
        const response = await axios.post(url+'api/order/verify',{success,orderId});
        if (response.data.success) {
            navigate("/myorders");
        }else{
            navigate("/")
        }

    }
    useEffect(()=>{
        verifyPayment()
    },[])
  return (
    <div className='verify'>
        <div className="spinner">

        </div>
    </div>
  )
}
