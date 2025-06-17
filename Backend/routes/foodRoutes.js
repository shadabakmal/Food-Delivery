import express from 'express'
import multer from 'multer'
import { addFood, listFood, removeFood } from '../controllers/foodControllers.js';
 const foodRouter = express.Router();
import path from "path";

 //Image Storage Engine
 const storage = multer.diskStorage({
    destination: (req,file,cb)=>{
        cb(null,'./uploads')
    },
    filename: (req, file, cb) => {
         cb(null, `${Date.now()}-${file.originalname}`)
        }
 })
 const upload = multer({storage:storage})

foodRouter.post("/add", upload.single("image"),addFood, async(req,res)=>{
    console.log(req.file)
});
foodRouter.get('/list',listFood)
foodRouter.post("/remove",removeFood)







 export default foodRouter
