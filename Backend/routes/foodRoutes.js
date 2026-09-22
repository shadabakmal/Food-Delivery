import express from 'express'
import multer from 'multer'
import { addFood, listFood, removeFood } from '../controllers/foodControllers.js';
import authMiddleware from '../middleware/auth.js';
import isAdmin from '../middleware/isAdmin.js';
import path from "path";

const foodRouter = express.Router();

// Image Storage Engine
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads')
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`)
    }
})
const upload = multer({ storage: storage })

// Public — anyone can browse the menu
foodRouter.get('/list', listFood);

// Admin only — menu management
foodRouter.post("/add", authMiddleware, isAdmin, upload.single("image"), addFood);
foodRouter.post("/remove", authMiddleware, isAdmin, removeFood);

export default foodRouter
