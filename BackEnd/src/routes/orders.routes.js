import express from "express";
import authenticate from "../middleware/authenticate.js";
import {
  createOrder,
  getOrderById,
  cancelOrder,
} from "../controllers/order.controller.js";

const ordersRouter = express.Router();

// ✅ Get all orders
ordersRouter.get("/orders", authenticate, (req, res) => {
  res.send("Orders fetched successfully");
});

// ✅ Place Order (DB + Email)
ordersRouter.post("/orders", authenticate, createOrder);

// ✅ Get order by ID
ordersRouter.get("/orders/:orderId", authenticate, getOrderById);

// ✅ Cancel order
ordersRouter.put("/orders/:orderId/cancel", authenticate, cancelOrder);

export default ordersRouter;