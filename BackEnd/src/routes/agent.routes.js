// src/routes/agent.routes.js
import express from "express";
import { chatWithAgent, confirmOrder } from "../controllers/agent.controller.js";
import authenticate from "../middleware/authenticate.js";

const router = express.Router();

router.post("/chat", chatWithAgent);
router.post("/confirm-order", authenticate, confirmOrder);

export default router;
