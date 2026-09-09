const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db");
const authenticateToken = require("../middleware/auth");

const router = express.Router();

// POST /login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const errors = {};

    if (!username) {
      errors.username = "Username harus diisi";
    }

    if (!password) {
      errors.password = "Password harus diisi";
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: errors,
      });
    }

    // Cari user berdasarkan username
    const [users] = await db.query(
      `SELECT id, username, password, name, role
       FROM users
       WHERE username = ?`,
      [username],
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Username atau password salah",
      });
    }

    const user = users[0];

    // Cek password dengan bcrypt
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Username atau password salah",
      });
    }

    // Buat JWT
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      },
    );

    res.json({
      success: true,
      message: "Login berhasil",
      data: {
        token: token,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Login gagal",
    });
  }
});

router.post("/logout", authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: "Logout berhasil",
  });
});

module.exports = router;
