import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

export const db = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_HOST.includes("supabase")
    ? { rejectUnauthorized: false }
    : false,
});

// Test connection immediately
db.connect()
  .then(() => console.log("✅ PostgreSQL Connected"))
  .catch(err => console.error("❌ DB Connection Error:", err));