import { GoogleGenAI } from "@google/genai";
import { db } from "../db.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

/* ======================================================
   GEMINI SETUP
====================================================== */

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

/* ======================================================
   1️⃣ CHAT WITH GEMINI BOT
====================================================== */

export const chatWithAgent = asyncHandler(async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({
      success: false,
      error: "Message is required",
    });
  }

  const prompt = `
You are an AI Pharmacist Assistant.
Give safe, medically aware and helpful responses.
If unsure, advise consulting a doctor.

User Question:
${message}
`;

  const result = await genAI.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  const aiReply = result.text;

  const userId = req.user?.user_id || null;

  await db.query(
    "INSERT INTO logs (user_id, step, decision) VALUES ($1, $2, $3)",
    [userId, "CHAT_RESPONSE", aiReply]
  );

  res.json({
    success: true,
    reply: aiReply,
  });
});

/* ======================================================
   2️⃣ VALIDATE ORDER WITH GEMINI
====================================================== */

export const validateOrderWithAgent = asyncHandler(async (req, res) => {
  const { orderItems } = req.body;

  if (!orderItems || !Array.isArray(orderItems)) {
    return res.status(400).json({
      success: false,
      error: "orderItems must be an array",
    });
  }

  const prompt = `
You are a pharmacy AI safety validator.

Check for:
- Drug interactions
- Wrong dosage
- Safety risks

Order:
${JSON.stringify(orderItems)}

Return ONLY valid JSON in this format:

{
  "isValid": true/false,
  "warnings": [],
  "recommendations": []
}
`;

  const result = await genAI.models.generateContent({
    model: "gemini-1.5-flash",
    contents: prompt,
  });

  let aiText = result.text;

  // Remove markdown formatting if model adds ```json
  aiText = aiText.replace(/```json|```/g, "").trim();

  let parsed;

  try {
    parsed = JSON.parse(aiText);
  } catch (error) {
    parsed = {
      isValid: false,
      warnings: ["AI response parsing failed"],
      recommendations: [],
    };
  }

  const userId = req.user?.user_id || null;

  await db.query(
    "INSERT INTO logs (user_id, step, decision) VALUES ($1, $2, $3)",
    [userId, "ORDER_VALIDATION", JSON.stringify(parsed)]
  );

  res.json({
    success: true,
    validation: parsed,
  });
});

/* ======================================================
   3️⃣ GET ALL USER LOGS
====================================================== */

export const getAgentTraceLogs = asyncHandler(async (req, res) => {
  const userId = req.user?.user_id;

  const { rows } = await db.query(
    "SELECT id, step, created_at FROM logs WHERE user_id = $1 ORDER BY created_at DESC",
    [userId]
  );

  res.json(rows);
});

/* ======================================================
   4️⃣ GET SINGLE TRACE
====================================================== */

export const getSingleTrace = asyncHandler(async (req, res) => {
  const { traceId } = req.params;
  const userId = req.user?.user_id;

  const { rows } = await db.query(
    "SELECT * FROM logs WHERE id = $1 AND user_id = $2",
    [traceId, userId]
  );

  if (rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: "Log not found",
    });
  }

  res.json(rows[0]);
});
