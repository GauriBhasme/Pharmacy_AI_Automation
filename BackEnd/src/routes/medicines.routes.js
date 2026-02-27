// src/routes/medicines.routes.js

import express from "express";
import {
  getAllMedicines,
  getMedicineById,
  searchMedicines
} from "../controllers/medicine.controller.js";

const router = express.Router();

// Public browse
router.get("/", getAllMedicines);

// Search
router.get("/search", searchMedicines);

// Get single
router.get("/:id", getMedicineById);

export default router;