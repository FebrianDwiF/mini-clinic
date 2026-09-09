const express = require("express");
const db = require("../db");
const authenticateToken = require("../middleware/auth");
const authorizeRoles = require("../middleware/role");

const router = express.Router();

// =====================================================
// GET RIWAYAT PEMERIKSAAN PASIEN
// GET /medical-records/:patientId
// =====================================================
router.get(
  "/:patientId",
  authenticateToken,
  authorizeRoles("Administrator", "Dokter"),
  async (req, res) => {
    try {
      const { patientId } = req.params;

      const [rows] = await db.query(
        `
        SELECT
          mr.id,
          mr.registration_id,
          mr.subjective,
          mr.objective,
          mr.assessment,
          mr.plan,
          mr.medical_action,
          mr.created_at,

          r.visit_date,
          r.initial_complaint,

          p.id AS patient_id,
          p.medical_record_number,
          p.name AS patient_name,

          d.id AS doctor_id,
          d.name AS doctor_name,

          po.id AS poli_id,
          po.name AS poli_name

        FROM medical_records mr

        INNER JOIN registrations r
          ON mr.registration_id = r.id

        INNER JOIN patients p
          ON r.patient_id = p.id

        INNER JOIN doctors d
          ON r.doctor_id = d.id

        INNER JOIN polis po
          ON r.poli_id = po.id

        WHERE p.id = ?

        ORDER BY mr.created_at DESC
        `,
        [patientId],
      );

      res.json({
        success: true,
        message: "Riwayat pemeriksaan berhasil diambil",
        data: rows,
      });
    } catch (error) {
      console.error("GET MEDICAL RECORD ERROR:", error);

      res.status(500).json({
        success: false,
        message: "Gagal mengambil riwayat pemeriksaan",
      });
    }
  },
);

// =====================================================
// POST PEMERIKSAAN
// POST /medical-records
// =====================================================
router.post(
  "/",
  authenticateToken,
  authorizeRoles("Administrator", "Dokter"),
  async (req, res) => {
    try {
      const {
        registration_id,
        subjective,
        blood_pressure,
        temperature,
        weight,
        height,
        assessment,
        plan,
        medical_action,
      } = req.body;

      const errors = {};

      if (!registration_id) {
        errors.registration_id = "Registrasi harus dipilih";
      }

      if (!subjective || !subjective.trim()) {
        errors.subjective = "Keluhan pasien harus diisi";
      }

      if (!blood_pressure || !blood_pressure.trim()) {
        errors.blood_pressure = "Tekanan darah harus diisi";
      }

      if (temperature === undefined || temperature === "") {
        errors.temperature = "Suhu tubuh harus diisi";
      }

      if (weight === undefined || weight === "") {
        errors.weight = "Berat badan harus diisi";
      }

      if (height === undefined || height === "") {
        errors.height = "Tinggi badan harus diisi";
      }

      if (!assessment || !assessment.trim()) {
        errors.assessment = "Diagnosa harus diisi";
      }

      if (!plan || !plan.trim()) {
        errors.plan = "Rencana terapi harus diisi";
      }

      if (!medical_action || !medical_action.trim()) {
        errors.medical_action = "Tindakan medis harus diisi";
      }

      if (Object.keys(errors).length > 0) {
        return res.status(400).json({
          success: false,
          message: "Validation Error",
          errors,
        });
      }

      // Cek registrasi
      const [registrations] = await db.query(
        `
        SELECT
          id,
          patient_id,
          doctor_id,
          status
        FROM registrations
        WHERE id = ?
        `,
        [registration_id],
      );

      if (registrations.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Validation Error",
          errors: {
            registration_id: "Registrasi tidak ditemukan",
          },
        });
      }

      // Objective berisi tanda vital
      const objective = [
        `Tekanan Darah: ${blood_pressure.trim()}`,
        `Suhu Tubuh: ${temperature} °C`,
        `Berat Badan: ${weight} kg`,
        `Tinggi Badan: ${height} cm`,
      ].join("\n");

      // Simpan medical record
      const [result] = await db.query(
        `
        INSERT INTO medical_records
        (
          registration_id,
          subjective,
          objective,
          assessment,
          plan,
          medical_action
        )
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          registration_id,
          subjective.trim(),
          objective,
          assessment.trim(),
          plan.trim(),
          medical_action.trim(),
        ],
      );

      // Registrasi menjadi selesai
      await db.query(
        `
        UPDATE registrations
        SET status = 'Selesai'
        WHERE id = ?
        `,
        [registration_id],
      );

      // Antrean menjadi selesai
      await db.query(
        `
        UPDATE queues
        SET status = 'Selesai'
        WHERE registration_id = ?
        `,
        [registration_id],
      );

      res.status(201).json({
        success: true,
        message: "Pemeriksaan berhasil disimpan",
        data: {
          id: result.insertId,
          registration_id,
          subjective: subjective.trim(),
          objective,
          assessment: assessment.trim(),
          plan: plan.trim(),
          medical_action: medical_action.trim(),
        },
      });
    } catch (error) {
      console.error("POST MEDICAL RECORD ERROR:", error);

      res.status(500).json({
        success: false,
        message: "Gagal menyimpan pemeriksaan",
      });
    }
  },
);

module.exports = router;
