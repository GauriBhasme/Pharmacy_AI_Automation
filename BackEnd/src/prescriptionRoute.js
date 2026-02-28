import express from "express";
import multer from "multer";
import fs from "fs";
import OpenAI from "openai";

const router = express.Router();

const upload = multer({ dest: "uploads/" });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/prescription", upload.single("image"), async (req, res) => {
  try {
    const imagePath = req.file.path;

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
Return clean JSON array:
[
  {
    name: "",
    type: "",
    dosage: "",
    frequency: ""
  }
]
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

    fs.unlinkSync(imagePath); // delete uploaded image after processing

    res.json({
      result: response.choices[0].message.content
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Prescription processing failed" });
  }
});

export default router;