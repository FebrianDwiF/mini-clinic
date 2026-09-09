const express = require("express");
const router = express.Router();

const db = require("../db");
const authenticateToken = require("../middleware/auth");
const authorizeRoles = require("../middleware/role");

router.get(
  "/",
  authenticateToken,
  authorizeRoles("Administrator", "Dokter", "Petugas Pendaftaran"),
  async (req, res) => {
    try {
      const [[totalPatients]] = await db.query(`
        SELECT COUNT(*) AS total
        FROM patients
      `);

      const [[todayPatients]] = await db.query(`
        SELECT COUNT(*) AS total
        FROM registrations
        WHERE visit_date = CURDATE()
      `);

      const [[todayQueues]] = await db.query(`
        SELECT COUNT(*) AS total
        FROM queues q
        INNER JOIN registrations r
          ON r.id = q.registration_id
        WHERE r.visit_date = CURDATE()
      `);

      const [[waitingPatients]] = await db.query(`
        SELECT COUNT(*) AS total
        FROM queues q
        INNER JOIN registrations r
          ON r.id = q.registration_id
        WHERE r.visit_date = CURDATE()
          AND q.status IN ('Menunggu', 'Dipanggil')
      `);

      const [[completedPatients]] = await db.query(`
        SELECT COUNT(*) AS total
        FROM registrations
        WHERE visit_date = CURDATE()
          AND status = 'Selesai'
      `);

      return res.json({
        success: true,
        message: "Dashboard berhasil diambil",
        data: {
          total_patients: Number(totalPatients.total),
          today_patients: Number(todayPatients.total),
          today_queues: Number(todayQueues.total),
          waiting_patients: Number(waitingPatients.total),
          completed_patients: Number(completedPatients.total),
        },
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Gagal mengambil data dashboard",
      });
    }
  },
);

module.exports = router;
