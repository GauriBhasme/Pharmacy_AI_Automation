import { db } from "../db.js";

export const getProfile = async (req, res) => {
  try {
    const userId = req.user?.user_id || req.user?.userId || req.user?.id;

    if (!userId) {
      return res.status(400).json({ message: "User ID not found in token." });
    }

    const userResult = await db.query(
      `SELECT user_id, user_name AS username, email, phone, user_role, created_at
       FROM users
       WHERE user_id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    const user = userResult.rows[0];

    const columnsResult = await db.query(
      `SELECT column_name
       FROM information_schema.columns
       WHERE table_name = 'orders'
       AND column_name = ANY($1::text[])`,
      [["total_price", "total_amount", "prescription_required"]]
    );

    const availableColumns = new Set(columnsResult.rows.map((row) => row.column_name));
    const amountColumn = availableColumns.has("total_price")
      ? "total_price"
      : availableColumns.has("total_amount")
      ? "total_amount"
      : null;

    let orderStats = {
      orders: 0,
      prescriptions: 0,
      total_spent: 0,
      points: 0,
    };

    if (amountColumn) {
      const prescriptionExpr = availableColumns.has("prescription_required")
        ? "COUNT(*) FILTER (WHERE prescription_required = true)::int AS prescriptions"
        : "0::int AS prescriptions";

      const statsResult = await db.query(
        `SELECT
           COUNT(*)::int AS orders,
           COALESCE(SUM(${amountColumn}), 0)::numeric AS total_spent,
           ${prescriptionExpr}
         FROM orders
         WHERE user_id = $1`,
        [userId]
      );

      const statsRow = statsResult.rows[0] || {};
      const totalSpent = Number(statsRow.total_spent || 0);
      const orders = Number(statsRow.orders || 0);
      const prescriptions = Number(statsRow.prescriptions || 0);

      orderStats = {
        orders,
        prescriptions,
        total_spent: totalSpent,
        // Simple loyalty metric: 10 points per order + 1 point per ₹100 spent
        points: orders * 10 + Math.floor(totalSpent / 100),
      };
    }

    let recentOrders = [];
    try {
      const recentOrdersResult = await db.query(
        `SELECT id, medicine_id, medicine_name, quantity, total_price, status, created_at
         FROM orders
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT 5`,
        [userId]
      );

      recentOrders = recentOrdersResult.rows;
    } catch (err) {
      // Keep profile response stable even if recent order columns differ.
      recentOrders = [];
    }

    res.json({
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      role: user.user_role,
      created_at: user.created_at,
      ...orderStats,
      recentOrders,
    });
  } catch (err) {
    console.error("[user.profile] Error:", err.message);
    res.status(500).json({ message: "Failed to load profile data." });
  }
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
  try {
    const userId = req.user?.user_id || req.user?.userId || req.user?.id;
    
    console.log('[dashboard] User info from token:', req.user);
    console.log('[dashboard] Extracted userId:', userId);
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID not found in token. Please login again.',
        receivedUser: req.user
      });
    }

    // Total orders for this user
    const totalOrdersResult = await db.query(
      "SELECT COUNT(*) as totalorders FROM orders WHERE user_id = $1",
      [userId]
    );

    // Active medications (last 5 orders with medicine details)
    const activeMedicationsResult = await db.query(
      `SELECT DISTINCT ON (medicine_id) 
        medicine_id, medicine_name, quantity, total_price, created_at
       FROM orders 
       WHERE user_id = $1 
       ORDER BY medicine_id, created_at DESC 
       LIMIT 5`,
      [userId]
    );

    // Refill alerts (medicines where 30+ days have passed since order)
    const refillAlertsResult = await db.query(
      `SELECT medicine_id, medicine_name, quantity, created_at,
              CURRENT_DATE - DATE(created_at) as days_since_order
       FROM orders 
       WHERE user_id = $1 
       AND DATE(created_at) <= CURRENT_DATE - INTERVAL '30 days'
       ORDER BY created_at DESC
       LIMIT 10`,
      [userId]
    );

    // Low stock alerts (medicines user ordered that have low stock)
    const lowStockAlertsResult = await db.query(
      `SELECT DISTINCT ON (m.id)
              m.id AS medicine_id,
              m.name AS medicine_name,
              m.stock,
              m.price,
              (
                SELECT created_at
                FROM orders
                WHERE user_id = $1 AND medicine_id = m.id
                ORDER BY created_at DESC
                LIMIT 1
              ) AS last_order_date
       FROM medicines m
       WHERE m.id IN (
         SELECT DISTINCT medicine_id FROM orders WHERE user_id = $1
       )
       AND m.stock < 20
       ORDER BY m.id, m.stock ASC`,
      [userId]
    );

    // Total chat interactions (count of chats for this user)
    let totalChatsResult = { rows: [{ totalchats: 0 }] };
    try {
      totalChatsResult = await db.query(
        "SELECT COUNT(*) as totalchats FROM chat_logs WHERE user_id = $1",
        [userId]
      );
    } catch (err) {
      // chat_logs table doesn't exist yet, default to 0
      console.log('ℹ️ chat_logs table not found, defaulting to 0');
    }

    const responseData = {
      totalOrders: parseInt(totalOrdersResult.rows[0].totalorders),
      activeMedications: activeMedicationsResult.rows.map(med => ({
        medicine_id: med.medicine_id,
        medicine_name: med.medicine_name,
        quantity: med.quantity,
        total_price: med.total_price,
        ordered_date: med.created_at
      })),
      refillAlerts: refillAlertsResult.rows.map(alert => ({
        medicine_id: alert.medicine_id,
        medicine_name: alert.medicine_name,
        quantity: alert.quantity,
        ordered_date: alert.created_at,
        days_since_order: alert.days_since_order
      })),
      lowStockAlerts: lowStockAlertsResult.rows.map(alert => ({
        medicine_id: alert.medicine_id,
        medicine_name: alert.medicine_name,
        current_stock: alert.stock,
        price: alert.price,
        last_order_date: alert.last_order_date,
        alert_type: 'LOW_STOCK',
        message: `${alert.medicine_name} stock is running low (${alert.stock} units left)`
      })),
      totalChats: parseInt(totalChatsResult.rows[0].totalchats)
    };

    console.log('[dashboard] Response data:', responseData);
    
    res.status(200).json(responseData);
  } catch (err) {
    console.error('[user.dashboard] Error:', err.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard data: ' + err.message
    });
  }
};

export const getOrderHistory = async (req, res) => {
  const userId = req.user.user_id;

  const result = await db.query(
    `SELECT o.id AS order_id, o.quantity, o.status AS order_status, m.name AS medicine_name
     FROM orders o
     LEFT JOIN medicines m ON m.id = o.medicine_id
     WHERE o.user_id = $1
     ORDER BY o.created_at DESC`,
    [userId]
  );

  res.json(result.rows);
};

export const getRefillPredictions = async (req, res) => {
  const userId = req.user.user_id;

  const result = await db.query(
    `SELECT m.name AS medicine_name, o.quantity, o.created_at AS ordered_at
     FROM orders o
     LEFT JOIN medicines m ON m.id = o.medicine_id
     WHERE o.user_id = $1
     ORDER BY o.created_at DESC`,
    [userId]
  );

  res.json({ predictions: result.rows });
};
