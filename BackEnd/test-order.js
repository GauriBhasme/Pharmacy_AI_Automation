import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function test(msg) {
  const prompt = `
You are a professional pharmacy AI assistant.

RULES:
- Uses, dosage, side effects → Answer normally.
- For price or stock → MUST call getPrice.
- For ordering → MUST call orderMedicine.
- Never guess price or stock.
- Prescription medicines must not be directly ordered.

User: ${msg}
  `;

  const result = await genAI.models.generateContent({
    model: "models/gemini-2.5-flash",
    contents: [
      { role: 'user', parts: [{ text: prompt }] }
    ],
    tools: [
      {
        name: 'getPrice',
        description: 'Get price and stock of a medicine',
        parameters: {
          type: 'OBJECT',
          properties: { name: { type: 'STRING' } },
          required: ['name']
        }
      },
      {
        name: 'orderMedicine',
        description: 'Order a medicine',
        parameters: {
          type: 'OBJECT',
          properties: {
            medicineName: { type: 'STRING' },
            quantity: { type: 'STRING' }
          },
          required: ['medicineName', 'quantity']
        }
      }
    ]
  });

  // display full object to catch any hidden fields the stringify may omit
  console.dir(result, { depth: null });
}

await test('please order 2 paracetamol');