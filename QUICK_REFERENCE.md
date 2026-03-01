# 🚀 Quick Reference - Medical Pharmacy Chatbot

## 🏃 Start Here (Choose One)

### Option A: Windows Batch (Easiest)
```
1. Navigate to: BackEnd folder
2. Double-click: START.bat
3. Backend runs ✅
```

### Option B: Command Line
```bash
# Terminal 1 - Backend
cd BackEnd
node src/server.js

# Terminal 2 - Frontend
cd FrontEnd
npm run dev
```

### Option C: PowerShell
```powershell
.\START_BACKEND.ps1
# In new terminal:
cd FrontEnd; npm run dev
```

---

## ✅ Verify Everything

```bash
# Check backend is running
curl http://localhost:5000/health

# Check frontend is running
# Open: http://localhost:5173

# Test the chatbot
curl -X POST http://localhost:5000/api/agent/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"price of paracetamol"}'
```

Expected response:
```json
{
  "response": "The price of Paracetamol is ₹50"
}
```

---

## 🔧 Setup (First Time Only)

```bash
# 1. Create database
psql -U postgres -c "CREATE DATABASE pharmacy_ai;"

# 2. Seed medicines (run from BackEnd folder)
cd BackEnd
node seed-medicines.js

# 3. Install dependencies
npm install

# 4. Frontend dependencies
cd FrontEnd
npm install
```

Then use "Start Here" options above.

---

## 🧪 Run Tests

```bash
cd BackEnd
node test-medical-report.js
```

Expected: 92.3% pass rate (12/13 tests)

---

## 📱 Chat Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/agent/chat` | POST | Send medical queries |
| `/api/chat/chat` | POST | Alternative endpoint |
| `/health` | GET | Check server status |

---

## 🧠 Try These Queries

✅ Working:
- "What is the price of paracetamol?"
- "What is the dosage for ibuprofen?"
- "I have a fever, what medicine?"
- "Order 2 units of aspirin"

❌ Rejected:
- "What is the capital of France?"
- "Tell me a joke"

---

## 🆘 Not Working?

| Problem | Solution |
|---------|----------|
| "Cannot connect to localhost:5000" | Backend not running. Run: `cd BackEnd && node src/server.js` |
| "Port 5000 in use" | Kill process: `taskkill /F /IM node.exe` (Windows) or use different port |
| "Database connection failed" | PostgreSQL not running. Start PostgreSQL service. |
| "medicines table not found" | Run: `cd BackEnd && node seed-medicines.js` |
| "Chat returns error" | Check backend console. Restart: Stop and run `node src/server.js` again |
| "Frontend not loading" | Run: `cd FrontEnd && npm install && npm run dev` |

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for detailed help.

---

## 📋 Default Credentials & Ports

```
Backend Port: 5000
Frontend Port: 5173
PostgreSQL: localhost:5432

Database:
  Name: pharmacy_ai
  User: postgres
  Password: super
  Host: localhost
```

---

## 🎯 Success Indicators

✅ Everything working when:
1. `curl http://localhost:5000/health` returns OK
2. `http://localhost:5173` loads without errors
3. Chat message "price of paracetamol" returns "₹50"
4. Non-medical query rejected with helpful message
5. `node test-medical-report.js` shows 92.3% pass rate

---

## 📚 Documentation

- **Need to setup?** → [STARTUP_GUIDE.md](./STARTUP_GUIDE.md)
- **Having issues?** → [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- **Want details?** → [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)
- **Full info?** → [README.md](./README.md)

---

## 🔄 Common Commands

```bash
# Start backend
cd BackEnd && node src/server.js

# Start frontend
cd FrontEnd && npm run dev

# Seed database
cd BackEnd && node seed-medicines.js

# Run tests
cd BackEnd && node test-medical-report.js

# Check health
curl http://localhost:5000/health

# Query chatbot
curl -X POST http://localhost:5000/api/agent/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"price of paracetamol"}'

# View medicines in database
psql -U postgres -d pharmacy_ai -c "SELECT * FROM medicines;"
```

---

## 🎨 File Locations

```
📁 Pharmacy_AI_Automation/
├── 📄 README.md                (← Start here)
├── 📄 STARTUP_GUIDE.md         (← How to run)
├── 📄 TROUBLESHOOTING.md       (← Help & fixes)
├── 📁 BackEnd/
│   ├── 📄 START.bat            (← Double-click to start)
│   ├── 📁 src/
│   │   └── 📄 server.js        (← Backend entry point)
│   ├── 📄 seed-medicines.js    (← Database setup)
│   ├── 📄 test-medical-report.js (← Test suite)
│   └── 📄 .env                 (← Config)
└── 📁 FrontEnd/
    └── 📄 vite.config.js
```

---

## 🚦 Status Indicators

| Indicator | Meaning | Action |
|-----------|---------|--------|
| ✅ Green | Working | Continue |
| ⚠️ Yellow | Warning | Check logs |
| ❌ Red | Error | See TROUBLESHOOTING.md |

---

**Questions?** See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

**Ready to go?** Run one of the "Start Here" options! 🚀
