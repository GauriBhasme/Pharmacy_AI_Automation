import db from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const registerUser = async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword)
      return res.status(400).json({ message: "Passwords do not match" });

    const [existing] = await db.query(
      "SELECT user_id FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0)
      return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO users (username, email, password, user_role) VALUES (?, ?, ?, ?)",
      [username, email, hashed, "user"]
    );

    res.status(201).json({ message: "Registration successful" });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [users] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0)
      return res.status(400).json({ message: "Invalid credentials" });

    const user = users[0];

    const match = await bcrypt.compare(password, user.password);

    if (!match)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { user_id: user.user_id, role: user.user_role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false
    });

    res.json({ message: "Login successful", role: user.user_role });

  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const logoutUser = (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
};

export const getCurrentUser = (req, res) => {
  res.json({ user: req.user || null });
};