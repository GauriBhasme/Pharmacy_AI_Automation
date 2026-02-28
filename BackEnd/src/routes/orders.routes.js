import express from "express";
import authenticate from "../middleware/authenticate.js";
import { db } from "../db.js";
// import { sendOrderConfirmation } from "../controllers/order.controller.js";

const ordersRouter = express.Router();

// ✅ Get all orders
ordersRouter.get("/orders", authenticate, (req, res) => {
  res.send("Orders fetched successfully");
});

// ✅ Place Order (DB + Email)
ordersRouter.post("/orders", authenticate, async (req, res) => {
  const connection = await db.getConnection();

  try {
    const { items, prescription, email } = req.body;
    const userId = req.user.user_id;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No medicines selected" });
    }

    await connection.beginTransaction();

    const [orderResult] = await connection.query(
      "INSERT INTO orders (user_id) VALUES (?)",
      [userId]
    );

    const orderId = orderResult.insertId;
    let grandTotal = 0;

    for (let item of items) {
      const [medicineRows] = await connection.query(
        "SELECT * FROM medicines WHERE medicine_id = ?",
        [item.medicine_id]
      );

      if (medicineRows.length === 0) {
        throw new Error("Medicine not found");
      }

      const medicine = medicineRows[0];

      if (medicine.stock_quantity < item.quantity) {
        throw new Error(`${medicine.medicine_name} has insufficient stock`);
      }

      if (medicine.prescription_required && !prescription) {
        throw new Error(`${medicine.medicine_name} requires prescription`);
      }

      const totalAmount = medicine.price * item.quantity;
      grandTotal += totalAmount;

      await connection.query(
        `INSERT INTO order_items 
        (order_id, medicine_id, quantity, total_amount) 
        VALUES (?, ?, ?, ?)`,
        [orderId, item.medicine_id, item.quantity, totalAmount]
      );

      await connection.query(
        `UPDATE medicines 
         SET stock_quantity = stock_quantity - ?, 
             updated_at = CURRENT_TIMESTAMP 
         WHERE medicine_id = ?`,
        [item.quantity, item.medicine_id]
      );
    }

    await connection.commit();

    // 📧 Send confirmation email
    await sendOrderConfirmation(email, {
      id: orderId,
      total: grandTotal,
    });

    res.status(201).json({
      message: "Order placed successfully",
      order_id: orderId,
    });

  } catch (error) {
    await connection.rollback();
    res.status(400).json({ message: error.message });
  } finally {
    connection.release();
  }
});


ordersRouter.get("/orders/:id", authenticate, (req, res) => {
  res.send("Order fetched successfully");
});

export default ordersRouter;