import axios from "axios";
import React, { createContext, useEffect, useState } from "react";
import { food_list as default_food_list } from "../assets/frontend_assets/assets";

export const StoreContext = createContext(null);

// Format default food list to Indian Rupees and add ratings
const formattedDefaultList = default_food_list.map((item, index) => ({
  ...item,
  price: item.price * 15, // Convert $ to INR (e.g. $12 -> ₹180)
  rating: (4.2 + (index % 8) * 0.1).toFixed(1),
  reviews: 120 + (index * 13) % 300
}));

const StoreContextProvider = (props) => {
  const [cartItems, setCartItems] = useState({});
  const [token, setToken] = useState("");
  const [userName, setUserName] = useState(localStorage.getItem("userName") || "");
  const [food_list, setFoodList] = useState(formattedDefaultList);
  const [searchTerm, setSearchTerm] = useState("");

  // Default to deployed backend URL if env variable is not set
  const url = (import.meta.env.VITE_BACKEND_URL || "https://food-delivery-backend-psi-lac.vercel.app/").replace(/\/?$/, '/');

  const fetchFoodList = async () => {
    try {
      const response = await axios.get(url + "api/food/list");
      if (response.data.success && response.data.data.length > 0) {
        const apiItems = response.data.data.map((item, idx) => ({
          ...item,
          price: item.price < 50 ? item.price * 15 : item.price,
          rating: item.rating || (4.3 + (idx % 7) * 0.1).toFixed(1),
          reviews: item.reviews || 85 + idx * 12
        }));
        
        const combined = [...apiItems];
        formattedDefaultList.forEach(defItem => {
          if (!combined.some(apiItem => apiItem.name.toLowerCase() === defItem.name.toLowerCase())) {
            combined.push(defItem);
          }
        });
        setFoodList(combined);
      }
    } catch (err) {
      console.warn("Could not fetch API food list, using default menu items:", err.message);
    }
  };

  const addToCart = async (itemId) => {
    setCartItems((prev) => ({
      ...prev,
      [itemId]: prev[itemId] ? prev[itemId] + 1 : 1,
    }));

    if (token) {
      try {
        await axios.post(
          url + "api/cart/add",
          { itemId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (e) {
        console.error("Cart add error:", e);
      }
    }
  };

  const removeFromCart = async (itemId) => {
    setCartItems((prev) => ({
      ...prev,
      [itemId]: prev[itemId] > 1 ? prev[itemId] - 1 : 0,
    }));

    if (token) {
      try {
        await axios.post(
          url + "api/cart/remove",
          { itemId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (e) {
        console.error("Cart remove error:", e);
      }
    }
  };

  const getTotalCartAmount = () => {
    let amount = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        const item_info = food_list.find((product) => product._id === item || String(product._id) === String(item));
        if (item_info) {
          amount += item_info.price * cartItems[item];
        }
      }
    }
    return amount;
  };

  const getTotalCartCount = () => {
    let totalCount = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        totalCount += cartItems[item];
      }
    }
    return totalCount;
  };

  const loadCartData = async (token) => {
    try {
      const response = await axios.post(
        url + "api/cart/get",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success && response.data.cartData) {
        setCartItems(response.data.cartData);
      }
    } catch (e) {
      console.error("Load cart error:", e);
    }
  };

  useEffect(() => {
    async function loadData() {
      await fetchFoodList();
      const savedToken = localStorage.getItem("token");
      const savedName = localStorage.getItem("userName");
      if (savedToken) {
        setToken(savedToken);
        if (savedName) setUserName(savedName);
        await loadCartData(savedToken);
      }
    }
    loadData();
  }, []);

  const contextValue = {
    food_list,
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    getTotalCartCount,
    searchTerm,
    setSearchTerm,
    url,
    token,
    setToken,
    userName,
    setUserName,
    setFoodList,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
