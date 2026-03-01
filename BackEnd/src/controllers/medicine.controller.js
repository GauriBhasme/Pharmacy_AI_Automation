import { db } from "../db.js";

export const getAllMedicines = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id, name, description, composition, dosage, side_effects, contraindications, price, stock, category, created_at, updated_at FROM medicines ORDER BY name ASC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("[medicines.getAll] Error:", err.message);
    res.status(500).json({ message: "Failed to fetch medicines" });
  }
};

export const getMedicineById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      "SELECT id, name, description, composition, dosage, side_effects, contraindications, price, stock, category, created_at, updated_at FROM medicines WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Medicine not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("[medicines.getById] Error:", err.message);
    res.status(500).json({ message: "Failed to fetch medicine" });
  }
};

export const searchMedicines = async (req, res) => {
  try {
    const { q = "" } = req.query;
    const result = await db.query(
      `SELECT id, name, description, composition, dosage, side_effects, contraindications, price, stock, category, created_at, updated_at
       FROM medicines
       WHERE LOWER(name) LIKE LOWER($1)
       ORDER BY name ASC
       LIMIT 50`,
      [`%${q}%`]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("[medicines.search] Error:", err.message);
    res.status(500).json({ message: "Failed to search medicines" });
  }
};
