import pkg from "pg";

const { Pool } = pkg;

export const db = new Pool({
  user: "postgres",        // your pg username
  host: "localhost",
  database: "your_db_name",
  password: "your_password",
  port: 5432,
});

db.connect()
  .then(() => console.log("✅ PostgreSQL Connected"))
  .catch((err) => console.error("❌ Connection Error:", err));