import mongoose from "mongoose";


let isConnected = false;

export const connectDB = async () => {
  if (isConnected) {
    return;
  }

  const mongoUri = process.env.MONGO_URI || "mongodb+srv://shadabakmal:shadab786@cluster0.i4gjx32.mongodb.net/FoodDelivery";

  try {
    const db = await mongoose.connect(mongoUri);
    isConnected = db.connections[0].readyState === 1;
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
  }
};
