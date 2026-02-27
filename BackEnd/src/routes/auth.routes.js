// src/routes/auth.routes.js

import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser
} from '../controllers/auth.controller.js';

const router = express.Router();

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Logout
router.post("/logout", logoutUser);

// Check logged in user
router.get("/me", getCurrentUser);

export default router;