import { useEffect, useState } from "react";
const API_URL = import.meta.env.VITE_API_URL;

function Patients({ onBack, onLogout }) {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [detailPatient, setDetailPatient] = useState(null);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 1,
  });

  const [form, setForm] = useState({
    nik: "",
    name: "",
    gender: "",
    date_of_birth: "",
    phone: "",
    address: "",
  });

  // =========================
  // HANDLE FORM
  // =========================

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // =========================
  // GET DATA PASIEN
  // =========================

  const getPatients = async (currentPage = page, currentSearch = search) => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:3000/patients?search=${encodeURIComponent(
          currentSearch,
        )}&page=${currentPage}&limit=5`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const result = await response.json();

      if (result.success) {
        setPatients(result.data);
        setPagination(result.pagination);
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error(error);
      alert("Gagal mengambil data pasien");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getPatients(page, search);
  }, [page, search]);

  // =========================
  // TAMBAH / EDIT PASIEN
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      const url = editingId
        ? `${API_URL}/patients/${editingId}`
        : `${API_URL}/patients`;

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const result = await response.json();

      console.log(result);

      if (result.success) {
        alert(
          editingId
            ? "Data pasien berhasil diubah"
            : "Pasien berhasil ditambahkan",
        );

        resetForm();

        getPatients(page, search);
      } else {
        if (result.errors) {
          const errorMessages = Object.values(result.errors).join("\n");
          alert(errorMessages);
        } else {
          alert(result.message);
        }
      }
    } catch (error) {
      console.error(error);
      alert("Gagal terhubung ke server");
    }
  };

  // =========================
  // RESET FORM
  // =========================

  const resetForm = () => {
    setForm({
      nik: "",
      name: "",
      gender: "",
      date_of_birth: "",
      phone: "",
      address: "",
    });

    setEditingId(null);
    setShowForm(false);
  };

  // =========================
  // DETAIL PASIEN
  // =========================

  const handleDetail = async (id) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/patients/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        setDetailPatient(result.data);
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error(error);
      alert("Gagal mengambil detail pasien");
    }
  };

  // =========================
  // EDIT PASIEN
  // =========================

  const handleEdit = (patient) => {
    setEditingId(patient.id);

    setForm({
      nik: patient.nik,
      name: patient.name,
      gender: patient.gender,
      date_of_birth: patient.date_of_birth
        ? patient.date_of_birth.substring(0, 10)
        : "",
      phone: patient.phone || "",
      address: patient.address || "",
    });

    setShowForm(true);
    setDetailPatient(null);
  };

  // =========================
  // HAPUS PASIEN
  // =========================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Apakah Anda yakin ingin menghapus pasien ini?",
    );

    if (!confirmed) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/patients/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      console.log(result);

      if (result.success) {
        alert("Pasien berhasil dihapus");

        // Kalau halaman terakhir kosong setelah delete,
        // kembali ke halaman sebelumnya.
        if (patients.length === 1 && page > 1) {
          setPage(page - 1);
        } else {
          getPatients(page, search);
        }
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error(error);
      alert("Gagal menghapus pasien");
    }
  };

  // =========================
  // SEARCH
  // =========================

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  // =========================
  // PAGINATION
  // =========================

  const handlePrevious = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNext = () => {
    if (page < pagination.totalPages) {
      setPage(page + 1);
    }
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return <p>Loading data pasien...</p>;
  }

  // =========================
  // UI
  // =========================

  return (
    <div className="patients-page">
      {/* NAVIGATION */}

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
          <h1>Data Pasien</h1>
          <p>Kelola data pasien Mini Clinic</p>
        </div>
      </div>

      {/* SEARCH */}

      <div className="search-toolbar">
        <div className="search-box">
          <input
            type="text"
            value={search}
            onChange={handleSearch}
            placeholder="Cari nama, NIK, atau No. RM"
          />
        </div>

        <button
          className="btn-primary"
          onClick={() => {
            if (showForm) {
              resetForm();
            } else {
              setShowForm(true);
            }
          }}
        >
          {showForm ? "Tutup Form" : "+ Tambah Pasien"}
        </button>
      </div>

      {/* FORM */}

      {showForm && (
        <div className="card">
          <form onSubmit={handleSubmit}>
            <h2>{editingId ? "Edit Data Pasien" : "Tambah Pasien"}</h2>

            <div>
              <label>NIK</label>

              <input
                type="text"
                name="nik"
                value={form.nik}
                onChange={handleChange}
                placeholder="Masukkan NIK 16 digit"
                maxLength="16"
                disabled={editingId !== null}
                required
              />
            </div>

            <div>
              <label>Nama</label>

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Masukkan nama"
                required
              />
            </div>

            <div>
              <label>Jenis Kelamin</label>

              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                required
              >
                <option value="">Pilih jenis kelamin</option>

                <option value="L">Laki-laki</option>

                <option value="P">Perempuan</option>
              </select>
            </div>

            <div>
              <label>Tanggal Lahir</label>

              <input
                type="date"
                name="date_of_birth"
                value={form.date_of_birth}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label>No. Telepon</label>

              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Masukkan nomor telepon"
              />
            </div>

            <div>
              <label>Alamat</label>

              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Masukkan alamat"
              />
            </div>

            <button type="submit">
              {editingId ? "Simpan Perubahan" : "Simpan Pasien"}
            </button>

            <button type="button" onClick={resetForm}>
              Batal
            </button>
          </form>
        </div>
      )}

      {/* DETAIL PASIEN */}

      {detailPatient && (
        <div>
          <h2>Detail Pasien</h2>

          <p>
            <strong>No. RM:</strong> {detailPatient.medical_record_number}
          </p>

          <p>
            <strong>NIK:</strong> {detailPatient.nik}
          </p>

          <p>
            <strong>Nama:</strong> {detailPatient.name}
          </p>

          <p>
            <strong>Jenis Kelamin:</strong>{" "}
            {detailPatient.gender === "L" ? "Laki-laki" : "Perempuan"}
          </p>

          <p>
            <strong>Tanggal Lahir:</strong> {detailPatient.date_of_birth}
          </p>

          <p>
            <strong>No. Telepon:</strong> {detailPatient.phone || "-"}
          </p>

          <p>
            <strong>Alamat:</strong> {detailPatient.address || "-"}
          </p>

          <button onClick={() => setDetailPatient(null)}>Tutup Detail</button>
        </div>
      )}

      {/* INFO */}

      <p>
        Menampilkan {patients.length} dari {pagination.total} pasien
      </p>

      {/* TABLE */}
      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>No.</th>
                <th>No. RM</th>
                <th>NIK</th>
                <th>Nama</th>
                <th>Jenis Kelamin</th>
                <th>Tanggal Lahir</th>
                <th>No. Telepon</th>
                <th>Aksi</th>
              </tr>
            </thead>

            <tbody>
              {patients.length > 0 ? (
                patients.map((patient, index) => (
                  <tr key={patient.id}>
                    <td>{(page - 1) * 5 + index + 1}</td>

                    <td>{patient.medical_record_number}</td>

                    <td>{patient.nik}</td>

                    <td>{patient.name}</td>

                    <td>
                      {patient.gender === "L" ? "Laki-laki" : "Perempuan"}
                    </td>

                    <td>{patient.date_of_birth}</td>

                    <td>{patient.phone || "-"}</td>

                    <td>
                      <button
                        className="btn-outline"
                        onClick={() => handleDetail(patient.id)}
                      >
                        Detail
                      </button>

                      <button
                        className="btn-primary"
                        onClick={() => handleEdit(patient)}
                      >
                        Edit
                      </button>

                      <button
                        className="btn-danger"
                        onClick={() => handleDelete(patient.id)}
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8">Tidak ada data pasien</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINATION */}

      <div>
        <button onClick={handlePrevious} disabled={page === 1}>
          ← Sebelumnya
        </button>

        <span>
          {" "}
          Halaman {pagination.page} dari {pagination.totalPages}{" "}
        </span>

        <button onClick={handleNext} disabled={page === pagination.totalPages}>
          Berikutnya →
        </button>
      </div>
    </div>
  );
}

export default Patients;
