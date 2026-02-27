import db from "../config/db.js";

export const getAdminDashboard = async (req, res) => {
  const [users] = await db.query("SELECT COUNT(*) as totalUsers FROM users");
  const [orders] = await db.query("SELECT COUNT(*) as totalOrders FROM orders");
  const [lowStock] = await db.query(
    "SELECT * FROM medicines WHERE stock_quantity < 5"
  );

  res.json({
    totalUsers: users[0].totalUsers,
    totalOrders: orders[0].totalOrders,
    lowStock
  });
};

export const getAllUsers = async (req, res) => {
  const [users] = await db.query("SELECT user_id, username, email, user_role FROM users");
  res.json(users);
};

export const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  await db.query(
    "UPDATE users SET user_role = ? WHERE user_id = ?",
    [role, id]
  );

  res.json({ message: "Role updated" });
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;

  await db.query("DELETE FROM users WHERE user_id = ?", [id]);

  res.json({ message: "User deleted" });
};