# 🏥 Complete Setup & Installation Guide

## Table of Contents
1. [System Requirements](#system-requirements)
2. [Installation Steps](#installation-steps)
3. [Quick Start](#quick-start)
4. [Verification](#verification)
5. [Troubleshooting](#troubleshooting)

---

## System Requirements

### Minimum Requirements
- **Windows 10+** (or Mac/Linux)
- **Node.js 14+** (download from nodejs.org)
- **PostgreSQL 12+** (download from postgresql.org)
- **4GB RAM**
- **2GB Disk Space**

### Verify Installation
```bash
# Check Node.js
node --version

# Check npm
npm --version

# Check PostgreSQL
psql --version
```

---

## Installation Steps

### Step 1: PostgreSQL Setup

#### Windows:
1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Run installer with default settings
3. Remember the password for `postgres` user
4. PostgreSQL will start automatically

#### Verify PostgreSQL Running:
```bash
# Should return a version number
psql --version

# Test connection
psql -U postgres -c "\q"
```

### Step 2: Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE pharmacy_ai;

# Verify
\l

# Exit
\q
```

Or one-liner:
```bash
psql -U postgres -c "CREATE DATABASE pharmacy_ai;"
```

### Step 3: Backend Setup

#### Clone/Navigate to Project
```bash
cd c:\gitproject\Pharmacy_AI_Automation
```

#### Configure Environment
1. Go to `BackEnd` folder
2. Open `.env` file with notepad
3. Update with your PostgreSQL credentials:
   ```
   DB_HOST=localhost
   DB_USER=postgres
   DB_PASSWORD=super          # Your PostgreSQL password
   DB_NAME=pharmacy_ai
   NODE_ENV=development
   PORT=5000
   ```
4. Save file

#### Install Dependencies
```bash
cd BackEnd
npm install
```

#### Seed Database
```bash
node seed-medicines.js
```

Expected output:
```
✅ Database table created successfully
✅ 10 medicines seeded successfully
```

### Step 4: Frontend Setup

```bash
cd FrontEnd
npm install
```

---

## Quick Start

### Method 1: Windows Batch File (Easiest)

**Terminal 1 - Backend:**
```bash
cd BackEnd
# Double-click START.bat
# Or run:
node src/server.js
```

**Terminal 2 - Frontend:**
```bash
cd FrontEnd
npm run dev
```

**Result:**
- Backend: http://localhost:5000
- Frontend: http://localhost:5173

### Method 2: Command Line

**Terminal 1:**
```bash
cd BackEnd
node src/server.js
```

Wait for:
```
Server running on port 5000
```

**Terminal 2:**
```bash
cd FrontEnd
npm run dev
```

Wait for:
```
VITE v4.x.x  ready
➜ Local: http://localhost:5173/
```

### Method 3: PowerShell

**Terminal 1:**
```powershell
cd .\Pharmacy_AI_Automation
.\START_BACKEND.ps1
```

**Terminal 2:**
```powershell
cd FrontEnd
npm run dev
```

---

## Verification

### 1. Backend Health Check
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{"status":"ok","database":"connected"}
```

### 2. Database Verification
```bash
psql -U postgres -d pharmacy_ai -c "SELECT COUNT(*) FROM medicines;"
```

Expected: `10`

### 3. Test API Endpoint
```bash
curl -X POST http://localhost:5000/api/agent/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What is the price of paracetamol?"}'
```

Expected response:
```json
{
  "response": "The price of Paracetamol is ₹50",
  "intent": "PRICE",
  "medicine": "Paracetamol"
}
```

### 4. Frontend Loading
Open browser: http://localhost:5173

Expected: Chat interface loads without console errors

### 5. End-to-End Test
1. Go to http://localhost:5173
2. Navigate to chat page
3. Send message: "What is the price of paracetamol?"
4. See response: "The price of Paracetamol is ₹50"

### 6. Run Test Suite
```bash
cd BackEnd
node test-medical-report.js
```

Expected: 12/13 passing (92.3% success rate)

---

## File Structure After Setup

```
Pharmacy_AI_Automation/
├── BackEnd/
│   ├── src/
│   │   ├── server.js
│   │   ├── app.js
│   │   ├── db.js
│   │   ├── controllers/
│   │   │   └── agent.controller.js
│   │   └── routes/
│   │       └── agent.routes.js
│   ├── node_modules/              ✅ Created by npm install
│   ├── .env                        ✅ Configure your credentials
│   ├── package.json
│   ├── seed-medicines.js
│   ├── test-medical-report.js
│   └── START.bat
│
├── FrontEnd/
│   ├── src/
│   │   ├── pages/User/ChatPage.jsx
│   │   ├── App.jsx
│   │   └── components/
│   ├── node_modules/              ✅ Created by npm install
│   ├── package.json
│   └── vite.config.js
│
├── README.md
├── STARTUP_GUIDE.md
├── QUICK_REFERENCE.md
├── TROUBLESHOOTING.md
├── START_BACKEND.ps1
└── diagnose.ps1

PostgreSQL Database:
├── pharmacy_ai (database)          ✅ Created manually
│   └── medicines table             ✅ Created by seed-medicines.js
│       └── 10 sample records       ✅ Seeded by seed-medicines.js
```

---

## Troubleshooting

### Issue: npm install fails

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Try install again
npm install

# If still failing, check Node.js version >= 14
node --version
```

### Issue: Port 5000/5173 already in use

**Solution for Windows:**
```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process
taskkill /PID <PID> /F

# Try again
node src/server.js
```

### Issue: PostgreSQL connection refused

**Solution:**
```bash
# Check if PostgreSQL is running
# Windows: Check Services app for "PostgreSQL" service
# Mac/Linux: brew services list

# Verify .env credentials match your psql setup
psql -h localhost -U postgres -d pharmacy_ai -c "SELECT 1;"

# If failed, update .env with correct credentials
```

### Issue: Missing database

**Solution:**
```bash
# Create database
psql -U postgres -c "CREATE DATABASE pharmacy_ai;"

# Seed medicines
cd BackEnd
node seed-medicines.js
```

### Issue: Medicine table is empty

**Solution:**
```bash
cd BackEnd
node seed-medicines.js

# Verify
psql -U postgres -d pharmacy_ai -c "SELECT COUNT(*) FROM medicines;"
# Should return: 10
```

### Issue: Chat returns "error communicating with AI agent"

**Debug Steps:**
1. Check backend is running:
   ```bash
   curl http://localhost:5000/health
   ```

2. Check database has medicines:
   ```bash
   psql -U postgres -d pharmacy_ai -c "SELECT * FROM medicines LIMIT 1;"
   ```

3. Run test suite:
   ```bash
   cd BackEnd
   node test-medical-report.js
   ```

4. Check browser console (F12) for JavaScript errors

---

## First Time Complete Walkthrough

### Part 1: Initial Setup (15 minutes)

1. **Install PostgreSQL**
   - Download from postgresql.org
   - Run installer (note password for postgres user)

2. **Create Database**
   ```bash
   psql -U postgres -c "CREATE DATABASE pharmacy_ai;"
   ```

3. **Navigate to Project**
   ```bash
   cd c:\gitproject\Pharmacy_AI_Automation
   ```

4. **Configure Backend**
   - Open `BackEnd\.env`
   - Update credentials if needed
   - Save

5. **Install Dependencies**
   ```bash
   cd BackEnd
   npm install
   
   cd ..\FrontEnd
   npm install
   ```

6. **Seed Database**
   ```bash
   cd BackEnd
   node seed-medicines.js
   ```

### Part 2: Running Application (5 minutes)

**Terminal 1 - Backend:**
```bash
cd BackEnd
node src/server.js
```

Wait for: `Server running on port 5000`

**Terminal 2 - Frontend:**
```bash
cd FrontEnd
npm run dev
```

Wait for: `VITE ready at http://localhost:5173`

### Part 3: Testing (5 minutes)

1. **Open Browser**
   - Go to: http://localhost:5173

2. **Navigate to Chat**
   - Click on User Dashboard or Chat button

3. **Send Test Message**
   - Type: "What is the price of paracetamol?"
   - Expected: "The price of Paracetamol is ₹50"

4. **Test Non-Medical Query**
   - Type: "What is the capital of France?"
   - Expected: Rejected with helpful message

5. **Run Test Suite**
   ```bash
   cd BackEnd
   node test-medical-report.js
   ```
   - Expected: 12/13 passing (92.3%)

### Part 4: Troubleshooting (if needed)

If something doesn't work:
1. Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
2. Run diagnostic: `.\diagnose.ps1`
3. Check backend console logs
4. Verify database: `psql -U postgres -d pharmacy_ai -c "SELECT * FROM medicines;"`

---

## Success Checklist

- [ ] Node.js installed (version >= 14)
- [ ] PostgreSQL installed and running
- [ ] Database `pharmacy_ai` created
- [ ] `.env` file configured in BackEnd
- [ ] Dependencies installed: `npm install` in both BackEnd and FrontEnd
- [ ] Database seeded: `node seed-medicines.js` completed
- [ ] Backend starts without errors: `node src/server.js`
- [ ] Frontend starts: `npm run dev` from FrontEnd folder
- [ ] Health check works: `curl http://localhost:5000/health`
- [ ] Chat endpoint works: POST to /api/agent/chat
- [ ] Frontend loads: http://localhost:5173
- [ ] Chat works: Send message, receive response
- [ ] Validation works: Non-medical query rejected
- [ ] Test suite passes: 12/13 tests (92.3%)

---

## Next Steps

Once everything is running:

1. **Explore Features**
   - Try different types of queries
   - Test medicine price lookup
   - Test dosage information
   - Test symptom recommendations
   - Place an order

2. **Customize**
   - Add more medicines to database: `BackEnd/src/db.js`
   - Modify medical keywords: `BackEnd/src/controllers/agent.controller.js`
   - Customize chat UI: `FrontEnd/src/pages/User/ChatPage.jsx`

3. **Deploy**
   - See IMPLEMENTATION_SUMMARY.md for deployment options

---

## Getting Help

1. **Read Documentation**
   - [README.md](./README.md) - Overview
   - [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Quick commands
   - [STARTUP_GUIDE.md](./STARTUP_GUIDE.md) - Detailed startup
   - [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common issues

2. **Run Diagnostics**
   - Windows: `.\diagnose.ps1`
   - Mac/Linux: `bash diagnose.sh`

3. **Check Logs**
   - Backend console for server errors
   - Browser DevTools (F12) for frontend errors
   - PostgreSQL logs for database errors

4. **Common Commands**
   ```bash
   # Check backend health
   curl http://localhost:5000/health
   
   # View database medicines
   psql -U postgres -d pharmacy_ai -c "SELECT * FROM medicines;"
   
   # Run tests
   cd BackEnd && node test-medical-report.js
   
   # Clear npm cache
   npm cache clean --force
   ```

---

**You're all set!** 🎉 Happy chatting with your Medical Pharmacy Chatbot!
