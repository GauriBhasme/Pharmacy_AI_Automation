import {db} from "../db.js";

export const getAllMedicines = async (req, res) => {
  const [medicines] = await db.query("SELECT * FROM medicines");
  res.json(medicines);
};

export const getMedicineById = async (req, res) => {
  const { id } = req.params;

  const [medicine] = await db.query(
    "SELECT * FROM medicines WHERE medicine_id = ?",
    [id]
  );

  res.json(medicine[0]);
};

export const searchMedicines = async (req, res) => {
  const { q } = req.query;

  const [results] = await db.query(
    "SELECT * FROM medicines WHERE medicine_name LIKE ?",
    [`%${q}%`]
  );

  res.json(results);
};