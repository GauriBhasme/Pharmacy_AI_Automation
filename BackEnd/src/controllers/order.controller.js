import {db} from "../db.js";

export const createOrder = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const { items } = req.body;
    const userId = req.user.user_id;

    await connection.beginTransaction();

    const [orderResult] = await connection.query(
      "INSERT INTO orders (user_id) VALUES (?)",
      [userId]
    );

    const orderId = orderResult.insertId;

    for (let item of items) {
      const [medicineRows] = await connection.query(
        "SELECT * FROM medicines WHERE medicine_id = ?",
        [item.medicine_id]
      );

      const medicine = medicineRows[0];

      if (medicine.stock_quantity < item.quantity)
        throw new Error("Insufficient stock");

      const total = medicine.price * item.quantity;

      await connection.query(
        `INSERT INTO order_items (order_id, medicine_id, quantity, total_amount)
         VALUES (?, ?, ?, ?)`,
        [orderId, item.medicine_id, item.quantity, total]
      );

      await connection.query(
        "UPDATE medicines SET stock_quantity = stock_quantity - ? WHERE medicine_id = ?",
        [item.quantity, item.medicine_id]
      );
    }

    await connection.commit();

    res.status(201).json({ message: "Order placed", orderId });

  } catch (err) {
    await connection.rollback();
    res.status(400).json({ message: err.message });
  } finally {
    connection.release();
  }
};

export const getOrderById = async (req, res) => {
  const { orderId } = req.params;

  const [order] = await db.query(
    "SELECT * FROM order_items WHERE order_id = ?",
    [orderId]
  );

  res.json(order);
};

export const cancelOrder = async (req, res) => {
  const { orderId } = req.params;

  await db.query(
    "UPDATE order_items SET order_status = 'cancelled' WHERE order_id = ?",
    [orderId]
  );

  res.json({ message: "Order cancelled" });
};
const sendOrderEmail = require("./mailer.js");

app.post("/place-order", async (req, res) => {
  const order = {
    id: "ORD1234",
    total: 999,
  };

  await sendOrderEmail("user@example.com", order);

  res.json({ message: "Order placed & email sent" });
});

// SMTP__________________

import transporter from "../mailer.js";

export const sendOrderConfirmation = async (userEmail, orderDetails) => {
  try {
    await transporter.sendMail({
      from: `"Online Pharmacy" <${process.env.SMTP_USER}>`,
      to: userEmail,
      subject: "🛒 Order Confirmation - Thank You!",
      html: `
        <h2>Order Confirmed ✅</h2>
        <p>Thank you for your order!</p>
        <p><strong>Order ID:</strong> ${orderDetails.id}</p>
        <p><strong>Total Amount:</strong> ₹${orderDetails.total}</p>
        <p>Your medicines will be delivered soon 🚚</p>
      `,
    });
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
  }
};