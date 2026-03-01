# UserDashboard Testing Guide

## ✅ Backend Status
The backend is **100% WORKING**. We've verified this with automated tests.

- **Endpoint:** `GET http://localhost:5000/api/user/dashboard`
- **Test Result:** ✅ Returns correct data when given a valid JWT token
- **Test File:** `test-login-dashboard.js` (see output below)

### Test Output Summary
```
✅ Login successful!
   Token: eyJhbGciOiJIUzI1NiIs...
   User ID: 4

✅ Dashboard data retrieved!
   Total Orders: 3
   Active Medications: 3
      1. Paracetamol - Qty: 2, Price: $100.00
      2. Aspirin - Qty: 2, Price: $80.00
      3. Cough Syrup - Qty: 3, Price: $360.00
   Refill Alerts: 0
   Total Chats: 0

✅ All tests passed!
```

---

## 🧪 Frontend Testing Instructions

We've created a test user with data. Use these credentials to test the frontend:

### Test Account Credentials
```
Email: dashboardtest@pharmacy.com
Password: test12345
```

### Step-by-Step Testing

#### 1. Start the Frontend Server
```bash
cd FrontEnd
npm run dev
```
This starts Vite dev server (usually at http://localhost:5173)

#### 2. Navigate to Login Page
- Open browser: `http://localhost:5173`
- Click "Login" button

#### 3. Enter Test Credentials
- **Email:** `dashboardtest@pharmacy.com`
- **Password:** `test12345`
- Click "Sign in"

#### 4. Open Browser Developer Tools
- Press **F12** to open Developer Tools
- Click the **Console** tab
- Look for logged messages (the frontend will log detailed information)

#### 5. Verify Login Success
You should see console logs like:
```
Login Success: {token: "eyJ...", user: {user_id: 4, username: "Dashboard Tester", ...}}
✅ User data stored: {user_id: 4, username: "Dashboard Tester", ...}
```

#### 6. Navigate to Dashboard
- After login, you should be redirected to the dashboard
- Or click "Dashboard" in the navigation menu

#### 7. Check Console Logs
With the Console open (F12), you should see detailed logs:
```
🔍 Token check: ✅ Found
📊 Fetching user dashboard...
   URL: http://localhost:5000/api/user/dashboard
   Token: eyJhbGciOiJIUzI1NiIs...
✅ Dashboard API Response: {
  totalOrders: 3,
  activeMedications: [
    {medicine_name: "Paracetamol", quantity: 2, total_price: "100.00"},
    {medicine_name: "Aspirin", quantity: 2, total_price: "80.00"},
    {medicine_name: "Cough Syrup", quantity: 3, total_price: "360.00"}
  ],
  refillAlerts: [],
  totalChats: 0
}
   Total Orders: 3
   Active Medications: 3
   Refill Alerts: 0
   Total Chats: 0
```

#### 8. Dashboard Should Display
The UserDashboard should show:
```
Welcome Back 👋

Stat Cards:
├─ Total Orders: 3
├─ Active Medications: 3
├─ Refill Alerts: 0
└─ AI Interactions: 0

Active Medications:
├─ Paracetamol - Quantity: 2 | Price: ₹100.00
├─ Aspirin - Quantity: 2 | Price: ₹80.00
└─ Cough Syrup - Quantity: 3 | Price: ₹360.00

AI Refill Alerts:
└─ No refill alerts. You're all set 👍
```

---

## 🔍 Troubleshooting

### Issue: Dashboard shows 0 values
1. **Check Console** (F12 → Console tab)
2. **Look for error messages** - they will be logged with ❌ prefix
3. **Check localStorage** - Go to Application → Local Storage → localhost:5173
   - Should have `token`, `user`, `user_id` keys
   - If missing, login refreshed the page first

### Issue: "No authentication token found" error
1. Make sure you're logged in
2. Try logging out and logging back in
3. Check if cookies/localStorage are being blocked

### Issue: Network error 401 (Unauthorized)
1. Token may be expired or invalid
2. Log out and log back in
3. Check that the token isn't corrupted

### Issue: Network error 500 (Server error)
1. Make sure backend is running on localhost:5000
2. Check backend console for error messages
3. Run the test script: `node test-login-dashboard.js` to verify backend works

---

## 🟢 Verification Checklist

After testing, confirm all of these:

- [ ] Login page works with test credentials
- [ ] After login, redirected to dashboard
- [ ] Browser console shows "✅ User data stored" message
- [ ] Browser console shows "✅ Dashboard API Response"
- [ ] Dashboard displays 3 for Total Orders
- [ ] Dashboard displays 3 for Active Medications
- [ ] Dashboard displays 0 for Refill Alerts
- [ ] Dashboard displays 0 for AI Interactions
- [ ] Active Medications section shows all 3 medications
- [ ] No red error messages on the dashboard

---

## 📝 Test Files Available

If you want to run backend tests directly:

```bash
# Test complete login + dashboard flow
node test-login-dashboard.js

# Test dashboard endpoint directly with manual JWT
node test-dashboard-token.js

# Create another test user
node create-test-user.js

# Create orders for a user
node create-test-orders.js

# List all users in database
node check-users.js
```

---

## 🚀 Next Steps

If the testing is successful:
1. The UserDashboard feature is complete and working
2. Users can see their order history and medications
3. Integration is complete between frontend and backend

If there are issues:
1. Check the browser console logs for detailed error information
2. Ensure backend is running (`npm start` in BackEnd folder)
3. Ensure frontend is running (`npm run dev` in FrontEnd folder)
4. Verify both are using correct ports (backend: 5000, frontend: 5173)
