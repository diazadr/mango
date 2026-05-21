# MANGO Platform — Buku Manual Pengguna
## Bagian 2: Modul Manufacturing & Integrasi Edge

---

## 6. Modul Manufacturing (ERP/MES)

Akses melalui sidebar: **Manufacturing** atau navigasi ke `/workspace/manufacturing`

### 6.1 Dashboard Manufacturing Summary

Halaman ringkasan utama menampilkan:

| Widget | Keterangan |
|---|---|
| **Total Work Orders** | Jumlah semua WO aktif |
| **Completed** | WO yang sudah selesai |
| **Good Quantity** | Total unit produk OK dari semua log produksi |
| **Open Alarms** | Jumlah alarm aktif dari mesin |
| **Edge Sync Status** | Status koneksi & sinkronisasi Edge System |
| **Recent Work Orders** | 5 WO terbaru dengan status |
| **Active Alarms** | 5 alarm aktif dengan severity |
| **Kapasitas Produksi** | Target harian, utilisasi mesin, produk aktif |

**Cara Penggunaan:**
1. Navigasi ke **Manufacturing** di sidebar kiri
2. Dashboard memuat otomatis dari API
3. Klik **"View All"** pada tiap section untuk detail lengkap
4. Klik **"+ Add Work Order"** untuk membuat WO baru

---

### 6.2 Manajemen Work Order

**Path:** `/workspace/manufacturing/work-orders`

Work Order (WO) adalah instruksi produksi yang ditugaskan ke mesin.

#### Status Work Order

| Status | Warna | Keterangan |
|---|---|---|
| `draft` | Abu-abu | WO dibuat, belum dirilis |
| `released` | Biru | WO dirilis, siap produksi |
| `in_progress` | Kuning | Produksi sedang berjalan |
| `completed` | Hijau | WO selesai |
| `cancelled` | Merah | WO dibatalkan |

#### Membuat Work Order Baru

1. Klik tombol **"+ Add Work Order"**
2. Isi form:
   - **Kode WO** — kode unik identifikasi (mis. `WO-2024-001`)
   - **Judul** — nama/deskripsi pekerjaan
   - **Mesin** — pilih mesin yang digunakan
   - **Produk** — pilih produk dari master data
   - **Target Quantity** — jumlah target unit
   - **Tanggal Mulai & Selesai**
   - **Shift** — pagi/siang/malam
3. Klik **"Save"**

#### Operasi pada Work Order

| Aksi | Keterangan |
|---|---|
| **Add Operation** | Tambah langkah/operasi produksi |
| **Update Status** | Ubah status WO |
| **View Detail** | Lihat semua operasi dan log |

#### Kanban View

WO dapat dilihat dalam tampilan Kanban:
- Navigasi ke `/workspace/manufacturing/work-orders` → tab **Kanban**
- Kolom sesuai status: Draft → Released → In Progress → Completed

---

### 6.3 Mesin (Machines)

**Path:** `/workspace/manufacturing/machines`

Daftar semua mesin yang terdaftar di platform MANGO.

#### Menambah Mesin Baru

1. Klik **"+ Add Machine"**
2. Isi data:
   - **Nama Mesin** — nama tampilan
   - **Kode/ID** — identifier unik mesin
   - **Tipe** — jenis mesin (CNC, Lathe, dll)
   - **Lokasi** — lokasi fisik mesin
   - **Status** — aktif/tidak aktif
3. Klik **"Save"**

#### Fitur Mesin

- **Lihat Jadwal** — kalender reservasi mesin
- **Detail** — informasi lengkap mesin
- **Edit** — ubah informasi mesin
- **Hapus** — hapus mesin (jika tidak ada reservasi aktif)

---

### 6.4 Production Records (Catatan Produksi)

**Path:** `/workspace/manufacturing/production-records`

Log produksi yang masuk dari dua sumber:
1. **Manual Input** — operator memasukkan via form
2. **Edge Sync** — otomatis dari Edge Manufacturing System

#### Kolom Data Production Record

| Field | Keterangan |
|---|---|
| **Machine** | Nama/kode mesin |
| **Work Order** | WO terkait |
| **Shift** | Shift produksi (1/2/3) |
| **Good Qty** | Jumlah produk OK |
| **Defect Qty** | Jumlah produk NG/reject |
| **OEE %** | Overall Equipment Effectiveness |
| **Availability** | % waktu mesin tersedia |
| **Performance** | % kecepatan vs target |
| **Quality** | % produk OK |
| **Recorded At** | Waktu pencatatan |
| **Source** | `edge` atau `manual` |

#### Filter Data

- Filter by **Mesin**
- Filter by **Work Order**
- Filter by **Tanggal**
- Filter by **Shift**

---

### 6.5 OEE Dashboard

**Path:** `/workspace/manufacturing/oee`

OEE (Overall Equipment Effectiveness) adalah metrik standar industri untuk mengukur produktivitas mesin.

#### Formula OEE

```
OEE = Availability × Performance × Quality

Availability  = Operating Time / Planned Production Time
Performance   = (Ideal Cycle Time × Total Count) / Operating Time
Quality       = Good Count / Total Count
```

![OEE Formula](C:\Users\AIO-16\.gemini\antigravity\brain\f0b0c2b0-de13-4dbd-b9cd-1d86f2f90022\oee_formula_diagram_1779051661664.png)

#### Target OEE World Class: **≥ 85%**

| Range OEE | Status | Warna |
|---|---|---|
| ≥ 85% | World Class | Hijau |
| 60–84% | Typical | Kuning |
| < 60% | Low | Merah |

#### Tampilan Dashboard OEE

- **OEE per Mesin** — kartu metrik per mesin
- **Trend Historis** — grafik OEE dari waktu ke waktu
- **Perbandingan Shift** — OEE per shift produksi
- **Filter Periode** — harian, mingguan, bulanan

---

### 6.6 Alarm Events

**Path:** `/workspace/manufacturing/alarms`

Daftar semua alarm dari mesin CNC yang masuk via Edge System.

#### Tingkat Keparahan Alarm

| Severity | Warna | Keterangan |
|---|---|---|
| `critical` | Merah | Mesin harus berhenti segera |
| `warning` | Kuning | Perlu perhatian segera |
| `info` | Biru | Informasi saja |
| `emergency` | Merah gelap | Emergency Stop aktif |

#### Menangani Alarm

1. Klik alarm yang ingin diselesaikan
2. Klik tombol **"Resolve"**
3. Masukkan catatan penyelesaian (opsional)
4. Konfirmasi → status alarm berubah ke `resolved`

#### Filter Alarm

- Filter by **Status**: Open / Resolved
- Filter by **Severity**: Critical / Warning / Info
- Filter by **Mesin**
- Filter by **Periode**

---

### 6.7 Downtime Management

**Path:** `/workspace/manufacturing/downtime`

Pencatatan waktu henti mesin untuk analisis dan perbaikan.

#### Kategori Downtime

| Kategori | Keterangan |
|---|---|
| `planned` | Maintenance terjadwal |
| `mechanical` | Kerusakan mekanikal |
| `electrical` | Masalah elektrikal |
| `tooling` | Penggantian/kerusakan alat |
| `material` | Kekurangan/masalah material |
| `operator` | Faktor operator |

#### Mencatat Downtime

1. Klik **"+ Add Downtime"**
2. Pilih **Mesin**
3. Pilih **Kategori**
4. Masukkan **Waktu Mulai**
5. Tambahkan **Catatan**
6. Klik **"Save"**

Saat mesin kembali beroperasi, klik **"Stop Downtime"** untuk mencatat waktu selesai.

---

## 7. Manajemen Edge Site

**Path:** `/workspace/manufacturing/edge-sites`

Edge Site adalah representasi dari satu lokasi/pabrik Edge Manufacturing System yang tersinkronisasi dengan MANGO.

### 7.1 Informasi Edge Site

| Field | Keterangan |
|---|---|
| **Name** | Nama site/pabrik |
| **Site ID** | Identifier unik (mis. `POLMAN_BANDUNG_EDGE`) |
| **API Key Preview** | Preview API key (format: `edge_****`) |
| **Status** | Online (sync < 10 menit) / Offline |
| **Last Sync** | Waktu terakhir data diterima |
| **Machine Count** | Jumlah mesin di site ini |
| **Institution** | Institusi terkait |
| **Organization** | Organisasi terkait |

### 7.2 Mendaftarkan Edge Site Baru

1. Klik **"+ Add Edge Site"**
2. Isi:
   - **Nama Site** — nama lokasi produksi
   - **Site ID** — identifier unik (akan dipakai di `config.yaml`)
   - **Deskripsi** — keterangan tambahan
   - **Lokasi** — alamat/lokasi fisik
   - **Institusi** — pilih institusi terkait
3. Klik **"Save"** → API Key di-generate otomatis
4. **Salin API Key yang ditampilkan** — hanya ditampilkan sekali!

### 7.3 Menggunakan API Key

Salin API Key ke konfigurasi Edge System:

```yaml
# config/config.yaml di Edge System
mango:
  api_key: "edge_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
  site_id: "POLMAN_BANDUNG_EDGE"
```

### 7.4 Rotate API Key

Jika API Key bocor atau perlu diperbarui:
1. Buka detail Edge Site
2. Klik **"Rotate Key"**
3. Konfirmasi tindakan
4. Salin API Key baru
5. Update `config.yaml` di Edge System dan restart service

### 7.5 Indikator Status Online/Offline

- **Online (hijau)** — data diterima dalam 10 menit terakhir
- **Offline (merah)** — tidak ada data lebih dari 10 menit

---

## 8. Edge Logs

**Path:** `/workspace/manufacturing/edge-logs`

Tampilan log raw yang diterima dari Edge System berupa production logs dan alarm logs.

### 8.1 Production Logs

Data produksi yang dikirim dari Edge Core ke MANGO.

| Field | Keterangan |
|---|---|
| **Site ID** | ID site pengirim |
| **Machine Code** | Kode mesin |
| **Work Order** | Nomor WO (jika ada) |
| **Shift** | Shift produksi |
| **Good/Defect Qty** | Kuantitas produk |
| **OEE %** | Nilai OEE saat itu |
| **Recorded At** | Waktu perekaman di edge |

### 8.2 Alarm Logs

Alarm yang diterima dari mesin via Edge System.

| Field | Keterangan |
|---|---|
| **Machine ID** | ID mesin sumber alarm |
| **Alarm Code** | Kode alarm mesin |
| **Message** | Pesan alarm |
| **Severity** | Tingkat keparahan |
| **Occurred At** | Waktu alarm terjadi |
| **Resolved At** | Waktu alarm diselesaikan |

---

## 9. Alur Sinkronisasi Edge ↔ MANGO

![Data Flow](C:\Users\AIO-16\.gemini\antigravity\brain\f0b0c2b0-de13-4dbd-b9cd-1d86f2f90022\data_flow_diagram_1779051194502.png)

### 9.1 Push Data (Edge → MANGO)

```
Mesin CNC
    │ MQTT publish
    ▼
EMQX Broker (:1883)
    │ subscribe
    ▼
Edge Collector
    │ process & route
    ├──→ InfluxDB (time-series, real-time)
    └──→ PostgreSQL sync_queue
              │
              │ tiap 60 detik
              ▼
         MANGO Sync Service
              │ HTTP POST (fallback)
              │ atau MQTT publish ke cloud
              ▼
    MANGO Backend API
    /api/v1/integrations/edge/production-data
    /api/v1/integrations/edge/alarms
```

### 9.2 Pull Data (MANGO → Edge)

```
Edge Pull Loop
    │ tiap 5 menit
    ├──→ GET /api/v1/integrations/edge/work-orders
    │        Simpan ke PostgreSQL edge (snapshot)
    │
    │ tiap 1 jam
    └──→ GET /api/v1/integrations/edge/master-data
             Mesin, material, produk terdaftar di MANGO
```

### 9.3 Retry & Fault Tolerance

- Jika push gagal, data tetap tersimpan di **sync queue** PostgreSQL
- Retry otomatis maksimal **3 kali** dengan delay **30 detik**
- Setelah semua retry gagal, status item dimark `failed` dengan pesan error
- Data tidak hilang — akan dicoba lagi pada siklus berikutnya

---

## 10. REST API Edge System

**Base URL:** `http://localhost:8080/api/v1`

### 10.1 Endpoint Mesin

| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/machines` | Semua state mesin |
| GET | `/machines/:id` | State mesin tertentu |
| GET | `/machines/:id/status` | Status run/alarm |
| GET | `/machines/:id/axis` | Posisi axis |
| GET | `/machines/:id/oee` | Data OEE mesin |

### 10.2 Endpoint Alarm

| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/alarms` | Active alarms |
| GET | `/alarms/history` | Riwayat alarm |
| PUT | `/alarms/:id/resolve` | Resolve alarm |

### 10.3 Endpoint Produksi & Operator

| Method | Endpoint | Keterangan |
|---|---|---|
| POST | `/production/logs` | Simpan log produksi |
| GET | `/production/summary` | Ringkasan produksi |
| POST | `/downtime/logs` | Simpan downtime |
| POST | `/operator/checkin` | Check-in operator |
| POST | `/operator/checkout` | Check-out operator |
| GET | `/operator/current/:machine_id` | Check-in aktif |

### 10.4 Endpoint MANGO Sync

| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/mango/status` | Status antrian sinkronisasi |
| GET | `/summary` | Ringkasan factory untuk ERP/MES |

### 10.5 Contoh Response `/summary`

```json
{
  "summary": {
    "total_machines": 2,
    "online": 2,
    "running": 1,
    "in_alarm": 0,
    "active_alarms": 0
  },
  "machines": [
    {
      "machine_id": "dmg_mori_ntx1000",
      "name": "DMG Mori NTX 1000",
      "is_running": true,
      "is_alarm": false,
      "oee": 87.5
    }
  ]
}
```

---

## 11. Grafana Dashboard (Edge)

**URL:** http://localhost:3005  
**Login:** admin / admin

Dashboard **CNC Edge — Overview** menampilkan:

| Panel | Keterangan |
|---|---|
| **Machine Status** | Status real-time semua mesin |
| **Axis Position** | Posisi X, Y, Z sumbu mesin |
| **Spindle RPM** | Kecepatan spindle |
| **OEE Trend** | Grafik OEE dari waktu ke waktu |
| **Alarm History** | Timeline alarm mesin |
| **Operating Time** | Total waktu operasi |

---

## 12. Admin Panel UI Edge (Built-in)

**URL:** http://localhost:8080/admin/machines

UI HTML bawaan Edge System untuk konfigurasi mesin tanpa perlu tools lain.

### Fitur Admin UI

- **Daftar Mesin** — tampilkan semua konfigurasi mesin
- **Tambah Mesin** — form tambah konfigurasi mesin baru
- **Edit Mesin** — ubah nama, tipe, status enabled
- **Hapus Mesin** — hapus konfigurasi
- **Test Koneksi** — tes koneksi Modbus/OPC-UA/MTConnect/TCP ke mesin
- **Reload Cache** — muat ulang nama mesin dari PostgreSQL

---

## 13. Troubleshooting

### 13.1 Edge Service Tidak Bisa Start

```bash
# Cek log edge core
docker compose logs edge_core

# Cek apakah semua service dependency berjalan
docker compose ps

# Restart edge core saja
docker compose restart edge_core
```

### 13.2 Data Tidak Muncul di MANGO

Langkah diagnosa:
1. Cek status sync: `GET http://localhost:8080/api/v1/mango/status`
2. Verifikasi API Key di `config.yaml` sama dengan yang di MANGO Edge Sites
3. Pastikan MANGO backend dapat diakses dari container edge:
   ```bash
   docker exec -it edge_core curl http://host.containers.internal:8000/api/v1/integrations/edge/status
   ```
4. Cek log sync service: `docker compose logs edge_core | grep "MANGO"`

### 13.3 MQTT Connection Failed

```bash
# Cek EMQX berjalan
docker compose logs emqx

# Test publish manual
mosquitto_pub -h localhost -u edge_service -P edge_secret_2026 \
  -t "polman/edge/test/status" -m '{"test": true}'

# Subscribe untuk monitoring
mosquitto_sub -h localhost -u edge_service -P edge_secret_2026 \
  -t "polman/edge/#" -v
```

### 13.4 Frontend Tidak Bisa Load Data

- Pastikan backend berjalan: `php artisan serve`
- Cek `.env.local` frontend: `NEXT_PUBLIC_API_URL=http://localhost:8000`
- Clear Next.js cache: `rm -rf .next && npm run dev`
- Cek browser console untuk error CORS atau 401

---

## 14. Simulator Python (Untuk Testing)

Simulator menghasilkan data dummy CNC untuk testing tanpa mesin fisik.

### Menjalankan Simulator

```bash
# Via Docker (otomatis dengan make dev)
make dev

# Manual (Python harus terinstall)
pip install paho-mqtt
python3 Data_Dummy_Nodered__1_.py
```

Data simulator dikirim ke topic `fanuc/cnc/data` dan otomatis masuk ke InfluxDB.

### Contoh Payload Simulator

```json
{
  "leitwert": 125.3,
  "laenge_prozent": 78.5,
  "spindel_drehzahl": 2500,
  "vorschub": 150,
  "timestamp": "2024-01-15T08:30:00Z"
}
```

---

*Untuk pertanyaan teknis lebih lanjut, lihat dokumentasi di `README.md` masing-masing direktori sistem.*
