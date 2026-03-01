import { db } from "../db.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

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
  'medication', 'cure', 'relief', 'condition', 'preventive'
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
  
  // Try common patterns
  let match = lower.match(/of\s+([a-z0-9\s\-]+?)(?:\?|$|for|with)/i);
  if (match) return match[1].trim();
  
  match = lower.match(/medicine\s+([a-z0-9\s\-]+?)(?:\?|$)/i);
  if (match) return match[1].trim();
  
  // Fallback: take last 1-2 words
  const words = message.match(/\b[a-z]+\b/gi) || [];
  if (words.length > 0) {
    return words.slice(-2).join(' ');
  }
  
  return '';
};

// Identify intent from message
const identifyIntent = (message) => {
  const lower = message.toLowerCase();
  
  if (/price|cost|how much|rupee|₹|amount/.test(lower)) {
    return 'PRICE';
  }
  if (/dosage|dose|take|consume|mg|mg\/ml|strength/.test(lower)) {
    return 'DOSAGE';
  }
  if (/side effect|adverse|allergy|allergic|contraindication|warning/.test(lower)) {
    return 'SIDE_EFFECTS';
  }
  if (/fever|cough|pain|cold|headache|symptom|sick|ill|disease/.test(lower)) {
    return 'SYMPTOM';
  }
  if (/order|buy|purchase|need|want|get|send|deliver/.test(lower)) {
    return 'ORDER';
  }
  
  return null;
};

// Main chat controller
export const chatWithAgent = asyncHandler(async (req, res) => {
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
  console.log('[chatbot] Intent:', intent);

  // EXTRACT MEDICINE NAME (if needed)
  const medicineName = extractMedicineName(message);
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
        'SELECT id, name, price, stock, composition FROM medicines WHERE LOWER(name) LIKE LOWER($1) LIMIT 1',
        [`%${medicineName}%`]
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
        'SELECT name, dosage, category FROM medicines WHERE LOWER(name) LIKE LOWER($1) LIMIT 1',
        [`%${medicineName}%`]
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
        'SELECT name, side_effects, contraindications FROM medicines WHERE LOWER(name) LIKE LOWER($1) LIMIT 1',
        [`%${medicineName}%`]
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

      // Extract quantity
      const qtyMatch = message.match(/(\d+)\s*(unit|pill|tablet|capsule|quantity|qty)?/i);
      const quantity = qtyMatch ? parseInt(qtyMatch[1]) : 1;

      if (quantity <= 0) {
        return res.json({
          success: true,
          reply: "Please specify a valid quantity. For example: 'Order 2 paracetamol'"
        });
      }

      const result = await db.query(
        'SELECT id, name, price, stock FROM medicines WHERE LOWER(name) LIKE LOWER($1) LIMIT 1',
        [`%${medicineName}%`]
      );

      console.log("Result:", result.rows);

      if (result.rows.length === 0) {
        return res.json({
          success: true,
          reply: `We don't have ${medicineName}. Available: Paracetamol, Aspirin, Ibuprofen, Cough Syrup, Cetirizine, Amoxicillin, Antacid Gel, Vitamin D3, Metformin, Losartan.`
        });
      }

      const med = result.rows[0];

      if (med.stock < quantity) {
        return res.json({
          success: true,
          reply: `Sorry, we only have ${med.stock} units of ${med.name} in stock. Would you like ${med.stock} units instead?`
        });
      }

      // Process order
      await db.query(
        'UPDATE medicines SET stock = stock - $1 WHERE id = $2',
        [quantity, med.id]
      );

      const totalPrice = med.price * quantity;
      const reply = `✅ Order Confirmed!\n💊 ${quantity}x ${med.name}\n💰 Total: ₹${totalPrice}\n\n📦 Order has been placed. Thank you!`;
      console.log('[chatbot] Order processed:', reply);

      return res.json({
        success: true,
        reply,
        order: {
          medicine: med.med_name,
          quantity,
          price_per_unit: med.price,
          total_price: totalPrice
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
});

// Alternative export names for compatibility
export const chat = chatWithAgent;