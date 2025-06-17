import express from 'express'
import cors from 'cors'
import { connectDB } from './config/db.js'
import foodRouter from './routes/foodRoutes.js'

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
app.get('/',(req,res)=>{
    res.send("Api working")
})

app.listen(port,()=>{
    console.log(`Server Started on http://localhost:${port}`)
})
