import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function main(){
  const message='hi';
  const prompt = `
You are an advanced pharmacy assistant.

RULES:
- For medicine uses, dosage, side effects, symptoms → answer directly.
- For price or stock → MUST call getPrice tool.
- For ordering → MUST call orderMedicine tool.
- Never guess price or stock.
- If prescription required → do not place order.

User: ${message}
`;

  const result = await genAI.models.generateContent({
    model: "models/gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }]
      }
    ],
    tools: [
      {
        functionDeclarations: [
          { name: "getPrice", description: "Get price and stock of a medicine", parameters: { type: "OBJECT", properties: { name: { type: "STRING" } }, required: ["name"] } },
          { name: "orderMedicine", description: "Order a medicine", parameters: { type: "OBJECT", properties: { name: { type: "STRING" }, quantity: { type: "NUMBER" } }, required: ["name", "quantity"] } }
        ]
      }
    ]
  });

  console.log(JSON.stringify(result, null, 2));
}

main();