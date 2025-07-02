import foodModel from "../models/foodModels.js";
import userModel from "../models/userModels.js";


// add item to cart
const addToCart = async (req,res)=>{
    try {
        let userData = await userModel.findOne({_id:req.userId});
         if (!userData) return res.status(404).json({ success: false, message: "User not found" });
        let cartData = userData.cartData || {};
        if(!cartData[req.body.itemId]){
            cartData[req.body.itemId] = 1;
        }else{
            cartData[req.body.itemId] += 1;
        }
        await userModel.findByIdAndUpdate(req.userId,{cartData});
        res.json({success:true,message:"Added To Cart"})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}


//remove item from cart
const removeFromCart = async (req,res)=>{
      try {
        let userData = await userModel.findById(req.userId);
         if (!userData) return res.status(404).json({ success: false, message: "User not found" });
        let cartData = await userData.cartData || {};
        if(cartData[req.body.itemId]>0){
            cartData[req.body.itemId] -= 1;
        }
        await userModel.findByIdAndUpdate(req.userId,{cartData});
        res.json({success:true,message:"Removed From Cart"})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}

//fetch  user cart data
const getCart = async (req,res)=>{
    try {
        let userData = await userModel.findById(req.userId);
         if (!userData) return res.status(404).json({ success: false, message: "User not found" });
        let cartData = await userData.cartData;
        res.json({success:true,cartData})
    } catch (error) {
         console.log(error);
        res.json({success:false,message:"Error"})
    }
}

export {addToCart,removeFromCart,getCart}