# 🏥 Medical Pharmacy Chatbot - Complete Setup & Startup Guide

## ⚡ Quick Start (5 Minutes)

### Option 1: Windows Batch File (Easiest)
1. Navigate to: `BackEnd` folder
2. Double-click: `START.bat`
3. Wait for: "✅ Server is running and ready!"
4. Open new terminal and run: `cd FrontEnd && npm run dev`
5. Go to: `http://localhost:5173`

### Option 2: PowerShell (Advanced)
```powershell
# From root directory
.\START_BACKEND.ps1
```

### Option 3: Manual Command Line
```bash
# Terminal 1 - Start Backend
cd BackEnd
node src/server.js

# Terminal 2 - Start Frontend
cd FrontEnd
npm run dev
```

---

## 📋 Prerequisites

Before starting, make sure you have:

- ✅ Node.js installed (`node --version`)
- ✅ PostgreSQL running locally
- ✅ `.env` file in `BackEnd` with correct credentials:
  ```
  DB_HOST=localhost
  DB_USER=postgres
  DB_PASSWORD=super
  DB_NAME=pharmacy_ai
  NODE_ENV=development
  ```

---

## 🗄️ Database Setup

If this is your first time:

### Step 1: Create Database
```bash
# Using psql
psql -U postgres -c "CREATE DATABASE pharmacy_ai;"
```

### Step 2: Seed Medicines (Run from BackEnd folder)
```bash
node seed-medicines.js
```

This creates the `medicines` table with 10 sample drugs:
- Paracetamol (₹50)
- Aspirin (₹40)
- Ibuprofen (₹60)
- Cough Syrup (₹120)
- Cetirizine (₹75)
- Amoxicillin (₹150)
- Antacid Gel (₹90)
- Vitamin D3 (₹200)
- Metformin (₹180)
- Losartan (₹250)

---

## 🚀 Detailed Startup Steps

### Backend Server

**Terminal 1:**
```bash
cd BackEnd
node src/server.js
```

Expected output:
```
Server running on port 5000
Health check endpoint available at http://localhost:5000/health
Database connected to pharmacy_ai
```

### Frontend Application

**Terminal 2:**
```bash
cd FrontEnd
npm run dev
```

Expected output:
```
  VITE v4.x.x  ready in 200 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

---

## ✅ Verification

### Test Backend Health
```bash
curl http://localhost:5000/health
```

Response:
```json
{"status":"ok","database":"connected"}
```

### Test Chat Endpoint
```bash
curl -X POST http://localhost:5000/api/agent/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What is the price of paracetamol?"}'
```

### Test Frontend
1. Go to: `http://localhost:5173`
2. Login with credentials (if required)
3. Navigate to Chat page
4. Send message: `"price of paracetamol"`
5. See response from medical chatbot

---

## 🤖 Test the Chatbot

### Valid Medical Queries (Will Work)
| Query | Expected Response |
|-------|-------------------|
| "What is the price of paracetamol?" | Returns ₹50 |
| "What is the dosage for ibuprofen?" | Returns dosage info |
| "I have a fever, what medicine?" | Recommends appropriate medicine |
| "Side effects of aspirin" | Lists side effects |
| "I want to order 2 units of paracetamol" | Processes order |

### Invalid Queries (Will Be Rejected)
- "What is the capital of France?" → Medical field validation fails
- "Tell me a joke" → Not a medical query
- "What's the weather?" → Rejected

---

## 🧪 Run Test Suite

From `BackEnd` folder:
```bash
node test-medical-report.js
```

This runs 13 comprehensive tests including:
- Medical field validation
- Price lookups
- Dosage information
- Side effects
- Symptom recommendations
- Order processing
- Error handling

Expected result: **92.3% pass rate (12/13 tests)**

---

## 🔍 Troubleshooting

### Issue: "Cannot connect to localhost:5000"
**Solution:**
1. Verify backend is running: `curl http://localhost:5000/health`
2. Check if port 5000 is in use: `netstat -ano | findstr :5000` (Windows)
3. Kill process on port 5000 and restart
4. Try different port in `.env`: `PORT=5001`

### Issue: "PostgreSQL connection failed"
**Solution:**
1. Verify PostgreSQL is running
2. Check `.env` credentials match your PostgreSQL setup
3. Test connection: `psql -h localhost -U postgres -d pharmacy_ai -c "SELECT 1;"`
4. If needed, run seed script again: `node seed-medicines.js`

### Issue: "Frontend can't reach backend"
**Solution:**
1. Verify backend health: `curl http://localhost:5000/health`
2. Check CORS is allowing frontend port (5173)
3. Look at browser console for specific error
4. Try: `curl -H "Origin: http://localhost:5173" http://localhost:5000/health`

### Issue: "Chat returns 'error communicating with AI agent'"
**Solution:**
1. Check backend console for error logs
2. Verify message is valid medical query
3. Check database has medicines: `node test-medical-report.js`
4. Restart backend: Stop and run `node src/server.js` again

---

## 📊 Architecture Overview

```
Frontend (React + Vite)
    |
    ├─ Port: 5173
    └─ Calls: POST http://localhost:5000/api/agent/chat
         |
         ↓
Backend (Express.js)
    |
    ├─ Port: 5000
    ├─ Routes:
    │  ├─ POST /api/agent/chat → agentController.chat()
    │  ├─ POST /api/chat/chat → agentController.chat()
    │  └─ GET /health → health check
    |
    └─ Database (PostgreSQL)
       └─ medicines table (10 sample drugs)
          ├─ id, name, description
          ├─ composition, dosage
          ├─ side_effects, contraindications
          ├─ price, stock, category
```

---

## 📝 Key Features

✅ **Medical Field Validation**: Only processes pharmacy-related queries
✅ **Intent Recognition**: Identifies queries about price, dosage, side effects, symptoms, orders
✅ **Database Integration**: Real-time lookups from medicines table
✅ **Error Handling**: Graceful responses to invalid queries
✅ **Stock Management**: Tracks inventory and processes orders
✅ **Local Fallback**: Works without external APIs

---

## 🆘 Getting Help

If issues persist:
1. Check backend console logs for error messages
2. Run test suite: `node test-medical-report.js`
3. Verify database: `psql -U postgres -d pharmacy_ai -c "SELECT * FROM medicines;"`
4. Check .env file is in BackEnd folder
5. Ensure PostgreSQL credentials are correct
6. Review [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) for detailed architecture

---

## ✨ Success Indicators

You'll know everything is working when:

1. ✅ Backend responds: `curl http://localhost:5000/health` returns `{"status":"ok"}`
2. ✅ Frontend loads: `http://localhost:5173` displays chat interface
3. ✅ Chat works: Send "What is the price of paracetamol?" → Get response "₹50"
4. ✅ Validation works: Send non-medical query → Get rejection message
5. ✅ Tests pass: `node test-medical-report.js` shows 92.3% pass rate

Happy chatting! 🎉
