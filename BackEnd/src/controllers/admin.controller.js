import { db } from "../db.js";

/* ===========================
   DASHBOARD
=========================== */
export const getAdminDashboard = async (req, res) => {
  try {
    const usersResult = await db.query(
      "SELECT COUNT(*) AS totalusers FROM users"
    );

    const ordersResult = await db.query(
      "SELECT COUNT(*) AS totalorders FROM orders"
    );

    const lowStockResult = await db.query(
      "SELECT * FROM medicines WHERE stock < 5"
    );

    res.status(200).json({
      totalUsers: usersResult.rows[0].totalusers,
      totalOrders: ordersResult.rows[0].totalorders,
      lowStock: lowStockResult.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to load dashboard" });
  }
};


/* ===========================
   USERS
=========================== */
export const getAllUsers = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT user_id, username, email, user_role FROM users"
    );
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const result = await db.query(
      "UPDATE users SET user_role = $1 WHERE user_id = $2 RETURNING *",
      [role, id]
    );

    if (result.rowCount === 0) {
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

    const result = await db.query(
      "DELETE FROM users WHERE user_id = $1 RETURNING *",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete user" });
  }
};


/* ===========================
   ORDERS
=========================== */
export const getAllOrders = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM orders");
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { status } = req.body;

    const result = await db.query(
      "UPDATE orders SET status = $1 WHERE order_id = $2 RETURNING *",
      [status, itemId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ message: "Order status updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update order status" });
  }
};


/* ===========================
   MEDICINES
=========================== */

export const getAllMedicinesAdmin = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM medicines");
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch medicines" });
  }
};

export const createMedicine = async (req, res) => {
  try {
    const {
      med_name,
      pzn,
      price,
      package_size,
      description,
      requires_prescription,
    } = req.body;

    const result = await db.query(
      `INSERT INTO medicines 
       (med_name, pzn, price, package_size, description, requires_prescription)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        med_name,
        pzn,
        price,
        package_size,
        description,
        requires_prescription,
      ]
    );

    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error("Create Medicine Error:", error);
    res.status(500).json({ message: "Failed to create medicine" });
  }
};

export const updateMedicine = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      med_name,
      pzn,
      price,
      stock,
      package_size,
      description,
      requires_prescription,
    } = req.body;

    const result = await db.query(
      `UPDATE medicines 
       SET med_name = $1,
           pzn = $2,
           price = $3,
           stock = $4,
           package_size = $5,
           description = $6,
           requires_prescription = $7
       WHERE med_id = $8
       RETURNING *`,
      [
        med_name,
        pzn,
        price,
        stock,
        package_size,
        description,
        requires_prescription,
        id,
      ]
    );

    if (result.rowCount === 0) {
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

    const result = await db.query(
      "DELETE FROM medicines WHERE med_id = $1 RETURNING *",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Medicine not found" });
    }

    res.status(200).json({ message: "Medicine deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete medicine" });
  }
};


/* ===========================
   AGENT LOGS
=========================== */
export const getAgentLogs = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM logs WHERE user_id = $1",
      [req.user.id]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch agent logs" });
  }
};