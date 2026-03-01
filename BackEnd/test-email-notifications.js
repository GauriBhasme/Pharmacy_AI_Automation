import transporter from "./src/mailer.js";
import dotenv from "dotenv";

dotenv.config();

console.log("🧪 Testing Email Notifications System\n");

// Test 1: Send Order Confirmation Email
const sendTestOrderConfirmation = async () => {
  console.log("📧 Test 1: Sending Order Confirmation Email...");

  const userEmail = process.env.TEST_EMAIL || "test@example.com";
  const userName = "Test User";
  const orderDetails = {
    orderId: 12345,
    items: [
      {
        medicine_name: "Paracetamol 500mg",
        quantity: 2,
        price: 50,
        total_amount: 100,
      },
      {
        medicine_name: "Vitamin C 1000mg",
        quantity: 1,
        price: 150,
        total_amount: 150,
      },
    ],
    totalAmount: 250,
  };

  const itemsHTML = orderDetails.items
    .map(
      (item) =>
        `<tr>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.medicine_name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">₹${item.price}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">₹${item.total_amount}</td>
    </tr>`
    )
    .join("");

  try {
    await transporter.sendMail({
      from: `"Online Pharmacy" <${process.env.SMTP_USER}>`,
      to: userEmail,
      subject: "🛒 Order Confirmation - Thank You!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #27ae60;">Order Confirmed ✅</h2>
          <p>Dear <strong>${userName}</strong>,</p>
          <p>Thank you for your order! Your medicines will be delivered soon.</p>
          
          <h3>🔔 Order Details:</h3>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background-color: #f0f0f0;">
                <th style="padding: 10px; text-align: left;">Medicine Name</th>
                <th style="padding: 10px; text-align: center;">Quantity</th>
                <th style="padding: 10px; text-align: right;">Unit Price</th>
                <th style="padding: 10px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px;">
            <p><strong>Order ID:</strong> #${orderDetails.orderId}</p>
            <p><strong>Order Total:</strong> ₹${orderDetails.totalAmount}</p>
            <p><strong>Order Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          
          <p style="margin-top: 20px; color: #666;">
            You can track your order using the Order ID provided above. If you have any questions, please contact our support team.
          </p>
          
          <p style="border-top: 1px solid #ddd; margin-top: 20px; padding-top: 10px; color: #999; font-size: 12px;">
            This is an automated email. Please do not reply to this email.
          </p>
        </div>
      `,
    });

    console.log("✅ Order confirmation email sent successfully to:", userEmail);
  } catch (error) {
    console.error("❌ Error sending order confirmation email:", error.message);
  }
};

// Test 2: Send Refill Alert Email
const sendTestRefillAlert = async () => {
  console.log("\n📧 Test 2: Sending Refill Alert Email...");

  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    console.warn(
      "⚠️ ADMIN_EMAIL not set in environment variables. Skipping refill alert test."
    );
    return;
  }

  const medicineDetails = {
    medicine_name: "Aspirin 500mg",
    medicine_id: 5,
    stock_quantity: 15,
    min_stock_level: 20,
    price: 25,
  };

  try {
    await transporter.sendMail({
      from: `"Online Pharmacy System" <${process.env.SMTP_USER}>`,
      to: adminEmail,
      subject: `⚠️ Low Stock Alert: ${medicineDetails.medicine_name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #e74c3c;">🚨 Stock Refill Alert</h2>
          <p>A medicine has reached low stock levels and needs to be refilled.</p>
          
          <div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0; border-radius: 4px;">
            <h3 style="margin-top: 0; color: #856404;">Medicine Details:</h3>
            <p><strong>Medicine Name:</strong> ${medicineDetails.medicine_name}</p>
            <p><strong>Medicine ID:</strong> ${medicineDetails.medicine_id}</p>
            <p><strong>Current Stock:</strong> <span style="color: #e74c3c; font-size: 18px;"><strong>${medicineDetails.stock_quantity}</strong></span> units</p>
            <p><strong>Minimum Stock Level:</strong> ${medicineDetails.min_stock_level} units</p>
            <p><strong>Price per Unit:</strong> ₹${medicineDetails.price}</p>
          </div>
          
          <p style="color: #666;">
            Please review the stock levels and place a reorder if necessary.
          </p>
          
          <p style="border-top: 1px solid #ddd; margin-top: 20px; padding-top: 10px; color: #999; font-size: 12px;">
            This is an automated alert from the Pharmacy Management System.
          </p>
        </div>
      `,
    });

    console.log(
      "✅ Refill alert email sent successfully to:",
      adminEmail
    );
  } catch (error) {
    console.error("❌ Error sending refill alert email:", error.message);
  }
};

// Run tests
const runTests = async () => {
  try {
    await sendTestOrderConfirmation();
    await sendTestRefillAlert();
    console.log("\n✅ All tests completed!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }
};

runTests();
