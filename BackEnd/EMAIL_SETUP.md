# Email Notification System Setup Guide

## Overview
This document explains how to set up and use the email notification system for order confirmations and low stock refill alerts.

## Features

### 1. **Order Confirmation Emails**
- Sent automatically when a user successfully places an order
- Includes order details, itemized list with prices, and order total
- Contains professional HTML formatting with order tracking ID

### 2. **Low Stock Refill Alerts**
- Sent automatically to admin when medicine stock falls below 20 units
- Includes medicine details, current stock level, and pricing information
- Helps admin manage inventory efficiently

## Environment Variables Setup

### Required SMTP Configuration
Add the following variables to your `.env` file in the BackEnd directory:

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
ADMIN_EMAIL=admin@pharmacy.com
TEST_EMAIL=test@example.com
```

### Using Gmail SMTP (Recommended)

1. **Enable 2-Factor Authentication on Gmail**
   - Go to myaccount.google.com
   - Select Security on the left menu
   - Enable 2-Step Verification

2. **Generate App Password**
   - Go to myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer"
   - Click Generate
   - Copy the 16-character password and use it as `SMTP_PASS`

3. **Allow Less Secure Apps (Alternative)**
   - If app passwords don't work, enable "Less secure app access"
   - Go to myaccount.google.com/lesssecureapps

### Using Other SMTP Providers

#### Gmail SMTP
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
```

#### Outlook/Hotmail SMTP
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
```

#### Yahoo Mail SMTP
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
```

#### Custom SMTP Server
```env
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
# or 465 for SSL
```

## Testing Email Configuration

### Run the Email Test
```bash
cd BackEnd
node test-email-notifications.js
```

This will:
- Send a test order confirmation email to `TEST_EMAIL`
- Send a test refill alert email to `ADMIN_EMAIL`
- Display success/error messages

### Expected Output
```
🧪 Testing Email Notifications System

📧 Test 1: Sending Order Confirmation Email...
✅ Order confirmation email sent successfully to: test@example.com

📧 Test 2: Sending Refill Alert Email...
✅ Refill alert email sent successfully to: admin@pharmacy.com

✅ All tests completed!
```

## Implementation Details

### Order Confirmation Email Flow

1. **User places an order** via POST `/api/orders`
2. **Order is created** in database with transaction
3. **User email is fetched** from users table
4. **Confirmation email is sent** with:
   - Order ID
   - Itemized medicine list
   - Total amount
   - Professional HTML template

### Refill Alert Email Flow

1. **Each medicine's stock is updated** when order is placed
2. **Stock is checked** against threshold (20 units)
3. **If stock < 20**, refill alert is sent to admin with:
   - Medicine name and ID
   - Current stock quantity
   - Minimum stock level
   - Unit price

## Code Integration

### Order Controller (`src/controllers/order.controller.js`)

The `createOrder` function now includes:

```javascript
// 1. Fetch user email
const userResult = await db.query(
  "SELECT username, email FROM users WHERE user_id = $1",
  [userId]
);

// 2. Create order and process items
// ... order creation logic ...

// 3. Check stock and send refill alerts
if (newStock < LOW_STOCK_THRESHOLD) {
  await sendRefillAlert({ ... });
}

// 4. Send order confirmation
await sendOrderConfirmation(userEmail, userName, { ... });
```

### Email Functions

#### `sendOrderConfirmation(userEmail, userName, orderDetails)`
```javascript
- userEmail: String (recipient email)
- userName: String (customer name)
- orderDetails: Object {
    orderId: Number,
    items: Array[{medicine_name, quantity, price, total_amount}],
    totalAmount: Number
  }
```

#### `sendRefillAlert(medicineDetails)`
```javascript
- medicineDetails: Object {
    medicine_name: String,
    medicine_id: Number,
    stock_quantity: Number,
    min_stock_level: Number,
    price: Number
  }
```

## Troubleshooting

### Email Not Sending?

#### 1. Check SMTP Credentials
```bash
# Verify .env file has correct SMTP settings
cat .env | grep SMTP
```

#### 2. Check SMTP Connection Status
Watch the server startup logs:
```
✅ SMTP server is ready to send emails
```

#### 3. Enable Debug Mode
Add this to test the SMTP connection:
```javascript
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  // ... config ...
});

transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP Error:", error);
  } else {
    console.log("SMTP Ready:", success);
  }
});
```

#### 4. Check Email Logs in Backend Console
```
✅ Order confirmation email sent to: user@example.com
✅ Refill alert email sent for: Aspirin 500mg
```

### Common Issues

| Issue | Solution |
|-------|----------|
| "Invalid login" error | Re-check SMTP_USER and SMTP_PASS in .env |
| "Connection timeout" | Verify SMTP_HOST and SMTP_PORT are correct |
| Emails going to spam | Check SMTP_USER matches "From" address |
| Gmail rejection | Enable 2FA and generate app password |
| No ADMIN_EMAIL configured | Add `ADMIN_EMAIL=admin@pharmacy.com` to .env |

## Email Templates

### Order Confirmation Email
- Professional header with checkmark ✅
- Customer greeting
- Order details table (Medicine, Quantity, Price, Total)
- Order summary box (Order ID, Total, Date)
- Footer with note

### Refill Alert Email
- Warning header with alert emoji 🚨
- Medicine details section with yellow background
- Current stock in large red text
- Minimum stock level
- Professional footer

## Future Enhancements

- [ ] Email delivery tracking
- [ ] Customizable email templates
- [ ] Scheduled digest emails for multiple low-stock alerts
- [ ] Email unsubscribe links
- [ ] Attachment support (receipts, invoices)
- [ ] Multi-language email support
- [ ] SMS notifications as backup

## Support

For issues or questions about email setup:
1. Check the Troubleshooting section above
2. Review server logs for SMTP errors
3. Verify .env configuration is correct
4. Run test-email-notifications.js to diagnose
