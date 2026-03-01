import OpenAI from "openai";
import { db } from "../db.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

/* ==============================
   GROQ SETUP
============================== */

// instantiate OpenAI/GROQ client; allow either GROQ_API_KEY or OPENAI_API_KEY
const apiKey = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.warn("⚠️  no OpenAI/GROQ API key configured (GROQ_API_KEY or OPENAI_API_KEY)");
}
const openai = new OpenAI({
  apiKey,
  baseURL: "https://api.groq.com/openai/v1",
});


/* ==============================
   TOOLS (OpenAI Format)
============================== */

const tools = [
  {
    type: "function",
    function: {
      name: "getPrice",
      description: "Get price and stock of a medicine",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string" }
        },
        required: ["name"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "orderMedicine",
      description: "Order a medicine",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string" },
          quantity: { type: "number" }
        },
        required: ["name", "quantity"]
      }
    }
  }
];

/* ==============================
   CHAT CONTROLLER
============================== */

export const chatWithAgent = asyncHandler(async (req, res) => {

  console.log('[agent] chatWithAgent called');
  console.log('[agent] apiKey present:', !!apiKey);
  console.log('[agent] request body:', req.body);

  const { message } = req.body;
  const userId = req.user?.user_id || null;

  if (!message) {
    return res.status(400).json({ success: false, error: "Message required" });
  }

  // If no API key is configured, return a safe local fallback so frontend
  // can be tested without the external model provider.
  if (!apiKey) {
    // Basic intent parser to follow the controller's tool rules locally.
    const lower = message.toLowerCase();

    const extractName = (text) => {
      // try common patterns: "price of paracetamol", "of paracetamol", or just word sequences
      let m = text.match(/price of ([a-z0-9\s\-]+)/i) || text.match(/of ([a-z0-9\s\-]+)/i) || text.match(/for ([a-z0-9\s\-]+)/i);
      if (m) return m[1].trim();
      // fallback: last two words
      const parts = text.split(/\s+/).slice(-2);
      return parts.join(' ').trim();
    };

    // ORDER intent
    if (/\border\b|\bbuy\b|\bplace order\b|\bplease order\b/.test(lower)) {
      try {
        // find quantity
        const qMatch = message.match(/(\d+)\s*(?:x|pcs|pieces|tablets|tablet)?/i);
        const quantity = qMatch ? parseInt(qMatch[1], 10) : 1;
        const name = extractName(message);
        console.log('[agent] ORDER: medicine name:', name, 'qty:', quantity);

        const med = await db.query(
          "SELECT * FROM medicines WHERE LOWER(name)=LOWER($1)",
          [name]
        );
        console.log('[agent] ORDER: found', med.rows.length, 'medicines');

        if (!med.rows.length) {
          const reply = "❌ Medicine not found";
          console.log('[agent] ORDER reply:', reply);
          return res.json({ success: true, reply });
        }

        const medicine = med.rows[0];
        if (medicine.stock < quantity) {
          const reply = "❌ Not enough stock available";
          console.log('[agent] ORDER reply:', reply);
          return res.json({ success: true, reply });
        }

        await db.query(
          "UPDATE medicines SET stock = stock - $1 WHERE id = $2",
          [quantity, medicine.id]
        );

        const reply = `✅ Order successful!\n${quantity} ${medicine.name} placed`;
        console.log('[agent] ORDER reply:', reply);
        return res.json({ success: true, reply });
      } catch (err) {
        console.error('[agent] ORDER error:', err.message);
        return res.status(500).json({ success: false, error: `Order error: ${err.message}` });
      }
    }

    // PRICE / STOCK intent
    if (/price|cost|how much|stock/.test(lower)) {
      try {
        const name = extractName(message);
        console.log('[agent] PRICE: medicine name:', name);

        const med = await db.query(
          "SELECT name, price, stock FROM medicines WHERE LOWER(name)=LOWER($1)",
          [name]
        );
        console.log('[agent] PRICE: found', med.rows.length, 'medicines');

        if (!med.rows.length) {
          const reply = "❌ Medicine not found";
          console.log('[agent] PRICE reply:', reply);
          return res.json({ success: true, reply });
        }
        const m = med.rows[0];
        const reply = `💊 ${m.name}\nPrice: ₹${m.price}\nStock: ${m.stock}`;
        console.log('[agent] PRICE reply:', reply);
        return res.json({ success: true, reply });
      } catch (err) {
        console.error('[agent] PRICE error:', err.message);
        return res.status(500).json({ success: false, error: `Price lookup error: ${err.message}` });
      }
    }

    // fallback local reply
    const reply = `Sorry — I couldn't determine intent. Ask about price or ordering, e.g. "price of paracetamol" or "order 2 paracetamol".`;
    console.log('[agent] FALLBACK: no intent matched');
    return res.json({ success: true, reply });
  }

  let completion;

  try {
    completion = await openai.chat.completions.create({
   model: "llama-3.1-8b-instant",  // SAFE model
      messages: [
        {
          role: "system",
          content: `
You are a pharmacy assistant.

If user asks price → call getPrice.
If user wants to order → call orderMedicine.
For uses → answer normally.
Never guess stock or price.
`
        },
        { role: "user", content: message }
      ],
      tools,
      tool_choice: "auto"
    });
  } catch (error) {
    // log full error for debugging
    console.error("GROQ ERROR:", error.response?.data || error.message);
    const message = error.response?.data?.error || error.message || "Groq request failed";
    return res.status(500).json({
      success: false,
      error: message,
      details: error.response?.data || null,
    });
  }

  /* ==============================
     CHECK TOOL CALL
  ============================== */

  const messageData = completion.choices[0].message;

if (!messageData) {
  return res.status(500).json({
    success: false,
    error: "No message returned from model"
  });
}

const toolCall = messageData.tool_calls && messageData.tool_calls.length > 0
  ? messageData.tool_calls[0]
  : null;
  if (toolCall) {
    const functionName = toolCall.function.name;
    let args = {};
try {
  args = toolCall ? JSON.parse(toolCall.function.arguments) : {};
} catch (err) {
  console.error("Argument parse error:", err);
}
    /* ---- GET PRICE ---- */

    if (functionName === "getPrice") {

      const med = await db.query(
        "SELECT name, price, stock FROM medicines WHERE LOWER(name)=LOWER($1)",
        [args.name]
      );

      if (!med.rows.length)
        return res.json({ success: true, reply: "❌ Medicine not found" });

      const m = med.rows[0];

      return res.json({
        success: true,
        reply: `💊 ${m.name}\nPrice: ₹${m.price}\nStock: ${m.stock}`
      });
    }

    /* ---- ORDER MEDICINE ---- */

    if (functionName === "orderMedicine") {

      const { name, quantity } = args;

      const med = await db.query(
        "SELECT * FROM medicines WHERE LOWER(name)=LOWER($1)",
        [name]
      );

      if (!med.rows.length)
        return res.json({ success: true, reply: "❌ Medicine not found" });

      const medicine = med.rows[0];

      if (medicine.stock < quantity) {
        return res.json({
          success: true,
          reply: "❌ Not enough stock available"
        });
      }

      await db.query(
        "UPDATE medicines SET stock = stock - $1 WHERE id = $2",
        [quantity, medicine.id]
      );

      return res.json({
        success: true,
        reply: `✅ Order successful!\n${quantity} ${medicine.name} placed`
      });
    }
  }

  /* ==============================
     NORMAL RESPONSE
  ============================== */

  return res.json({
    success: true,
    reply: completion.choices[0].message.content
  });

});