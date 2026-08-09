import orderModel from "../models/orderModel.js";
import userModel from "../models/userModels.js";
import Stripe from "stripe";

// Pre-configured active delivery partners for assignment
const DELIVERY_BOYS = [
  { id: "DB001", name: "Rahul Kumar", phone: "+91 98765 43210", vehicle: "Honda Activa (UP16 AB 1234)", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" },
  { id: "DB002", name: "Vikram Singh", phone: "+91 98123 45678", vehicle: "TVS Jupiter (UP16 CD 5678)", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" },
  { id: "DB003", name: "Amit Sharma", phone: "+91 97111 22334", vehicle: "Hero Splendor (UP16 EF 9012)", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80" },
  { id: "DB004", name: "Priya Sharma", phone: "+91 99887 76655", vehicle: "Ather 450X (UP16 GH 3456)", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80" }
];

const placeOrder = async (req, res) => {
  const frontend_url = req.headers.origin || "https://food-delivery-eight-dun.vercel.app";

  try {
    const items = req.body.items || [];
    const paymentMethod = req.body.paymentMethod || "stripe";

    // Restaurant default coordinates (Connaught Place, New Delhi)
    const restaurantLocation = { lat: 28.6315, lng: 77.2167 };
    const userLocation = { 
      lat: 28.6315 + (Math.random() * 0.03 - 0.015), 
      lng: 77.2167 + (Math.random() * 0.03 - 0.015) 
    };

    // Save order in DB
    const newOrder = new orderModel({
      userId: req.userId || "usr_guest",
      items: items,
      amount: req.body.amount || 250,
      address: req.body.address || {},
      status: "Food Processing",
      payment: false,
      paymentMethod: paymentMethod,
      restaurantLocation,
      userLocation,
      deliveryBoyLocation: restaurantLocation
    });
    await newOrder.save();

    // Clear user cart if userId exists
    if (req.userId) {
      try {
        await userModel.findByIdAndUpdate(req.userId, { cartData: {} });
      } catch (e) {}
    }

    // Cash on Delivery
    if (paymentMethod === "cod") {
      return res.json({ 
        success: true, 
        session_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}` 
      });
    }

    // Stripe Online Payment - EXCLUSIVELY OFFICIAL STRIPE CHECKOUT SESSIONS
    const activeStripeKey = process.env.STRIPE_SECRET_KEY;
    if (!activeStripeKey || activeStripeKey.trim().length < 10) {
      return res.json({
        success: false,
        message: "STRIPE_SECRET_KEY environment variable is missing on Vercel backend."
      });
    }

    try {
      const stripeInstance = new Stripe(activeStripeKey.trim());
      const line_items = items.map((item) => ({
        price_data: {
          currency: "inr",
          product_data: { name: item.name },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      }));

      line_items.push({
        price_data: {
          currency: "inr",
          product_data: { name: "Delivery Charges" },
          unit_amount: 4000,
        },
        quantity: 1,
      });

      const session = await stripeInstance.checkout.sessions.create({
        line_items,
        mode: "payment",
        success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
        cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
      });

      return res.json({ success: true, session_url: session.url });
    } catch (stripeErr) {
      console.error("Stripe session creation error:", stripeErr.message);
      return res.json({ success: false, message: "Stripe error: " + stripeErr.message });
    }
  } catch (error) {
    console.error("Order placement error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Order error: " + error.message
    });
  }
};

const verifyOrder = async (req, res) => {
  const { orderId, success } = req.body;
  try {
    if (success === "true" || success === true) {
      await orderModel.findByIdAndUpdate(orderId, { payment: true });
      res.json({ success: true, message: "Payment confirmed successfully!" });
    } else {
      await orderModel.findByIdAndDelete(orderId);
      res.json({ success: false, message: "Payment cancelled" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error verifying order" });
  }
};

const userOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({ userId: req.userId }).sort({ date: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error fetching user orders" });
  }
};

const listOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({}).sort({ date: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error fetching admin orders" });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    const order = await orderModel.findById(orderId);
    if (!order) return res.json({ success: false, message: "Order not found" });

    // Locked states: Delivered and Cancelled order statuses cannot be modified
    if (order.status === "Delivered" && status !== "Delivered") {
      return res.json({ success: false, message: "Delivered orders cannot be modified" });
    }
    if (order.status === "Cancelled" && status !== "Cancelled") {
      return res.json({ success: false, message: "Cancelled orders cannot be modified" });
    }

    order.status = status;
    await order.save();
    res.json({ success: true, message: "Status Updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error updating status" });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await orderModel.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const assignDeliveryBoy = async (req, res) => {
  try {
    const { orderId, deliveryBoyId } = req.body;
    const order = await orderModel.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    if (order.status === "Delivered" || order.status === "Cancelled") {
      return res.json({ success: false, message: "Cannot re-assign rider for completed or cancelled order" });
    }

    const boy = DELIVERY_BOYS.find(b => b.id === deliveryBoyId) || DELIVERY_BOYS[0];
    order.deliveryBoyId = boy.id;
    order.deliveryBoyName = boy.name;
    order.deliveryBoyPhone = boy.phone;
    order.deliveryBoyVehicle = boy.vehicle;
    order.deliveryBoyAvatar = boy.avatar;
    await order.save();
    res.json({ success: true, message: "Delivery boy assigned", order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateDeliveryLocation = async (req, res) => {
  try {
    const { orderId, lat, lng } = req.body;
    const order = await orderModel.findByIdAndUpdate(orderId, {
      deliveryBoyLocation: { lat, lng }
    }, { new: true });
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getDeliveryBoys = async (req, res) => {
  res.json({ success: true, data: DELIVERY_BOYS });
};

const getOrderTracking = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (!order.deliveryBoyId) {
      const assignedBoy = DELIVERY_BOYS[Math.floor(Math.random() * DELIVERY_BOYS.length)];
      order.deliveryBoyId = assignedBoy.id;
      order.deliveryBoyName = assignedBoy.name;
      order.deliveryBoyPhone = assignedBoy.phone;
      order.deliveryBoyVehicle = assignedBoy.vehicle;
      order.deliveryBoyAvatar = assignedBoy.avatar;
      await order.save();
    }

    res.json({
      success: true,
      order: {
        id: order._id,
        status: order.status,
        amount: order.amount,
        items: order.items,
        address: order.address,
        restaurantLocation: order.restaurantLocation || { lat: 28.6315, lng: 77.2167 },
        userLocation: order.userLocation || { lat: 28.6450, lng: 77.2250 },
        deliveryBoyLocation: order.deliveryBoyLocation || order.restaurantLocation || { lat: 28.6315, lng: 77.2167 },
        deliveryBoy: {
          id: order.deliveryBoyId,
          name: order.deliveryBoyName,
          phone: order.deliveryBoyPhone,
          vehicle: order.deliveryBoyVehicle,
          avatar: order.deliveryBoyAvatar
        }
      }
    });
  } catch (error) {
    console.error("Order tracking error:", error.message);
    res.status(500).json({ success: false, message: "Error fetching tracking data" });
  }
};

// Cancel order (User or Admin)
const cancelOrder = async (req, res) => {
  try {
    const { orderId, reason } = req.body;
    if (!orderId) {
      return res.json({ success: false, message: "Order ID is required" });
    }

    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.json({ success: false, message: "Order not found" });
    }

    if (order.status === "Delivered") {
      return res.json({ success: false, message: "Delivered orders cannot be cancelled" });
    }

    if (order.status === "Cancelled") {
      return res.json({ success: false, message: "Order is already cancelled" });
    }

    order.status = "Cancelled";
    if (reason) order.cancelReason = reason;
    await order.save();

    res.json({ success: true, message: "Order cancelled successfully", order });
  } catch (error) {
    console.error("Cancel order error:", error.message);
    res.status(500).json({ success: false, message: "Error cancelling order" });
  }
};

export { 
  placeOrder, 
  verifyOrder, 
  userOrders, 
  listOrders, 
  updateStatus, 
  getOrderById, 
  assignDeliveryBoy, 
  updateDeliveryLocation, 
  getDeliveryBoys, 
  getOrderTracking,
  cancelOrder
};
