import express from 'express';
import cors from 'cors';
import { connectDB } from '../config/db.js';
import foodRouter from '../routes/foodRoutes.js';
import userRouter from '../routes/userRoutes.js';
import 'dotenv/config';
import cartRouter from '../routes/cartRoutes.js';
import orderRouter from '../routes/orderRoutes.js';

const app = express();

// Permissive CORS for all origins, preview domains, and preflight OPTIONS requests
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'token']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/images', express.static('uploads'));
app.use('/videos', express.static('uploads/videos'));

// Middleware to ensure database connection before processing requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
  } catch (err) {
    console.error("DB Connection Error:", err.message);
  }
  next();
});

app.use("/api/food", foodRouter);
app.use('/api/user', userRouter);
app.use('/api/cart', cartRouter);
app.use('/api/order', orderRouter);

app.get('/', (req, res) => {
  res.send("Api working");
});

// Global error handler middleware
app.use((err, req, res, next) => {
  console.error("Serverless Error Handler:", err);
  res.status(500).json({ success: false, message: err.message || "Internal Server Error" });
});

export default app;
