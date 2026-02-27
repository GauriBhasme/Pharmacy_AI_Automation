import db from "../config/db.js";

export const getProfile = async (req, res) => {
  const userId = req.user.user_id;

  const [user] = await db.query(
    "SELECT username, email, allergy, image_url FROM users WHERE user_id = ?",
    [userId]
  );

  res.json(user[0]);
};

export const updateProfile = async (req, res) => {
  const userId = req.user.user_id;
  const { allergy, image_url } = req.body;

  await db.query(
    "UPDATE users SET allergy = ?, image_url = ? WHERE user_id = ?",
    [allergy, image_url, userId]
  );

  res.json({ message: "Profile updated" });
};

export const getDashboard = async (req, res) => {
  const userId = req.user.user_id;

  const [orders] = await db.query(
    "SELECT COUNT(*) as totalOrders FROM orders WHERE user_id = ?",
    [userId]
  );

  res.json({
    totalOrders: orders[0].totalOrders
  });
};

export const getOrderHistory = async (req, res) => {
  const userId = req.user.user_id;

  const [history] = await db.query(
    `SELECT o.order_id, oi.quantity, oi.order_status, m.medicine_name
     FROM orders o
     JOIN order_items oi ON o.order_id = oi.order_id
     JOIN medicines m ON m.medicine_id = oi.medicine_id
     WHERE o.user_id = ?`,
    [userId]
  );

  res.json(history);
};

export const getRefillPredictions = async (req, res) => {
  const userId = req.user.user_id;

  const [items] = await db.query(
    `SELECT m.medicine_name, oi.quantity, oi.ordered_at
     FROM orders o
     JOIN order_items oi ON o.order_id = oi.order_id
     JOIN medicines m ON m.medicine_id = oi.medicine_id
     WHERE o.user_id = ?`,
    [userId]
  );

  res.json({ predictions: items });
};