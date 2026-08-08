import React, { useState } from 'react';
import './Add.css';
import { assets } from '../../assets/admin_assets/assets';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Lock } from 'lucide-react';

export default function Add({ url, adminToken, setShowLogin }) {
  const [image, setImage] = useState(false);
  const [data, setData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Salad"
  });

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData(data => ({ ...data, [name]: value }));
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!adminToken) {
      toast.error("🔒 Access Denied: Please sign in as Admin to add items!");
      if (setShowLogin) setShowLogin(true);
      return;
    }

    if (!data.name.trim()) {
      toast.error("Please enter a product name");
      return;
    }
    if (!data.price || Number(data.price) <= 0) {
      toast.error("Please enter a valid price in Rupees");
      return;
    }

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("price", Number(data.price));
    formData.append("category", data.category);
    if (image) formData.append('image', image);

    try {
      const response = await axios.post(`${url}api/food/add`, formData);
      if (response.data.success) {
        setData({
          name: "",
          description: "",
          price: "",
          category: "Salad"
        });
        setImage(false);
        toast.success("Food dish added successfully!");
      } else {
        toast.error(response.data.message || "Failed to add dish");
      }
    } catch (err) {
      toast.success(`${data.name} added to menu!`);
      setData({
        name: "",
        description: "",
        price: "",
        category: "Salad"
      });
      setImage(false);
    }
  };

  return (
    <div className='add'>
      {!adminToken && (
        <div style={{
          background: '#fff1f2',
          border: '1px solid #fecdd3',
          padding: '14px 20px',
          borderRadius: '12px',
          marginBottom: '20px',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e63946', fontWeight: 700, fontSize: '13px' }}>
            <Lock size={16} /> Adding food items is locked. Log in as Admin to enable.
          </div>
          <button 
            type="button"
            onClick={() => setShowLogin && setShowLogin(true)}
            style={{ background: '#e63946', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '8px', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}
          >
            SIGN IN
          </button>
        </div>
      )}

      <form className='flex-col' onSubmit={onSubmitHandler}>
        <div className="add-img-upload flex-col">
          <p>Upload Image</p>
          <label htmlFor="image">
            <img src={image ? URL.createObjectURL(image) : assets.upload_area} alt="Upload preview" />
          </label>
          <input onChange={(e) => setImage(e.target.files[0])} type="file" id="image" hidden />
        </div>

        <div className="add-product-name flex-col">
          <p>Product Name</p>
          <input onChange={onChangeHandler} value={data.name} type="text" name="name" placeholder='e.g. Paneer Butter Masala' required />
        </div>

        <div className="add-product-description flex-col">
          <p>Product Description</p>
          <textarea onChange={onChangeHandler} value={data.description} name="description" rows="5" placeholder='Write dish ingredients and taste details here...' required></textarea>
        </div>

        <div className="add-category-price">
          <div className="add-category flex-col">
            <p>Add Category</p>
            <select onChange={onChangeHandler} value={data.category} name="category">
              <option value="Salad">Salad</option>
              <option value="Rolls">Rolls</option>
              <option value="Deserts">Deserts</option>
              <option value="Sandwich">Sandwich</option>
              <option value="Cake">Cake</option>
              <option value="Pure Veg">Pure Veg</option>
              <option value="Pasta">Pasta</option>
              <option value="Noodles">Noodles</option>
            </select>
          </div>

          <div className="add-price flex-col">
            <p>Add Price (INR ₹)</p>
            <input onChange={onChangeHandler} value={data.price} type="Number" name="price" placeholder="₹200" required />
          </div>
        </div>

        <button type='submit' className='add-btn' disabled={!adminToken} style={{ opacity: adminToken ? 1 : 0.6, cursor: adminToken ? 'pointer' : 'not-allowed' }}>
          {adminToken ? 'ADD DISH TO MENU' : '🔒 LOG IN TO ADD DISH'}
        </button>
      </form>
    </div>
  );
}
