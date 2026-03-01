import { db } from "../db.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

/* ==============================
   MEDICAL PHARMACY CHATBOT
   - Validates all queries are medical/pharmacy field
   - Provides medicine info, prices, stock, dosage
   - Rejects non-medical queries
============================== */

/**
 * Check if message is related to medical/pharmacy field
 */
const isMedicalQuery = (message) => {
  const medicalKeywords = [
    'medicine', 'drug', 'tablet', 'capsule', 'injection', 'syrup', 'cream', 'ointment',
    'symptom', 'disease', 'pain', 'fever', 'flu', 'cold', 'cough', 'allergy', 'asthma',
    'diabetes', 'pressure', 'cholesterol', 'infection', 'antibiotic', 'paracetamol',
    'aspirin', 'ibuprofen', 'amoxicillin', 'antihistamine', 'antacid', 'laxative',
    'price', 'cost', 'stock', 'available', 'buy', 'order', 'dosage', 'dose', 'side effect',
    'contraindication', 'interaction', 'health', 'medical', 'pharmacy', 'prescription',
    'otc', 'over the counter', 'generic', 'brand', 'composition', 'ingredient'
  ];

  const lower = message.toLowerCase();
  return medicalKeywords.some(keyword => lower.includes(keyword));
};

/**
 * Extract medicine name from query
 */
const extractMedicineName = (text) => {
  // Remove common words
  const cleaned = text
    .toLowerCase()
    .replace(/^(price|cost|what|is|the|of|for|about|tell me|give me|show me|list|available|stock|order|buy)\s+/gi, '')
    .replace(/\s*(medicine|drug|tablet|capsule|injection|syrup|cream|ointment|price|cost|stock|available)\s*$/gi, '')
    .trim();
  
  return cleaned || null;
};

/**
 * Fetch medicine details from database
 */
const getMedicineInfo = async (medicineName) => {
  if (!medicineName) return null;

  try {
    const result = await db.query(
      `SELECT id, name, description, composition, dosage, 
              side_effects, contraindications, price, stock, category
       FROM medicines 
       WHERE LOWER(name) ILIKE LOWER($1) OR LOWER(description) ILIKE LOWER($1)
       LIMIT 5`,
      [`%${medicineName}%`]
    );

    return result.rows.length > 0 ? result.rows : null;
  } catch (err) {
    console.error('[medical] getMedicineInfo error:', err.message);
    return null;
  }
};

/**
 * Format medicine info for display
 */
const formatMedicineInfo = (medicine) => {
  if (!medicine) return null;

  let info = `💊 **${medicine.name}**\n`;
  info += `─────────────────\n`;
  
  if (medicine.description) info += `📝 ${medicine.description}\n`;
  if (medicine.composition) info += `🧪 Composition: ${medicine.composition}\n`;
  if (medicine.dosage) info += `⏱️  Dosage: ${medicine.dosage}\n`;
  if (medicine.category) info += `📂 Category: ${medicine.category}\n`;
  if (medicine.side_effects) info += `⚠️  Side Effects: ${medicine.side_effects}\n`;
  if (medicine.contraindications) info += `🚫 Contraindications: ${medicine.contraindications}\n`;
  
  info += `\n💰 Price: ₹${medicine.price}`;
  info += `\n📦 Stock: ${medicine.stock > 0 ? `${medicine.stock} units available` : 'Out of stock'}`;

  return info;
};

/**
 * Main chat handler - Medical pharmacy chatbot
 */
export const chatWithAgent = asyncHandler(async (req, res) => {
  const { message } = req.body;
  const userId = req.user?.user_id || null;

  console.log(`[medical] Chat request from user ${userId || 'anonymous'}: "${message}"`);

  if (!message || message.trim().length === 0) {
    return res.status(400).json({ 
      success: false, 
      error: "Message cannot be empty" 
    });
  }

  // Validate message is medical-related
  if (!isMedicalQuery(message)) {
    console.log(`[medical] Non-medical query rejected: "${message}"`);
    return res.json({
      success: true,
      reply: `⚠️ I'm a Medical Pharmacy Assistant. I can only help with:\n\n` +
             `✅ Medicine information (composition, dosage, side effects)\n` +
             `✅ Medicine prices and availability\n` +
             `✅ Ordering medicines\n` +
             `✅ Symptom-based medicine recommendations\n` +
             `✅ Drug interactions and contraindications\n\n` +
             `Please ask something related to medicines or health. Example:\n` +
             `"What is paracetamol used for?" or "Price of aspirin?"`
    });
  }

  const lower = message.toLowerCase();

  // ==================== SYMPTOM/DISEASE INTENT ====================
  if (/symptom|disease|treat|pain|fever|cold|cough|allergy|headache|flu/.test(lower)) {
    console.log('[medical] Symptom/Disease query detected');
    
    // Basic symptom-to-medicine mapping
    const symptomMap = {
      'fever': { name: 'Paracetamol', info: 'Paracetamol is used to reduce fever and mild to moderate pain.' },
      'cold': { name: 'Cough Syrup', info: 'Cough syrup helps relieve cold and cough symptoms.' },
      'cough': { name: 'Cough Syrup', info: 'Antitussive syrups relieve dry or productive coughs.' },
      'headache': { name: 'Aspirin', info: 'Aspirin or Paracetamol are commonly used for headache relief.' },
      'pain': { name: 'Ibuprofen', info: 'Ibuprofen is an anti-inflammatory pain reliever for mild to moderate pain.' },
      'allergy': { name: 'Antihistamine', info: 'Antihistamines like Cetirizine relieve allergic reactions.' },
    };

    let response = `🏥 **Symptom Assessment**\n\n`;
    let foundMatch = false;

    for (const [symptom, remedy] of Object.entries(symptomMap)) {
      if (lower.includes(symptom)) {
        response += `For **${symptom}**: Try **${remedy.name}**\n`;
        response += `${remedy.info}\n\n`;
        foundMatch = true;
      }
    }

    if (!foundMatch) {
      response += `I can help with medicine recommendations for various symptoms.\n`;
      response += `Common symptoms I can help with: fever, cold, cough, headache, pain, allergy.\n\n`;
      response += `⚠️ **Disclaimer**: This is for informational purposes only. `;
      response += `Please consult a doctor or pharmacist for proper diagnosis and treatment.`;
    } else {
      response += `\n⚠️ **IMPORTANT**: Consult a doctor or pharmacist before taking any medicine!`;
    }

    console.log('[medical] Symptom response prepared');
    return res.json({ success: true, reply: response });
  }

  // ==================== PRICE/STOCK INTENT ====================
  if (/price|cost|how much|stock|available|quantity|inventory/.test(lower)) {
    console.log('[medical] Price/Stock query detected');
    const medicineName = extractMedicineName(message);
    console.log(`[medical] Medicine name extracted: "${medicineName}"`);

    if (!medicineName || medicineName.length < 2) {
      return res.json({
        success: true,
        reply: `To check price and availability, please mention a specific medicine.\n\n` +
               `Example: "What is the price of paracetamol?" or "Stock of aspirin"`
      });
    }

    const medicines = await getMedicineInfo(medicineName);
    console.log(`[medical] Found ${medicines ? medicines.length : 0} medicines`);

    if (!medicines || medicines.length === 0) {
      return res.json({
        success: true,
        reply: `❌ Medicine not found in our database: **${medicineName}**\n\n` +
               `Please check the spelling or try another medicine name.`
      });
    }

    if (medicines.length === 1) {
      const med = medicines[0];
      const info = formatMedicineInfo(med);
      console.log('[medical] Single medicine found, returning info');
      return res.json({ success: true, reply: info });
    }

    // Multiple matches
    console.log('[medical] Multiple medicines found');
    let reply = `Found ${medicines.length} matching medicines:\n\n`;
    medicines.forEach((med, idx) => {
      reply += `${idx + 1}. **${med.name}** - ₹${med.price} (${med.stock > 0 ? med.stock + ' in stock' : 'Out of stock'})\n`;
    });
    reply += `\nWhich one would you like more details about?`;

    return res.json({ success: true, reply });
  }

  // ==================== ORDER/BUY INTENT ====================
  if (/order|buy|purchase|place order|need/.test(lower)) {
    console.log('[medical] Order/Buy query detected');
    const medicineName = extractMedicineName(message);
    const qtyMatch = message.match(/(\d+)\s*(?:tablet|cap|strip|pack|box|x)?/i);
    const quantity = qtyMatch ? parseInt(qtyMatch[1], 10) : 1;

    console.log(`[medical] Order: medicine="${medicineName}", qty=${quantity}`);

    if (!medicineName || medicineName.length < 2) {
      return res.json({
        success: true,
        reply: `To place an order, please specify:\n\n` +
               `1. Medicine name\n2. Quantity (optional, defaults to 1)\n\n` +
               `Example: "Order 10 paracetamol tablets"`
      });
    }

    const medicines = await getMedicineInfo(medicineName);

    if (!medicines || medicines.length === 0) {
      return res.json({
        success: true,
        reply: `❌ Medicine not found: **${medicineName}**\n\nCannot proceed with order.`
      });
    }

    const medicine = medicines[0];

    if (medicine.stock < quantity) {
      return res.json({
        success: true,
        reply: `❌ Insufficient stock!\n\n` +
               `Requested: ${quantity} units\n` +
               `Available: ${medicine.stock} units\n\n` +
               `Please reduce the quantity.`
      });
    }

    try {
      // Update stock
      await db.query(
        'UPDATE medicines SET stock = stock - $1 WHERE id = $2',
        [quantity, medicine.id]
      );

      // Log order
      const totalPrice = medicine.price * quantity;
      console.log(`[medical] Order successful: ${medicine.name} x${quantity} = ₹${totalPrice}`);

      return res.json({
        success: true,
        reply: `✅ **Order Confirmed!**\n\n` +
               `Medicine: ${medicine.name}\n` +
               `Quantity: ${quantity} units\n` +
               `Price per unit: ₹${medicine.price}\n` +
               `Total: ₹${totalPrice}\n\n` +
               `Your order will be delivered soon. Keep your prescription ready.`
      });
    } catch (err) {
      console.error('[medical] Order processing error:', err.message);
      return res.status(500).json({
        success: false,
        error: `Order processing failed: ${err.message}`
      });
    }
  }

  // ==================== DOSAGE/USAGE INTENT ====================
  if (/dosage|dose|how to take|usage|how much|when to take|frequency/.test(lower)) {
    console.log('[medical] Dosage/Usage query detected');
    const medicineName = extractMedicineName(message);

    if (!medicineName || medicineName.length < 2) {
      return res.json({
        success: true,
        reply: `To provide dosage information, please specify a medicine name.\n\n` +
               `Example: "What is the dosage for aspirin?"`
      });
    }

    const medicines = await getMedicineInfo(medicineName);

    if (!medicines || medicines.length === 0) {
      return res.json({
        success: true,
        reply: `❌ Medicine not found: **${medicineName}**`
      });
    }

    const medicine = medicines[0];
    const dosageInfo = medicine.dosage || "Standard dosage not available";

    return res.json({
      success: true,
      reply: `💊 **${medicine.name} - Dosage Information**\n\n` +
             `${dosageInfo}\n\n` +
             `⚠️ **IMPORTANT**: These are general guidelines. ` +
             `Always follow your doctor's or pharmacist's prescription.`
    });
  }

  // ==================== SIDE EFFECTS INTENT ====================
  if (/side effect|adverse|reaction|allergy to|contraindication|interact/.test(lower)) {
    console.log('[medical] Side Effects/Contraindication query detected');
    const medicineName = extractMedicineName(message);

    if (!medicineName || medicineName.length < 2) {
      return res.json({
        success: true,
        reply: `To provide safety information, please specify a medicine name.\n\n` +
               `Example: "What are the side effects of paracetamol?"`
      });
    }

    const medicines = await getMedicineInfo(medicineName);

    if (!medicines || medicines.length === 0) {
      return res.json({
        success: true,
        reply: `❌ Medicine not found: **${medicineName}**`
      });
    }

    const medicine = medicines[0];
    let safetyInfo = `⚠️ **${medicine.name} - Safety Information**\n\n`;
    
    if (medicine.side_effects) {
      safetyInfo += `**Possible Side Effects:**\n${medicine.side_effects}\n\n`;
    }
    
    if (medicine.contraindications) {
      safetyInfo += `**Contraindications (Do NOT use if):**\n${medicine.contraindications}\n\n`;
    }

    safetyInfo += `🚨 **If you experience severe side effects, stop use and contact a doctor immediately.**`;

    return res.json({ success: true, reply: safetyInfo });
  }

  // ==================== DEFAULT/GENERAL MEDICAL QUERY ====================
  console.log('[medical] General medical query');
  const medicineName = extractMedicineName(message);

  if (medicineName && medicineName.length > 1) {
    const medicines = await getMedicineInfo(medicineName);
    
    if (medicines && medicines.length > 0) {
      const info = formatMedicineInfo(medicines[0]);
      return res.json({ success: true, reply: info });
    }
  }

  // Generic medical help message
  return res.json({
    success: true,
    reply: `🏥 **Medical Pharmacy Assistant**\n\n` +
           `I can help you with:\n\n` +
           `💊 **Medicine Information** - Details, composition, uses\n` +
           `💰 **Pricing & Availability** - Check stock and prices\n` +
           `📦 **Orders** - Buy medicines\n` +
           `⏱️  **Dosage** - Recommended doses and frequency\n` +
           `⚠️  **Safety** - Side effects and contraindications\n` +
           `🔍 **Symptoms** - Medicine suggestions for symptoms\n\n` +
           `How can I assist you today?`
  });
});

export default { chatWithAgent };
