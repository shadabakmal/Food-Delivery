import React from 'react'
import './Navbar.css'
import {assets} from '../../assets/admin_assets/assets'
export default function Navbar() {
  return (
    <div className='navbar'>
        <img  className="logo" src={assets.logo} alt="" />
        <img src={assets.profile_image} alt="" />
    </div>
  )
}
