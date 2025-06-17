import foodModel from "../models/foodModels.js";
import fs from 'fs';
import foodRouter from "../routes/foodRoutes.js";
import mongoose from "mongoose";
 const addFood = async (req,res)=>{
    let image_filename = `${req.file.filename}`;
    const food = new foodModel({
        name:req.body.name,
        description:req.body.description,
        price:req.body.price,
        category:req.body.category,
        image:image_filename
    })
    try {
        await food.save();
        res.json({success:true,message:"Food Added"})
    } catch (error) {
       console.log("Upload Error:", error);
        res.status(500).json({ success: false, message: error.message });

    }

}
//all foodList
const listFood = async (req,res)=>{
    
    try {
        const foods = await foodModel.find({});
        res.json({success:true,data:foods})
    } catch (error) {
         console.log("Error:", error);
        res.status(500).json({ success: false, message: error.message });

    }
}
//remove foodItem
const removeFood = async(req,res)=>{
    try {
        const food = await foodModel.findById(req.body.id);
        fs.unlink(`uploads/${food.image}`,()=>{});
        await foodModel.findByIdAndDelete(req.body.id);
        res.json({success:true,message:"Food Removed"})
    } catch (error) {
        console.log("Removed Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
}


export {addFood,listFood,removeFood}