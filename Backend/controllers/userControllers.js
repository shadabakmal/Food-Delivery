import userModel from "../models/userModels.js";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import validator from 'validator';

const JWT_SECRET = process.env.JWT_SECRET;

// Login User 
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User doesn't exist" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid credentials" });
    }
    const token = createToken(user._id, user.role);
    res.json({ success: true, token, name: user.name, role: user.role });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Error logging in" });
  }
};

const createToken = (id, role) => {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured on the server.");
  }
  return jwt.sign({ id, role }, JWT_SECRET);
};

// Register User
const registerUser = async (req, res) => {
  const { name, password, email } = req.body;
  try {
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Please enter a valid email address." });
    }
    if (!password || password.length < 4) {
      return res.json({ success: false, message: "Password must be at least 4 characters long." });
    }

    const exist = await userModel.findOne({ email });
    if (exist) {
      return res.json({ success: false, message: "User already exists. Please log in instead." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new userModel({
      name: name,
      email: email,
      password: hashedPassword
      // role is not set here on purpose - schema default ("user") applies automatically
    });
    const user = await newUser.save();
    const token = createToken(user._id, user.role);
    res.json({ success: true, token, name: user.name, role: user.role });
  } catch (error) {
    console.log(error);
    if (error.code === 11000) {
      // Duplicate key error from the unique index on email (race-condition safety net)
      return res.status(409).json({ success: false, message: "User already exists. Please log in instead." });
    }
    res.status(500).json({ success: false, message: "Server error during registration." });
  }
};

const saveAddress = async (req, res) => {
  try {
    if (req.isGuest || !req.userId) {
      return res.status(401).json({ success: false, message: "Please log in to save an address." });
    }

    const { address } = req.body;
    const user = await userModel.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const addresses = user.addresses || [];
    addresses.push({ ...address, id: Date.now().toString() });

    await userModel.findByIdAndUpdate(req.userId, { addresses });
    res.json({ success: true, message: "Address saved successfully!", addresses });
  } catch (error) {
    console.error("Save address error:", error);
    res.status(500).json({ success: false, message: "Failed to save address" });
  }
};

const getAddresses = async (req, res) => {
  try {
    if (req.isGuest || !req.userId) {
      return res.status(401).json({ success: false, message: "Please log in to view addresses." });
    }

    const user = await userModel.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.json({ success: true, addresses: user.addresses || [] });
  } catch (error) {
    console.error("Get addresses error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch addresses" });
  }
};

export { loginUser, registerUser, saveAddress, getAddresses };
