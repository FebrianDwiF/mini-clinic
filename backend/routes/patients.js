const express = require("express");
const authenticateToken = require("../middleware/auth");
const authorizeRoles = require("../middleware/role");

const db = require("../db");
const router = express.Router();

router.get(
  "/",
  authenticateToken,
  authorizeRoles("Administrator", "Petugas Pendaftaran"),
  async (req, res) => {
    try {
      const { search = "", page = 1, limit = 10 } = req.query;

      const offset = (page - 1) * limit;

      const searchQuery = `%${search}%`;

      const [rows] = await db.query(
        `SELECT *
       FROM patients
       WHERE name LIKE ?
          OR nik LIKE ?
          OR medical_record_number LIKE ?
       ORDER BY id DESC
       LIMIT ? OFFSET ?`,
        [searchQuery, searchQuery, searchQuery, Number(limit), Number(offset)],
      );

      const [countResult] = await db.query(
        `SELECT COUNT(*) AS total
       FROM patients
       WHERE name LIKE ?
          OR nik LIKE ?
          OR medical_record_number LIKE ?`,
        [searchQuery, searchQuery, searchQuery],
      );

      const total = countResult[0].total;

      res.json({
        success: true,
        message: "Data pasien berhasil diambil",
        data: rows,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message: "Gagal mengambil data pasien",
      });
    }
  },
);

router.get(
  "/:id",
  authenticateToken,
  authorizeRoles("Administrator", "Petugas Pendaftaran"),
  async (req, res) => {
    try {
      const { id } = req.params;

      const [rows] = await db.query("SELECT * FROM patients WHERE id = ?", [
        id,
      ]);

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Pasien tidak ditemukan",
        });
      }

      res.json({
        success: true,
        message: "Data pasien berhasil diambil",
        data: rows[0],
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message: "Gagal mengambil data pasien",
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
      const { nik, name, gender, date_of_birth, phone, address } = req.body;
      const errors = {};

      if (!nik) errors.nik = "NIK harus diisi";
      if (nik && !/^\d{16}$/.test(nik)) {
        errors.nik = "NIK harus terdiri dari 16 digit";
      }
      if (!name) errors.name = "Nama harus diisi";
      if (!gender) errors.gender = "Jenis kelamin harus diisi";
      if (gender && !["L", "P"].includes(gender)) {
        errors.gender = "Jenis kelamin harus L atau P";
      }
      const [existingPatient] = await db.query(
        "SELECT id FROM patients WHERE nik = ?",
        [nik],
      );

      if (existingPatient.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Validation Error",
          errors: {
            nik: "NIK sudah terdaftar",
          },
        });
      }
      if (Object.keys(errors).length > 0) {
        return res.status(400).json({
          success: false,
          message: "Validation Error",
          errors: errors,
        });
      }

      const [lastPatient] = await db.query(
        ` SELECT medical_record_number
        FROM patients
        ORDER BY id DESC
        LIMIT 1`,
      );

      let medicalRecordNumber = "RM000001";

      if (lastPatient.length > 0) {
        const lastNumber = parseInt(
          lastPatient[0].medical_record_number.replace("RM", ""),
        );

        medicalRecordNumber = "RM" + String(lastNumber + 1).padStart(6, "0");
      }

      const [result] = await db.query(
        `INSERT INTO patients
      (nik, name, gender, date_of_birth, phone, address, medical_record_number)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [nik, name, gender, date_of_birth, phone, address, medicalRecordNumber],
      );

      res.status(201).json({
        success: true,
        message: "Pasien berhasil ditambahkan",
        data: {
          id: result.insertId,
          medical_record_number: medicalRecordNumber,
        },
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message: "Gagal menambahkan pasien",
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
      const { name, gender, date_of_birth, phone, address } = req.body;
      const errors = {};

      if (!name) errors.name = "Nama harus diisi";
      if (!gender) errors.gender = "Jenis kelamin harus diisi";
      if (gender && !["L", "P"].includes(gender)) {
        errors.gender = "Jenis kelamin harus L atau P";
      }
      if (Object.keys(errors).length > 0) {
        return res.status(400).json({
          success: false,
          message: "Validation Error",
          errors: errors,
        });
      }

      const [result] = await db.query(
        `UPDATE patients
       SET name = ?,
           gender = ?,
           date_of_birth = ?,
           phone = ?,
           address = ?
       WHERE id = ?`,
        [name, gender, date_of_birth, phone, address, id],
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Pasien tidak ditemukan",
        });
      }
      res.json({
        success: true,
        message: "Data pasien berhasil diubah",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Gagal mengubah data pasien",
      });
    }
  },
);

router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("Administrator", "Petugas Pendaftaran"),
  async (req, res) => {
    try {
      const { id } = req.params;

      const [result] = await db.query("DELETE FROM patients WHERE id = ?", [
        id,
      ]);

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Pasien tidak ditemukan",
        });
      }

      res.json({
        success: true,
        message: "Pasien berhasil dihapus",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Gagal menghapus pasien",
      });
    }
  },
);
module.exports = router;
