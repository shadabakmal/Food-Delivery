import express from 'express';
import { loginUser, registerUser, saveAddress, getAddresses } from '../controllers/userControllers.js';
import authMiddleware from '../middleware/auth.js';

const userRouter = express.Router();

userRouter.post('/login', loginUser);
userRouter.post('/register', registerUser);
userRouter.post('/address/add', authMiddleware, saveAddress);
userRouter.get('/address/get', authMiddleware, getAddresses);

export default userRouter;