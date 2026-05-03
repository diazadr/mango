# MANGO Business Flow

## Overview

Flow ini menggambarkan alur utama UMKM dari registrasi hingga monitoring dalam platform MANGO.

---

## 1. Tahapan Sistem

### 1. Registrasi & Profil Usaha

UMKM melakukan pendaftaran dan mengisi data dasar usaha.

Data:

* nama usaha
* jenis produk
* skala usaha
* lokasi
* jumlah tenaga kerja

---

### 2. Pengisian Data Awal

UMKM mengisi kondisi awal usaha.

Data:

* sistem produksi
* peralatan
* omzet
* kebutuhan utama

---

### 3. Akses Layanan Platform

UMKM dapat menggunakan fitur:

* informasi teknologi
* booking mesin
* materi pelatihan
* forum diskusi dengan pendamping

---

### 4. Pelaksanaan Assessment

UMKM mengisi kuesioner berbasis 6 dimensi:

* manajemen
* produksi
* pemasaran
* keuangan
* teknologi
* SDM

Proses:

* input skor (1–5)
* verifikasi oleh pendamping

---

### 5. Analisis & Pemetaan Level

```id="c8q9tp"
input_score
→ calculate_dimension_score
→ calculate_total_score
→ map_to_level
```

Output:

* score per dimensi
* total score
* maturity level (1–5)

---

### 6. Rekomendasi & Pendampingan

Sistem menghasilkan:

* rekomendasi pelatihan
* akses teknologi
* jenis pendampingan

Mapping berdasarkan level.

---

### 7. Monitoring Berkala

```id="9t4c3p"
repeat assessment every 6 months
→ compare previous score
→ track improvement
```

Tujuan:

* melihat progress UMKM
* evaluasi efektivitas program

---

## 2. Entity yang Terlibat

* User
* Campus
* UPT
* UMKM Organization
* UMKM
* Assessment
* Score
* Dimension
* Recommendation
* Mentoring

Catatan relasi:

* Admin kampus hanya mengelola data kampus, advisor, dan departemen kampus
* Admin UPT hanya mengelola data UPT, organisasi UMKM binaan, dan registry UMKM yang dibina
* Organisasi UMKM adalah entitas binaan yang dikelola oleh UPT
* UMKM dapat mendaftar ke organisasi UMKM yang berada di bawah UPT
* Kampus dan UPT adalah entitas berbeda dan tidak disatukan dalam satu tabel umum

---

## 3. Status Flow

```id="y7n2vb"
REGISTERED
→ PROFILE_COMPLETED
→ INITIAL_DATA_FILLED
→ ASSESSED
→ SCORED
→ MENTORED
→ MONITORED
```

---

## 4. Rule untuk AI Agent

* Setiap UMKM wajib melalui flow berurutan
* Assessment tidak boleh dilewati
* Level hanya dihitung setelah semua dimensi terisi
* Recommendation wajib berdasarkan level
* Monitoring menggunakan data historis

---

## 5. Output Sistem

* user_profile
* assessment_result
* maturity_level
* recommendation
* progress_tracking

---
