import React from 'react'
import  './Sidebar.css'
import { assets } from '../../assets/admin_assets/assets'
import { NavLink } from 'react-router-dom'
export default function Sidebar() {
  return (
    <div className='sidebar'>
        <div className="sidebar-options">
            <NavLink to='/add' className="sidebar-option">
                <img src={assets.add_icon} alt="" />
                <p>Add item</p>
            </NavLink>
             <NavLink to='list' className="sidebar-option">
                <img src={assets.order_icon} alt="" />
                <p>List item</p>
            </NavLink>
            <NavLink to='order' className="sidebar-option">
                <img src={assets.order_icon} alt="" />
                <p>order item</p>
            </NavLink>
        </div>
        
    </div>
  )
}
