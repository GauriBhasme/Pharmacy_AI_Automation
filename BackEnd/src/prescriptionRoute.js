import express from "express";
import multer from "multer";
import fs from "fs";
import OpenAI from "openai";

const router = express.Router();

// ✅ Secure multer config with file size limit
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/prescription", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    const imagePath = req.file.path;

    // Convert image to Base64
    const base64Image = fs.readFileSync(imagePath, {
      encoding: "base64",
    });

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `
Extract medicines from this prescription image.

Return ONLY valid JSON array in this format:
[
  {
    "name": "",
    "type": "",
    "dosage": "",
    "frequency": ""
  }
]

Do not include explanations or markdown.
`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
    });

    // ✅ Extract text from AI
    let extractedText = response.choices[0].message.content;

    // ✅ Remove markdown formatting if present
    extractedText = extractedText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    let parsed;

    try {
      parsed = JSON.parse(extractedText);
    } catch (err) {
      console.error("JSON Parse Failed:", extractedText);
      return res.status(400).json({
        error: "Invalid JSON format returned by AI",
      });
    }

    // ✅ Delete uploaded file after processing
    fs.unlinkSync(imagePath);

    return res.json({ result: parsed });

  } catch (error) {
    console.error("Prescription processing error:", error);
    return res.status(500).json({
      error: "Prescription processing failed",
    });
  }
});

export default router;