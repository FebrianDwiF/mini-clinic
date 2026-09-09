const express = require("express");
const cors = require("cors");
const db = require("./db");
require("dotenv").config();

const patientRoutes = require("./routes/patients");
const registrationRoutes = require("./routes/registrations");
const queueRoutes = require("./routes/queues");
const medicalRecordRoutes = require("./routes/medicalRecords");
const prescriptionRoutes = require("./routes/prescriptions");
const authRoutes = require("./routes/auth");
const authenticateToken = require("./middleware/auth");
const authorizeRoles = require("./middleware/role");
const dashboardRoutes = require("./routes/dashboard");
const poliRoutes = require("./routes/polis");
const doctorRoutes = require("./routes/doctors");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/patients", patientRoutes);
app.use("/polis", poliRoutes);
app.use("/registrations", registrationRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/queues", queueRoutes);
app.use("/medical-records", medicalRecordRoutes);
app.use("/prescriptions", prescriptionRoutes);
app.use("/doctors", doctorRoutes);
app.use("/", authRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Mini Clinic API berjalan",
  });
});
app.get(
  "/profile",
  authenticateToken,
  authorizeRoles("Administrator"),
  (req, res) => {
    res.json({
      success: true,
      message: "Akses diberikan",
      data: {
        user: req.user,
      },
    });
  },
);

app.get("/test-db", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT 1 AS result");

    res.json({
      success: true,
      message: "Database berhasil terhubung",
      data: rows,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Database gagal terhubung",
    });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server running on port ${process.env.PORT || 3000}`);
});
