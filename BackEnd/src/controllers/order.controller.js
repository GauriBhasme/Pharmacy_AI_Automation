import { db } from "../db.js";
import transporter from "../mailer.js";

// Send order confirmation email to user
export const sendOrderConfirmation = async (userEmail, userName, orderDetails) => {
  try {
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

    const mailOptions = {
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
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Order confirmation email sent to:", userEmail);
  } catch (error) {
    console.error("❌ Error sending order confirmation email:", error);
  }
};

// Send refill alert email to admin
export const sendRefillAlert = async (medicineDetails) => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      console.warn("⚠️ ADMIN_EMAIL not configured. Skipping refill alert.");
      return;
    }

    const mailOptions = {
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
            <p><strong>Minimum Stock Level:</strong> ${medicineDetails.min_stock_level || 20} units</p>
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
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Refill alert email sent for:", medicineDetails.medicine_name);
  } catch (error) {
    console.error("❌ Error sending refill alert email:", error);
  }
};

export const createOrder = async (req, res) => {
  try {
    const { items } = req.body;
    const userId = req.user.user_id;

    // Get user details
    const userResult = await db.query(
      "SELECT user_name AS username, email FROM users WHERE user_id = $1",
      [userId]
    );

    if (userResult.rowCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const userEmail = userResult.rows[0].email;
    const userName = userResult.rows[0].username;

    // Get connection for transaction
    const connection = await db.connect();

    try {
      await connection.query("BEGIN");

      // Insert order
      let totalAmount = 0;
      const orderItems = [];
      const createdOrderIds = [];

      for (let item of items) {
        const medicineId = Number(item.medicine_id);
        const quantity = Number(item.quantity);
        if (!medicineId || !quantity || quantity <= 0) {
          throw new Error("Invalid medicine_id or quantity in items");
        }

        const medicineResult = await connection.query(
          "SELECT id, name, price, stock, dosage FROM medicines WHERE id = $1",
          [medicineId]
        );

        if (medicineResult.rowCount === 0) {
          throw new Error(`Medicine with ID ${medicineId} not found`);
        }

        const medicine = medicineResult.rows[0];

        if (medicine.stock < quantity) {
          throw new Error(`Insufficient stock for ${medicine.name}`);
        }

        const total = Number(medicine.price) * quantity;
        totalAmount += total;

        const createdOrder = await connection.query(
          `INSERT INTO orders (
             user_id, medicine_id, quantity, medicine_name, total_price, dosage, frequency, prescription_required, status
           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           RETURNING id`,
          [
            userId,
            medicineId,
            quantity,
            medicine.name,
            total,
            medicine.dosage || "As directed",
            "As directed",
            false,
            "completed",
          ]
        );
        createdOrderIds.push(createdOrder.rows[0].id);

        // Update medicine stock
        const newStock = medicine.stock - quantity;
        await connection.query(
          "UPDATE medicines SET stock = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
          [newStock, medicineId]
        );

        orderItems.push({
          medicine_name: medicine.name,
          quantity,
          price: Number(medicine.price),
          total_amount: total,
        });

        // Check if stock is low and send refill alert
        const LOW_STOCK_THRESHOLD = 20;
        if (newStock < LOW_STOCK_THRESHOLD) {
          await sendRefillAlert({
            medicine_name: medicine.name,
            medicine_id: medicine.id,
            stock_quantity: newStock,
            min_stock_level: LOW_STOCK_THRESHOLD,
            price: medicine.price,
          });
        }
      }

      await connection.query("COMMIT");

      // Send order confirmation email to user
      await sendOrderConfirmation(userEmail, userName, {
        orderId: createdOrderIds[0] || null,
        items: orderItems,
        totalAmount,
      });

      res.status(201).json({
        message: "Order placed successfully & confirmation email sent",
        orderIds: createdOrderIds,
        totalAmount,
      });
    } catch (err) {
      await connection.query("ROLLBACK");
      throw err;
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error("Error creating order:", err);
    res.status(400).json({ message: err.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    const result = await db.query(
      "SELECT * FROM orders WHERE id = $1",
      [orderId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching order:", err);
    res.status(500).json({ message: "Error fetching order" });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const result = await db.query(
      "UPDATE orders SET status = 'cancelled' WHERE id = $1 RETURNING *",
      [orderId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ message: "Order cancelled successfully", order: result.rows[0] });
  } catch (err) {
    console.error("Error cancelling order:", err);
    res.status(500).json({ message: "Error cancelling order" });
  }
};
