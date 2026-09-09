const express = require("express");
const db = require("../db");
const authenticateToken = require("../middleware/auth");
const authorizeRoles = require("../middleware/role");

const router = express.Router();

// =====================================================
// GET RESEP BERDASARKAN REGISTRASI
// GET /prescriptions/registration/:registrationId
// =====================================================
router.get(
  "/registration/:registrationId",
  authenticateToken,
  authorizeRoles("Administrator", "Dokter"),
  async (req, res) => {
    try {
      const { registrationId } = req.params;

      const [rows] = await db.query(
        `
        SELECT
          id,
          registration_id,
          medicine_name,
          dosage,
          quantity,
          instructions,
          created_at
        FROM prescriptions
        WHERE registration_id = ?
        ORDER BY id DESC
        `,
        [registrationId],
      );

      res.json({
        success: true,
        message: "Data resep berhasil diambil",
        data: rows,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message: "Gagal mengambil data resep",
      });
    }
  },
);

// =====================================================
// GET RESEP BERDASARKAN ID
// GET /prescriptions/:id
// =====================================================
router.get(
  "/:id",
  authenticateToken,
  authorizeRoles("Administrator", "Dokter"),
  async (req, res) => {
    try {
      const { id } = req.params;

      const [rows] = await db.query(
        `
        SELECT
          id,
          registration_id,
          medicine_name,
          dosage,
          quantity,
          instructions,
          created_at
        FROM prescriptions
        WHERE id = ?
        `,
        [id],
      );

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Resep tidak ditemukan",
        });
      }

      res.json({
        success: true,
        message: "Data resep berhasil diambil",
        data: rows[0],
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message: "Gagal mengambil data resep",
      });
    }
  },
);

// =====================================================
// POST RESEP
// POST /prescriptions
// =====================================================
router.post(
  "/",
  authenticateToken,
  authorizeRoles("Administrator", "Dokter"),
  async (req, res) => {
    try {
      const { registration_id, medicine_name, dosage, quantity, instructions } =
        req.body;

      const errors = {};

      if (!registration_id) {
        errors.registration_id = "Registrasi harus dipilih";
      }

      if (!medicine_name || !medicine_name.trim()) {
        errors.medicine_name = "Nama obat harus diisi";
      }

      if (!dosage || !dosage.trim()) {
        errors.dosage = "Dosis obat harus diisi";
      }

      if (quantity === undefined || quantity === "" || Number(quantity) <= 0) {
        errors.quantity = "Jumlah obat harus lebih dari 0";
      }

      if (!instructions || !instructions.trim()) {
        errors.instructions = "Aturan penggunaan harus diisi";
      }

      if (Object.keys(errors).length > 0) {
        return res.status(400).json({
          success: false,
          message: "Validation Error",
          errors,
        });
      }

      const [registration] = await db.query(
        `
        SELECT id
        FROM registrations
        WHERE id = ?
        `,
        [registration_id],
      );

      if (registration.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Validation Error",
          errors: {
            registration_id: "Registrasi tidak ditemukan",
          },
        });
      }

      const [result] = await db.query(
        `
        INSERT INTO prescriptions
        (
          registration_id,
          medicine_name,
          dosage,
          quantity,
          instructions
        )
        VALUES (?, ?, ?, ?, ?)
        `,
        [
          registration_id,
          medicine_name.trim(),
          dosage.trim(),
          Number(quantity),
          instructions.trim(),
        ],
      );

      res.status(201).json({
        success: true,
        message: "Resep berhasil disimpan",
        data: {
          id: result.insertId,
          registration_id,
          medicine_name: medicine_name.trim(),
          dosage: dosage.trim(),
          quantity: Number(quantity),
          instructions: instructions.trim(),
        },
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message: "Gagal menyimpan resep",
      });
    }
  },
);

module.exports = router;
