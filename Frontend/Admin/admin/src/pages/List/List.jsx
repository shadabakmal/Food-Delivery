import React, { useEffect, useState } from 'react';
import './List.css';
import axios from 'axios';
import { toast } from 'react-toastify';
import { food_list as websiteDefaultList } from '../../../../../src/assets/frontend_assets/assets';
import { Search, Trash2, Tag, Utensils } from 'lucide-react';

export default function List({ url }) {
  const [list, setList] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Formatted default food list in INR
  const formattedDefaultList = websiteDefaultList.map((item) => ({
    ...item,
    price: item.price < 50 ? item.price * 15 : item.price,
    isDefault: true
  }));

  const fetchList = async () => {
    try {
      const response = await axios.get(`${url}/api/food/list`);
      let combined = [...formattedDefaultList];

      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        const apiItems = response.data.data.map(item => ({
          ...item,
          price: item.price < 50 ? item.price * 15 : item.price,
          isDefault: false
        }));

        apiItems.forEach(apiItem => {
          const index = combined.findIndex(def => def.name.toLowerCase() === apiItem.name.toLowerCase());
          if (index !== -1) {
            combined[index] = apiItem;
          } else {
            combined.unshift(apiItem);
          }
        });
      }
      setList(combined);
    } catch (err) {
      console.warn("Could not fetch API list, displaying complete website menu items:", err.message);
      setList(formattedDefaultList);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const removeFood = async (item) => {
    if (item.isDefault) {
      setList(prev => prev.filter(f => f.name !== item.name));
      toast.success(`${item.name} removed from admin view`);
      return;
    }

    try {
      const response = await axios.post(`${url}/api/food/remove`, { id: item._id });
      if (response.data.success) {
        toast.success(response.data.message);
        await fetchList();
      } else {
        toast.error("Error removing item");
      }
    } catch (err) {
      setList(prev => prev.filter(f => f._id !== item._id));
      toast.success(`${item.name} removed from view`);
    }
  };

  const categories = ['All', 'Salad', 'Rolls', 'Deserts', 'Sandwich', 'Cake', 'Pure Veg', 'Pasta', 'Noodles'];

  const filteredList = list.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className='admin-list-container'>
      <div className="list-header-row">
        <div>
          <h2><Utensils size={24} color="#e63946" /> All Website Food Items ({filteredList.length})</h2>
          <p className="subtext">All items listed on the customer food delivery website</p>
        </div>

        {/* Search Bar */}
        <div className="admin-search-box">
          <Search size={16} color="#64748b" />
          <input 
            type="text" 
            placeholder="Search dish by name or category..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="category-pills-row">
        {categories.map(cat => (
          <button 
            key={cat} 
            className={`cat-pill ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Food Items Table */}
      <div className="list-table">
        <div className="list-table-format title">
          <b>Image</b>
          <b>Dish Name</b>
          <b>Category</b>
          <b>Price (Rupees)</b>
          <b>Action</b>
        </div>

        {filteredList.length === 0 ? (
          <div className="no-items-row">
            <p>No food items match your filter.</p>
          </div>
        ) : (
          filteredList.map((item, index) => {
            const imageSrc = typeof item.image === 'string' && (item.image.startsWith('http') || item.image.startsWith('data:'))
              ? item.image
              : typeof item.image === 'string' && item.image.length > 5 && !item.isDefault
                ? `${url}/images/` + item.image
                : item.image;

            return (
              <div key={item._id || index} className="list-table-format">
                <img 
                  src={imageSrc} 
                  alt={item.name} 
                  className="food-thumb-img"
                  onError={(e) => { e.target.onerror = null; e.target.src = websiteDefaultList[0].image; }}
                />
                <p className="food-name-cell">
                  <strong>{item.name}</strong>
                  <span className="desc-snippet">{item.description}</span>
                </p>
                <p><span className="category-tag"><Tag size={12} /> {item.category}</span></p>
                <p className="price-rupee">₹{item.price}</p>
                <p onClick={() => removeFood(item)} className='action-delete-btn' title="Remove item">
                  <Trash2 size={18} color="#ef4444" />
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
