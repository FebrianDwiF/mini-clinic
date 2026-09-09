import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function Registrations({ onBack, onLogout }) {
  const [registrations, setRegistrations] = useState([]);
  const [patients, setPatients] = useState([]);
  const [polis, setPolis] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    patient_id: "",
    doctor_id: "",
    poli_id: "",
    visit_date: "",
    payment_type: "",
    initial_complaint: "",
    status: "Menunggu",
  });

  // =========================================================
  // GET PATIENTS
  // =========================================================

  const getPatients = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/patients?limit=100`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      console.log("Patients:", result);

      if (result.success) {
        setPatients(result.data || []);
      } else {
        alert(result.message || "Gagal mengambil data pasien");
      }
    } catch (error) {
      console.error("GET PATIENTS ERROR:", error);
      alert("Gagal mengambil data pasien");
    }
  };

  // =========================================================
  // GET REGISTRATIONS
  // =========================================================

  const getRegistrations = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/registrations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      console.log("Registrations:", result);

      if (result.success) {
        setRegistrations(result.data || []);
      } else {
        alert(result.message || "Gagal mengambil data registrasi");
      }
    } catch (error) {
      console.error("GET REGISTRATIONS ERROR:", error);

      alert("Gagal mengambil data registrasi");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    getPatients();
    getRegistrations();
    getPolis();
    getDoctors();
  }, []);
  // =========================================================
  // GET POLIS
  // =========================================================

  const getPolis = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/polis`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      console.log("Polis:", result);

      if (result.success) {
        setPolis(result.data || []);
      } else {
        alert(result.message || "Gagal mengambil data poli");
      }
    } catch (error) {
      console.error("GET POLIS ERROR:", error);
      alert("Gagal mengambil data poli");
    }
  };

  const getDoctors = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/doctors`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      console.log("DOCTORS RESPONSE:", result);

      if (!response.ok) {
        throw new Error(result.message || "Gagal mengambil data dokter");
      }

      if (result.success) {
        setDoctors(result.data || []);
      } else {
        throw new Error(result.message || "Gagal mengambil data dokter");
      }
    } catch (error) {
      console.error("GET DOCTORS ERROR:", error);
      alert(error.message);
    }
  };

  // =========================================================
  // HANDLE SEARCH
  // =========================================================

  const filteredRegistrations = registrations.filter((registration) => {
    if (!search.trim()) {
      return true;
    }

    const keyword = search.toLowerCase();

    return (
      String(registration.medical_record_number || "")
        .toLowerCase()
        .includes(keyword) ||
      String(registration.patient_name || "")
        .toLowerCase()
        .includes(keyword) ||
      String(registration.doctor_name || "")
        .toLowerCase()
        .includes(keyword) ||
      String(registration.poli_name || "")
        .toLowerCase()
        .includes(keyword) ||
      String(registration.payment_type || "")
        .toLowerCase()
        .includes(keyword) ||
      String(registration.initial_complaint || "")
        .toLowerCase()
        .includes(keyword) ||
      String(registration.status || "")
        .toLowerCase()
        .includes(keyword)
    );
  });

  // =========================================================
  // HANDLE CHANGE
  // =========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================================================
  // RESET FORM
  // =========================================================

  const resetForm = () => {
    setForm({
      patient_id: "",
      doctor_id: "",
      poli_id: "",
      visit_date: "",
      payment_type: "",
      initial_complaint: "",
      status: "Menunggu",
    });

    setEditingId(null);
    setShowForm(false);
  };

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // =======================================================
    // VALIDATION FRONTEND
    // =======================================================

    const errors = {};

    if (!form.patient_id) {
      errors.patient_id = "Pasien harus dipilih";
    }

    if (!form.doctor_id) {
      errors.doctor_id = "Dokter harus dipilih";
    }

    if (!form.poli_id) {
      errors.poli_id = "Poli harus dipilih";
    }

    if (!form.visit_date) {
      errors.visit_date = "Tanggal kunjungan harus diisi";
    }

    if (!form.payment_type) {
      errors.payment_type = "Jenis pembayaran harus dipilih";
    }

    if (!form.initial_complaint.trim()) {
      errors.initial_complaint = "Keluhan awal harus diisi";
    }

    if (Object.keys(errors).length > 0) {
      alert(Object.values(errors).join("\n"));
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const url = editingId
        ? `${API_URL}/registrations/${editingId}`
        : `${API_URL}/registrations`;

      const method = editingId ? "PUT" : "POST";

      // =======================================================
      // PAYLOAD SESUAI BACKEND
      // =======================================================

      const payload = {
        patient_id: Number(form.patient_id),

        doctor_id: Number(form.doctor_id),

        poli_id: Number(form.poli_id),

        visit_date: form.visit_date,

        payment_type: form.payment_type,

        initial_complaint: form.initial_complaint.trim(),
      };

      // Status hanya digunakan ketika EDIT
      if (editingId) {
        payload.status = form.status;
      }

      console.log("Payload Registrasi:", payload);

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify(payload),
      });

      const result = await response.json();

      console.log("Response Registrasi:", result);

      if (result.success) {
        alert(
          editingId
            ? "Registrasi berhasil diubah"
            : "Registrasi berhasil dibuat",
        );

        resetForm();

        await getRegistrations();
      } else {
        if (result.errors) {
          alert(Object.values(result.errors).join("\n"));
        } else {
          alert(result.message || "Gagal menyimpan registrasi");
        }
      }
    } catch (error) {
      console.error("SUBMIT REGISTRATION ERROR:", error);

      alert("Gagal terhubung ke server");
    }
  };

  // =========================================================
  // EDIT
  // =========================================================

  const handleEdit = (registration) => {
    console.log("Edit registration:", registration);

    setEditingId(registration.id);

    setForm({
      patient_id: registration.patient_id
        ? String(registration.patient_id)
        : "",

      doctor_id: registration.doctor_id ? String(registration.doctor_id) : "",

      poli_id: registration.poli_id ? String(registration.poli_id) : "",

      visit_date: registration.visit_date
        ? String(registration.visit_date).substring(0, 10)
        : "",

      payment_type: registration.payment_type || "",

      initial_complaint: registration.initial_complaint || "",

      status: registration.status || "Menunggu",
    });

    setShowForm(true);
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return String(date).substring(0, 10);
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div>
        <p>Loading data registrasi...</p>
      </div>
    );
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="page-container">
      {/* =====================================================
          NAVIGATION
      ====================================================== */}

      <div className="page-toolbar">
        <div className="page-toolbar-left">
          <button className="btn-secondary" onClick={onBack}>
            ← Dashboard
          </button>
        </div>

        <div className="page-toolbar-right">
          <button className="btn-danger" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>

      <div className="page-header">
        <div>
          <h1>Registrasi Pasien</h1>
          <p>Kelola pendaftaran kunjungan pasien</p>
        </div>
      </div>

      {/* =====================================================
          SEARCH
      ====================================================== */}

      <div className="card">
        <div className="search-toolbar">
          <div className="search-box">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari pasien, No. RM, dokter, poli..."
            />
          </div>

          <button
            className="btn-primary"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
          >
            + Registrasi Baru
          </button>
        </div>

        <p className="pagination-info">
          Menampilkan {filteredRegistrations.length} dari {registrations.length}{" "}
          registrasi
        </p>
      </div>

      {/* =====================================================
          FORM
      ====================================================== */}

      {showForm && (
        <div className="card">
          <div className="card-header">
            <div>
              <h2>{editingId ? "Edit Registrasi" : "Registrasi Baru"}</h2>
              <p style={{ color: "#667085", margin: "5px 0 0" }}>
                Lengkapi informasi kunjungan pasien
              </p>
            </div>
          </div>
          <form onSubmit={handleSubmit}>
            <h2>{editingId ? "Edit Registrasi" : "Registrasi Pasien Baru"}</h2>

            {/* =================================================
              PASIEN
          ================================================== */}

            <div>
              <label>Pasien</label>

              <select
                name="patient_id"
                value={form.patient_id}
                onChange={handleChange}
                required
              >
                <option value="">Pilih pasien</option>

                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.medical_record_number} - {patient.name}
                  </option>
                ))}
              </select>
            </div>

            {/* =================================================
              DOKTER
          ================================================== */}

            <div>
              <label>Dokter</label>

              <select
                name="doctor_id"
                value={form.doctor_id}
                onChange={handleChange}
                required
              >
                <option value="">Pilih dokter</option>

                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name}
                  </option>
                ))}
              </select>
            </div>

            {/* =================================================
              POLI
          ================================================== */}

            <div>
              <label>Poli</label>

              <select
                name="poli_id"
                value={form.poli_id}
                onChange={handleChange}
                required
              >
                <option value="">Pilih poli</option>

                {polis.map((poli) => (
                  <option key={poli.id} value={poli.id}>
                    {poli.name}
                  </option>
                ))}
              </select>

              {polis.length === 0 && (
                <small>Data poli belum tersedia dari backend.</small>
              )}
            </div>

            {/* =================================================
              TANGGAL KUNJUNGAN
          ================================================== */}

            <div>
              <label>Tanggal Kunjungan</label>

              <input
                type="date"
                name="visit_date"
                value={form.visit_date}
                onChange={handleChange}
                required
              />
            </div>

            {/* =================================================
              PEMBAYARAN
          ================================================== */}

            <div>
              <label>Jenis Pembayaran</label>

              <select
                name="payment_type"
                value={form.payment_type}
                onChange={handleChange}
                required
              >
                <option value="">Pilih pembayaran</option>

                <option value="Umum">Umum</option>

                <option value="BPJS">BPJS</option>
              </select>
            </div>

            {/* =================================================
              KELUHAN
          ================================================== */}

            <div>
              <label>Keluhan Awal</label>

              <textarea
                name="initial_complaint"
                value={form.initial_complaint}
                onChange={handleChange}
                placeholder="Masukkan keluhan awal pasien"
                required
              />
            </div>

            {/* =================================================
              STATUS
          ================================================== */}

            <div>
              <label>Status</label>

              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                required
                disabled={!editingId}
              >
                <option value="Menunggu">Menunggu</option>

                <option value="Check In">Check In</option>

                <option value="Pemeriksaan">Pemeriksaan</option>

                <option value="Selesai">Selesai</option>
              </select>

              {!editingId && (
                <small>
                  Registrasi baru otomatis memiliki status "Menunggu".
                </small>
              )}
            </div>

            {/* =================================================
              BUTTON
          ================================================== */}

            <button type="submit">
              {editingId ? "Simpan Perubahan" : "Simpan Registrasi"}
            </button>

            <button type="button" onClick={resetForm}>
              Batal
            </button>
          </form>
        </div>
      )}

      {/* =====================================================
          INFO
      ====================================================== */}

      <div className="card">
        <div className="card-header">
          <div>
            <h2>Daftar Registrasi</h2>
            <p style={{ color: "#667085", margin: "5px 0 18px" }}>
              Riwayat pendaftaran pasien
            </p>
          </div>
        </div>

        {/* =====================================================
          TABLE
      ====================================================== */}
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>No.</th>

                <th>No. RM</th>

                <th>Pasien</th>

                <th>Dokter</th>

                <th>Poli</th>

                <th>Tanggal</th>

                <th>Pembayaran</th>

                <th>Keluhan</th>

                <th>Status</th>

                <th>Aksi</th>
              </tr>
            </thead>

            <tbody>
              {filteredRegistrations.length > 0 ? (
                filteredRegistrations.map((registration, index) => (
                  <tr key={registration.id}>
                    <td>{index + 1}</td>

                    <td>{registration.medical_record_number}</td>

                    <td>{registration.patient_name}</td>

                    <td>{registration.doctor_name}</td>

                    <td>{registration.poli_name}</td>

                    <td>{formatDate(registration.visit_date)}</td>

                    <td>{registration.payment_type}</td>

                    <td>{registration.initial_complaint || "-"}</td>

                    <td>
                      <span
                        className={`status status-${registration.status
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`}
                      >
                        {registration.status}
                      </span>
                    </td>

                    <td>
                      <button onClick={() => handleEdit(registration)}>
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10">
                    {search
                      ? "Data registrasi tidak ditemukan"
                      : "Belum ada data registrasi"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Registrations;
