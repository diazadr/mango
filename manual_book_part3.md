# MANGO Platform — Buku Manual Pengguna
## Bagian 3: Modul UMKM, Mentoring & Reservasi

---

## 15. Modul UMKM

### 15.1 Profil UMKM

Setiap pengguna UMKM memiliki profil yang mencakup:

| Seksi | Konten |
|---|---|
| **Profil Bisnis** | Nama, bidang usaha, tahun berdiri, modal |
| **Profil Teknis** | Kapasitas produksi, mesin yang dimiliki |
| **Produk** | Daftar produk dengan spesifikasi |
| **Sertifikasi** | Sertifikat halal, ISO, SNI, dll |

#### Melengkapi Profil UMKM

1. Login sebagai UMKM owner
2. Navigasi ke **UMKM Profile** di sidebar
3. Klik **"Edit Profil"** pada setiap seksi
4. Isi data yang diperlukan
5. Upload dokumen pendukung (sertifikat, foto produk)
6. Klik **"Save"**

---

### 15.2 Asesmen Kematangan UMKM

Platform menyediakan sistem asesmen untuk mengukur tingkat kematangan UMKM di berbagai dimensi.

#### Dimensi Asesmen

| Dimensi | Bobot | Keterangan |
|---|---|---|
| **Produksi** | 25% | Proses, kapasitas, kualitas |
| **Manajemen** | 20% | Struktur organisasi, SDM |
| **Keuangan** | 20% | Pencatatan, arus kas |
| **Pemasaran** | 20% | Pasar, branding, digital |
| **Teknologi** | 15% | Adopsi teknologi, digitalisasi |

#### Melakukan Asesmen

1. Navigasi ke **UMKM Assessment**
2. Klik **"Mulai Asesmen Baru"**
3. Jawab pertanyaan tiap dimensi (pilihan ganda)
4. Klik **"Submit"** setelah semua pertanyaan dijawab
5. Sistem menghitung skor otomatis
6. Lihat **Rekomendasi** yang di-generate sistem

#### Level Kematangan

| Level | Skor | Keterangan |
|---|---|---|
| **Level 1** | 0–20 | Initial / Ad-hoc |
| **Level 2** | 21–40 | Developing |
| **Level 3** | 41–60 | Defined |
| **Level 4** | 61–80 | Managed |
| **Level 5** | 81–100 | Optimizing |

---

### 15.3 Progress UMKM

Halaman **UMKM Progress** menampilkan:
- **Tren Skor Kematangan** — grafik perkembangan skor dari waktu ke waktu
- **Perubahan per Kategori** — delta skor tiap dimensi
- **Impact Mentoring** — pengaruh sesi mentoring terhadap skor

---

## 16. Modul Mentoring

### 16.1 Alur Mentoring

```
UMKM buat Request Mentoring
          ↓
Admin assign Departemen
          ↓
Advisor/Mentor ditugaskan
          ↓
Jadwal Sesi dibuat
          ↓
Sesi dilaksanakan → Notes dicatat
          ↓
Skor kematangan UMKM diperbarui
          ↓
Konsultasi selesai (Complete)
```

### 16.2 Membuat Request Mentoring (UMKM)

1. Navigasi ke **Mentoring** → **Requests**
2. Klik **"+ Buat Request"**
3. Pilih:
   - **Kategori Asesmen** — dimensi yang ingin diperbaiki
   - **Deskripsi Masalah** — ceritakan masalah yang dihadapi
4. Submit request
5. Tunggu assignment mentor dari admin

### 16.3 Mengelola Mentoring (Advisor)

1. Lihat request yang ditugaskan di **Mentoring** → **My Requests**
2. Klik request untuk melihat detail UMKM
3. Klik **"+ Buat Sesi"** untuk menjadwalkan pertemuan
4. Setelah sesi selesai, klik **"+ Add Notes"**
5. Isi catatan sesi dan pilih kategori yang dibahas
6. Notes tersimpan dan mempengaruhi skor kematangan UMKM

### 16.4 Melihat Impact Summary

Navigasi ke detail konsultasi → klik **"Impact Summary"**:
- Total sesi yang dilakukan
- Peningkatan skor per kategori
- Grafik tren progress UMKM

---

## 17. Reservasi Mesin

### 17.1 Alur Reservasi

```
UMKM buat Reservasi
         ↓
Admin/Operator review
         ↓
Negosiasi harga (opsional)
         ↓
Reservasi Disetujui
         ↓
UMKM upload Bukti Pembayaran
         ↓
Admin konfirmasi Pembayaran
         ↓
Reservasi Aktif → Mesin dapat digunakan
```

### 17.2 Membuat Reservasi

1. Navigasi ke **Machines** → **Reservations**
2. Klik **"+ Buat Reservasi"**
3. Isi form:
   - **Mesin** — pilih mesin yang diinginkan
   - **Tanggal & Waktu Mulai**
   - **Durasi** (jam)
   - **Keterangan** — tujuan penggunaan
4. Sistem menampilkan estimasi biaya
5. Submit reservasi

### 17.3 Status Reservasi

| Status | Keterangan |
|---|---|
| `pending` | Menunggu persetujuan |
| `approved` | Disetujui, menunggu pembayaran |
| `payment_submitted` | Bukti bayar diunggah |
| `payment_confirmed` | Pembayaran dikonfirmasi |
| `active` | Reservasi aktif, mesin dapat digunakan |
| `completed` | Selesai |
| `cancelled` | Dibatalkan |
| `rejected` | Ditolak |

### 17.4 Negosiasi Harga

Jika harga awal tidak sesuai:
1. Buka detail reservasi
2. Klik **"Propose Price"**
3. Masukkan harga yang diinginkan + alasan
4. Admin dapat **Accept** atau **Counter** dengan harga lain

### 17.5 Approval Reservasi (Admin)

1. Navigasi ke **Reservations** → **Incoming**
2. Klik reservasi yang masuk
3. Review detail:
   - Mesin yang diminta
   - Waktu & durasi
   - Pemohon & UMKM
4. Klik **"Approve"** atau **"Reject"**
5. Jika ada konflik jadwal, sistem akan memperingatkan

---

## 18. Admin Panel

### 18.1 Akses Admin

Fitur admin hanya tersedia untuk pengguna dengan permission `access admin panel`.

Navigasi ke **Admin** di sidebar.

### 18.2 Overview Admin

Dashboard admin menampilkan:
- Total pengguna aktif
- Total institusi & organisasi
- Total UMKM terdaftar
- **Edge Status** — ringkasan semua edge site yang terhubung

### 18.3 Manajemen Pengguna

**Path:** Admin → Users

| Aksi | Keterangan |
|---|---|
| **Lihat Semua** | Daftar semua pengguna terdaftar |
| **Edit** | Ubah data pengguna |
| **Assign Role** | Tetapkan peran ke pengguna |
| **Add Role** | Tambah peran tambahan |
| **Remove Role** | Cabut peran |
| **Sync Permission** | Sinkronisasi permission kustom |
| **Delete** | Hapus pengguna |

### 18.4 RBAC (Role-Based Access Control)

**Roles yang tersedia:**

| Role | Keterangan |
|---|---|
| `superadmin` | Akses penuh ke semua fitur |
| `admin` | Manajemen platform |
| `advisor` | Mentor untuk UMKM |
| `umkm_owner` | Pemilik UMKM |
| `operator` | Operator lantai produksi |

**Permissions penting:**

| Permission | Keterangan |
|---|---|
| `access admin panel` | Akses menu admin |
| `manage users` | CRUD pengguna |
| `manage organizations` | CRUD org & institusi |
| `manage roles` | CRUD roles |
| `assign roles` | Assign role ke user |
| `manage umkm` | Moderasi UMKM |
| `view umkm` | Lihat data UMKM |

### 18.5 Manajemen Institusi & Organisasi

**Institusi** = Lembaga induk (mis. Polman Bandung)  
**Organisasi** = Unit di bawah institusi (mis. Lab CNC)

Cara menambah institusi:
1. Admin → Institutions → **"+ Add"**
2. Isi nama, kode, deskripsi, kontak
3. Save

Cara menambah anggota:
1. Buka detail institusi
2. Tab **Members**
3. Cari & tambah pengguna
4. Set status (active/inactive)

### 18.6 Moderasi UMKM

1. Admin → UMKM
2. Lihat daftar UMKM pending approval
3. Klik UMKM → review profil & dokumen
4. Klik **"Approve"** atau **"Reject"** dengan alasan

---

## 19. Artikel & Konten

**Path:** Admin → Articles (untuk admin) | /articles (untuk publik)

### Membuat Artikel

1. Admin → Articles → **"+ New Article"**
2. Isi:
   - **Judul**
   - **Konten** (rich text editor)
   - **Upload Gambar** — gunakan tombol upload image
   - **Tags/Kategori**
   - **Status** — draft/published
3. Klik **"Publish"** atau **"Save as Draft"**

Artikel yang dipublish dapat diakses publik di `/articles`.

---

## 20. Profil & Pengaturan Akun

### 20.1 Edit Profil

1. Klik avatar/nama di pojok kanan atas
2. Pilih **"Profile"**
3. Edit: nama, foto profil, tanggal lahir, telepon
4. Klik **"Save Changes"**

### 20.2 Ganti Password

1. Profile → **"Change Password"**
2. Masukkan password lama
3. Masukkan password baru (min 8 karakter)
4. Konfirmasi password baru
5. Klik **"Update Password"**

### 20.3 Keamanan Akun

**Path:** Profile → Security

Fitur:
- **Activity Log** — riwayat aktivitas login & aksi
- **Active Sessions** — daftar sesi aktif di perangkat lain
- **Logout Other Sessions** — paksa logout semua sesi lain
- **Delete Account** — hapus akun permanen (konfirmasi diperlukan)

### 20.4 Pengaturan Notifikasi

**Path:** Profile → Notifications

Atur notifikasi untuk:
- Email notifikasi
- Notifikasi reservasi
- Notifikasi mentoring
- Notifikasi alarm sistem

---

## 21. Notifikasi

Ikon lonceng di header menampilkan notifikasi real-time:

| Jenis Notifikasi | Trigger |
|---|---|
| Reservasi baru masuk | UMKM submit reservasi |
| Reservasi disetujui | Admin approve reservasi |
| Pembayaran dikonfirmasi | Admin konfirmasi bayar |
| Mentoring request | UMKM buat request |
| Sesi mentoring dijadwalkan | Advisor jadwalkan sesi |
| Alarm kritis | Edge system kirim alarm critical |

Klik notifikasi untuk langsung ke halaman terkait.  
Klik **"Mark All as Read"** untuk tandai semua sudah dibaca.

---

## 22. Produk & Inventori

### 22.1 Manajemen Produk (ERP)

**Path:** `/workspace/manufacturing/products`

Produk ERP digunakan untuk:
- Referensi di Work Order
- Bill of Materials (BOM)
- Target produksi

#### Menambah Produk ERP

1. Manufacturing → Products → **"+ Add Product"**
2. Isi:
   - **Kode Produk**
   - **Nama Produk**
   - **Satuan** (pcs, kg, m, dll)
   - **Harga**
3. Tab **BOM** — tambah material yang dibutuhkan
4. Save

### 22.2 Manajemen Material/Inventori

**Path:** `/workspace/manufacturing/inventory`

| Field | Keterangan |
|---|---|
| **Kode Material** | Identifier unik |
| **Nama** | Nama material |
| **Satuan** | Unit (kg, liter, pcs) |
| **Stok Sekarang** | Kuantitas tersedia |
| **Stok Minimum** | Threshold alert |
| **Harga Satuan** | Harga per unit |

#### Pergerakan Stok

1. Buka detail material
2. Klik **"+ Movement"**
3. Pilih tipe: `in` (masuk) atau `out` (keluar)
4. Masukkan jumlah dan keterangan
5. Save → stok otomatis diperbarui

---

## 23. Jadwal Produksi

**Path:** `/workspace/manufacturing/schedule`

Tampilan kalender yang menggabungkan:
- Work Order yang aktif (dengan tanggal mulai/selesai)
- Reservasi mesin (UMKM)
- Downtime yang dijadwalkan

Gunakan untuk:
- Perencanaan kapasitas mesin
- Menghindari konflik jadwal
- Melihat beban produksi per periode

---

## 24. Export Data

### 24.1 Export Profil UMKM

1. Buka profil UMKM
2. Klik **"Export Resume"**
3. File PDF/Excel di-download otomatis berisi:
   - Profil bisnis & teknis
   - Skor kematangan terkini
   - Rekomendasi sistem
   - Riwayat mentoring

---

## 25. Keamanan & Best Practices

### 25.1 API Key Edge Site

- API Key hanya ditampilkan **sekali** saat generate — simpan di tempat aman
- Jika bocor, segera **Rotate Key** dari halaman Edge Sites
- Gunakan environment variable, jangan hardcode di source code

### 25.2 Akses Produksi

- Batasi akses admin panel hanya untuk pengguna terpercaya
- Review Active Sessions secara berkala
- Aktifkan notifikasi email untuk login dari perangkat baru

### 25.3 Data Edge

- Backup InfluxDB secara berkala
- Pantau disk usage PostgreSQL edge (alarm log bisa besar)
- Set retention policy di InfluxDB untuk data lama

---

## 26. Referensi Cepat

### URL Penting

| Layanan | URL |
|---|---|
| Frontend MANGO | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| Edge REST API | http://localhost:8080 |
| EMQX Dashboard | http://localhost:18083 |
| Grafana | http://localhost:3005 |
| InfluxDB UI | http://localhost:8086 |

### Perintah Docker Useful

```bash
# Lihat semua container
docker compose ps

# Log semua service
make logs

# Restart satu service
docker compose restart edge_core

# Stop semua
docker compose down

# Reset data (HATI-HATI: menghapus semua data!)
make clean-all
```

### Endpoint API MANGO (Backend)

| Method | Path | Keterangan |
|---|---|---|
| POST | `/api/v1/auth/login` | Login |
| GET | `/api/v1/me` | Info user saat ini |
| GET | `/api/v1/edge-sites` | Daftar edge sites |
| GET | `/api/v1/erp-mes/summary` | Ringkasan manufacturing |
| GET | `/api/v1/erp-mes/work-orders` | Daftar work order |
| POST | `/api/v1/erp-mes/work-orders` | Buat WO baru |
| GET | `/api/v1/erp-mes/alarm-events` | Daftar alarm |
| GET | `/api/v1/erp-mes/oee` | Data OEE |
| GET | `/api/v1/integrations/edge/status` | Status edge (API key) |
| POST | `/api/v1/integrations/edge/production-data` | Terima data produksi |

---

*© 2026 MANGO Platform — I Maschine Lab / Polman Bandung*
