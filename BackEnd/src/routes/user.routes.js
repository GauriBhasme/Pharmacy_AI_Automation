// src/routes/user.routes.js

import express from "express";
import authenticate from "../middleware/authenticate.js";
import {
  getProfile,
  updateProfile,
  getDashboard,
  getOrderHistory,
  getRefillPredictions
} from "../controllers/user.controller.js";

const router = express.Router();

// router.use(authenticate);

// Profile
router.get("/profile", getProfile);
router.patch("/profile", updateProfile);

// Dashboard
router.get("/dashboard", getDashboard);

// Order history
router.get("/history", getOrderHistory);

// AI refill suggestions
router.get("/refill-predictions", getRefillPredictions);

export default router;