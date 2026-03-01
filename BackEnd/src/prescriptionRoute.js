import "dotenv/config";
import express from "express";
import multer from "multer";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import { db } from "./db.js";

const router = express.Router();

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype?.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
});

const normalizeApiKey = (value) =>
  String(value || "")
    .trim()
    .replace(/^["']|["']$/g, "");

const getGeminiApiKey = () =>
  normalizeApiKey(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);

router.post("/prescription", upload.single("image"), async (req, res) => {
  let imagePath = null;
  try {
    const geminiApiKey = getGeminiApiKey();
    if (!geminiApiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is missing in backend environment",
        details: "Set GEMINI_API_KEY (or GOOGLE_API_KEY) in BackEnd/.env and restart backend.",
      });
    }

    const gemini = new GoogleGenAI({ apiKey: geminiApiKey });

    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    imagePath = req.file.path;
    const mimeType = req.file.mimetype || "image/jpeg";

    const base64Image = fs.readFileSync(imagePath, { encoding: "base64" });

    const response = await gemini.models.generateContent({
      model: "models/gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Extract medicines from this prescription image.

Return ONLY valid JSON array in this format:
[
  {
    "name": "",
    "type": "",
    "dosage": "",
    "frequency": "",
    "quantity": 1
  }
]

Do not include explanations or markdown.`,
            },
            {
              inlineData: {
                mimeType,
                data: base64Image,
              },
            },
          ],
        },
      ],
      config: {
        temperature: 0,
      },
    });

    const extractedText = String(response?.text || "")
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    if (!extractedText) {
      return res.status(502).json({
        error: "Gemini returned empty OCR result",
      });
    }

    let parsed;
    try {
      parsed = JSON.parse(extractedText);
    } catch (err) {
      console.error("JSON Parse Failed:", extractedText);
      return res.status(400).json({
        error: "Invalid JSON format returned by AI",
        details: extractedText.slice(0, 500),
      });
    }

    const normalized = Array.isArray(parsed)
      ? parsed
          .map((item) => ({
            name: String(item?.name || "").trim(),
            type: String(item?.type || "").trim(),
            dosage: String(item?.dosage || "").trim(),
            frequency: String(item?.frequency || "").trim(),
            quantity: Number(item?.quantity || 1) > 0 ? Number(item?.quantity || 1) : 1,
          }))
          .filter((item) => item.name)
      : [];

    return res.json({ result: normalized });
  } catch (error) {
    console.error("Prescription processing error:", error);
    const rawMessage = error?.message || "Unknown OCR error";
    const invalidKey =
      rawMessage.includes("API key not valid") ||
      rawMessage.includes("API_KEY_INVALID");

    if (invalidKey) {
      return res.status(401).json({
        error: "Invalid Gemini API key",
        details:
          "Your Gemini key is invalid. Generate a new key in Google AI Studio, set GEMINI_API_KEY in BackEnd/.env, then restart backend.",
      });
    }

    return res.status(500).json({
      error: "Prescription processing failed",
      details: rawMessage,
    });
  } finally {
    if (imagePath && fs.existsSync(imagePath)) {
      try {
        fs.unlinkSync(imagePath);
      } catch (cleanupErr) {
        console.error("Failed to cleanup uploaded file:", cleanupErr.message);
      }
    }
  }
});

router.post("/prescription/confirm", async (req, res) => {
  try {
    const { medicines } = req.body || {};
    if (!Array.isArray(medicines) || medicines.length === 0) {
      return res.status(400).json({ error: "No medicines provided" });
    }

    const available = [];
    const unavailable = [];

    for (const med of medicines) {
      const medicineName = String(med?.name || "").trim();
      const quantity = Number(med?.quantity || 1) > 0 ? Number(med?.quantity || 1) : 1;
      if (!medicineName) continue;

      let matchResult = await db.query(
        "SELECT id, name, price, stock, dosage FROM medicines WHERE LOWER(name) = LOWER($1) LIMIT 1",
        [medicineName]
      );

      if (matchResult.rows.length === 0) {
        matchResult = await db.query(
          "SELECT id, name, price, stock, dosage FROM medicines WHERE LOWER(name) LIKE LOWER($1) ORDER BY stock DESC LIMIT 1",
          [`%${medicineName}%`]
        );
      }

      if (matchResult.rows.length === 0) {
        unavailable.push({
          name: medicineName,
          reason: "Medicine not found in inventory",
        });
        continue;
      }

      const matched = matchResult.rows[0];
      if (Number(matched.stock) < quantity) {
        unavailable.push({
          name: matched.name,
          reason: `Insufficient stock (${matched.stock} available)`,
        });
        continue;
      }

      available.push({
        medicine_id: matched.id,
        medicine_name: matched.name,
        quantity,
        price_per_unit: Number(matched.price),
        total_price: Number(matched.price) * quantity,
        stock_available: Number(matched.stock),
        dosage: matched.dosage || null,
      });
    }

    res.json({
      success: true,
      available,
      unavailable,
      recommendedOrder: available[0] || null,
    });
  } catch (error) {
    console.error("Prescription confirm error:", error.message);
    res.status(500).json({ error: "Failed to confirm extracted prescription" });
  }
});

router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "Image size exceeds 5MB limit" });
    }
    return res.status(400).json({ error: err.message });
  }

  if (err) {
    return res.status(400).json({ error: err.message || "Invalid upload request" });
  }

  next();
});

export default router;
