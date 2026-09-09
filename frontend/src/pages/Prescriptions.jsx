import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function Prescriptions({ onBack, onLogout }) {
  const [registrations, setRegistrations] = useState([]);

  const [prescriptions, setPrescriptions] = useState([]);

  const [selectedRegistration, setSelectedRegistration] = useState("");

  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    registration_id: "",
    medicine_name: "",
    dosage: "",
    quantity: "",
    instructions: "",
  });

  const getRegistrations = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/registrations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        setRegistrations(result.data || []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getPrescriptions = async (registrationId) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/prescriptions/${registrationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const result = await response.json();

      if (result.success) {
        setPrescriptions(result.data || []);
      } else {
        setPrescriptions([]);
      }
    } catch (error) {
      console.error(error);
      setPrescriptions([]);
    }
  };

  useEffect(() => {
    const load = async () => {
      await getRegistrations();
      setLoading(false);
    };

    load();
  }, []);

  const handleRegistrationChange = (e) => {
    const registrationId = e.target.value;

    setSelectedRegistration(registrationId);

    setForm((prev) => ({
      ...prev,
      registration_id: registrationId,
    }));

    if (registrationId) {
      getPrescriptions(registrationId);
    } else {
      setPrescriptions([]);
    }
  };

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.registration_id) {
      alert("Pilih pasien terlebih dahulu");
      return;
    }

    if (!form.medicine_name.trim()) {
      alert("Nama obat harus diisi");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/prescriptions`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          registration_id: Number(form.registration_id),

          medicine_name: form.medicine_name,

          dosage: form.dosage,

          quantity: Number(form.quantity),

          instructions: form.instructions,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert("Resep berhasil disimpan");

        await getPrescriptions(form.registration_id);

        setForm((prev) => ({
          ...prev,
          medicine_name: "",
          dosage: "",
          quantity: "",
          instructions: "",
        }));
      } else {
        if (result.errors) {
          alert(Object.values(result.errors).join("\n"));
        } else {
          alert(result.message);
        }
      }
    } catch (error) {
      console.error(error);

      alert("Gagal menyimpan resep");
    }
  };

  if (loading) {
    return <p>Loading resep...</p>;
  }

  return (
    <div className="prescriptions-page">
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
          <h1>Resep Obat</h1>
          <p>Kelola resep obat pasien</p>
        </div>
      </div>
      <div className="card">
        <h2>Buat Resep</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Pasien / Registrasi</label>

            <select
              value={selectedRegistration}
              onChange={handleRegistrationChange}
              required
            >
              <option value="">Pilih pasien</option>

              {registrations.map((registration) => (
                <option key={registration.id} value={registration.id}>
                  {registration.medical_record_number} -{" "}
                  {registration.patient_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Nama Obat</label>

            <input
              type="text"
              name="medicine_name"
              value={form.medicine_name}
              onChange={handleChange}
              placeholder="Contoh: Paracetamol"
              required
            />
          </div>

          <div>
            <label>Dosis</label>

            <input
              type="text"
              name="dosage"
              value={form.dosage}
              onChange={handleChange}
              placeholder="Contoh: 500 mg"
              required
            />
          </div>

          <div>
            <label>Jumlah</label>

            <input
              type="number"
              name="quantity"
              value={form.quantity}
              onChange={handleChange}
              min="1"
              placeholder="Jumlah obat"
              required
            />
          </div>

          <div>
            <label>Aturan Pakai</label>

            <textarea
              name="instructions"
              value={form.instructions}
              onChange={handleChange}
              placeholder="Contoh: 3x sehari setelah makan"
              required
            />
          </div>

          <button type="submit">Simpan Resep</button>
        </form>
      </div>

      <hr />

      <div className="card">
        <div className="card-header">
          <div>
            <h2>Resep Pasien</h2>
            <p style={{ color: "#667085", fontSize: "13px" }}>
              Daftar obat untuk registrasi yang dipilih
            </p>
          </div>
        </div>
        ...
      </div>

      {prescriptions.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>No.</th>

              <th>Nama Obat</th>

              <th>Dosis</th>

              <th>Jumlah</th>

              <th>Aturan Pakai</th>
            </tr>
          </thead>

          <tbody>
            {prescriptions.map((prescription, index) => (
              <tr key={prescription.id}>
                <td>{index + 1}</td>

                <td>{prescription.medicine_name}</td>

                <td>{prescription.dosage}</td>

                <td>{prescription.quantity}</td>

                <td>{prescription.instructions}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Belum ada resep untuk registrasi ini.</p>
      )}
    </div>
  );
}

export default Prescriptions;
