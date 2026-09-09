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
      SELECT
        queues.id,
        queues.queue_number,
        queues.status,
        queues.called_at,
        queues.created_at,

        registrations.id AS registration_id,
        registrations.visit_date,

        patients.id AS patient_id,
        patients.medical_record_number,
        patients.name AS patient_name,

        doctors.id AS doctor_id,
        doctors.name AS doctor_name,

        polis.id AS poli_id,
        polis.name AS poli_name

      FROM queues

      JOIN registrations
        ON queues.registration_id = registrations.id

      JOIN patients
        ON registrations.patient_id = patients.id

      JOIN doctors
        ON registrations.doctor_id = doctors.id

      JOIN polis
        ON registrations.poli_id = polis.id

      ORDER BY queues.id ASC
    `);

      res.json({
        success: true,
        message: "Data antrean berhasil diambil",
        data: rows,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message: "Gagal mengambil data antrean",
      });
    }
  },
);

router.put(
  "/:id/call",
  authenticateToken,
  authorizeRoles("Administrator", "Petugas Pendaftaran", "Dokter"),
  async (req, res) => {
    try {
      const { id } = req.params;

      // Cari antrean
      const [queues] = await db.query(
        `SELECT id, queue_number, status
       FROM queues
       WHERE id = ?`,
        [id],
      );

      if (queues.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Antrean tidak ditemukan",
        });
      }

      const queue = queues[0];

      // Cek status antrean
      if (queue.status !== "Menunggu") {
        return res.status(400).json({
          success: false,
          message: "Antrean tidak dapat dipanggil",
        });
      }

      // Ubah status menjadi Dipanggil
      const [result] = await db.query(
        `UPDATE queues
       SET status = 'Dipanggil',
           called_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
        [id],
      );

      res.json({
        success: true,
        message: "Antrean berhasil dipanggil",
        data: {
          id: queue.id,
          queue_number: queue.queue_number,
          status: "Dipanggil",
        },
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message: "Gagal memanggil antrean",
      });
    }
  },
);

router.put(
  "/:id/status",
  authenticateToken,
  authorizeRoles("Administrator", "Petugas Pendaftaran", "Dokter"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      // Validasi status
      const allowedStatus = ["Menunggu", "Dipanggil", "Selesai"];

      if (!status || !allowedStatus.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Validation Error",
          errors: {
            status: "Status harus Menunggu, Dipanggil, atau Selesai",
          },
        });
      }

      // Cek antrean
      const [queues] = await db.query(
        `SELECT id, queue_number, status
       FROM queues
       WHERE id = ?`,
        [id],
      );

      if (queues.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Antrean tidak ditemukan",
        });
      }

      // Update status
      await db.query(
        `UPDATE queues
       SET status = ?
       WHERE id = ?`,
        [status, id],
      );

      res.json({
        success: true,
        message: "Status antrean berhasil diubah",
        data: {
          id: Number(id),
          queue_number: queues[0].queue_number,
          status: status,
        },
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message: "Gagal mengubah status antrean",
      });
    }
  },
);

router.post(
  "/",
  authenticateToken,
  authorizeRoles("Administrator", "Petugas Pendaftaran"),
  async (req, res) => {
    try {
      const { registration_id } = req.body;

      // Validasi input
      if (!registration_id) {
        return res.status(400).json({
          success: false,
          message: "Validation Error",
          errors: {
            registration_id: "Registration ID harus diisi",
          },
        });
      }

      // Ambil data pendaftaran
      const [registrations] = await db.query(
        `SELECT id, poli_id, visit_date, status
       FROM registrations
       WHERE id = ?`,
        [registration_id],
      );

      if (registrations.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Pendaftaran tidak ditemukan",
        });
      }

      const registration = registrations[0];

      // Cek apakah pendaftaran sudah memiliki antrean
      const [existingQueue] = await db.query(
        `SELECT id
       FROM queues
       WHERE registration_id = ?`,
        [registration_id],
      );

      if (existingQueue.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Pendaftaran sudah memiliki nomor antrean",
        });
      }

      // Cari nomor antrean terakhir
      // berdasarkan poli dan tanggal kunjungan
      const [lastQueue] = await db.query(
        `SELECT q.queue_number
       FROM queues q
       JOIN registrations r
         ON q.registration_id = r.id
       WHERE r.poli_id = ?
         AND r.visit_date = ?
       ORDER BY q.queue_number DESC
       LIMIT 1`,
        [registration.poli_id, registration.visit_date],
      );

      let queueNumber = 1;

      if (lastQueue.length > 0) {
        queueNumber = lastQueue[0].queue_number + 1;
      }

      // Simpan antrean
      const [result] = await db.query(
        `INSERT INTO queues
       (registration_id, queue_number, status)
       VALUES (?, ?, ?)`,
        [registration_id, queueNumber, "Menunggu"],
      );

      res.status(201).json({
        success: true,
        message: "Nomor antrean berhasil dibuat",
        data: {
          id: result.insertId,
          registration_id: registration_id,
          queue_number: queueNumber,
          status: "Menunggu",
        },
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message: "Gagal membuat nomor antrean",
      });
    }
  },
);

module.exports = router;
