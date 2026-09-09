const express = require("express");
const db = require("../db");
const authenticateToken = require("../middleware/auth");
const authorizeRoles = require("../middleware/role");

const router = express.Router();

router.get(
  "/",
  authenticateToken,
  authorizeRoles("Administrator", "Petugas Pendaftaran", "Dokter"),
  async (req, res) => {
    try {
      const [rows] = await db.query(`
        SELECT id, name
        FROM doctors
        ORDER BY id ASC
      `);

      return res.json({
        success: true,
        message: "Data dokter berhasil diambil",
        data: rows,
      });
    } catch (error) {
      console.error("GET DOCTORS ERROR:", error);

      return res.status(500).json({
        success: false,
        message: "Gagal mengambil data dokter",
      });
    }
  },
);

module.exports = router;
