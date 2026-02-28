import { db } from "../db.js";

export const getProfile = async (req, res) => {
  const userId = req.user.user_id;

  const result = await db.query(
    "SELECT username, email, allergy, image_url FROM users WHERE user_id = $1",
    [userId]
  );

  res.json(result.rows[0]);
};

export const updateProfile = async (req, res) => {
  const userId = req.user.user_id;
  const { allergy, image_url } = req.body;

  await db.query(
    "UPDATE users SET allergy = $1, image_url = $2 WHERE user_id = $3",
    [allergy, image_url, userId]
  );

  res.json({ message: "Profile updated" });
};

export const getDashboard = async (req, res) => {
  const userId = req.user.user_id;

  const result = await db.query(
    "SELECT COUNT(*) as totalorders FROM orders WHERE user_id = $1",
    [userId]
  );

  res.json({
    totalOrders: result.rows[0].totalorders
  });
};

export const getOrderHistory = async (req, res) => {
  const userId = req.user.user_id;

  const result = await db.query(
    `SELECT o.order_id, oi.quantity, oi.order_status, m.medicine_name
     FROM orders o
     JOIN order_items oi ON o.order_id = oi.order_id
     JOIN medicines m ON m.medicine_id = oi.medicine_id
     WHERE o.user_id = $1`,
    [userId]
  );

  res.json(result.rows);
};

export const getRefillPredictions = async (req, res) => {
  const userId = req.user.user_id;

  const result = await db.query(
    `SELECT m.medicine_name, oi.quantity, oi.ordered_at
     FROM orders o
     JOIN order_items oi ON o.order_id = oi.order_id
     JOIN medicines m ON m.medicine_id = oi.medicine_id
     WHERE o.user_id = $1`,
    [userId]
  );

  res.json({ predictions: result.rows });
};