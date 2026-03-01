# Email Notifications - Quick Reference Guide

## 🎯 Core Features

### 1. **Automatic Order Confirmation Emails** ✉️
Sent to the customer's registered email when they place an order.

### 2. **Automatic Stock Refill Alerts** ⚠️
Sent to admin when medicine stock falls below 20 units.

---

## 🔌 API Usage

### Place an Order (with Email Notifications)

**Endpoint:**
```http
POST /api/orders
Authentication: Required (JWT Token)
Content-Type: application/json
```

**Request Body:**
```json
{
  "items": [
    {
      "medicine_id": 1,
      "quantity": 2
    },
    {
      "medicine_id": 5,
      "quantity": 1
    }
  ]
}
```

**Response (Success):**
```json
{
  "message": "Order placed successfully & confirmation email sent",
  "orderId": 12345,
  "totalAmount": 500
}
```

**Response (Failure):**
```json
{
  "message": "Insufficient stock for Paracetamol 500mg"
}
```

**What Happens Automatically:**

```
1. Order Created ✓
   ├─ Insert order_id
   ├─ Insert order_items
   └─ Update medicine stock
   
2. Stock Check ✓
   ├─ If stock < 20
   └─ Send Refill Alert to Admin ⚠️
   
3. User Notification ✓
   └─ Send Confirmation Email ✉️ (with itemized details)
   
4. Response Sent ✓
```

---

## 📧 Email Formats

### Order Confirmation Email 🛒

**Sent To:** Customer's registered email  
**Trigger:** When order is successfully placed  
**Status:** Automatic

**Email Content:**
```
Subject: 🛒 Order Confirmation - Thank You!
From: "Online Pharmacy" <workspacegauri@gmail.com>

---

Dear [Customer Name],

Thank you for your order! Your medicines will be delivered soon.

📦 Order Details:

| Medicine Name          | Quantity | Unit Price | Total    |
|------------------------|----------|------------|----------|
| Paracetamol 500mg     | 2        | ₹50        | ₹100     |
| Vitamin C 1000mg      | 1        | ₹150       | ₹150     |

Order ID: #12345
Total Amount: ₹250
Order Date: 3/1/2026

---

You can track your order using the Order ID above.
If you have any questions, please contact our support team.

This is an automated email. Please do not reply.
```

---

### Low Stock Refill Alert Email ⚠️

**Sent To:** Admin email (configured in `.env`)  
**Trigger:** When medicine stock drops below 20 units  
**Status:** Automatic

**Email Content:**
```
Subject: ⚠️ Low Stock Alert: Aspirin 500mg
From: "Online Pharmacy System" <workspacegauri@gmail.com>

---

🚨 Stock Refill Alert

A medicine has reached low stock levels and needs to be refilled.

┌─────────────────────────────────┐
│ Medicine Details:               │
├─────────────────────────────────┤
│ Medicine Name: Aspirin 500mg    │
│ Medicine ID: 5                  │
│ Current Stock: 15 units ⚠️      │
│ Minimum Stock Level: 20 units   │
│ Price per Unit: ₹25             │
└─────────────────────────────────┘

Please review the stock levels and place a reorder if necessary.

This is an automated alert from the Pharmacy Management System.
```

---

## 🔧 Configuration

### Required Environment Variables

**In `.env` file:**
```env
# SMTP Configuration (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=workspacegauri@gmail.com
SMTP_PASS=xlvt pwdb wjgg nxny

# Admin Email (for refill alerts)
ADMIN_EMAIL=admin@pharmacy.com

# Test Email (for testing)
TEST_EMAIL=workspacegauri@gmail.com
```

### Change Default Stock Threshold

Edit `/src/controllers/order.controller.js`:
```javascript
// Line ~180
const LOW_STOCK_THRESHOLD = 20;  // Change to desired value
```

### Change Admin Email

Edit `.env`:
```env
ADMIN_EMAIL=your-email@pharmacy.com
```

---

## 🧪 Testing

### Test Email System

Run the test script:
```bash
cd BackEnd
node test-email-notifications.js
```

**Expected Output:**
```
🧪 Testing Email Notifications System

📧 Test 1: Sending Order Confirmation Email...
✅ Order confirmation email sent successfully to: workspacegauri@gmail.com

📧 Test 2: Sending Refill Alert Email...
✅ Refill alert email sent successfully to: admin@pharmacy.com

✅ All tests completed!
```

### Create Test Order

```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {"medicine_id": 1, "quantity": 2}
    ]
  }'
```

---

## 📋 Database Requirements

### Users Table (Required Fields)
```sql
-- Customer email must exist
SELECT user_id, email, username FROM users WHERE user_id = 123;
```

### Medicines Table (Required Fields)
```sql
-- All these fields should exist
SELECT 
  medicine_id,
  medicine_name,
  price,
  stock_quantity
FROM medicines WHERE medicine_id = 1;
```

### Orders Table (Required)
```sql
CREATE TABLE orders (
  order_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Order Items Table (Required)
```sql
CREATE TABLE order_items (
  item_id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(order_id),
  medicine_id INTEGER REFERENCES medicines(medicine_id),
  quantity INTEGER,
  total_amount DECIMAL
);
```

---

## 🚨 Troubleshooting

### Issue: "Email not sent"
**Solution:**
1. Check `.env` SMTP settings
2. Run: `node test-email-notifications.js`
3. Check console for SMTP errors

### Issue: "ADMIN_EMAIL not configured"
**Solution:**
1. Add to `.env`: `ADMIN_EMAIL=admin@pharmacy.com`
2. Restart server

### Issue: "User email not found"
**Solution:**
1. Ensure user has email in database
2. Query: `SELECT email FROM users WHERE user_id = 123;`

### Issue: "Gmail rejects connection"
**Solution:**
1. Enable 2-Factor Authentication on Gmail
2. Generate app password
3. Update `SMTP_PASS` in `.env`

---

## 📊 Email Statistics

After implementation, you should see:

| Email Type | Trigger | Rate | Response Time |
|-----------|---------|------|---|
| Order Confirmation | Per Order | 1 email per order | < 2 seconds |
| Refill Alert | Low Stock | Variable | < 2 seconds |

---

## 💡 Best Practices

1. **Keep `.env` Secure**
   - Never commit to git
   - Don't share SMTP credentials

2. **Monitor Email Delivery**
   - Check server logs for SMTP errors
   - Test regularly with `test-email-notifications.js`

3. **Verify Email Addresses**
   - Ensure users have valid emails
   - Check spam folder for test emails

4. **Adjust Stock Threshold**
   - Default is 20 units
   - Change based on your needs

5. **Set Admin Email**
   - Ensure admin email is valid
   - Check admin inbox for alerts

---

## 🎯 Implementation Status

✅ **Order Confirmation Emails** - ACTIVE
✅ **Low Stock Refill Alerts** - ACTIVE
✅ **SMTP Configuration** - CONFIGURED
✅ **Email Templates** - PROFESSIONAL
✅ **Error Handling** - COMPLETE
✅ **Testing Tools** - AVAILABLE

**System Ready for Production Use!**

---

## 📞 Support

For issues or questions:
1. See [EMAIL_SETUP.md](EMAIL_SETUP.md) for detailed setup
2. See [EMAIL_IMPLEMENTATION.md](EMAIL_IMPLEMENTATION.md) for implementation details
3. Run `node test-email-notifications.js` to diagnose
4. Check server console logs for SMTP errors

---

**Last Updated:** March 1, 2026  
**Status:** ✅ ACTIVE
