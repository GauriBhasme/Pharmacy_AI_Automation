import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "../db.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

/* ======================================================
   1️⃣ CHAT WITH AGENT
====================================================== */

export const chatWithAgent = asyncHandler(async (req, res) => {
  const { message } = req.body;

  if (!message) {
    const error = new Error("Message is required");
    error.statusCode = 400;
    throw error;
  }

  const prompt = `
You are a pharmacy AI assistant.
Provide safe and helpful responses.
User: ${message}
`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const aiReply = response.text();

  // Save log
  await db.query(
    "INSERT INTO logs (user_id, step, decision) VALUES (?, ?, ?)",
    [req.user.id, "CHAT_RESPONSE", aiReply]
  );

  res.json({
    reply: aiReply,
  });
});

/* ======================================================
   2️⃣ VALIDATE ORDER WITH AGENT
====================================================== */

export const validateOrderWithAgent = asyncHandler(async (req, res) => {
  const { orderItems } = req.body;

  if (!orderItems || !Array.isArray(orderItems)) {
    const error = new Error("orderItems must be an array");
    error.statusCode = 400;
    throw error;
  }

  const prompt = `
You are a pharmacy AI safety validator.

Validate the following order for:
- Drug interactions
- Incorrect dosage
- Safety risks

Order:
${JSON.stringify(orderItems)}

Return STRICT JSON:

{
  "isValid": true/false,
  "warnings": [],
  "recommendations": []
}
`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const aiText = response.text();

  let parsed;

  try {
    parsed = JSON.parse(aiText);
  } catch {
    parsed = {
      isValid: false,
      warnings: ["AI response parsing failed"],
      recommendations: []
    };
  }

  await db.query(
    "INSERT INTO logs (user_id, step, decision) VALUES (?, ?, ?)",
    [
      req.user.id,
      "ORDER_VALIDATION",
      JSON.stringify(parsed)
    ]
  );

  res.json({
    validation: parsed
  });
});

/* ======================================================
   3️⃣ GET ALL AGENT LOGS FOR USER
====================================================== */

export const getAgentTraceLogs = asyncHandler(async (req, res) => {
  const [logs] = await db.query(
    "SELECT id, step, created_at FROM logs WHERE user_id = ? ORDER BY created_at DESC",
    [req.user.id]
  );

  res.json(logs);
});

/* ======================================================
   4️⃣ GET SINGLE TRACE
====================================================== */

export const getSingleTrace = asyncHandler(async (req, res) => {
  const { traceId } = req.params;

  const [result] = await db.query(
    "SELECT * FROM logs WHERE id = ? AND user_id = ?",
    [traceId, req.user.id]
  );

  if (result.length === 0) {
    const error = new Error("Log not found");
    error.statusCode = 404;
    throw error;
  }

  res.json(result[0]);
});