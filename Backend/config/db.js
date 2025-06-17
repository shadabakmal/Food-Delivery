import mongoose from "mongoose";


export const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://shadabakmal:shadab786@cluster0.i4gjx32.mongodb.net/FoodDelivery", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};
