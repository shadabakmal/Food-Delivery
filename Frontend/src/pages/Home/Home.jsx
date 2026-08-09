import React, { useState } from 'react';
import './Home.css';
import Header from '../../components/Header/Header';
import ExploreMenu from '../../components/ExploreMenu/ExploreMenu';
import FoodDisplay from '../../FoodDisplay/FoodDisplay';
import AppDownload from '../../components/AppDownload/AppDownload';

export default function Home() {
  const [category, setCategory] = useState("All");

  return (
    <div className='home-page-container' style={{ position: 'relative' }}>
      <Header />
      <ExploreMenu category={category} setCategory={setCategory} />
      <FoodDisplay category={category} />
      <AppDownload />
    </div>
  );
}