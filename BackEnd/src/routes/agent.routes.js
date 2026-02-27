// src/routes/agent.routes.js

import express from "express";
import authenticate from "../middleware/authenticate.js";
import {
  chatWithAgent,
  validateOrderWithAgent,
  getAgentTraceLogs,
  getSingleTrace
} from "../controllers/agent.controller.js";

const router = express.Router();

router.use(authenticate);

// Natural language chat
router.post("/chat", chatWithAgent);

// Validate order through AI
router.post("/validate-order", validateOrderWithAgent);

// Logs
router.get("/logs", getAgentTraceLogs);
router.get("/logs/:traceId", getSingleTrace);

export default router;