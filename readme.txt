# Mini Clinic Information System

Aplikasi berbasis web untuk membantu administrasi dan pelayanan pasien klinik pratama secara terintegrasi — mulai dari data pasien, pendaftaran kunjungan, antrean, hingga pencatatan hasil pemeriksaan dokter (metode SOAP).

Dibangun sebagai Technical Assignment (Take Home Test) posisi Programmer.

## Tech Stack

| Komponen | Teknologi |
|---|---|
| Frontend | React.js |
| Backend | Node.js (Express.js) |
| Database | MySQL (via `mysql2`) |
| Authentication | JSON Web Token (JWT) + bcrypt |
| Version Control | Git |

## Struktur Project

```
mini-clinic/
├── backend/
│   ├── middleware/
│   │   ├── auth.js          # verifikasi JWT
│   │   └── role.js          # otorisasi berdasarkan role
│   ├── routes/
│   │   ├── auth.js          # POST /login, /logout
│   │   ├── patients.js      # CRUD data pasien
│   │   ├── doctors.js       # master data dokter
│   │   ├── polis.js         # master data poli
│   │   ├── registrations.js # pendaftaran kunjungan
│   │   ├── queues.js        # modul antrean
│   │   ├── medicalRecords.js# pemeriksaan dokter (SOAP)
│   │   ├── prescriptions.js # resep obat
│   │   └── dashboard.js     # ringkasan dashboard
│   ├── database/
│   │   └── schema.sql       # skema tabel database
│   ├── db.js                 # koneksi pool MySQL
│   ├── createUser.js         # script pembuatan user awal (hash password)
│   ├── server.js              # entry point Express
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   └── ...                   # React.js app (lihat instruksi di dalam folder frontend)
│
├── docs/
│   ├── ERD.md                                # Entity Relationship Diagram
│   ├── Mini_Clinic_API.postman_collection.json
│   └── Mini_Clinic.postman_environment.json
│
└── README.md
```

## Role & Fitur

| Role | Akses |
|---|---|
| **Administrator** | Akses penuh ke seluruh modul |
| **Petugas Pendaftaran** | Master data pasien, pendaftaran, antrean |
| **Dokter** | Melihat antrean & pendaftaran, input pemeriksaan (SOAP), resep, riwayat pemeriksaan |

## Instalasi

### 1. Clone repository

```bash
git clone <url-repository-anda>
cd mini-clinic
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Buat file `.env` dari `.env.example`:

```bash
cp .env.example .env
```

Isi `.env` sesuai environment lokal Anda:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=mini_clinic
DB_PORT=3306
JWT_SECRET=ganti_dengan_secret_key_anda
PORT=3000
```

> ⚠️ **Penting:** jangan pernah commit file `.env` ke Git. File ini sudah dimasukkan ke `.gitignore`. Kredensial database dan `JWT_SECRET` **tidak** di-hardcode di source code — semuanya dibaca lewat `process.env` (lihat `db.js` dan `middleware/auth.js`).

### 3. Migrasi Database

Project ini **tidak menggunakan tool migration** (seperti Sequelize/Knex migration) — struktur tabel dibuat manual lewat file SQL. Jalankan:

```bash
mysql -u root -p < backend/database/schema.sql
```

Atau import manual lewat MySQL client / GUI (phpMyAdmin, DBeaver, TablePlus, dll) dengan file `backend/database/schema.sql`. File ini akan:
- Membuat database `mini_clinic`
- Membuat seluruh tabel (`users`, `patients`, `doctors`, `polis`, `registrations`, `queues`, `medical_records`, `prescriptions`)
- Mengisi seed data dasar untuk `doctors` dan `polis`

### 4. Buat User Login Awal

Karena tabel `users` butuh password dalam bentuk **hash bcrypt** (tidak boleh insert plain text manual), gunakan script:

```bash
cd backend
node createUser.js
```

Script ini akan membuat 1 user Administrator default (lihat bagian **Akun Login** di bawah). Untuk membuat user role lain (Dokter / Petugas Pendaftaran), duplikasi/modifikasi `createUser.js` sesuai kebutuhan, atau tambahkan endpoint pembuatan user khusus Administrator.

### 5. Setup Frontend

```bash
cd frontend
npm install
```

Sesuaikan base URL API frontend (biasanya di file `.env` atau config axios) ke:

```
http://localhost:3000
```

## Menjalankan Aplikasi

**Backend:**

```bash
cd backend
node server.js
```

Server berjalan di `http://localhost:3000`.

> Catatan: `package.json` backend belum punya script `start`/`dev`. Anda bisa menambahkan:
> ```json
> "scripts": {
>   "start": "node server.js",
>   "dev": "nodemon server.js"
> }
> ```

**Frontend:**

```bash
cd frontend
npm run dev
```

## Akun Login

| Role | Username | Password |
|---|---|---|
| Administrator | `admin` | `admin123` |

> Akun ini dibuat lewat `node createUser.js`. Segera ganti password default ini jika aplikasi akan digunakan di luar keperluan demo/testing.

## REST API & Postman Collection

Seluruh endpoint yang tersedia (lihat daftar lengkap di `docs/Mini_Clinic_API.postman_collection.json`):

| Modul | Endpoint |
|---|---|
| Auth | `POST /login`, `POST /logout`, `GET /profile` |
| Patients | `GET /patients`, `GET /patients/:id`, `POST /patients`, `PUT /patients/:id`, `DELETE /patients/:id` |
| Doctors | `GET /doctors` |
| Polis | `GET /polis` |
| Registrations | `GET /registrations`, `POST /registrations`, `PUT /registrations/:id`, `PUT /registrations/:id/status` |
| Queues | `GET /queues`, `POST /queues`, `PUT /queues/:id/call`, `PUT /queues/:id/status` |
| Medical Records | `GET /medical-records/:patientId`, `POST /medical-records` |
| Prescriptions | `GET /prescriptions/:id`, `GET /prescriptions/registration/:registrationId`, `POST /prescriptions` |
| Dashboard | `GET /dashboard` |

Semua response mengikuti format standar:

```json
// Success
{ "success": true, "message": "Success", "data": {} }

// Error
{ "success": false, "message": "Validation Error", "errors": {} }
```

### Cara Import Postman Collection

1. Buka Postman → **Import** → pilih file `docs/Mini_Clinic_API.postman_collection.json`.
2. Import juga file environment `docs/Mini_Clinic.postman_environment.json`, lalu pilih environment **"Mini Clinic - Local"** di pojok kanan atas Postman.
3. Jalankan request **Auth → Login** terlebih dahulu. Collection ini sudah dilengkapi script test yang otomatis menyimpan `token` hasil login ke variable environment — jadi request lain (yang butuh Bearer Token) langsung terautentikasi tanpa copy-paste manual.
4. Untuk request yang butuh `patient_id` / `registration_id` / `queue_id`, jalankan dulu request "Create ..." terkait — variabel-variabel ini juga otomatis tersimpan lewat script test di masing-masing request.

### Cara Membuat/Meng-generate Postman Collection dari Backend Sendiri

Kalau ke depannya Anda menambah endpoint dan ingin re-generate collection sendiri, ada beberapa cara umum:

1. **Manual (paling umum untuk assignment seperti ini)** — buat request satu per satu di Postman sesuai route yang ada di `routes/*.js`, kelompokkan per folder (Auth, Patients, dst), lalu **Export** collection: klik collection → `...` → **Export** → pilih format **Collection v2.1**.
2. **Capture otomatis lewat Postman Interceptor / Proxy** — aktifkan Postman Interceptor (atau proxy capture di Postman Desktop), lalu jalankan aplikasi frontend/Postman dan hit setiap endpoint backend Anda secara manual sekali. Postman akan otomatis mencatat request-request tersebut ke dalam History yang bisa langsung di-**Save** ke sebuah Collection.
3. **Generate dari OpenAPI/Swagger spec** — jika backend dilengkapi dokumentasi Swagger (misal dengan `swagger-jsdoc` + `swagger-ui-express`), Postman bisa **Import** langsung file `swagger.json`/`openapi.yaml` dan otomatis membuat semua request-nya. Backend project ini belum memakai Swagger, jadi opsi ini butuh setup tambahan.
4. **Generate dari daftar route Express** — pakai package seperti `express-list-routes` untuk mencetak semua route yang terdaftar di `server.js`, sebagai checklist untuk memastikan collection manual Anda sudah mencakup semua endpoint.

Untuk kebutuhan submission assignment ini, collection yang sudah disediakan (`docs/Mini_Clinic_API.postman_collection.json`) sudah mencakup seluruh endpoint minimum yang diminta di dokumen technical assignment (Auth, Patient, Registration, Queue, Medical Record, Prescription) plus beberapa endpoint tambahan (Doctors, Polis, Dashboard) yang memang dipakai di kode.

## Entity Relationship Diagram (ERD)

Lihat `docs/ERD.md` (format Mermaid, otomatis render di GitHub/GitLab).

Ringkasan relasi:
- `patients` 1—N `registrations`
- `doctors` 1—N `registrations`
- `polis` 1—N `registrations`
- `registrations` 1—1 `queues`
- `registrations` 1—N `medical_records`
- `registrations` 1—N `prescriptions`

## Asumsi & Penyederhanaan Proses Bisnis

Beberapa asumsi/penyederhanaan yang diambil dalam implementasi backend ini:

1. **Format nomor antrean** — dokumen assignment mencontohkan format `A001`, `A002`. Implementasi saat ini menyimpan `queue_number` sebagai **integer polos** (1, 2, 3, ...) per kombinasi poli & tanggal kunjungan. Jika format string `A001` wajib ditampilkan, bisa ditambahkan formatting di response API (`"A" + String(queue_number).padStart(3, "0")`) tanpa mengubah struktur database.
2. **Relasi Registrasi–Antrean dibuat 1:1** — satu pendaftaran hanya bisa memiliki satu nomor antrean (di-enforce lewat kolom `UNIQUE` pada `queues.registration_id` serta validasi di endpoint `POST /queues`).
3. **Objective SOAP disimpan sebagai satu kolom teks gabungan** (`objective`), bukan 4 kolom terpisah (tekanan darah, suhu, berat, tinggi) — data tetap lengkap namun disederhanakan secara storage. Bisa dinormalisasi ke kolom-kolom terpisah bila dibutuhkan validasi numerik lebih ketat.
4. **Port server saat ini hardcoded** di `server.js` (`app.listen(3000)`), belum membaca `process.env.PORT`. Untuk konsistensi dengan `.env`, disarankan mengubah ke `app.listen(process.env.PORT || 3000)`.
5. **Pembuatan user baru** (role Dokter/Petugas Pendaftaran) belum punya endpoint API tersendiri — saat ini dibuat lewat script `createUser.js` yang dijalankan manual di server, demi kesederhanaan scope assignment.
6. **Logout** bersifat stateless (tidak ada token blacklist/refresh token) — client cukup menghapus token yang tersimpan di sisi frontend.

## Error Handling & Validasi

- Validasi input dilakukan di setiap route sebelum query ke database (contoh: NIK harus 16 digit, NIK tidak boleh duplikat, status registrasi/antrean harus salah satu dari daftar yang valid).
- Semua error dikembalikan dengan format konsisten `{ success: false, message, errors }` sesuai spesifikasi.
- Autentikasi (`middleware/auth.js`) mengembalikan 401 jika token tidak ada/tidak valid; otorisasi (`middleware/role.js`) mengembalikan 403 jika role tidak diizinkan.

## Git Commit History

Pastikan development dilakukan dengan beberapa commit bertahap (bukan 1 commit di akhir), contoh alur commit yang disarankan:

```
feat: setup express server & db connection
feat: implement JWT auth (login, logout, middleware)
feat: CRUD master data pasien
feat: modul pendaftaran pasien
feat: modul antrean
feat: modul pemeriksaan dokter (SOAP) & resep
feat: dashboard summary endpoint
feat: setup frontend react + routing
feat: integrasi frontend-backend per modul
docs: README, ERD, postman collection
```