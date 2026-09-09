import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function Queues({ onBack, onLogout }) {
  const [queues, setQueues] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [selectedRegistration, setSelectedRegistration] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  // =========================
  // GET QUEUES
  // =========================
  const getQueues = async () => {
    try {
      const response = await fetch(`${API_URL}/queues`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      console.log("QUEUES:", result);

      if (!response.ok) {
        throw new Error(result.message || "Gagal mengambil data antrean");
      }

      if (result.success) {
        setQueues(result.data || []);
      }
    } catch (error) {
      console.error("GET QUEUES ERROR:", error);
      alert(error.message);
    }
  };

  // =========================
  // GET REGISTRATIONS
  // =========================
  const getRegistrations = async () => {
    try {
      const response = await fetch(`${API_URL}/registrations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      console.log("REGISTRATIONS:", result);

      if (!response.ok) {
        throw new Error(result.message || "Gagal mengambil data pendaftaran");
      }

      if (result.success) {
        setRegistrations(result.data || []);
      }
    } catch (error) {
      console.error("GET REGISTRATIONS ERROR:", error);
      alert(error.message);
    }
  };

  // =========================
  // CREATE QUEUE
  // =========================
  const createQueue = async (event) => {
    event.preventDefault();

    if (!selectedRegistration) {
      alert("Pilih pendaftaran terlebih dahulu");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/queues`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          registration_id: Number(selectedRegistration),
        }),
      });

      const result = await response.json();

      console.log("CREATE QUEUE:", result);

      if (!response.ok) {
        throw new Error(result.message || "Gagal membuat antrean");
      }

      if (result.success) {
        alert(result.message || "Antrean berhasil dibuat");

        setSelectedRegistration("");

        await getQueues();
        await getRegistrations();
      } else {
        throw new Error(result.message || "Gagal membuat antrean");
      }
    } catch (error) {
      console.error("CREATE QUEUE ERROR:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // CALL QUEUE
  // =========================
  const callQueue = async (id) => {
    try {
      const response = await fetch(`${API_URL}/queues/${id}/call`, {
        method: "PUT",
        headers,
      });

      const result = await response.json();

      console.log("CALL QUEUE:", result);

      if (!response.ok) {
        throw new Error(result.message || "Gagal memanggil antrean");
      }

      if (result.success) {
        await getQueues();
      } else {
        throw new Error(result.message || "Gagal memanggil antrean");
      }
    } catch (error) {
      console.error("CALL QUEUE ERROR:", error);
      alert(error.message);
    }
  };

  // =========================
  // UPDATE QUEUE STATUS
  // =========================
  const updateQueueStatus = async (id, status) => {
    try {
      const response = await fetch(`${API_URL}/queues/${id}/status`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          status,
        }),
      });

      const result = await response.json();

      console.log("UPDATE QUEUE:", result);

      if (!response.ok) {
        throw new Error(result.message || "Gagal mengubah status antrean");
      }

      if (result.success) {
        await getQueues();
      } else {
        throw new Error(result.message || "Gagal mengubah status antrean");
      }
    } catch (error) {
      console.error("UPDATE QUEUE ERROR:", error);
      alert(error.message);
    }
  };

  // =========================
  // INITIAL LOAD
  // =========================
  useEffect(() => {
    getQueues();
    getRegistrations();
  }, []);

  // =========================
  // FORMAT QUEUE NUMBER
  // =========================
  const formatQueueNumber = (number) => {
    return `A${String(number).padStart(3, "0")}`;
  };

  // =========================
  // FILTER REGISTRATIONS
  // =========================
  const availableRegistrations = registrations.filter((registration) => {
    const alreadyQueued = queues.some(
      (queue) => queue.registration_id === registration.id,
    );

    return !alreadyQueued && registration.status !== "Selesai";
  });

  return (
    <div className="page-container">
      <div className="page-toolbar">
        <button className="btn-secondary" onClick={onBack}>
          ← Dashboard
        </button>

        <button className="btn-danger" onClick={onLogout}>
          Logout
        </button>
      </div>
      <div className="page-header">
        <div>
          <h1>Antrean Pasien</h1>
          <p>Kelola antrean pasien hari ini</p>
        </div>
      </div>

      {/* =========================
          CREATE QUEUE
      ========================= */}
      <div className="card">
        <h2>Buat Antrean</h2>

        <form onSubmit={createQueue}>
          <div className="form-group">
            <label>Pendaftaran</label>

            <select
              value={selectedRegistration}
              onChange={(e) => setSelectedRegistration(e.target.value)}
              required
            >
              <option value="">Pilih pendaftaran</option>

              {availableRegistrations.map((registration) => (
                <option key={registration.id} value={registration.id}>
                  {registration.medical_record_number} -{" "}
                  {registration.patient_name} - {registration.poli_name}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Membuat..." : "Buat Nomor Antrean"}
          </button>
        </form>
      </div>

      {/* =========================
          QUEUE LIST
      ========================= */}
      <div className="card">
        <div className="card-header">
          <h2>Daftar Antrean</h2>

          <button type="button" onClick={getQueues} className="btn-secondary">
            Refresh
          </button>
        </div>

        {queues.length === 0 ? (
          <div className="empty-state">Belum ada antrean.</div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>No. Antrean</th>
                  <th>No. RM</th>
                  <th>Pasien</th>
                  <th>Dokter</th>
                  <th>Poli</th>
                  <th>Tanggal</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>

              <tbody>
                {queues.map((queue) => (
                  <tr key={queue.id}>
                    <td>
                      <strong>{formatQueueNumber(queue.queue_number)}</strong>
                    </td>

                    <td>{queue.medical_record_number}</td>

                    <td>{queue.patient_name}</td>

                    <td>{queue.doctor_name}</td>

                    <td>{queue.poli_name}</td>

                    <td>{queue.visit_date}</td>

                    <td>
                      <span
                        className={`status status-${queue.status
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`}
                      >
                        {queue.status}
                      </span>
                    </td>

                    <td>
                      <div className="action-buttons">
                        {queue.status === "Menunggu" && (
                          <button
                            type="button"
                            className="btn-primary"
                            onClick={() => callQueue(queue.id)}
                          >
                            Panggil
                          </button>
                        )}

                        {queue.status === "Dipanggil" && (
                          <button
                            type="button"
                            className="btn-success"
                            onClick={() =>
                              updateQueueStatus(queue.id, "Selesai")
                            }
                          >
                            Selesaikan
                          </button>
                        )}

                        {queue.status === "Selesai" && <span>-</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Queues;
