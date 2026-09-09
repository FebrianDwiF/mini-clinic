const bcrypt = require("bcrypt");
const db = require("./db");

async function createUser() {
  try {
    const username = "admin";
    const password = "admin123";
    const name = "Administrator";
    const role = "Administrator";

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan user ke database
    const [result] = await db.query(
      `INSERT INTO users
      (username, password, name, role)
      VALUES (?, ?, ?, ?)`,
      [username, hashedPassword, name, role],
    );

    console.log("User berhasil dibuat");
    console.log("ID:", result.insertId);
    console.log("Username:", username);
    console.log("Role:", role);

    process.exit();
  } catch (error) {
    console.error("Gagal membuat user:", error);
    process.exit(1);
  }
}

createUser();
