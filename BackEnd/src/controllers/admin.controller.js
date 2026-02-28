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

export const  getAllOrders = async (req, res) => {
  try {
    const [orders] = await db.query("SELECT * FROM orders");
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};


export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const [result] = await db.query("UPDATE orders SET status = ? WHERE order_id = ?", [status, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ message: "Order status updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update order status" });
  }
};

export const getAllMedicinesAdmin = async (req, res) => {
  try {
    const [medicines] = await db.query("SELECT * FROM medicines");
    res.status(200).json(medicines);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch medicines" });
  }
};

export const createMedicine = async (req, res) => {
  try {
    const { name, description, price, stock_quantity } = req.body;

    if (!name || !description || !price || !stock_quantity) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const [result] = await db.query(
      "INSERT INTO medicines (name, description, price, stock_quantity) VALUES (?, ?, ?, ?)",
      [name, description, price, stock_quantity]
    );

    res.status(201).json({ message: "Medicine created successfully", medicineId: result.insertId });
  } catch (error) {
    res.status(500).json({ message: "Failed to create medicine" });
  }
};

export const updateMedicine = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock_quantity } = req.body;

    const [result] = await db.query(
      "UPDATE medicines SET name = ?, description = ?, price = ?, stock_quantity = ? WHERE id = ?",
      [name, description, price, stock_quantity, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Medicine not found" });
    }

    res.status(200).json({ message: "Medicine updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update medicine" });
  }
};

export const deleteMedicine = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query("DELETE FROM medicines WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Medicine not found" });
    }

    res.status(200).json({ message: "Medicine deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete medicine" });
  }
};

export const getAgentLogs = async (req, res) => {
  try {
    const [logs] = await db.query("SELECT * FROM logs WHERE user_id = ?", [req.user.id]);
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch agent logs" });
  }
};
