// Mock in-memory database for testing without PostgreSQL
const users = [];

export const mockDb = {
  async query(sql, params) {
    // Register validation
    if (sql.includes("SELECT user_id FROM users WHERE email = $1")) {
      const [email] = params;
      const existing = users.find(u => u.email === email);
      return { rows: existing ? [existing] : [] };
    }

    // Insert user
    if (sql.includes("INSERT INTO users")) {
      const [username, phone, email, hashedPassword, role] = params;
      const newUser = { user_id: users.length + 1, user_name: username, phone, email, hashed_password: hashedPassword, user_role: role };
      users.push(newUser);
      return { rows: [{ user_id: newUser.user_id }] };
    }

    // Login query
    if (sql.includes("SELECT * FROM users WHERE email = $1")) {
      const [email] = params;
      const user = users.find(u => u.email === email);
      return { rows: user ? [user] : [] };
    }

    return { rows: [] };
  },

  async connect() {
    console.log("✅ Mock Database Ready (In-Memory)");
  }
};

export default mockDb;
