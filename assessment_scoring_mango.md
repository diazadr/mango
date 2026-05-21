# Tabel Perhitungan Level Assessment, Skoring, Pertanyaan, dan Studi Kasus

Dokumen ini merangkum metode assessment yang saat ini diimplementasikan pada platform MANGO, khususnya modul assessment UMKM. Isi dokumen ini disusun berdasarkan implementasi kode yang aktif saat ini, bukan semata-mata berdasarkan teori umum readiness assessment.

## 1. Dasar Implementasi di MANGO

Sumber utama implementasi:

- Service utama perhitungan: `mango/backend/app/Services/Umkm/Strategy/AssessmentService.php`
- Seeder kategori: `mango/backend/database/seeders/AssessmentCategorySeeder.php`
- Seeder pertanyaan: `mango/backend/database/seeders/QuestionSeeder.php`
- Validasi input jawaban: `mango/backend/app/Http/Requests/Umkm/Strategy/SubmitAnswersRequest.php`
- Resource hasil assessment: `mango/backend/app/Http/Resources/Umkm/Strategy/AssessmentResultResource.php`
- Resource rekomendasi: `mango/backend/app/Http/Resources/Umkm/Strategy/RecommendationResource.php`

## 2. Ringkasan Metodologi Skoring MANGO

| Komponen | Implementasi Saat Ini |
|---|---|
| Skor jawaban | Nilai numerik `1` sampai `5` |
| Metode skor kategori | Rata-rata skor seluruh pertanyaan dalam kategori |
| Metode skor total | Jumlah tertimbang seluruh skor rata-rata kategori |
| Jumlah kategori | 6 kategori |
| Jumlah pertanyaan aktif | 31 pertanyaan |
| Level akhir | 5 level (`Level 1` s.d. `Level 5`) |
| Dasar rekomendasi | Gap terhadap skor ideal `5` pada tiap kategori |

## 3. Kategori Assessment, Bobot, dan Struktur

| No | Kategori | Slug | Deskripsi | Bobot | Jumlah Pertanyaan |
|---|---|---|---|---:|---:|
| 1 | Manajemen Usaha | `manajemen` | Legalitas, struktur organisasi, perencanaan, dan SOP | 0.15 | 5 |
| 2 | Sistem Produksi | `produksi` | Standarisasi proses, otomasi, pengendalian kualitas, dan efisiensi | 0.25 | 6 |
| 3 | Pemasaran & Penjualan | `pemasaran` | Jangkauan pasar, distribusi, branding, dan pemasaran digital | 0.15 | 5 |
| 4 | Keuangan | `keuangan` | Pencatatan keuangan, arus kas, dan akses permodalan | 0.15 | 5 |
| 5 | Teknologi & Peralatan | `teknologi` | Kondisi peralatan, digitalisasi operasional, dan literasi digital | 0.20 | 5 |
| 6 | SDM & Kapasitas | `sdm` | Keterampilan teknis, pelatihan, kompetensi manajerial, dan budaya kerja | 0.10 | 5 |
|  | **Total** |  |  | **1.00** | **31** |

Catatan penting:

- Bobot kategori saat ini dipakai dari konstanta `WEIGHTS` di service.
- Walaupun tabel kategori di database juga menyimpan bobot, kalkulasi skor total saat ini tetap mengacu ke konstanta di service.

## 4. Skala Penilaian Jawaban

Secara validasi backend, field `score` wajib berada pada rentang `1` sampai `5`.

| Skor | Interpretasi operasional yang disarankan |
|---:|---|
| 1 | Belum siap / belum diterapkan |
| 2 | Sudah mulai diterapkan sebagian |
| 3 | Diterapkan secara terstruktur |
| 4 | Diterapkan dan dipantau berkala |
| 5 | Terintegrasi, konsisten, dan berkelanjutan |

Catatan implementasi:

- Backend menyimpan `value` dan `score` secara terpisah.
- Resource jawaban saat ini memiliki label `value` historis `0..4`, tetapi validasi skor operasional yang dipakai sistem tetap `1..5`.
- Untuk keperluan kebijakan dan pelaporan, gunakan interpretasi 1 sampai 5 di atas karena itulah yang mempengaruhi skor akhir.

## 5. Daftar Lengkap Pertanyaan Assessment MANGO

### 5.1 Manajemen Usaha

| No | Pertanyaan |
|---|---|
| M1 | Apakah usaha Anda sudah memiliki legalitas lengkap (NIB, Izin Edar, Izin Khusus)? |
| M2 | Apakah terdapat struktur organisasi dan pembagian tugas (job desk) yang jelas? |
| M3 | Apakah sudah ada SOP (Standard Operating Procedure) untuk seluruh operasional rutin? |
| M4 | Apakah Anda memiliki rencana bisnis (business plan) dan target target jangka menengah? |
| M5 | Sejauh mana manajemen risiko dan sistem penanganan masalah diterapkan di perusahaan? |

### 5.2 Sistem Produksi

| No | Pertanyaan |
|---|---|
| P1 | Apakah proses produksi Anda sudah memiliki alur standar dan rekayasa produk yang tetap? |
| P2 | Apakah dilakukan pemeliharaan (maintenance) rutin dan terencana pada mesin/peralatan? |
| P3 | Bagaimana efektivitas manajemen persediaan bahan baku dan rantai pasok (supply chain)? |
| P4 | Sejauh mana tingkat otomasi atau penggunaan teknologi mekanik pada lini produksi Anda? |
| P5 | Apakah terdapat sistem pengendalian kualitas (QC) dan penanganan produk gagal yang ketat? |
| P6 | Apakah standar Kesehatan dan Keselamatan Kerja (K3) sudah diterapkan di area produksi? |

### 5.3 Pemasaran & Penjualan

| No | Pertanyaan |
|---|---|
| PM1 | Sejauh mana efektivitas penggunaan platform digital (Marketplace, Medsos, Web) untuk pemasaran? |
| PM2 | Apakah produk Anda memiliki identitas brand, kemasan, dan nilai jual yang kompetitif? |
| PM3 | Apakah Anda melakukan analisis pasar dan kompetitor secara berkala untuk inovasi? |
| PM4 | Apakah terdapat sistem manajemen pelanggan (CRM) dan penanganan keluhan pembeli? |
| PM5 | Seberapa luas jangkauan distribusi produk Anda (Lokal, Nasional, atau Ekspor)? |

### 5.4 Keuangan

| No | Pertanyaan |
|---|---|
| K1 | Apakah dilakukan pencatatan keuangan harian dan penyusunan laporan laba-rugi rutin? |
| K2 | Apakah keuangan usaha sudah terpisah sepenuhnya dari keuangan pribadi pemilik? |
| K3 | Apakah terdapat manajemen arus kas (cash flow) dan penganggaran (budgeting) tahunan? |
| K4 | Sejauh mana kepatuhan usaha terhadap kewajiban perpajakan (NPWP dan lapor pajak)? |
| K5 | Apakah usaha Anda memiliki akses dan rekam jejak yang baik dengan lembaga keuangan formal? |

### 5.5 Teknologi & Peralatan

| No | Pertanyaan |
|---|---|
| T1 | Bagaimana kondisi fisik, umur ekonomis, dan keandalan alat/mesin produksi utama Anda? |
| T2 | Apakah Anda menggunakan software pendukung (POS, Inventory, atau ERP) untuk operasional? |
| T3 | Sejauh mana keamanan data bisnis dan perlindungan informasi perusahaan dikelola? |
| T4 | Apakah tersedia infrastruktur IT (Internet/Hardware) yang memadai untuk operasional harian? |
| T5 | Apakah terdapat pemanfaatan teknologi digital untuk monitoring performa bisnis real-time? |

### 5.6 SDM & Kapasitas

| No | Pertanyaan |
|---|---|
| S1 | Apakah karyawan memiliki keterampilan teknis yang sesuai dengan standar kebutuhan industri? |
| S2 | Apakah perusahaan menyediakan program pelatihan dan pengembangan kompetensi berkala? |
| S3 | Bagaimana kualitas kepemimpinan dan budaya kerja inovatif di lingkungan perusahaan? |
| S4 | Apakah sudah terdapat sistem penggajian (remunerasi) dan motivasi kerja yang terstandar? |
| S5 | Sejauh mana tingkat literasi dan kemahiran digital seluruh anggota tim Anda? |

## 6. Rumus Perhitungan Skor

### 6.1 Skor per Kategori

Untuk setiap kategori:

```text
Skor_Kategori = (Jumlah seluruh score jawaban dalam kategori) / (Jumlah pertanyaan kategori)
```

Karena semua pertanyaan saat ini memiliki `weight = 1.0`, maka semua pertanyaan memiliki pengaruh yang sama di dalam kategorinya.

### 6.2 Skor Total

```text
Skor_Total =
    (Avg_Manajemen × 0.15) +
    (Avg_Produksi × 0.25) +
    (Avg_Pemasaran × 0.15) +
    (Avg_Keuangan × 0.15) +
    (Avg_Teknologi × 0.20) +
    (Avg_SDM × 0.10)
```

### 6.3 Gap Score per Kategori

```text
Gap_Score = 5.0 - Avg_Kategori
```

### 6.4 Prioritas Rekomendasi

| Gap Score | Prioritas |
|---:|---|
| `> 2` | `high` |
| `> 1` dan `<= 2` | `medium` |
| `<= 1` | `low` |

## 7. Tabel Level Assessment MANGO

| Rentang Skor Total | Level | Label Tahap |
|---:|---|---|
| `<= 1.8` | Level 1 | Usaha Dasar |
| `> 1.8` sampai `<= 2.6` | Level 2 | Mulai Terorganisir |
| `> 2.6` sampai `<= 3.4` | Level 3 | Berkembang |
| `> 3.4` sampai `<= 4.2` | Level 4 | Maju |
| `> 4.2` sampai `<= 5.0` | Level 5 | Siap Ekspansi |

## 8. Tabel Output yang Dihasilkan Sistem

| Output | Isi |
|---|---|
| `total_score` | Nilai total tertimbang 1.00 sampai 5.00 |
| `level` | Level 1 sampai Level 5 |
| `status` | Draft atau submitted |
| `chart_data` | Radar chart per kategori, `fullMark = 5` |
| `recommendations` | Daftar rekomendasi per kategori yang masih punya gap |

## 9. Studi Kasus Contoh

### 9.1 Profil Kasus

Nama UMKM: **CV Logam Presisi Bandung**

Jenis usaha:

- Job order machining ringan
- Fabrikasi part kecil untuk industri lokal
- Sudah punya beberapa mesin, namun pengelolaan masih semi-manual

Tujuan studi kasus:

- Menunjukkan cara hitung skor aktual di MANGO
- Menunjukkan level akhir
- Menunjukkan kategori prioritas pembinaan

### 9.2 Nilai Jawaban per Pertanyaan

#### Manajemen Usaha

| Kode | Skor |
|---|---:|
| M1 | 4 |
| M2 | 3 |
| M3 | 2 |
| M4 | 3 |
| M5 | 2 |

Rata-rata Manajemen:

```text
(4 + 3 + 2 + 3 + 2) / 5 = 2.80
```

#### Sistem Produksi

| Kode | Skor |
|---|---:|
| P1 | 3 |
| P2 | 3 |
| P3 | 2 |
| P4 | 2 |
| P5 | 3 |
| P6 | 4 |

Rata-rata Produksi:

```text
(3 + 3 + 2 + 2 + 3 + 4) / 6 = 2.83
```

#### Pemasaran & Penjualan

| Kode | Skor |
|---|---:|
| PM1 | 3 |
| PM2 | 3 |
| PM3 | 2 |
| PM4 | 2 |
| PM5 | 2 |

Rata-rata Pemasaran:

```text
(3 + 3 + 2 + 2 + 2) / 5 = 2.40
```

#### Keuangan

| Kode | Skor |
|---|---:|
| K1 | 3 |
| K2 | 4 |
| K3 | 2 |
| K4 | 3 |
| K5 | 2 |

Rata-rata Keuangan:

```text
(3 + 4 + 2 + 3 + 2) / 5 = 2.80
```

#### Teknologi & Peralatan

| Kode | Skor |
|---|---:|
| T1 | 3 |
| T2 | 2 |
| T3 | 2 |
| T4 | 4 |
| T5 | 2 |

Rata-rata Teknologi:

```text
(3 + 2 + 2 + 4 + 2) / 5 = 2.60
```

#### SDM & Kapasitas

| Kode | Skor |
|---|---:|
| S1 | 3 |
| S2 | 2 |
| S3 | 3 |
| S4 | 2 |
| S5 | 2 |

Rata-rata SDM:

```text
(3 + 2 + 3 + 2 + 2) / 5 = 2.40
```

### 9.3 Tabel Rekap Perhitungan Skor

| Kategori | Rata-rata Kategori | Bobot | Skor Tertimbang |
|---|---:|---:|---:|
| Manajemen | 2.80 | 0.15 | 0.42 |
| Produksi | 2.83 | 0.25 | 0.71 |
| Pemasaran | 2.40 | 0.15 | 0.36 |
| Keuangan | 2.80 | 0.15 | 0.42 |
| Teknologi | 2.60 | 0.20 | 0.52 |
| SDM | 2.40 | 0.10 | 0.24 |
| **Total** |  |  | **2.67** |

### 9.4 Penentuan Level

Skor total kasus:

```text
2.67
```

Karena `2.67` berada pada rentang `> 2.6` sampai `<= 3.4`, maka:

| Skor Total | Level | Tahap |
|---:|---|---|
| 2.67 | Level 3 | Berkembang |

### 9.5 Gap Score dan Prioritas Pembinaan

| Kategori | Rata-rata | Gap terhadap 5 | Prioritas |
|---|---:|---:|---|
| Manajemen | 2.80 | 2.20 | High |
| Produksi | 2.83 | 2.17 | High |
| Pemasaran | 2.40 | 2.60 | High |
| Keuangan | 2.80 | 2.20 | High |
| Teknologi | 2.60 | 2.40 | High |
| SDM | 2.40 | 2.60 | High |

Interpretasi:

- Walaupun level total sudah masuk `Level 3`, seluruh kategori masih memiliki gap lebih dari 2 terhadap kondisi ideal `5`.
- Dengan aturan sistem saat ini, semua kategori tersebut akan masuk prioritas `high`.
- Ini menunjukkan MANGO cenderung bersifat konservatif dalam menyusun prioritas rekomendasi.

### 9.6 Contoh Rekomendasi yang Akan Selaras dengan MANGO

Jika kategori dipetakan dengan level kategori masing-masing:

- Manajemen `2.80` akan diperlakukan mendekati `Level 3`
- Produksi `2.83` mendekati `Level 3`
- Pemasaran `2.40` mendekati `Level 2`
- Keuangan `2.80` mendekati `Level 3`
- Teknologi `2.60` mendekati `Level 2`
- SDM `2.40` mendekati `Level 2`

Contoh rekomendasi:

| Kategori | Contoh rekomendasi yang sesuai logika MANGO |
|---|---|
| Manajemen | Lengkapi sertifikasi produk dan formalkan sistem manajemen risiko operasional |
| Produksi | Implementasikan QC per tahapan dan optimalkan inventory management |
| Pemasaran | Aktifkan media sosial secara konsisten dan perbaiki identitas visual produk |
| Keuangan | Susun budgeting tahunan dan monitor cash flow secara ketat |
| Teknologi | Adopsi software POS/inventory dan perkuat infrastruktur perangkat |
| SDM | Mulai pelatihan teknis berkala dan evaluasi kinerja sederhana |

## 10. Interpretasi Kebijakan untuk Kampus, UPT, dan UMKM

Dalam konteks platform MANGO yang menghubungkan ekosistem kampus, UPT, dan UMKM, hasil assessment ini dapat dipakai sebagai:

| Aktor | Fungsi hasil assessment |
|---|---|
| UMKM | Mengetahui posisi kematangan usaha saat ini |
| Kampus | Menentukan fokus pendampingan, pelatihan, dan intervensi teknologi |
| UPT | Mengelompokkan UMKM berdasarkan tingkat kesiapan pembinaan |
| Sistem proyek mentoring | Menilai before-after impact dari sesi pendampingan |

## 11. Catatan Teknis Penting

| Temuan | Implikasi |
|---|---|
| Bobot kategori tersimpan di DB dan juga hardcoded di service | Potensi inkonsistensi jika suatu saat bobot DB diubah tanpa mengubah kode |
| Semua pertanyaan berbobot sama | Sistem belum mendukung pertanyaan kritis berbobot lebih tinggi |
| Level kategori memakai fungsi level yang sama dengan skor total | Secara konseptual sederhana, tetapi tidak selalu ideal untuk interpretasi mikro per pilar |
| Priority recommendation hanya berbasis gap | Sistem belum membedakan urgensi berdasarkan bobot kategori atau risiko bisnis |
| Total item saat ini 31 | Berbeda dari beberapa instrumen INDI 4.0 yang memakai 32 butir |

## 12. Referensi Akademik dan Dokumen Rujukan

### 12.1 Referensi yang paling relevan dengan desain MANGO

| No | Referensi | Kegunaan |
|---|---|---|
| 1 | Kementerian Perindustrian RI. *Indonesia Industry 4.0 Readiness Index (INDI 4.0).* | Rujukan nasional Indonesia untuk konsep readiness multi-pilar |
| 2 | Gumilang, Z. F., & Mahfudz, M. S. (2025). *Pengukuran Readiness Level Menggunakan INDI 4.0: Studi Kasus UMKM di Bandung.* | Sangat relevan untuk konteks UMKM Bandung |
| 3 | Sony, M., & Naik, S. (2020). *Defining SMEs’ 4.0 Readiness Indicators.* Applied Sciences, 10(24), 8998. | Mendukung pendekatan indikator multi-dimensi |
| 4 | Gökalp, E., Martinez, V., et al. model-type literature on SME maturity tools; dirangkum kuat dalam *A Maturity Level-Based Assessment Tool to Enhance the Implementation of Industry 4.0 in SMEs* | Mendukung penggunaan skala 1-5 dan gap analysis |
| 5 | Rodrigues, L. S., et al. (2021). *A Framework for Assessing Manufacturing SMEs Industry 4.0 Maturity.* Applied Sciences, 11(13), 6127. | Mendukung evaluasi per dimensi, bukan hanya skor agregat |
| 6 | Hasbullah, H., & Bareduan, S. A. (2023). *Capturing the Reality of Industry 4.0 Readiness Dimensions and Indicators in a Developing Country.* | Memberi kritik dan konteks terhadap instrumen INDI 4.0 di Indonesia |

### 12.2 Tautan sumber

- INDI 4.0 resmi: https://sindi4.kemenperin.go.id/assets/content/INDI4.0_Full_v1.pdf
- Gumilang & Mahfudz (2025): https://doi.org/10.14710/jati.20.2.111-124
- Sony & Naik (2020): https://www.mdpi.com/2076-3417/10/24/8998
- Maturity tool for SMEs: https://www.mdpi.com/2071-1050/12/9/3559
- Framework manufacturing SMEs maturity: https://www.mdpi.com/2076-3417/11/13/6127
- Hasbullah & Bareduan (2023): https://doi.org/10.7166/34-2-2846

## 13. Kesimpulan

Sistem assessment MANGO saat ini dapat didefinisikan sebagai:

- model assessment kematangan usaha berbasis 6 kategori,
- skala 1 sampai 5,
- skor kategori menggunakan rata-rata,
- skor total menggunakan weighted average,
- level akhir dibagi menjadi 5 tahap,
- rekomendasi dibentuk dari gap menuju skor ideal.

Secara praktis, model ini sudah cukup baik untuk:

- pemetaan cepat kesiapan UMKM,
- pengelompokan kebutuhan pendampingan,
- pelacakan dampak mentoring,
- dasar penyusunan intervensi per kategori.

Namun, jika ke depan ingin lebih kuat secara akademik dan operasional, area yang paling layak ditingkatkan adalah:

- sinkronisasi bobot kategori dari database,
- dukungan bobot pertanyaan yang berbeda,
- perbaikan label skala jawaban,
- prioritas rekomendasi yang mempertimbangkan bobot kategori dan dampak bisnis.
