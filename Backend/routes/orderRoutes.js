import express from 'express'
import authMiddleware from '../middleware/auth.js';
import isAdmin from '../middleware/isAdmin.js';
import { 
  placeOrder, 
  userOrders, 
  verifyOrder, 
  getOrderById, 
  listOrders, 
  updateStatus, 
  assignDeliveryBoy, 
  updateDeliveryLocation, 
  getDeliveryBoys,
  cancelOrder
} from '../controllers/orderController.js';

const orderRouter = express.Router();

// Public / no login required
orderRouter.post('/verify', verifyOrder);
orderRouter.get('/delivery-boys', getDeliveryBoys);

// Requires login (any logged-in user, not just admin)
orderRouter.post('/place', authMiddleware, placeOrder);
orderRouter.post('/userorders', authMiddleware, userOrders);
orderRouter.post('/cancel', authMiddleware, cancelOrder);
orderRouter.get('/:id', authMiddleware, getOrderById);

// Admin only
orderRouter.get('/list', authMiddleware, isAdmin, listOrders);
orderRouter.post('/status', authMiddleware, isAdmin, updateStatus);
orderRouter.post('/assign', authMiddleware, isAdmin, assignDeliveryBoy);
orderRouter.post('/update-location', authMiddleware, isAdmin, updateDeliveryLocation);

export default orderRouter;
