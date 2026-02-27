import { db } from "../db.js";

/* ===========================
   DASHBOARD
=========================== */
export const getAdminDashboard = async (req, res) => {
  try {
    const [users] = await db.query(
      "SELECT COUNT(*) as totalUsers FROM users"
    );

    const [orders] = await db.query(
      "SELECT COUNT(*) as totalOrders FROM orders"
    );

    const [lowStock] = await db.query(
      "SELECT * FROM medicines WHERE stock_quantity < 5"
    );

    res.status(200).json({
      totalUsers: users[0].totalUsers,
      totalOrders: orders[0].totalOrders,
      lowStock
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to load dashboard" });
  }
};

/* ===========================
   USERS
=========================== */
export const getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query(
      "SELECT user_id, username, email, user_role FROM users"
    );

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({ message: "Role is required" });
    }

    const [result] = await db.query(
      "UPDATE users SET user_role = ? WHERE user_id = ?",
      [role, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Role updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update role" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      "DELETE FROM users WHERE user_id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete user" });
  }
};