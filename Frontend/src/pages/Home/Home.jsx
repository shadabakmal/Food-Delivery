import React, { useState } from 'react'
import './Home.css'
import Header from '../../components/Header/Header'
import ExploreMenu from '../../components/ExploreMenu/ExploreMenu'
import FoodDisplay from '../../FoodDisplay/FoodDisplay';
import AppDownload from '../../components/AppDownload/AppDownload';
import FloatingCart from '../../components/FloatingCart/FloatingCart'; // 1. Import it

export default function Home() {
  const [category, setCategory] = useState("All");

  return (
    <div className='home-page-container' style={{position: 'relative'}}> 
      {/* 2. Add the Floating Cart here */}
      <FloatingCart /> 
      
      <Header/>
      <ExploreMenu category={category} setCategory={setCategory}/>
      <FoodDisplay category={category} />
      <AppDownload/>
    </div>
  )
}