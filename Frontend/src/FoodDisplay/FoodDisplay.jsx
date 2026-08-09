import React, { useContext } from 'react';
import './FoodDisplay.css';
import { StoreContext } from '../Context/StoreContext';
import FoodItem from '../FoodItem/FoodItem';

export default function FoodDisplay({ category }) {
  const { food_list, searchTerm } = useContext(StoreContext);

  const filteredList = food_list.filter((item) => {
    const matchesCategory = category === "All" || category === item.category;
    const matchesSearch = !searchTerm || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="food-display" id="food-display">
      <div className="food-display-header">
        <h2>{searchTerm ? `Search Results for "${searchTerm}"` : "Top Dishes Near You"}</h2>
        <span className="dishes-count">{filteredList.length} Dishes Available</span>
      </div>

      {filteredList.length === 0 ? (
        <div className="no-food-found">
          <p>No delicious dishes found matching your search!</p>
        </div>
      ) : (
        <div className="food-display-list">
          {filteredList.map((item, index) => (
            <FoodItem 
              key={index} 
              id={item._id} 
              name={item.name} 
              description={item.description} 
              price={item.price} 
              image={item.image}
              rating={item.rating || (4.2 + (index % 7) * 0.1).toFixed(1)}
              reviews={item.reviews || 95 + index * 10}
            />
          ))}
        </div>
      )}
    </div>
  );
}
