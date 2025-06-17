import { createContext, useEffect, useState } from "react";
import { food_list } from "../assets/frontend_assets/assets.js";
import React from "react";
export const StoreContext = createContext(null);
const StoreContextProvider = (props)=>{
    const [cartItems,setCartItems] = useState({})
    const addToCart=(itemId)=>{
        if(!cartItems[itemId]){
            setCartItems((prev)=>({...prev,[itemId]:1}));
        }else{
            setCartItems((prev)=>({...prev,[itemId]:prev[itemId]+1}))
        }
    }
    const removeFromCart=(itemId)=>{
        if(!cartItems[itemId]){
            setCartItems((prev)=>({...prev,[itemId]:1}));
        }else{
            setCartItems((prev)=>({...prev,[itemId]:prev[itemId]-1}))
        }
    }
    const getTotalCartAmount = ()=>{
        let Amount = 0;
        for (const item in cartItems) {
            let item_info = food_list.find((product)=> product._id===item);
            Amount += item_info.price*cartItems[item];
        }
        return Amount;
    }
    const contextValue = {
        food_list,
        cartItems,
        setCartItems,
        addToCart,
        removeFromCart,
        getTotalCartAmount
    }
        return(
            <StoreContext.Provider value={contextValue}>
            {props.children}
            </StoreContext.Provider>
        ) 
}

export default StoreContextProvider