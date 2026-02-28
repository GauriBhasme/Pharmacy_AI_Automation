import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

console.log("DB URL =", process.env.DB_URL);

export const db = new pg.Pool({
  connectionString: process.env.DB_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});