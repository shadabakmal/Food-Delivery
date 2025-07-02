import axios from "axios";
import { createContext, useEffect, useState } from "react";
import React from "react";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const [cartItems, setCartItems] = useState({});
  const [token, setToken] = useState(""); // ✅ must be string
  const [food_list, setFoodList] = useState([]);
  const url = "http://localhost:5000/";

  const fetchFoodList = async () => {
    const response = await axios.get(url + "api/food/list");
    setFoodList(response.data.data);
  };


  

  const addToCart = async (itemId) => {
    setCartItems((prev) => ({
      ...prev,
      [itemId]: prev[itemId] ? prev[itemId] + 1 : 1,
    }));

    if (token) {
      await axios.post(
        url + "api/cart/add",
        { itemId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    }
  };

  const removeFromCart = async (itemId) => {
    setCartItems((prev) => ({
      ...prev,
      [itemId]: prev[itemId] ? prev[itemId] - 1 : 0,
    }));

    if (token) {
      await axios.post(
        url + "api/cart/remove", // ✅ correct endpoint
        { itemId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    }
  };

  const getTotalCartAmount = () => {
    let amount = 0;
    for (const item in cartItems) {
      const item_info = food_list.find((product) => product._id === item);
      if (item_info) {
        amount += item_info.price * cartItems[item];
      }
    }
    return amount;
  };
  const loadCartData = async (token)=>{
    const response = await axios.post( url + "api/cart/get",{},{headers: { Authorization: `Bearer ${token}` }} );
    setCartItems(response.data.cartData);
  }
  useEffect(() => {
    async function loadData() {
      await fetchFoodList();
      const savedToken = localStorage.getItem("token"); // ✅ correct key
      if (savedToken) {
        setToken(savedToken);
        await loadCartData(savedToken)
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
    url,
    token,
    setToken,
    setFoodList,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
