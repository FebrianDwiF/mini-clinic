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
        FROM polis
        ORDER BY id ASC
      `);

      res.json({
        success: true,
        message: "Data poli berhasil diambil",
        data: rows,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message: "Gagal mengambil data poli",
      });
    }
  },
);

module.exports = router;
