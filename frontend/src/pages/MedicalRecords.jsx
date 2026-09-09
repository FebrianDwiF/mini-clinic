import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function MedicalRecords({ onBack, onLogout }) {
  const token = localStorage.getItem("token");

  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [registrations, setRegistrations] = useState([]);
  const [history, setHistory] = useState([]);

  const [selectedRegistration, setSelectedRegistration] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    subjective: "",
    blood_pressure: "",
    temperature: "",
    weight: "",
    height: "",
    assessment: "",
    plan: "",
    medical_action: "",
  });

  const [prescription, setPrescription] = useState({
    medicine_name: "",
    dosage: "",
    quantity: "",
    instructions: "",
  });

  // =====================================================
  // GET REGISTRATIONS
  // =====================================================

  const getRegistrations = async () => {
    try {
      const response = await fetch(`${API_URL}/registrations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!result.success) {
        alert(result.message || "Gagal mengambil registrasi");
        return;
      }

      const available = (result.data || []).filter(
        (item) => item.status === "Check In" || item.status === "Pemeriksaan",
      );

      setRegistrations(available);
    } catch (error) {
      console.error(error);
      alert("Gagal mengambil data registrasi");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    getRegistrations();
  }, []);

  // =====================================================
  // HANDLE FORM
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePrescriptionChange = (e) => {
    const { name, value } = e.target;

    setPrescription((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =====================================================
  // SELECT PATIENT
  // =====================================================

  const handleSelectRegistration = async (e) => {
    const registrationId = e.target.value;

    setSelectedRegistration(registrationId);

    setHistory([]);

    if (!registrationId) {
      setForm({
        subjective: "",
        blood_pressure: "",
        temperature: "",
        weight: "",
        height: "",
        assessment: "",
        plan: "",
        medical_action: "",
      });

      return;
    }

    const selected = registrations.find(
      (item) => String(item.id) === String(registrationId),
    );

    if (!selected) return;

    // Keluhan awal otomatis menjadi Subjective
    setForm((prev) => ({
      ...prev,
      subjective: selected.initial_complaint || "",
    }));

    // Ubah status menjadi Pemeriksaan
    try {
      await fetch(`${API_URL}/registrations/${registrationId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: "Pemeriksaan",
        }),
      });
    } catch (error) {
      console.error("Gagal mengubah status pemeriksaan:", error);
    }

    getHistory(selected.patient_id);
  };

  // =====================================================
  // GET HISTORY
  // =====================================================

  const getHistory = async (patientId) => {
    if (!patientId) return;

    try {
      const response = await fetch(`${API_URL}/medical-records/${patientId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        setHistory(result.data || []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // =====================================================
  // SAVE MEDICAL RECORD
  // =====================================================

  const saveMedicalRecord = async () => {
    try {
      const response = await fetch(`${API_URL}/medical-records`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          registration_id: Number(selectedRegistration),
          subjective: form.subjective,
          blood_pressure: form.blood_pressure,
          temperature: Number(form.temperature),
          weight: Number(form.weight),
          height: Number(form.height),
          assessment: form.assessment,
          plan: form.plan,
          medical_action: form.medical_action,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        if (result.errors) {
          alert(Object.values(result.errors).join("\n"));
        } else {
          alert(result.message || "Gagal menyimpan pemeriksaan");
        }

        return false;
      }

      return true;
    } catch (error) {
      console.error(error);
      alert("Gagal terhubung ke server");

      return false;
    }
  };

  // =====================================================
  // SAVE PRESCRIPTION
  // =====================================================

  const savePrescription = async () => {
    /*
      Resep bersifat opsional.
      Kalau nama obat kosong, kita tidak membuat resep.
    */
    if (!prescription.medicine_name.trim()) {
      return true;
    }

    if (!prescription.dosage.trim()) {
      alert("Dosis obat harus diisi");
      return false;
    }

    if (!prescription.quantity) {
      alert("Jumlah obat harus diisi");
      return false;
    }

    if (!prescription.instructions.trim()) {
      alert("Aturan penggunaan harus diisi");
      return false;
    }

    try {
      const response = await fetch(`${API_URL}/prescriptions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          registration_id: Number(selectedRegistration),
          medicine_name: prescription.medicine_name,
          dosage: prescription.dosage,
          quantity: Number(prescription.quantity),
          instructions: prescription.instructions,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        alert(result.message || "Gagal menyimpan resep");
        return false;
      }

      return true;
    } catch (error) {
      console.error(error);
      alert("Gagal menyimpan resep");

      return false;
    }
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedRegistration) {
      alert("Silakan pilih pasien terlebih dahulu");
      return;
    }

    setSaving(true);

    const medicalSaved = await saveMedicalRecord();

    if (!medicalSaved) {
      setSaving(false);
      return;
    }

    const prescriptionSaved = await savePrescription();

    if (!prescriptionSaved) {
      setSaving(false);
      return;
    }

    alert("Pemeriksaan berhasil disimpan");

    setSelectedRegistration("");

    setForm({
      subjective: "",
      blood_pressure: "",
      temperature: "",
      weight: "",
      height: "",
      assessment: "",
      plan: "",
      medical_action: "",
    });

    setPrescription({
      medicine_name: "",
      dosage: "",
      quantity: "",
      instructions: "",
    });

    setHistory([]);

    await getRegistrations();

    setSaving(false);
  };

  // =====================================================
  // SELECTED DATA
  // =====================================================

  const selected = registrations.find(
    (item) => String(item.id) === String(selectedRegistration),
  );

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="page-container">
        <p>Loading pemeriksaan...</p>
      </div>
    );
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Pemeriksaan Dokter</h1>
          <p>
            {user?.name} ({user?.role})
          </p>
        </div>

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
      </div>

      {/* ===============================================
          PILIH PASIEN
      =============================================== */}

      <div className="card">
        <h2>Pasien Menunggu Pemeriksaan</h2>

        {registrations.length === 0 ? (
          <p>
            Tidak ada pasien yang siap diperiksa. Pastikan status registrasi
            sudah <b>Check In</b>.
          </p>
        ) : (
          <select
            value={selectedRegistration}
            onChange={handleSelectRegistration}
          >
            <option value="">-- Pilih pasien --</option>

            {registrations.map((registration) => (
              <option key={registration.id} value={registration.id}>
                {registration.medical_record_number} -{" "}
                {registration.patient_name} - {registration.doctor_name} -{" "}
                {registration.poli_name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* ===============================================
          DATA PEMERIKSAAN
      =============================================== */}

      {selected && (
        <form onSubmit={handleSubmit}>
          {/* INFORMASI PASIEN */}

          <div className="card">
            <h2>Informasi Kunjungan</h2>

            <div className="patient-info-grid">
              <div className="patient-info-item">
                <span>Pasien</span>
                <strong>{selected.patient_name}</strong>
              </div>

              <div className="patient-info-item">
                <span>No. RM</span>
                <strong>{selected.medical_record_number}</strong>
              </div>

              <div className="patient-info-item">
                <span>Dokter</span>
                <strong>{selected.doctor_name}</strong>
              </div>

              <div className="patient-info-item">
                <span>Poli</span>
                <strong>{selected.poli_name}</strong>
              </div>

              <div className="patient-info-item">
                <span>Tanggal</span>
                <strong>{String(selected.visit_date).substring(0, 10)}</strong>
              </div>

              <div className="patient-info-item">
                <span>Status</span>
                <strong>{selected.status}</strong>
              </div>
            </div>

            <p>
              <strong>Tanggal:</strong>{" "}
              {String(selected.visit_date).substring(0, 10)}
            </p>

            <p>
              <strong>Keluhan Awal:</strong> {selected.initial_complaint}
            </p>
          </div>

          {/* SOAP */}

          <div className="card">
            <h2>SOAP</h2>

            {/* SUBJECTIVE */}

            <h3>Subjective</h3>

            <label>Keluhan Pasien</label>

            <textarea
              name="subjective"
              value={form.subjective}
              onChange={handleChange}
              rows="4"
              placeholder="Masukkan keluhan pasien"
            />

            {/* OBJECTIVE */}

            <h3>Objective</h3>

            <div className="form-grid">
              <div>
                <label>Tekanan Darah</label>

                <input
                  type="text"
                  name="blood_pressure"
                  value={form.blood_pressure}
                  onChange={handleChange}
                  placeholder="120/80 mmHg"
                />
              </div>

              <div>
                <label>Suhu Tubuh (°C)</label>

                <input
                  type="number"
                  step="0.1"
                  name="temperature"
                  value={form.temperature}
                  onChange={handleChange}
                  placeholder="36.5"
                />
              </div>

              <div>
                <label>Berat Badan (kg)</label>

                <input
                  type="number"
                  step="0.1"
                  name="weight"
                  value={form.weight}
                  onChange={handleChange}
                  placeholder="60"
                />
              </div>

              <div>
                <label>Tinggi Badan (cm)</label>

                <input
                  type="number"
                  step="0.1"
                  name="height"
                  value={form.height}
                  onChange={handleChange}
                  placeholder="170"
                />
              </div>
            </div>

            {/* ASSESSMENT */}

            <h3>Assessment</h3>

            <label>Diagnosa</label>

            <textarea
              name="assessment"
              value={form.assessment}
              onChange={handleChange}
              rows="3"
              placeholder="Masukkan diagnosa pasien"
            />

            {/* PLAN */}

            <h3>Plan</h3>

            <label>Rencana Terapi</label>

            <textarea
              name="plan"
              value={form.plan}
              onChange={handleChange}
              rows="4"
              placeholder="Masukkan rencana terapi"
            />
          </div>

          {/* TINDAKAN */}

          <div className="card">
            <h2>Tindakan Medis</h2>

            <label>Tindakan</label>

            <textarea
              name="medical_action"
              value={form.medical_action}
              onChange={handleChange}
              rows="4"
              placeholder="Contoh: Pemeriksaan fisik, nebulisasi, perawatan luka, dll."
            />
          </div>

          {/* RESEP */}

          <div className="card">
            <h2>Resep Obat</h2>

            <p>
              Jika pasien tidak mendapatkan obat, bagian ini boleh dikosongkan.
            </p>

            <label>Nama Obat</label>

            <input
              type="text"
              name="medicine_name"
              value={prescription.medicine_name}
              onChange={handlePrescriptionChange}
              placeholder="Contoh: Paracetamol"
            />

            <label>Dosis</label>

            <input
              type="text"
              name="dosage"
              value={prescription.dosage}
              onChange={handlePrescriptionChange}
              placeholder="Contoh: 500 mg"
            />

            <label>Jumlah</label>

            <input
              type="number"
              name="quantity"
              value={prescription.quantity}
              onChange={handlePrescriptionChange}
              min="1"
              placeholder="10"
            />

            <label>Aturan Penggunaan</label>

            <textarea
              name="instructions"
              value={prescription.instructions}
              onChange={handlePrescriptionChange}
              rows="3"
              placeholder="Contoh: 3 x sehari setelah makan"
            />
          </div>

          <button type="submit" disabled={saving}>
            {saving ? "Menyimpan..." : "Simpan Pemeriksaan"}
          </button>
        </form>
      )}

      {/* ===============================================
          RIWAYAT
      =============================================== */}

      <div className="card">
        <h2>Riwayat Pemeriksaan</h2>

        {history.length === 0 ? (
          <p>Belum ada riwayat pemeriksaan.</p>
        ) : (
          history.map((record) => (
            <div
              key={record.id}
              style={{
                borderBottom: "1px solid #ddd",
                padding: "15px 0",
              }}
            >
              <p>
                <strong>Tanggal:</strong>{" "}
                {String(record.visit_date).substring(0, 10)}
              </p>

              <p>
                <strong>Dokter:</strong> {record.doctor_name}
              </p>

              <p>
                <strong>Subjective:</strong>
                <br />
                {record.subjective}
              </p>

              <p>
                <strong>Objective:</strong>
                <br />
                {record.objective}
              </p>

              <p>
                <strong>Assessment:</strong>
                <br />
                {record.assessment}
              </p>

              <p>
                <strong>Plan:</strong>
                <br />
                {record.plan}
              </p>

              <p>
                <strong>Tindakan:</strong>
                <br />
                {record.medical_action}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default MedicalRecords;
