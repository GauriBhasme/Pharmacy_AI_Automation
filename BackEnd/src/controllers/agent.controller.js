import { db } from "../db.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { langfuse } from "../utils/langfuse.js";
import { randomUUID } from "crypto";
import transporter from "../mailer.js";

/* ==============================
   MEDICAL PHARMACY CHATBOT
   Pure Local Implementation - No External API Dependency
============================== */

// MEDICAL KEYWORDS (40+)
const MEDICAL_KEYWORDS = [
  'medicine', 'drug', 'pharmacy', 'prescription', 'doctor',
  'dosage', 'dose', 'pill', 'tablet', 'capsule', 'syrup',
  'cream', 'ointment', 'injection', 'vaccine', 'treatment',
  'side effect', 'adverse', 'allergy', 'allergic', 'contraindication',
  'symptom', 'pain', 'fever', 'cold', 'cough', 'headache',
  'disease', 'illness', 'health', 'medical', 'clinical',
  'price', 'cost', 'stock', 'available', 'order', 'purchase',
  'medication', 'cure', 'relief', 'condition', 'preventive',
  // Specific medicine names
  'paracetamol', 'aspirin', 'ibuprofen', 'cetirizine', 'amoxicillin',
  'antacid', 'vitamin', 'metformin', 'losartan'
];

// Check if message is medical-related
const isMedicalQuery = (message) => {
  const lower = message.toLowerCase();
  // Must contain at least one medical keyword
  return MEDICAL_KEYWORDS.some(keyword => lower.includes(keyword));
};

// Extract medicine name from message
const extractMedicineName = (message) => {
  const lower = message.toLowerCase();
  
  // List of all known medicines (for exact matching)
  const knownMedicines = [
    'paracetamol', 'aspirin', 'ibuprofen', 'cough syrup', 'cetirizine',
    'amoxicillin', 'antacid gel', 'vitamin d3', 'metformin', 'losartan'
  ];
  
  // Check if message contains any known medicine name
  for (const medicine of knownMedicines) {
    if (lower.includes(medicine)) {
      return medicine;
    }
  }
  
  // Try pattern: "order X paracetamol" → extract "paracetamol"
  let match = lower.match(/order\s+(\d+)?\s*(?:units?|x|of)?\s*([a-z0-9\s\-]+?)(?:\s+(?:medicine|drug|pills?|tablets?|capsule))?(?:\?|$)/i);
  if (match) {
    let name = (match[2] || '').trim();
    // Remove trailing "medicine", "drug", etc.
    name = name.replace(/\s+(medicine|drug|pills?|tablets?|capsule)$/i, '').trim();
    if (name) return name;
  }
  
  // Try pattern: "price/dosage/effect of X" → extract "X"
  match = lower.match(/(?:price|dosage|dose|effect|side effect|side effects) of\s+([a-z0-9\s\-]+?)(?:\?|$|for|with)/i);
  if (match) return match[1].trim().replace(/\s+(medicine|drug|pills?|tablets?|capsule)$/i, '').trim();
  
  // Try pattern: "medicine X" or "drug X"
  match = lower.match(/(?:medicine|drug|order)\s+([a-z0-9\s\-]+?)(?:\?|$)/i);
  if (match) return match[1].trim().replace(/\s+(medicine|drug|pills?|tablets?|capsule)$/i, '').trim();
  
  // Try pattern: "I have X, what medicine" → extract "X"
  match = lower.match(/(?:have|took|took|suffering|affected|experiencing)\s+([a-z]+)(?:\s+or\s+)?([a-z]*)?(?:,|\s)/i);
  if (match) {
    const symptom = (match[1] + ' ' + (match[2] || '')).trim();
    if (symptom) return symptom;
  }
  
  // Fallback: take last meaningful word(s)
  let words = lower.match(/\b[a-z]+\b/gi) || [];
  // Filter out common filler words
  const fillerWords = ['the', 'a', 'an', 'of', 'for', 'and', 'or', 'is', 'to', 'in', 'on', 'at', 'by', 'from', 'with', 'medicine', 'drug', 'pills', 'pill', 'tablet', 'tablets', 'capsule', 'syrup', 'order', 'want', 'like', 'have', 'what', 'which', 'that', 'this', 'do', 'can', 'you'];
  words = words.filter(w => !fillerWords.includes(w));
  
  if (words.length > 0) {
    // Return last 2 words if available
    return words.slice(-2).join(' ');
  }
  
  return '';
};

// Identify intent from message
const identifyIntent = (message) => {
  const lower = message.toLowerCase();
  
  // Check ORDER first (highest priority)
  // Matches: "order X", "buy X", "need N X", "want N X", etc.
  if (/order|buy|purchase/.test(lower) || 
      /(?:need|want|give|send|deliver|get)\s+\d+/.test(lower)) {
    return 'ORDER';
  }
  
  if (/price|cost|how much|rupee|₹|amount/.test(lower)) {
    return 'PRICE';
  }
  if (/dosage|dose|take|consume|mg|mg\/ml|strength/.test(lower)) {
    return 'DOSAGE';
  }
  if (/side effect|adverse|allergy|allergic|contraindication|warning/.test(lower)) {
    return 'SIDE_EFFECTS';
  }
  // SYMPTOM - exclude product names
  if (!/cough\s+syrup|pain\s+relief|antacid|vitamin/i.test(lower) && /fever|cough|pain|cold|headache|symptom|sick|ill|disease|suffering|hurt|ache/i.test(lower)) {
    return 'SYMPTOM';
  }
  
  return null;
};

const truncateText = (value, max = 1000) => {
  if (!value) return "";
  const text = String(value);
  return text.length > max ? `${text.slice(0, max)}...` : text;
};

let isAgentActivityTableReady = false;
const ensureAgentActivityTable = async () => {
  if (isAgentActivityTableReady) return;

  await db.query(`
    CREATE TABLE IF NOT EXISTS agent_activity_logs (
      id SERIAL PRIMARY KEY,
      trace_id VARCHAR(120) NOT NULL,
      user_id INTEGER,
      activity_type VARCHAR(50) NOT NULL,
      intent VARCHAR(50),
      medicine_name VARCHAR(255),
      input_message TEXT,
      response_preview TEXT,
      status VARCHAR(20) NOT NULL,
      http_status INTEGER,
      duration_ms INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  isAgentActivityTableReady = true;
};

const saveAgentActivity = async ({
  traceId,
  userId,
  activityType,
  intent,
  medicineName,
  inputMessage,
  responsePreview,
  status,
  httpStatus,
  durationMs,
}) => {
  try {
    await ensureAgentActivityTable();
    await db.query(
      `INSERT INTO agent_activity_logs
        (trace_id, user_id, activity_type, intent, medicine_name, input_message, response_preview, status, http_status, duration_ms)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        traceId,
        userId,
        activityType,
        intent,
        medicineName,
        truncateText(inputMessage, 1500),
        truncateText(responsePreview, 1500),
        status,
        httpStatus,
        durationMs,
      ]
    );
  } catch (err) {
    console.error("[agent.trace] Failed to save activity log:", err.message);
  }
};

const sendOrderConfirmationEmail = async ({
  toEmail,
  userName,
  orderId,
  medicineName,
  quantity,
  totalPrice,
}) => {
  if (!toEmail) return { sent: false, reason: "missing_recipient" };

  try {
    await transporter.sendMail({
      from: `"Online Pharmacy" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: `Order Confirmation #${orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1d4ed8;">Order Confirmed</h2>
          <p>Hi ${userName || "Customer"},</p>
          <p>Your order has been placed successfully.</p>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px;">
            <p><strong>Order ID:</strong> #${orderId}</p>
            <p><strong>Medicine:</strong> ${medicineName}</p>
            <p><strong>Quantity:</strong> ${quantity}</p>
            <p><strong>Total:</strong> Rs ${totalPrice}</p>
          </div>
          <p style="margin-top: 16px;">Thank you for choosing Pharmacy AI.</p>
        </div>
      `,
    });

    console.log("[email] Order confirmation sent:", { toEmail, orderId });
    return { sent: true };
  } catch (err) {
    console.error("[email] Failed to send order confirmation:", err.message);
    return { sent: false, reason: err.message };
  }
};

// Main chat controller
export const chatWithAgent = asyncHandler(async (req, res) => {
  const startedAt = Date.now();
  const traceId = randomUUID();
  const userId = req.user?.user_id || req.user?.id || null;
  let detectedIntent = null;
  let detectedMedicineName = null;

  const originalJson = res.json.bind(res);
  res.json = (body) => {
    res.locals.responseBody = body;
    return originalJson(body);
  };

  let trace = null;
  let generation = null;
  try {
    trace = langfuse.trace({
      id: traceId,
      name: "agent.chat",
      userId: userId ? String(userId) : undefined,
      input: req.body?.message || "",
    });

    generation = trace.generation({
      name: "agent.local-response",
      model: "pharmacy-rule-engine",
      input: req.body?.message || "",
    });
  } catch (err) {
    console.error("[agent.trace] Unable to initialize Langfuse trace:", err.message);
  }

  try {
    const { message } = req.body;

    console.log('[chatbot] Received message:', message);

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: "Message is required"
      });
    }

    // CHECK: Is this a medical query?
    if (!isMedicalQuery(message)) {
      console.log('[chatbot] Not a medical query');
      return res.json({
        success: true,
        reply: "I can only help with pharmacy and medicine-related questions. Please ask about medicines, dosages, side effects, symptoms, or place an order. For example: 'What is the price of paracetamol?' or 'I have a fever, what medicine do I need?'"
      });
    }

    console.log('[chatbot] Valid medical query');

    // IDENTIFY INTENT
    const intent = identifyIntent(message);
    detectedIntent = intent;
    console.log('[chatbot] Intent:', intent);

    // EXTRACT MEDICINE NAME (if needed)
    const medicineName = extractMedicineName(message);
    detectedMedicineName = medicineName;
    console.log('[chatbot] Extracted medicine name:', medicineName);

  // ======= INTENT: PRICE / STOCK =======
  if (intent === 'PRICE') {
    try {
      if (!medicineName) {
        return res.json({
          success: true,
          reply: "Which medicine do you want the price of? For example: 'price of paracetamol'"
        });
      }

      const result = await db.query(
        'SELECT id, name, price, stock, composition FROM medicines WHERE LOWER(name) = LOWER($1) LIMIT 1',
        [medicineName]
      );

      if (result.rows.length === 0) {
        return res.json({
          success: true,
          reply: `We don't have ${medicineName} in stock. Available medicines: Paracetamol, Aspirin, Ibuprofen, Cough Syrup, Cetirizine, Amoxicillin, Antacid Gel, Vitamin D3, Metformin, Losartan.`
        });
      }

      const med = result.rows[0];
      const reply = `💊 ${med.name}\n💰 Price: ₹${med.price}\n📦 Stock: ${med.stock} units\n📝 Composition: ${med.composition || 'N/A'}`;
      console.log('[chatbot] Returning price:', reply);

      return res.json({
        success: true,
        reply,
        medicine: med.name,
        price: med.price,
        stock: med.stock
      });
    } catch (err) {
      console.error('[chatbot] Price query error:', err.message);
      return res.json({
        success: true,
        reply: "Error retrieving medicine info. Please try again."
      });
    }
  }

  // ======= INTENT: DOSAGE =======
  if (intent === 'DOSAGE') {
    try {
      if (!medicineName) {
        return res.json({
          success: true,
          reply: "Which medicine would you like dosage information for? For example: 'dosage of paracetamol'"
        });
      }

      const result = await db.query(
        'SELECT name, dosage, category FROM medicines WHERE LOWER(name) = LOWER($1) LIMIT 1',
        [medicineName]
      );

      if (result.rows.length === 0) {
        return res.json({
          success: true,
          reply: `We don't have dosage info for ${medicineName}. Try asking about: Paracetamol, Aspirin, Ibuprofen, Cetirizine, Amoxicillin, Metformin, or Losartan.`
        });
      }

      const med = result.rows[0];
      const reply = `💊 ${med.name}\n📋 Dosage: ${med.dosage}\n🏥 Category: ${med.category || 'Medicine'}`;
      console.log('[chatbot] Returning dosage:', reply);

      return res.json({
        success: true,
        reply,
        medicine: med.name,
        dosage: med.dosage
      });
    } catch (err) {
      console.error('[chatbot] Dosage query error:', err.message);
      return res.json({
        success: true,
        reply: "Error retrieving dosage info. Please try again."
      });
    }
  }

  // ======= INTENT: SIDE EFFECTS / SAFETY =======
  if (intent === 'SIDE_EFFECTS') {
    try {
      if (!medicineName) {
        return res.json({
          success: true,
          reply: "Which medicine would you like safety information for? For example: 'side effects of paracetamol'"
        });
      }

      const result = await db.query(
        'SELECT name, side_effects, contraindications FROM medicines WHERE LOWER(name) = LOWER($1) LIMIT 1',
        [medicineName]
      );

      if (result.rows.length === 0) {
        return res.json({
          success: true,
          reply: `We don't have side effects info for ${medicineName}. Ask about: Paracetamol, Aspirin, Ibuprofen, etc.`
        });
      }

      const med = result.rows[0];
      const reply = `⚠️ ${med.name}\n\n**Side Effects:**\n${med.side_effects || 'Minimal side effects reported'}\n\n**Contraindications:**\n${med.contraindications || 'Consult doctor if allergic'}`;
      console.log('[chatbot] Returning side effects:', reply);

      return res.json({
        success: true,
        reply,
        medicine: med.name,
        side_effects: med.side_effects
      });
    } catch (err) {
      console.error('[chatbot] Side effects query error:', err.message);
      return res.json({
        success: true,
        reply: "Error retrieving safety info. Please try again."
      });
    }
  }

  // ======= INTENT: SYMPTOM RECOMMENDATION =======
  if (intent === 'SYMPTOM') {
    try {
      // Extract symptom from message
      const symptoms = [
        { keyword: /fever|temp|thermal/, medicine: 'Paracetamol' },
        { keyword: /cough|throat/, medicine: 'Cough Syrup' },
        { keyword: /pain|ache|hurt/, medicine: 'Ibuprofen' },
        { keyword: /cold|runny|sinus/, medicine: 'Cetirizine' },
        { keyword: /inflammation|swelling/, medicine: 'Aspirin' },
        { keyword: /stomach|acid|heat/, medicine: 'Antacid Gel' },
        { keyword: /vitamin|weak|energy/, medicine: 'Vitamin D3' },
        { keyword: /blood|sugar|diabetes/, medicine: 'Metformin' },
        { keyword: /pressure|hypertension|bp/, medicine: 'Losartan' },
        { keyword: /infection|bacterial|antibiotic/, medicine: 'Amoxicillin' }
      ];

      let recommendedMedicine = null;
      for (const sym of symptoms) {
        if (sym.keyword.test(message.toLowerCase())) {
          recommendedMedicine = sym.medicine;
          break;
        }
      }

      if (!recommendedMedicine) {
        return res.json({
          success: true,
          reply: "I understand you're not feeling well. Please describe your symptoms (fever, cough, pain, cold, etc.) and I can recommend a medicine. Important: For serious symptoms, please consult a doctor!"
        });
      }

      // Get medicine details
      const result = await db.query(
        'SELECT name, price, dosage, side_effects FROM medicines WHERE LOWER(name) = LOWER($1)',
        [recommendedMedicine]
      );

      if (result.rows.length === 0) {
        return res.json({
          success: true,
          reply: `I recommend ${recommendedMedicine} for your symptoms. Would you like to order it?`
        });
      }

      const med = result.rows[0];
      const reply = `🏥 For your symptoms, I recommend:\n\n💊 ${med.name}\n💰 Price: ₹${med.price}\n📋 Dosage: ${med.dosage}\n\n⚠️ ${med.side_effects}\n\nWould you like to order this medicine?`;
      console.log('[chatbot] Returning symptom recommendation:', reply);

      return res.json({
        success: true,
        reply,
        recommended_medicine: med.name,
        price: med.price
      });
    } catch (err) {
      console.error('[chatbot] Symptom query error:', err.message);
      return res.json({
        success: true,
        reply: "Please describe your symptoms and I can help you find the right medicine!"
      });
    }
  }

  // ======= INTENT: ORDER =======
  if (intent === 'ORDER') {
    try {
      if (!medicineName) {
        return res.json({
          success: true,
          reply: "Which medicine would you like to order? For example: 'Order 2 paracetamol'"
        });
      }

      // Extract quantity - try multiple patterns
      let quantity = 1;
      const lower = message.toLowerCase();
      
      // Pattern 1: "order 2 paracetamol"
      let qtyMatch = lower.match(/order\s+(\d+)/i);
      if (qtyMatch) {
        quantity = parseInt(qtyMatch[1]);
      } else {
        // Pattern 2: "2 paracetamol" or "paracetamol 2"
        qtyMatch = message.match(/(\d+)/);
        if (qtyMatch) {
          quantity = parseInt(qtyMatch[1]);
        }
      }

      if (quantity <= 0) {
        quantity = 1;
      }

      const result = await db.query(
        'SELECT id, name, price, stock FROM medicines WHERE LOWER(name) = LOWER($1) LIMIT 1',
        [medicineName]
      );

      console.log('ORDER Query:', { medicineName, result: result.rows?.length });

      if (result.rows.length === 0) {
        return res.json({
          success: true,
          reply: `We don't have ${medicineName} in stock. Available: Paracetamol, Aspirin, Ibuprofen, Cough Syrup, Cetirizine, Amoxicillin, Antacid Gel, Vitamin D3, Metformin, Losartan.`
        });
      }

      const med = result.rows[0];

      // Check if requested quantity is available
      if (med.stock < quantity) {
        return res.json({
          success: true,
          reply: `❌ Insufficient Stock!\n\n💊 ${med.name}\n📍 Requested: ${quantity} units\n📍 Available: ${med.stock} units\n\nWould you like to order ${med.stock} units instead?`
        });
      }

      // Medicine is available with sufficient stock - confirm availability
      const totalPrice = med.price * quantity;
      const confirmationMessage = `✅ Great! We have ${med.name} in stock!\n\n💊 Medicine: ${med.name}\n📦 Quantity: ${quantity} units\n💰 Price: ₹${med.price} per unit\n💰 Total: ₹${totalPrice}\n\n📋 Please confirm your order:`;
      
      console.log('[chatbot] Order availability confirmed:', { medicine: med.name, requestedQty: quantity, availableQty: med.stock, totalPrice });

      return res.json({
        success: true,
        reply: confirmationMessage,
        showOrderModal: true,
        order: {
          medicine_id: med.id,
          medicine_name: med.name,
          quantity,
          price_per_unit: med.price,
          total_price: totalPrice,
          stock_available: med.stock
        }
      });
    } catch (err) {
      console.error('[chatbot] Order error:', err.message);
      return res.json({
        success: true,
        reply: "Error processing order. Please try again."
      });
    }
  }

  // ======= NO SPECIFIC INTENT - GENERAL HELP =======
  return res.json({
    success: true,
    reply: "I can help you with:\n• 💰 Medicine prices\n• 📋 Dosage information\n• ⚠️ Side effects & contraindications\n• 🏥 Symptom recommendations\n• 📦 Placing orders\n\nWhat would you like to know?"
  });
  } finally {
    const durationMs = Date.now() - startedAt;
    const responseBody = res.locals.responseBody || {};
    const responseText = responseBody.reply || responseBody.error || responseBody.message || "";
    const status = res.statusCode >= 400 ? "error" : "success";

    try {
      if (generation) generation.end({ output: responseText });
      if (trace) trace.event({
        name: "agent.chat.summary",
        input: req.body?.message || "",
        output: responseText,
        metadata: {
          intent: detectedIntent,
          medicine: detectedMedicineName,
          status,
          httpStatus: res.statusCode,
          durationMs,
        },
      });
      if (trace) trace.update({
        metadata: {
          intent: detectedIntent,
          medicine: detectedMedicineName,
          status,
          httpStatus: res.statusCode,
          durationMs,
        },
      });
      if (trace) trace.end();
      await langfuse.flushAsync();
    } catch (traceErr) {
      console.error("[agent.trace] Langfuse error:", traceErr.message);
    }

    await saveAgentActivity({
      traceId,
      userId,
      activityType: "chat",
      intent: detectedIntent || "UNKNOWN",
      medicineName: detectedMedicineName || null,
      inputMessage: req.body?.message || "",
      responsePreview: responseText,
      status,
      httpStatus: res.statusCode,
      durationMs,
    });
  }
});

// Confirm and process order
export const confirmOrder = asyncHandler(async (req, res) => {
  const startedAt = Date.now();
  const traceId = randomUUID();
  const reqUserId = req.user?.user_id || req.user?.id || null;
  let finalUserIdForLog = reqUserId || null;
  let medicineNameForLog = null;

  const originalJson = res.json.bind(res);
  res.json = (body) => {
    res.locals.responseBody = body;
    return originalJson(body);
  };

  let trace = null;
  let generation = null;
  try {
    trace = langfuse.trace({
      id: traceId,
      name: "agent.confirm-order",
      userId: reqUserId ? String(reqUserId) : undefined,
      input: req.body,
    });

    generation = trace.generation({
      name: "agent.order-confirmation",
      model: "pharmacy-rule-engine",
      input: req.body,
    });
  } catch (err) {
    console.error("[agent.trace] Unable to initialize confirm-order trace:", err.message);
  }

  try {
    const { medicine_id, quantity, user_id } = req.body;

    if (!medicine_id || !quantity) {
      return res.status(400).json({
        success: false,
        error: "Missing medicine_id or quantity",
      });
    }

    const finalUserId = user_id || reqUserId || 1;
    finalUserIdForLog = finalUserId;

    try {
      const medicineResult = await db.query(
        "SELECT id, name, price, stock, dosage FROM medicines WHERE id = $1 LIMIT 1",
        [medicine_id]
      );

      if (medicineResult.rows.length === 0) {
        return res.status(400).json({
          success: false,
          error: "Medicine not found",
        });
      }

      const med = medicineResult.rows[0];
      medicineNameForLog = med.name;

      if (med.stock < quantity) {
        return res.status(400).json({
          success: false,
          error: `Insufficient stock. Only ${med.stock} units available.`,
        });
      }

      const totalPrice = med.price * quantity;

      const orderResult = await db.query(
        `INSERT INTO orders (
          user_id, medicine_id, quantity, medicine_name,
          total_price, dosage, frequency,
          prescription_required, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id, medicine_name, quantity, total_price, status, created_at`,
        [
          finalUserId,
          medicine_id,
          quantity,
          med.name,
          totalPrice,
          med.dosage || "As directed",
          "Once daily",
          false,
          "completed",
        ]
      );

      const order = orderResult.rows[0];

      const updateResult = await db.query(
        "UPDATE medicines SET stock = stock - $1 WHERE id = $2 RETURNING stock",
        [quantity, medicine_id]
      );

      const newStock = updateResult.rows[0]?.stock || (med.stock - quantity);

      console.log("[order] Order confirmed and inserted:", {
        orderId: order.id,
        userId: finalUserId,
        medicine: order.medicine_name,
        quantity,
        totalPrice,
      });

      // Try to send confirmation email (non-blocking for order success).
      let emailSent = false;
      try {
        const userResult = await db.query(
          "SELECT user_name, email FROM users WHERE user_id = $1 LIMIT 1",
          [finalUserId]
        );

        const userRow = userResult.rows[0];
        if (userRow?.email) {
          const emailResult = await sendOrderConfirmationEmail({
            toEmail: userRow.email,
            userName: userRow.user_name,
            orderId: order.id,
            medicineName: order.medicine_name,
            quantity,
            totalPrice: order.total_price,
          });
          emailSent = !!emailResult.sent;
        } else {
          console.warn("[email] No email found for user:", finalUserId);
        }
      } catch (emailErr) {
        console.error("[email] Confirmation email flow failed:", emailErr.message);
      }

      return res.json({
        success: true,
        message: `Order Confirmed: ${quantity}x ${order.medicine_name}. Total: Rs ${order.total_price}. Order #${order.id} placed.`,
        email_sent: emailSent,
        order: {
          order_id: order.id,
          medicine_name: order.medicine_name,
          quantity,
          price_per_unit: med.price,
          total_price: order.total_price,
          stock_remaining: newStock,
          status: order.status,
          created_at: order.created_at,
        },
      });
    } catch (err) {
      console.error("[order] Confirmation error:", err.message);
      return res.status(500).json({
        success: false,
        error: "Error confirming order: " + err.message,
      });
    }
  } finally {
    const durationMs = Date.now() - startedAt;
    const responseBody = res.locals.responseBody || {};
    const responseText = responseBody.message || responseBody.error || "";
    const status = res.statusCode >= 400 ? "error" : "success";

    try {
      if (generation) generation.end({ output: responseText });
      if (trace) trace.event({
        name: "agent.confirm-order.summary",
        input: req.body,
        output: responseText,
        metadata: {
          medicine: medicineNameForLog,
          status,
          httpStatus: res.statusCode,
          durationMs,
        },
      });
      if (trace) trace.update({
        metadata: {
          medicine: medicineNameForLog,
          status,
          httpStatus: res.statusCode,
          durationMs,
        },
      });
      if (trace) trace.end();
      await langfuse.flushAsync();
    } catch (traceErr) {
      console.error("[agent.trace] Confirm-order Langfuse error:", traceErr.message);
    }

    await saveAgentActivity({
      traceId,
      userId: finalUserIdForLog,
      activityType: "confirm_order",
      intent: "ORDER",
      medicineName: medicineNameForLog,
      inputMessage: JSON.stringify(req.body || {}),
      responsePreview: responseText,
      status,
      httpStatus: res.statusCode,
      durationMs,
    });
  }
});
// Alternative export names for compatibility
export const chat = chatWithAgent;


