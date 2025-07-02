import orderModel from "../models/orderModel.js";
import userModel from "../models/userModels.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const placeOrder = async (req, res) => {
  const frontend_url = "http://localhost:5173/";

  try {
    const items = req.body.items;

    // Save order in DB
    const newOrder = new orderModel({
      userId: req.userId,
      items: items,
      amount: req.body.amount,
      address: req.body.address,
    });
    await newOrder.save();

    // Clear cart after order placed
    await userModel.findByIdAndUpdate(req.userId, { cartData: {} });

    // Stripe line items
    const line_items = items.map((item) => ({
      price_data: {
        currency: "inr",
        product_data: { name: item.name },
        unit_amount: item.price * 100*85, // Stripe expects paise
      },
      quantity: item.quantity,
    }));

    // Add delivery charges
    line_items.push({
      price_data: {
        currency: "inr",
        product_data: { name: "Delivery charges" },
        unit_amount: 2 * 100*85,
      },
      quantity: 1,
    });
    

    // Stripe session
    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: "payment",
      success_url: `${frontend_url}verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${frontend_url}verify?success=false&orderId=${newOrder._id}`,
    });

    res.json({ success: true, session_url: session.url });
  } catch (error) {
    console.error("Order error:", error.message);
    res.status(500).json({ success: false, message: "Order failed" });
  }
};
const verifyOrder = async(req,res)=>{
  const {orderId,success} = req.body;
  try {
    if(success==true){
      await orderModel.findByIdAndUpdate(orderId,{payment:true});
      res.json({success:true,message:"Paid"})
    }else{
      await orderModel.findByIdAndDelete(orderId);
      res.json({success:false,message:"Not Paid"})
    }
    
  } catch (error) {
    console.log(error);
    res.json({success:false,message:"Error"})
  }
}
const userOrders = async(res,req)=>{
  try {
    const orders = await orderModel.find({userId:req.userId});
    res.json({success:true,data:orders})
  } catch (error) {
    console.log(error);
    res.json({success:false,message:"Error"});
  }
}

export { placeOrder,verifyOrder,userOrders };



