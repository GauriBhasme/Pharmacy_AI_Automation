# 🏥 Medical Pharmacy AI Chatbot

A specialized AI-powered pharmacy assistant that provides medicine information, recommendations, and order processing with strict medical field validation.

## 🎯 What This Does

- **💊 Medicine Information:** Instant access to prices, dosages, side effects, contraindications
- **🏥 Medical Field Validation:** Rejects non-medical queries with helpful guidance
- **🧠 Intent Recognition:** Understands 5 types of queries (price, dosage, safety, symptoms, orders)
- **📦 Order Processing:** Process medicine orders and update inventory
- **🗄️ Database Backed:** Real-time data from PostgreSQL database
- **⚡ No External APIs:** Works completely offline with local database

## ⚡ Quick Start

### Fastest Way (3 steps)
1. **Backend:** Double-click `BackEnd/START.bat`
2. **Frontend:** `cd FrontEnd && npm run dev`
3. **Chat:** Go to `http://localhost:5173` and start chatting

### See It In Action
```bash
# Backend terminal
cd BackEnd
node src/server.js

# Frontend terminal (new window)
cd FrontEnd
npm run dev
```

Then open `http://localhost:5173` in your browser.

## 📋 Architecture

```
┌─────────────────────┐
│   React Frontend    │
│   (Vite Dev)        │
│   Port: 5173        │
└──────────┬──────────┘
           │
           │ HTTP POST
           │ /api/agent/chat
           │ {"message":"..."}
           │
           ↓
┌─────────────────────────────────────┐
│   Express.js Backend                │
│   Port: 5000                        │
│                                     │
│   Medical Field Validation          │
│   ↓                                 │
│   Intent Recognition (5 types)      │
│   ↓                                 │
│   Database Query (if needed)        │
│   ↓                                 │
│   Response JSON                     │
└──────────┬──────────────────────────┘
           │
           ↓
    ┌──────────────┐
    │ PostgreSQL   │
    │ medicines    │
    │ table        │
    │ (10 samples) │
    └──────────────┘
```

## 🚀 Features

### Medical Field Validation
- ✅ Only accepts pharmacy-related questions (40+ keywords recognized)
- ✅ Rejects non-medical queries with helpful message
- ✅ Examples:
  - ✅ "What is the price of paracetamol?" → Answer
  - ❌ "What is the capital of France?" → Rejected

### Intent Recognition (5 Types)
1. **PRICE/STOCK** - "How much does paracetamol cost?"
2. **DOSAGE** - "What is the dosage for ibuprofen?"
3. **SIDE_EFFECTS** - "What are the side effects of aspirin?"
4. **SYMPTOM** - "I have a fever, what medicine?"
5. **ORDER** - "I want to order 2 units of paracetamol"

### Database Features
- Real-time medicine info (name, price, stock, dosage, etc.)
- 10 sample medicines pre-loaded
- Automatic stock management
- Easy to extend with more medicines

## 📊 Sample Medicines

| Medicine | Price | Stock | Dosage |
|----------|-------|-------|--------|
| Paracetamol | ₹50 | 100 | 500mg |
| Aspirin | ₹40 | 100 | 300mg |
| Ibuprofen | ₹60 | 100 | 200mg |
| Cough Syrup | ₹120 | 50 | 5ml |
| Cetirizine | ₹75 | 100 | 10mg |
| Amoxicillin | ₹150 | 80 | 250mg |
| Antacid Gel | ₹90 | 100 | 15ml |
| Vitamin D3 | ₹200 | 60 | 2000IU |
| Metformin | ₹180 | 100 | 500mg |
| Losartan | ₹250 | 50 | 50mg |

## 📱 Test Results

### Performance: 92.3% Success Rate (12/13 tests passing)

| Test Category | Results |
|---------------|---------|
| Medical Field Validation | ✅ 100% |
| Price Lookup | ✅ 100% |
| Stock Info | ✅ 100% |
| Dosage Info | ✅ 100% |
| Side Effects | ✅ 100% |
| Symptom Recommendation | ✅ 67% |
| Order Processing | ✅ 100% |
| Error Handling | ✅ 100% |
| **Overall** | **✅ 92.3%** |

## 📖 Documentation

- **[STARTUP_GUIDE.md](./STARTUP_GUIDE.md)** - Complete setup & running instructions
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Detailed feature documentation
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Complete troubleshooting guide
- **[CHATBOT_REPORT.md](./BackEnd/CHATBOT_REPORT.txt)** - Full implementation report

## 🔧 Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| **Backend** | Express.js | 5.2.1 |
| **Frontend** | React + Vite | Latest |
| **Database** | PostgreSQL | 12+ |
| **Runtime** | Node.js | 14+ |
| **HTTP** | REST/JSON | - |

## 🏃 Running the Application

### Prerequisites
- Node.js installed
- PostgreSQL running
- Port 5000 & 5173 available

### Setup (First Time Only)

1. **Database Setup**
   ```bash
   # Create database
   psql -U postgres -c "CREATE DATABASE pharmacy_ai;"
   
   # Seed medicines (from BackEnd folder)
   node seed-medicines.js
   ```

2. **Install Dependencies**
   ```bash
   # Backend
   cd BackEnd
   npm install
   
   # Frontend
   cd FrontEnd
   npm install
   ```

### Running

**Method 1: Windows Batch (Easiest)**
```bash
# Terminal 1
BackEnd/START.bat

# Terminal 2
cd FrontEnd && npm run dev
```

**Method 2: Command Line**
```bash
# Terminal 1
cd BackEnd
node src/server.js

# Terminal 2
cd FrontEnd
npm run dev
```

**Method 3: PowerShell**
```powershell
# From root
.\START_BACKEND.ps1

# New terminal
cd FrontEnd; npm run dev
```

## 🧪 Testing

### Run Test Suite
```bash
cd BackEnd
node test-medical-report.js
```

Expected: 12/13 tests passing (92.3%)

### Test Individual Endpoint
```bash
curl -X POST http://localhost:5000/api/agent/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What is the price of paracetamol?"}'
```

### Health Check
```bash
curl http://localhost:5000/health
```

## 📝 API Endpoints

### POST /api/agent/chat
Main chatbot endpoint for medical queries.

**Request:**
```json
{
  "message": "What is the price of paracetamol?"
}
```

**Response (Success):**
```json
{
  "response": "The price of Paracetamol is ₹50",
  "intent": "PRICE",
  "medicine": "Paracetamol",
  "data": {
    "name": "Paracetamol",
    "price": 50,
    "stock": 100
  }
}
```

**Response (Non-Medical):**
```json
{
  "response": "I can only answer medical and pharmacy-related questions. Please ask about medicines, dosages, side effects, or place an order.",
  "isMedicalQuery": false
}
```

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "database": "connected"
}
```

## 🎓 Query Examples

### Try These Queries

✅ **Working Queries:**
- "What is the price of paracetamol?"
- "What is the dosage for ibuprofen?"
- "What are the side effects of aspirin?"
- "I have a fever, what medicine do you recommend?"
- "I want to order 2 units of paracetamol"
- "Do you have cough syrup in stock?"
- "How much does cetirizine cost?"

❌ **Rejected Queries:**
- "What is the capital of France?"
- "Tell me a joke"
- "What's the weather today?"
- "How do I cook rice?"

## 🐛 Troubleshooting

**Backend won't start?**
→ See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

**Chat returns error?**
→ See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) → "Chat returns error"

**Database issues?**
→ Run `node seed-medicines.js` from BackEnd folder

## 📊 File Structure

```
Pharmacy_AI_Automation/
├── BackEnd/
│   ├── src/
│   │   ├── app.js                 # Express config & routes
│   │   ├── server.js              # Server startup
│   │   ├── db.js                  # Database connection
│   │   ├── controllers/
│   │   │   └── agent.controller.js # Medical chatbot logic (372 lines)
│   │   └── routes/
│   │       └── agent.routes.js    # Chat route definitions
│   ├── seed-medicines.js          # Database initialization
│   ├── test-medical-report.js     # Test suite (13 tests)
│   ├── START.bat                  # Windows launcher
│   ├── .env                       # Environment variables
│   └── package.json
│
├── FrontEnd/
│   ├── src/
│   │   ├── pages/
│   │   │   └── User/
│   │   │       └── ChatPage.jsx   # Chat UI (axios POST integration)
│   │   ├── components/
│   │   └── App.jsx
│   ├── vite.config.js
│   └── package.json
│
├── STARTUP_GUIDE.md               # How to run
├── IMPLEMENTATION_SUMMARY.md      # Feature details
├── TROUBLESHOOTING.md             # Help & fixes
└── README.md                      # This file
```

## ✨ Key Implementation Details

### Medical Field Validation (40+ Keywords)
```javascript
// Includes keywords like:
medicine, drug, pharmacy, prescription, dosage, dose,
pill, tablet, capsule, syrup, cream, ointment,
side effects, contraindication, allergy, adverse,
fever, cough, pain, cold, headache, etc.
```

### Intent Recognition Logic
1. Extract medicine name from query
2. Classify intent (PRICE, DOSAGE, SIDE_EFFECTS, SYMPTOM, ORDER)
3. Query database if needed
4. Format and return response

### Error Handling
- ✅ Invalid medical queries: Rejected with helpful message
- ✅ Medicine not found: Suggests alternatives
- ✅ Database errors: Graceful fallback
- ✅ Invalid orders: Checks stock before processing

## 🚀 Future Enhancements

- [ ] Integration with real pharmacy inventory systems
- [ ] Multi-language support
- [ ] AI-powered natural language processing (NLP)
- [ ] User prescription history tracking
- [ ] Medicine interaction checker
- [ ] Doctor appointment scheduling
- [ ] Medicine delivery integration

## 📞 Support

For issues:
1. Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
2. Run `node test-medical-report.js` to validate setup
3. Check backend console logs for error messages
4. Verify PostgreSQL is running and has medicines table

## ✅ Verification Checklist

- [ ] Backend running on localhost:5000
- [ ] Frontend running on localhost:5173
- [ ] Health check returns `{"status":"ok","database":"connected"}`
- [ ] Database has medicines: `SELECT COUNT(*) FROM medicines;` returns 10
- [ ] Test suite passes: `node test-medical-report.js` shows 92.3%
- [ ] Chat works: Send "price of paracetamol" → Get response "₹50"
- [ ] Validation works: Send "What is 2+2?" → Get rejection message

## 📄 License

This project is part of Pharmacy AI Automation.

---

**Need Help?** See [STARTUP_GUIDE.md](./STARTUP_GUIDE.md) or [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

**Happy Chatting!** 🏥💊🤖
