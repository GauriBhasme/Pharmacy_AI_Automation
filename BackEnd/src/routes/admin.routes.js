// src/routes/admin.routes.js

import express from "express";
import authenticate from "../middleware/authenticate.js";
import authorizeAdmin from "../middleware/authorizeAdmin.js";

import {
  getAdminDashboard,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAllOrders,
  updateOrderStatus,
  getAllMedicinesAdmin,
  createMedicine,
  updateMedicine,
  deleteMedicine,
  getAgentLogs
} from "../controllers/admin.controller.js";

const router = express.Router();

router.use(authenticate);
router.use(authorizeAdmin);

// Dashboard
router.get("/dashboard", getAdminDashboard);

// Users
router.get("/users", getAllUsers);
router.patch("/users/:id/role", updateUserRole);
router.delete("/users/:id", deleteUser);

// Orders
router.get("/orders", getAllOrders);
router.patch("/orders/:itemId/status", updateOrderStatus);

// Medicines
router.get("/medicines", getAllMedicinesAdmin);
router.post("/medicines", createMedicine);
router.patch("/medicines/:id", updateMedicine);
router.delete("/medicines/:id", deleteMedicine);

// Agent Logs
router.get("/agent-logs", getAgentLogs);

//
export default router;