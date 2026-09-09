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
        registrations.id,
        registrations.visit_date,
        registrations.payment_type,
        registrations.initial_complaint,
        registrations.status,

        patients.id AS patient_id,
        patients.medical_record_number,
        patients.name AS patient_name,

        doctors.id AS doctor_id,
        doctors.name AS doctor_name,

        polis.id AS poli_id,
        polis.name AS poli_name

      FROM registrations

      JOIN patients
        ON registrations.patient_id = patients.id

      JOIN doctors
        ON registrations.doctor_id = doctors.id

      JOIN polis
        ON registrations.poli_id = polis.id

      ORDER BY registrations.id DESC
    `);

      res.json({
        success: true,
        message: "Data pendaftaran berhasil diambil",
        data: rows,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message: "Gagal mengambil data pendaftaran",
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
      const {
        patient_id,
        doctor_id,
        poli_id,
        visit_date,
        payment_type,
        initial_complaint,
      } = req.body;

      const errors = {};

      // Validasi input
      if (!patient_id) errors.patient_id = "Pasien harus dipilih";
      if (!doctor_id) errors.doctor_id = "Dokter harus dipilih";
      if (!poli_id) errors.poli_id = "Poli harus dipilih";
      if (!visit_date) errors.visit_date = "Tanggal kunjungan harus diisi";
      if (!payment_type) errors.payment_type = "Jenis pembayaran harus diisi";
      if (!initial_complaint) {
        errors.initial_complaint = "Keluhan awal harus diisi";
      }

      if (Object.keys(errors).length > 0) {
        return res.status(400).json({
          success: false,
          message: "Validation Error",
          errors: errors,
        });
      }

      // Cek apakah pasien ada
      const [patient] = await db.query("SELECT id FROM patients WHERE id = ?", [
        patient_id,
      ]);

      if (patient.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Validation Error",
          errors: {
            patient_id: "Pasien tidak ditemukan",
          },
        });
      }

      // Cek apakah dokter ada
      const [doctor] = await db.query("SELECT id FROM doctors WHERE id = ?", [
        doctor_id,
      ]);

      if (doctor.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Validation Error",
          errors: {
            doctor_id: "Dokter tidak ditemukan",
          },
        });
      }

      // Cek apakah poli ada
      const [poli] = await db.query("SELECT id FROM polis WHERE id = ?", [
        poli_id,
      ]);

      if (poli.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Validation Error",
          errors: {
            poli_id: "Poli tidak ditemukan",
          },
        });
      }

      // Simpan pendaftaran
      const [result] = await db.query(
        `INSERT INTO registrations
      (
        patient_id,
        doctor_id,
        poli_id,
        visit_date,
        payment_type,
        initial_complaint,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          patient_id,
          doctor_id,
          poli_id,
          visit_date,
          payment_type,
          initial_complaint,
          "Menunggu",
        ],
      );

      res.status(201).json({
        success: true,
        message: "Pendaftaran berhasil dibuat",
        data: {
          id: result.insertId,
          patient_id,
          doctor_id,
          poli_id,
          visit_date,
          payment_type,
          initial_complaint,
          status: "Menunggu",
        },
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message: "Gagal membuat pendaftaran",
      });
    }
  },
);

router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("Administrator", "Petugas Pendaftaran"),
  async (req, res) => {
    try {
      const { id } = req.params;

      const {
        patient_id,
        doctor_id,
        poli_id,
        visit_date,
        payment_type,
        initial_complaint,
        status,
      } = req.body;

      const errors = {};

      if (!patient_id) errors.patient_id = "Pasien harus dipilih";
      if (!doctor_id) errors.doctor_id = "Dokter harus dipilih";
      if (!poli_id) errors.poli_id = "Poli harus dipilih";
      if (!visit_date) errors.visit_date = "Tanggal kunjungan harus diisi";
      if (!payment_type) errors.payment_type = "Jenis pembayaran harus diisi";

      const allowedStatuses = [
        "Menunggu",
        "Check In",
        "Pemeriksaan",
        "Selesai",
      ];

      if (status && !allowedStatuses.includes(status)) {
        errors.status = "Status tidak valid";
      }

      if (Object.keys(errors).length > 0) {
        return res.status(400).json({
          success: false,
          message: "Validation Error",
          errors: errors,
        });
      }

      const [existingRegistration] = await db.query(
        "SELECT id FROM registrations WHERE id = ?",
        [id],
      );

      if (existingRegistration.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Pendaftaran tidak ditemukan",
        });
      }

      const [patient] = await db.query("SELECT id FROM patients WHERE id = ?", [
        patient_id,
      ]);

      if (patient.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Pasien tidak ditemukan",
        });
      }

      const [doctor] = await db.query("SELECT id FROM doctors WHERE id = ?", [
        doctor_id,
      ]);

      if (doctor.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Dokter tidak ditemukan",
        });
      }

      const [poli] = await db.query("SELECT id FROM polis WHERE id = ?", [
        poli_id,
      ]);

      if (poli.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Poli tidak ditemukan",
        });
      }

      const [result] = await db.query(
        `UPDATE registrations
         SET patient_id = ?,
             doctor_id = ?,
             poli_id = ?,
             visit_date = ?,
             payment_type = ?,
             initial_complaint = ?,
             status = COALESCE(?, status)
         WHERE id = ?`,
        [
          patient_id,
          doctor_id,
          poli_id,
          visit_date,
          payment_type,
          initial_complaint,
          status || null,
          id,
        ],
      );

      res.json({
        success: true,
        message: "Pendaftaran berhasil diubah",
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message: "Gagal mengubah pendaftaran",
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

      const allowedStatus = ["Menunggu", "Check In", "Pemeriksaan", "Selesai"];

      if (!status) {
        return res.status(400).json({
          success: false,
          message: "Status harus diisi",
          errors: {
            status: "Status harus diisi",
          },
        });
      }

      if (!allowedStatus.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Status tidak valid",
          errors: {
            status: `Status harus salah satu dari: ${allowedStatus.join(", ")}`,
          },
        });
      }

      const [registration] = await db.query(
        "SELECT id FROM registrations WHERE id = ?",
        [id],
      );

      if (registration.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Registrasi tidak ditemukan",
        });
      }

      await db.query("UPDATE registrations SET status = ? WHERE id = ?", [
        status,
        id,
      ]);

      return res.json({
        success: true,
        message: "Status registrasi berhasil diperbarui",
        data: {
          id: Number(id),
          status,
        },
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Gagal memperbarui status registrasi",
      });
    }
  },
);
module.exports = router;
