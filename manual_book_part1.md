# MANGO Platform — Buku Manual Pengguna
## Bagian 1: Gambaran Umum & Arsitektur Sistem

**Versi:** 1.0 | **Terakhir Diperbarui:** Mei 2026

---

## 1. Pendahuluan

**MANGO** *(Manufacturing & UMKM Growth Optimization)* adalah platform ERP/MES terintegrasi yang dirancang untuk mendukung ekosistem UMKM manufaktur. Platform ini menggabungkan:

- **Portal Web** (Next.js) — antarmuka pengguna modern berbasis web
- **Backend API** (Laravel/PHP) — logika bisnis dan manajemen data
- **Edge Manufacturing System** (Go/Golang) — sistem monitoring mesin CNC secara real-time

### Modul Utama

| Modul | Deskripsi |
|---|---|
| **Manufacturing / ERP-MES** | Work order, produksi, alarm, OEE, downtime |
| **Edge Integration** | Sinkronisasi data real-time dari lantai produksi |
| **UMKM Management** | Profil, asesmen kematangan, rekomendasi |
| **Mentoring** | Konsultasi advisor, sesi, dampak kematangan |
| **Mesin & Reservasi** | Pemesanan mesin, persetujuan, jadwal |
| **Admin Panel** | RBAC, pengguna, institusi, organisasi |

---

## 2. Arsitektur Sistem

```
┌─────────────────────────────────────────────────────┐
│              LANTAI PRODUKSI (Edge)                  │
│                                                      │
│  [Mesin CNC]  →  MQTT (EMQX :1883)                  │
│  DMG Mori          │                                 │
│  Makino            ▼                                 │
│             [Edge Core — Go]                         │
│             ├── Collector (MQTT Handler)             │
│             ├── Storage                              │
│             │   ├── InfluxDB :8086 (time-series)     │
│             │   └── PostgreSQL :5433 (alarm/sync)    │
│             ├── OEE Calculator                       │
│             ├── REST API :8080                       │
│             └── MANGO Sync Service                   │
│                     │                               │
│              HTTP/MQTT push tiap 60 detik            │
└─────────────────────┼───────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────┐
│              MANGO PLATFORM (Cloud/Server)           │
│                                                      │
│  [Laravel Backend :8000]                             │
│  ├── /api/v1/integrations/edge/*  ← Edge API Key    │
│  ├── /api/v1/erp-mes/*            ← Auth Users      │
│  ├── EdgeSite, EdgeProductionLog, EdgeAlarmLog       │
│  └── PostgreSQL :5432                                │
│                                                      │
│  [Next.js Frontend :3000]                            │
│  ├── /workspace/manufacturing                        │
│  ├── /workspace/manufacturing/machines               │
│  ├── /workspace/manufacturing/work-orders            │
│  ├── /workspace/manufacturing/edge-sites             │
│  ├── /workspace/manufacturing/oee                    │
│  └── /workspace/manufacturing/alarms                 │
└─────────────────────────────────────────────────────┘
```

![Diagram Arsitektur](C:\Users\AIO-16\.gemini\antigravity\brain\f0b0c2b0-de13-4dbd-b9cd-1d86f2f90022\system_architecture_diagram_1779051165022.png)

---

## 3. Komponen Edge Manufacturing System

### 3.1 Stack Teknologi

| Komponen | Teknologi | Port | Fungsi |
|---|---|---|---|
| Edge Core | Go 1.22+ | — | Collector, API, Sync |
| MQTT Broker | EMQX 5.3 | 1883, 18083 | Message broker |
| Time-series DB | InfluxDB 2.7 | 8086 | Sensor & telemetri |
| Relational DB | PostgreSQL 15 | 5433 | Alarm, antrian sync |
| Visualisasi | Grafana | 3005 | Dashboard mesin |
| REST API | Gin (Go) | 8080 | API untuk ERP/MES |
| Simulator | Python | — | Data dummy CNC |

### 3.2 Struktur MQTT Topic

```
polman/edge/{machine_id}/status   — Status run/alarm (QoS 1)
polman/edge/{machine_id}/axis     — Posisi sumbu X,Y,Z (QoS 0)
polman/edge/{machine_id}/alarm    — Kode alarm mesin (QoS 2)
polman/edge/{machine_id}/tool     — Data tooling & wear (QoS 1)
polman/edge/{machine_id}/timer    — Operating/cutting time (QoS 1)
polman/edge/{machine_id}/spindle  — RPM & beban spindle (QoS 0)
fanuc/cnc/data                    — Data simulator Python
```

![MQTT Topics](C:\Users\AIO-16\.gemini\antigravity\brain\f0b0c2b0-de13-4dbd-b9cd-1d86f2f90022\mqtt_topics_diagram_1779051245670.png)

---

## 4. Instalasi & Setup

### 4.1 Prasyarat

| Software | Versi | Keterangan |
|---|---|---|
| Docker Desktop | 24+ | Untuk container Edge System |
| Docker Compose | v2 | Sudah termasuk Docker Desktop |
| Node.js | 18+ | Untuk frontend Next.js |
| PHP | 8.2+ | Untuk backend Laravel |
| Go | 1.22+ | Hanya untuk development Edge |

### 4.2 Setup Edge Manufacturing System

```bash
# 1. Masuk ke direktori edge
cd edge-manufacturing-system-main/edge-manufacturing-system

# 2. Jalankan setup awal
make setup
# atau: bash scripts/setup.sh

# 3. Jalankan semua service (mode produksi)
make up

# 4. Jalankan dengan simulator (mode development)
make dev

# 5. Verifikasi semua container berjalan
docker compose ps

# 6. Cek health semua service
make health
```

**Service yang berjalan setelah `make up`:**
- EMQX Dashboard → http://localhost:18083
- InfluxDB → http://localhost:8086
- Grafana → http://localhost:3005 (admin/admin)
- Edge REST API → http://localhost:8080

### 4.3 Setup MANGO Backend

```bash
cd mango/backend

# Install dependencies
composer install

# Konfigurasi environment
cp .env.example .env
php artisan key:generate

# Jalankan migrasi database
php artisan migrate --seed

# Jalankan server development
php artisan serve
# Backend tersedia di: http://localhost:8000
```

### 4.4 Setup MANGO Frontend

```bash
cd mango/frontend

# Install dependencies
npm install

# Konfigurasi environment
# Edit .env.local: NEXT_PUBLIC_API_URL=http://localhost:8000

# Jalankan development server
npm run dev
# Frontend tersedia di: http://localhost:3000
```

### 4.5 Konfigurasi Integrasi Edge ↔ MANGO

Edit file `config/config.yaml` pada Edge System:

```yaml
mango:
  enabled: true
  base_url: "http://localhost:8000/api/v1/integrations/edge"
  api_key: "YOUR_EDGE_API_KEY"   # Dari MANGO → Edge Sites → Generate Key
  site_id: "POLMAN_BANDUNG_EDGE"
  push_production_interval: 60   # detik
  push_alarms_realtime: true
  pull_work_order_interval: 300  # 5 menit
  pull_master_data_interval: 3600 # 1 jam

cloud_mqtt:
  enabled: true
  broker: "tls://j1618cec.ala.asia-southeast1.emqxsl.com:8883"
  tls: true
  qos: 1
```

---

## 5. Login & Navigasi

### 5.1 Akses Platform

Buka browser dan navigasi ke: **http://localhost:3000**

### 5.2 Login

1. Masukkan **Email** dan **Password**
2. Klik tombol **Sign In**

> **Akun Default (Development):**
> - Superadmin: `superadmin@gmail.com` / `password`

### 5.3 Peran Pengguna (Roles)

| Peran | Akses |
|---|---|
| **Superadmin** | Semua fitur + admin panel |
| **Admin** | Manajemen pengguna, institusi, UMKM |
| **Advisor/Mentor** | Sesi mentoring, evaluasi UMKM |
| **UMKM Owner** | Profil, asesmen, reservasi mesin |
| **Operator** | Check-in mesin, log produksi (via Edge API) |

---
