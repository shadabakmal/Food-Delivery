import express from 'express'
import cors from 'cors'
import { connectDB } from './config/db.js'
import foodRouter from './routes/foodRoutes.js'
import userRouter from './routes/userRoutes.js'
import 'dotenv/config'
import cartRouter from './routes/cartRoutes.js'
import orderRouter from './routes/orderRoutes.js'

// app config
const app = express()
const port = 5000

//middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use('/images',express.static('uploads'));
app.use(cors());



//Db connection
connectDB();
app.use("/api/food",foodRouter)
app.use('/api/user',userRouter)
app.use('/api/cart',cartRouter)
app.use('/api/order',orderRouter)
app.get('/',(req,res)=>{
    res.send("Api working")
})

app.listen(port,()=>{
    console.log(`Server Started on http://localhost:${port}`)
})
