import React from 'react'
import  './Sidebar.css'
import { assets } from '../../assets/admin_assets/assets'
export default function Sidebar() {
  return (
    <div className='sidebar'>
        <div className="sidebar-options">
            <div className="sidebar-option">
                <img src={assets.add_icon} alt="" />
                <p>Add item</p>
            </div>
            <div className="sidebar-option">
                <img src={assets.order_icon} alt="" />
                <p>List item</p>
            </div>
            <div className="sidebar-option">
                <img src={assets.order_icon} alt="" />
                <p>order item</p>
            </div>
        </div>
        
    </div>
  )
}
