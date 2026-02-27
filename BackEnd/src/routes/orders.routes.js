// src/routes/orders.routes.js

import express from "express";
import { authenticate } from "../middleware/authenticate.js";
import {
  createOrder,
  getOrderById,
  cancelOrder
} from "../controllers/order.controller.js";

const router = express.Router();

router.use(authenticate);

// Place order
router.post("/", createOrder);

// Get specific order
router.get("/:orderId", getOrderById);

// Cancel order
router.delete("/:orderId", cancelOrder);

export default router;