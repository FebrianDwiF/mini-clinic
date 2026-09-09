import { useEffect, useState } from "react";
import "./Dashboard.css";

const API_URL = import.meta.env.VITE_API_URL;

function Dashboard({
  onLogout,
  onPatients,
  onRegistrations,
  onQueues,
  onMedicalRecords,
  onPrescriptions,
}) {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const role = user?.role;

  useEffect(() => {
    const getDashboard = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          console.error("Token tidak ditemukan");

          localStorage.removeItem("token");
          localStorage.removeItem("user");

          onLogout();
          return;
        }

        const response = await fetch(`${API_URL}/dashboard`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();

        console.log("Dashboard response:", result);

        // Token tidak valid / expired
        if (response.status === 401) {
          console.error("Token tidak valid atau sudah kedaluwarsa");

          localStorage.removeItem("token");
          localStorage.removeItem("user");

          onLogout();
          return;
        }

        // Tidak memiliki akses
        if (response.status === 403) {
          setError("Anda tidak memiliki akses ke dashboard.");
          return;
        }

        // Server error
        if (!response.ok) {
          setError(result.message || "Gagal mengambil data dashboard.");
          return;
        }

        if (result.success) {
          setDashboard(result.data);
        } else {
          setError(result.message || "Gagal mengambil data dashboard.");
        }
      } catch (error) {
        console.error("Dashboard error:", error);
        setError("Tidak dapat terhubung ke server.");
      }
    };

    getDashboard();
  }, [onLogout]);

  if (error) {
    return (
      <div className="dashboard-container">
        <main className="main-content">
          <h1>Dashboard</h1>
          <p>{error}</p>
        </main>
      </div>
    );
  }

  if (!dashboard) {
    return <p>Loading dashboard...</p>;
  }

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <h2>Mini Clinic</h2>

        <div className="sidebar-menu">
          {/* Dashboard */}
          <button>Dashboard</button>

          {/* Administrator & Petugas Pendaftaran */}
          {(role === "Administrator" || role === "Petugas Pendaftaran") && (
            <>
              <button onClick={onPatients}>Pasien</button>

              <button onClick={onRegistrations}>Registrasi</button>
            </>
          )}

          {/* Administrator, Petugas Pendaftaran & Dokter */}
          {(role === "Administrator" ||
            role === "Petugas Pendaftaran" ||
            role === "Dokter") && <button onClick={onQueues}>Antrean</button>}

          {/* Administrator & Dokter */}
          {(role === "Administrator" || role === "Dokter") && (
            <>
              <button onClick={onMedicalRecords}>Pemeriksaan</button>

              <button onClick={onPrescriptions}>Resep</button>
            </>
          )}
        </div>
      </aside>

      <main className="main-content">
        <div className="topbar">
          <div>
            <h1>Dashboard</h1>
            <p>Selamat datang di Mini Clinic</p>
          </div>

          <div className="user-info">
            <span>
              {user?.name} ({user?.role})
            </span>

            <button className="logout-button" onClick={onLogout}>
              Logout
            </button>
          </div>
        </div>

        <div className="dashboard-cards">
          <div className="dashboard-card">
            <h3>Total Pasien</h3>
            <p>{dashboard.total_patients}</p>
          </div>

          <div className="dashboard-card">
            <h3>Pasien Hari Ini</h3>
            <p>{dashboard.today_patients}</p>
          </div>

          <div className="dashboard-card">
            <h3>Antrean Hari Ini</h3>
            <p>{dashboard.today_queues}</p>
          </div>

          <div className="dashboard-card">
            <h3>Antrean Menunggu</h3>
            <p>{dashboard.waiting_patients}</p>
          </div>

          <div className="dashboard-card">
            <h3>Pasien Selesai</h3>
            <p>{dashboard.completed_patients}</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
