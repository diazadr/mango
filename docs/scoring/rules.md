# MANGO UMKM Assessment System

## Overview

Assessment system pada Platform MANGO menggunakan 6 dimensi utama untuk mengukur kematangan UMKM secara komprehensif. 

---

## 1. Dimensi Penilaian

### 1.1 Manajemen Usaha

* Legalitas usaha
* Struktur organisasi
* Perencanaan usaha
* Pencatatan administrasi
* SOP operasional
* Manajemen risiko

### 1.2 Sistem Produksi

* Standarisasi proses produksi
* Tingkat otomasi
* Pengendalian kualitas
* Efisiensi bahan baku
* Kapasitas produksi
* Pemeliharaan peralatan

### 1.3 Pemasaran & Penjualan

* Jangkauan pasar
* Saluran distribusi
* Pemasaran digital
* Pengelolaan pelanggan
* Branding
* Penetapan harga

### 1.4 Keuangan

* Pencatatan keuangan
* Pemisahan keuangan
* Manajemen arus kas
* Akses permodalan
* Analisis profitabilitas
* Investasi

### 1.5 Teknologi & Peralatan

* Kondisi peralatan
* Digitalisasi operasional
* Adopsi teknologi
* Literasi digital
* Maintenance
* Inovasi teknologi

### 1.6 SDM & Kapasitas

* Jumlah tenaga kerja
* Keterampilan teknis
* Pelatihan
* Kompetensi manajerial
* Budaya kerja
* Kolaborasi

---

## 2. Skala Penilaian

Setiap parameter dinilai dengan skala:

* 1 = Tidak ada / belum dilakukan
* 2 = Sangat dasar
* 3 = Cukup
* 4 = Baik
* 5 = Sangat baik / terstandarisasi

---

## 3. Bobot Dimensi

| Dimensi               | Bobot |
| --------------------- | ----- |
| Manajemen Usaha       | 15%   |
| Sistem Produksi       | 25%   |
| Pemasaran & Penjualan | 15%   |
| Keuangan              | 15%   |
| Teknologi & Peralatan | 20%   |
| SDM & Kapasitas       | 10%   |

---

## 4. Formula Skoring

### 4.1 Rata-rata per Dimensi

```
dimension_score = sum(parameter_score) / total_parameter
```

### 4.2 Total Score (Weighted)

```
total_score =
(manajemen * 0.15) +
(produksi * 0.25) +
(pemasaran * 0.15) +
(keuangan * 0.15) +
(teknologi * 0.20) +
(sdm * 0.10)
```

---

## 5. Konversi Level

| Range     | Level   | Kategori           |
| --------- | ------- | ------------------ |
| 1.0 – 1.8 | Level 1 | Usaha Dasar        |
| 1.9 – 2.6 | Level 2 | Mulai Terorganisir |
| 2.7 – 3.4 | Level 3 | Berkembang         |
| 3.5 – 4.2 | Level 4 | Maju               |
| 4.3 – 5.0 | Level 5 | Siap Ekspansi      |

---

## 6. Intervensi (Pendampingan)

### Level 1

* Legalitas usaha
* SOP dasar
* Literasi keuangan

### Level 2

* Manajemen produksi
* Akses KUR
* Digitalisasi dasar

### Level 3

* Adopsi teknologi
* Standarisasi SOP
* Marketing digital

### Level 4

* Integrasi CNC / teknologi
* Coaching keuangan
* Kemitraan industri

### Level 5

* Inovasi produk
* Ekspansi pasar
* Replikasi model

---

## 7. Flow Sistem

```
Input parameter score
→ Hitung per dimensi
→ Hitung total score
→ Tentukan level
→ Generate rekomendasi pendampingan
```

---

## 8. Rule untuk AI Agent

* Gunakan formula di atas untuk semua perhitungan
* Jangan mengubah bobot tanpa update dokumen
* Semua scoring harus berbasis parameter
* Level ditentukan hanya dari total_score
* Pendampingan harus sesuai level

---

## 9. Output yang Diharapkan

* score_per_dimension
* total_score
* maturity_level
* recommendation_list

---
