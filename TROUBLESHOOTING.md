# 🔧 Troubleshooting Checklist - Medical Pharmacy Chatbot

## Pre-Launch Checklist

- [ ] PostgreSQL is running on localhost
- [ ] Database `pharmacy_ai` exists
- [ ] `.env` file exists in `BackEnd` folder with credentials:
  ```
  DB_HOST=localhost
  DB_USER=postgres
  DB_PASSWORD=super
  DB_NAME=pharmacy_ai
  NODE_ENV=development
  ```
- [ ] `medicines` table has been seeded (`node seed-medicines.js`)
- [ ] Node.js is installed (`node --version`)
- [ ] Port 5000 is not in use
- [ ] Port 5173 is not in use

---

## Backend Server Issues

### ❌ "ECONNREFUSED" - Cannot connect to PostgreSQL

**Checklist:**
- [ ] Is PostgreSQL service running?
  - Windows: Check Services app for "PostgreSQL" or similar
  - Linux: `sudo systemctl status postgresql`
  - Mac: `brew services list`

- [ ] Are the .env credentials correct?
  ```bash
  # Test connection
  psql -h localhost -U postgres -d pharmacy_ai -c "SELECT 1;"
  ```

- [ ] Does the database exist?
  ```bash
  psql -U postgres -c "\l" | grep pharmacy_ai
  ```

- [ ] Create database if needed:
  ```bash
  psql -U postgres -c "CREATE DATABASE pharmacy_ai;"
  ```

**Action:** If still failing, run: `node seed-medicines.js`

---

### ❌ "EADDRINUSE" - Port 5000 already in use

**Check what's using port 5000:**
```bash
# Windows
netstat -ano | findstr :5000

# Mac/Linux
lsof -i :5000
```

**Options:**
1. Kill the process using port 5000
2. Change port in `.env`: `PORT=5001`
3. Restart your computer

---

### ❌ "ERR_MODULE_NOT_FOUND" - Missing dependencies

**Solution:**
```bash
cd BackEnd
npm install
```

Then restart: `node src/server.js`

---

### ❌ "SyntaxError: Unexpected token" - Code error

**Check:**
1. Are you in the `BackEnd` folder?
2. Try: `node --check src/server.js`
3. Check for special characters in .env file

**Restart:** Delete `node_modules` and reinstall:
```bash
rm -r node_modules
npm install
npm start
```

---

## Frontend Issues

### ❌ "Cannot GET http://localhost:5173"

**Solution:**
```bash
cd FrontEnd
npm install
npm run dev
```

Wait for: `➜ Local: http://localhost:5173/`

---

### ❌ "Chat returns 'error communicating with AI agent'"

**Diagnostic steps:**

1. **Check backend is running:**
   ```bash
   curl http://localhost:5000/health
   ```
   - Should return: `{"status":"ok","database":"connected"}`

2. **Check database has medicines:**
   ```bash
   node test-medical-report.js
   ```
   - Should show: "92.3% pass rate"

3. **Test the endpoint directly:**
   ```bash
   curl -X POST http://localhost:5000/api/agent/chat \
     -H "Content-Type: application/json" \
     -d '{"message":"What is the price of paracetamol?"}'
   ```

4. **Check browser console:**
   - Open DevTools (F12)
   - Go to Console tab
   - Look for error messages
   - Check Network tab for request/response

5. **Verify CORS:**
   ```bash
   curl -i -H "Origin: http://localhost:5173" http://localhost:5000/health
   ```
   Should include: `access-control-allow-origin: http://localhost:5173`

**Restart both servers:**
```bash
# Terminal 1
cd BackEnd
node src/server.js

# Terminal 2
cd FrontEnd
npm run dev
```

---

### ❌ "TypeError: Cannot read property 'message'"

**Cause:** Backend not receiving message from frontend

**Check:**
1. Open DevTools (F12) → Network tab
2. Send a message in chat
3. Look for POST request to `http://localhost:5000/api/agent/chat`
4. Click on request → Payload tab
5. Should show: `{"message":"your text"}`

**If payload is missing:**
- Check ChatPage.jsx line 128-140
- Verify handleSend() function exists
- Restart frontend: `npm run dev`

---

## Database Issues

### ❌ "medicines table does not exist"

**Solution:**
```bash
cd BackEnd
node seed-medicines.js
```

This will:
- ✅ Create `medicines` table automatically
- ✅ Insert 10 sample medicines
- ✅ Set up proper schema

Verify:
```bash
psql -U postgres -d pharmacy_ai -c "SELECT COUNT(*) FROM medicines;"
```

Should return: `10`

---

### ❌ "No rows returned" for queries

**Check if medicines table has data:**
```bash
psql -U postgres -d pharmacy_ai -c "SELECT name, price FROM medicines LIMIT 5;"
```

Should show:
```
       name        | price
-------------------+-------
 Paracetamol       |    50
 Aspirin           |    40
 Ibuprofen         |    60
 ...
```

If empty, run: `node seed-medicines.js`

---

## Complete System Test

Run this to test everything:

```bash
# Terminal 1 - Backend
cd BackEnd
node src/server.js

# Wait for "Server running on port 5000"

# Terminal 2 - Test backend
curl http://localhost:5000/health

# Terminal 3 - Seed database
cd BackEnd
node seed-medicines.js

# Terminal 4 - Run tests
cd BackEnd
node test-medical-report.js

# Terminal 5 - Frontend
cd FrontEnd
npm run dev

# Terminal 6 - Manual API test
curl -X POST http://localhost:5000/api/agent/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"price of paracetamol"}'
```

**Expected Results:**
- ✅ Backend: Server running message
- ✅ Health: `{"status":"ok","database":"connected"}`
- ✅ Seed: Database seeded successfully
- ✅ Tests: 12/13 passing (92.3%)
- ✅ Frontend: Running on port 5173
- ✅ API test: Returns medicine price

---

## Contact Server Logs

When opening new terminal to test API, the server terminal should show logs like:

```
[2024-01-15T10:30:45.123Z] POST /api/agent/chat
  Body: {"message":"price of paracetamol"}
  Processing medical query...
  Found medicine: Paracetamol
  Returning price: ₹50
```

If you see errors in these logs, that's the issue to fix.

---

## Nuclear Option: Complete Reset

If everything is broken, try this:

```bash
# Kill all Node processes
# Windows: taskkill /F /IM node.exe
# Mac/Linux: killall node

# Stop PostgreSQL
# (Check your system's instructions)

# Start fresh
cd BackEnd
rm -r node_modules
npm install
node seed-medicines.js

# In new terminal
cd FrontEnd
rm -r node_modules
npm install

# Restart PostgreSQL
# (Check your system's instructions)

# Start server
cd BackEnd
node src/server.js

# Start frontend (in new terminal)
cd FrontEnd
npm run dev
```

---

## Quick Reference Ports & URLs

| Service | Port | URL |
|---------|------|-----|
| Backend API | 5000 | http://localhost:5000 |
| Health Check | 5000 | http://localhost:5000/health |
| Chat Endpoint | 5000 | http://localhost:5000/api/agent/chat |
| Frontend | 5173 | http://localhost:5173 |
| PostgreSQL | 5432 | localhost (internal only) |

---

## Still Having Issues?

1. **Check this file:** [STARTUP_GUIDE.md](./STARTUP_GUIDE.md)
2. **Read implementation:** [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)
3. **Run tests:** `node test-medical-report.js`
4. **Check logs:** Review backend console output
5. **Check database:** `psql -U postgres -d pharmacy_ai -c "\d medicines;"`

**Share these details when asking for help:**
- Backend console output (full error message)
- Frontend DevTools Console errors
- `.env` file (without passwords)
- Output of `node test-medical-report.js`
- PostgreSQL version: `psql --version`
- Node version: `node --version`
