# CNC Edge System

Sistem edge computing untuk monitoring mesin CNC dan integrasi ERP/MES MANGO, dibangun dengan Golang, MQTT, InfluxDB, Redis, PostgreSQL, dan Grafana.

---

## Arsitektur

```
Mesin CNC / Simulator
        │
        ▼ MQTT (EMQX)
  ┌─────────────┐
  │  Collector  │  ← Go: subscribe semua topic
  │  (Golang)   │
  └──────┬──────┘
         │
    ┌────┴────┐
    ▼         ▼
InfluxDB    Redis          PostgreSQL
(time-series) (realtime     (alarm &
              state)         OEE history)
    │
    ▼
 Grafana
 Dashboard
    │
    ▼
REST API (:8080) ← untuk ERP/MES
```

## Struktur Project

```
cnc-edge/
├── cmd/edge/main.go             ← Entry point
├── config/
│   └── config.yaml              ← Konfigurasi utama
├── internal/
│   ├── models/models.go         ← Semua struct data
│   ├── logger/logger.go         ← Zap logger
│   ├── broker/mqtt.go           ← MQTT client wrapper
│   ├── collector/collector.go   ← MQTT handler & router
│   ├── collector/protocol/      ← Tes koneksi protokol (admin)
│   ├── storage/
│   │   ├── influx.go            ← InfluxDB writer
│   │   ├── redis.go             ← Redis state store
│   │   └── postgres.go          ← PostgreSQL alarm store
│   ├── oee/calculator.go        ← OEE calculator
│   ├── api/server.go            ← REST API (Gin)
│   ├── api/operator_handlers.go
│   ├── api/admin_handlers.go
│   ├── api/webhook_handlers.go
│   └── mango/sync.go            ← Antre & push/pull MANGO
├── templates/admin/             ← UI admin mesin (HTML)
├── docker/
│   ├── Dockerfile               ← Multi-stage Go build
│   ├── Dockerfile.simulator     ← Python simulator
│   ├── emqx/                    ← Config ACL EMQX
│   └── grafana/
│       ├── provisioning/        ← Auto-provisioning datasource
│       └── dashboards/          ← Dashboard JSON
├── scripts/setup.sh             ← Script setup pertama kali
├── Makefile                     ← Shortcut perintah
└── docker-compose.yml           ← Semua service
```

---

## Instalasi dari Nol

### Prasyarat

| Software | Versi minimal | Instalasi |
|---|---|---|
| Docker | 24+ | https://docs.docker.com/engine/install/ubuntu/ |
| Docker Compose | v2 (plugin) | Sudah termasuk Docker Desktop |
| Go | 1.22+ | https://go.dev/dl/ (hanya untuk dev lokal) |
| Make | — | `sudo apt install make` |

### Langkah 1 — Clone / copy project

```bash
# Jika dari git
git clone https://github.com/yourorg/cnc-edge.git
cd cnc-edge

# Atau extract zip, lalu masuk direktori
cd cnc-edge
```

### Langkah 2 — Jalankan setup

Script ini akan membuat direktori yang diperlukan untuk menjalankan stack edge.

```bash
chmod +x scripts/setup.sh
make setup

# Atau langsung:
bash scripts/setup.sh
```

### Langkah 3 — Jalankan semua service

```bash
# Mode produksi (tanpa simulator)
make up

# Mode development (dengan simulator Python aktif)
make dev
```

Docker akan mengunduh semua image dan menjalankan:
- **EMQX**      → `localhost:1883` dan dashboard `localhost:18083`
- **InfluxDB**  → `localhost:8086`
- **Redis**     → `localhost:6379`
- **PostgreSQL**→ `localhost:5432`
- **Grafana**   → `localhost:3000`
- **Edge API**  → `localhost:8080`

### Langkah 4 — Verifikasi

```bash
# Cek semua container berjalan
docker compose ps

# Cek health semua service
make health

# Lihat log real-time
make logs
```

### Langkah 5 — Buka Grafana

1. Buka browser → `http://localhost:3000`
2. Login: `admin` / `grafana_secret_2024`
3. Dashboard **CNC Edge — Overview** sudah tersedia di folder **CNC Edge**

---

## Pengujian dengan Simulator Python

Simulator dari kelompok sebelumnya sudah diintegrasikan. Jalankan:

```bash
# Via Docker (otomatis dengan --profile dev)
make dev

# Atau manual (Python harus terinstall + paho-mqtt)
pip install paho-mqtt
# Edit MQTT_BROKER di file simulator jika perlu
python3 Data_Dummy_Nodered__1_.py
```

Data simulator akan muncul di topic `fanuc/cnc/data` dan langsung tersimpan ke InfluxDB serta terlihat di Grafana.

---

## Monitoring MQTT Manual

```bash
# Subscribe semua topic CNC (untuk debugging)
make test-mqtt

# Atau langsung:
mosquitto_sub -h localhost \
  -u edge_service -P edge_secret_2024 \
  -t "cnc/#" -t "fanuc/#" -v

# Publish test alarm
make pub-test-alarm

# Publish test status
make pub-test-status
```

---

## REST API

Base URL: `http://localhost:8080/api/v1`

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/machines` | Semua state mesin (dari Redis) |
| GET | `/machines/:id` | State mesin tertentu |
| GET | `/machines/:id/status` | Status run/alarm mesin |
| GET | `/machines/:id/axis` | Posisi axis terakhir |
| GET | `/machines/:id/oee` | Data OEE mesin |
| GET | `/alarms` | Active alarms |
| GET | `/alarms/history?machine_id=&limit=50` | Riwayat alarm |
| PUT | `/alarms/:id/resolve` | Resolve alarm |
| GET | `/summary` | Ringkasan factory (untuk ERP/MES) |
| GET | `/mango/status` | Status antrean sinkronisasi ke Laravel MANGO |
| POST | `/production/logs` | Simpan production log (+ antre MANGO) |
| GET | `/production/summary` | Ringkasan produksi per mesin/shift/tanggal |
| POST | `/downtime/logs` | Simpan downtime |
| POST | `/operator/checkin` | Check-in operator ke mesin |
| POST | `/operator/checkout` | Check-out (`checkin_id` atau `machine_id`) |
| GET | `/operator/list` | Daftar operator |
| GET | `/operator/current/:machine_id` | Check-in aktif per mesin |
| POST | `/operator/production-log` | Alias production log (lantai produksi) |
| GET | `/operator/production/summary` | Alias `/production/summary` |
| POST | `/operator/downtime` | Downtime dari operator |
| PUT | `/operator/downtime/:id/resolve` | Selesaikan downtime |
| POST | `/webhooks/mango` | Webhook dari MANGO (`X-Webhook-Secret` atau `?secret=`) |
| GET | `/admin/machines` | **UI HTML** konfigurasi `machine_configs` |
| GET/POST | `/admin/machines/...` | Form tambah/edit/hapus mesin |
| GET | `/api/v1/admin/machine-configs` | JSON daftar konfigurasi mesin |
| POST | `/api/v1/admin/machine-configs` | JSON upsert konfigurasi |
| DELETE | `/api/v1/admin/machine-configs/:id` | Hapus konfigurasi |
| POST | `/api/v1/admin/machine-configs/:id/test-connection` | Tes koneksi (modbus/opcua/mtconnect/tcp) |
| POST | `/api/v1/admin/reload-cache` | Muat ulang cache nama mesin dari PostgreSQL |

Contoh:
```bash
# Lihat semua mesin
curl http://localhost:8080/api/v1/machines | python3 -m json.tool

# Lihat factory summary
curl http://localhost:8080/api/v1/summary | python3 -m json.tool
```

---

## Topic MQTT

Format: `cnc/{tipe_mesin}/{machine_id}/{data_type}`

| Topic | QoS | Isi |
|---|---|---|
| `fanuc/cnc/data` | 0 | Data simulator Python |
| `cnc/dmg/ntx1000/status` | 1 | Run status, mode, alarm, emergency |
| `cnc/dmg/ntx1000/axis` | 0 | Posisi X, Y, Z absolut & relatif |
| `cnc/dmg/ntx1000/alarm` | 2 | Alarm code & message |
| `cnc/dmg/ntx1000/tool` | 1 | Tool actual, wear data |
| `cnc/dmg/ntx1000/timer` | 1 | Operating time, cutting time |
| `cnc/dmg/ntx1000/spindle` | 0 | RPM, load spindle |
| `cnc/makino/{id}/...` | sama | Untuk mesin Makino |

---

## Koneksi ke Mesin Asli (FOCAS2)

Saat mesin sudah bisa dikoneksikan, tambahkan FOCAS2 collector di `internal/collector/focas.go`:

1. Download FANUC FOCAS2 library (`fwlib32.dll` / `libfwlib32.so`) dari FANUC
2. Buat CGo wrapper atau gunakan library Go: `github.com/kmpm/gofanuc`
3. Poll data tiap N detik, publish ke topic `cnc/dmg/ntx1000/{data_type}`

---

## Integrasi ERP/MES MANGO

Endpoint Laravel yang dipakai edge sync:

```text
GET  /api/v1/integrations/edge/status
POST /api/v1/integrations/edge/production-data
POST /api/v1/integrations/edge/alarms
GET  /api/v1/integrations/edge/work-orders
GET  /api/v1/integrations/edge/master-data
```

Endpoint edge API yang mendukung integrasi:

```text
GET  /api/v1/mango/status
POST /api/v1/production/logs
GET  /api/v1/production/summary
POST /api/v1/downtime/logs
GET  /api/v1/summary
```

Ringkasan factory yang bisa dikonsumsi ERP/MES:

```json
{
  "summary": {
    "total_machines": 2,
    "online": 2,
    "running": 1,
    "in_alarm": 0,
    "active_alarms": 0
  },
  "machines": [...]
}
```

---

## Troubleshooting

```bash
# EMQX tidak bisa start → cek log
docker compose logs emqx

# Edge service gagal konek ke broker
docker compose logs edge

# Reset semua data (HATI-HATI)
make clean-all
```
