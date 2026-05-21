UMKM-UPT-KAMPUS
1.  [SELESAI] Pada Business Location, integrasikan dengan map api
2.  [SELESAI] Untuk bagian Business Console ada technical profile yang berisi Kapasitas Produksi, lalu juga ada Inventory Catalog, itu digabungkan saja dengan ERP Modules tinggal nantinya beri keterangan yang sudah tersedia apakah akan dijual atau tidak, tujuannya agar lebih sederhana dan mengurangi kebingungan, termasuk juga berkaitan dengan Products dan BOM nya.
3.  [SELESAI] Lalu juga untuk Halaman My Machine Catalog itu gabung saja dengan Halaman Technical Profile, Daftar Permesinan tinggal nantinya beri aksi modal untuk pengaturan Reservasinya
4.  [SELESAI] Pada MES Edge Logs hilangkan saja
5.  [SELESAI] Lalu untuk Downtime Tracker buat pagination tabelnya
6.  [SELESAI] Lalu buat pada Halaman Reservasi Permesinan menjadi lebih seperti seharusnya halaman reservasi, terdapat pencarian, terdapat informasi Nama dan Logo PT, Lalu ada halaman view lengkap terkait mesinnya juga.
7.  [SELESAI] Untuk Gambar Mesin pada Katalog Reservasi bisa lebih dari satu seperti pada halaman Katalog Product landing page
8.  [SELESAI] Buat juga History Reservasi, bisa lihat detailnya juga
9.  [SELESAI] Untuk Reservasi sendiri buatkan PDF invoice penawaran setelah transaksi dimana dapat terlihat dari pengajuan sampai penawaran sampai Harga totalnya
10. [SELESAI] Buat tombol download Ekspor Resume UMKM lebih sederhana seperti button simbol download PDF
11. Untuk Product UMKM, buat support multi-image (lebih dari satu foto produk) seperti katalog mesin reservasi


UMUM
1. [SELESAI] Preferensi Notifikasi Emailnya hapus
2. [SELESAI] Buat alert setelah loginnya hilang setelah muncul. jadi tidak manual di klik x
3. Pastikan semua role (SuperAdmin, Kampus, UPT, UMKM) hanya bisa mengakses menu dan data yang sesuai dengan hak aksesnya masing-masing (role-based access control konsisten)
4. Buat fitur notifikasi in-app (bell icon di navbar) untuk event penting seperti status reservasi berubah, mentoring dijadwalkan, dll


STYLE
1. [SELESAI] Samakan semua bentuk table beserta pencariannya
2. [SELESAI] Untuk warna primary saat Tema Gelap didashboard MANGO, Ubah yang warna navy jadi warna orange, karena warna card nya terkesan seperti biru maka agar konstras ubah jadi orange untuk warna primary seperti saat select disidebar
3. [SELESAI] Untuk Sidebar Dashboardnya buat menjadi lebih lebar lagi
4. [SELESAI] Untuk navbar Dashboardnya juga buat lebih lebar kebawah lagi
5. [SELESAI] Perbaiki navbar dimobile entah itu pakai hamburger atau ada opsi standar lainnya
6. Pastikan semua halaman sudah responsif di mobile (terutama tabel, form, dan modal)


UMKM
1.  [SELESAI] Hapuskan Certification Dokument pada umkm kecuali NIB
2.  [SELESAI] Buat Profil Completeness hanya sebagai modal popup
3.  [SELESAI] Buat card keterangan INDI 4.0 Maturity Levelnya dikanan
4.  [SELESAI] Hapus main product dan market target
5.  [SELESAI] Metodologi Penilaian dan Manfaat Assesment di Self Asssesmentnya dibuat informasi modal pop up
6.  [SELESAI] Setelah assessment, bisa melihat Kembali history skornya dia milih apa nya di detail
7.  [SELESAI] Buat Ketika setelah assessment lalu ada pendampingan mentoring, maka setelah pendampingan seharusnya poin assessment nya naik, sehingga ada grafik kenaikannya.
8.  Untuk artikel pada halaman profil publik UMKM, pastikan konten markdown ter-render dengan benar (sudah pakai markdown parser)
9.  Untuk upload gambar di body artikel, pastikan fitur image upload di rich editor berjalan normal


SuperAdmin
1. [SELESAI] Permission Matrixnya hilangkan saja pada dashboard karena berdasarkan role saja
2. [SELESAI] Master Institutions nya buat tunggal yaitu Polman Bandung, jadi hilangkan crud penambahan institutions, lalu hilangkan juga UPT Pembina
3. [SELESAI] Buat halaman monitoring/overview untuk SuperAdmin: berapa UMKM terdaftar, berapa aktif, statistik assessment, dsb


Edge (Go Backend)
1.  [SELESAI] Hilangkan Redis dari sistem Edge — tidak ada lagi dependensi Redis/cache lokal
2.  [SELESAI] Hilangkan PostgreSQL lokal dari sistem Edge — tidak ada lagi DB lokal, sinkronisasi langsung via API/MQTT ke MANGO
3.  [SELESAI] URL Edge ubah dari /admin menjadi / langsung — index / menjadi halaman dashboard utama dengan tombol menuju InfluxDB, Grafana, EMQX Lokal, EMQX Cloud, dan sambutan Edge Computing Dashboard
4.  [SELESAI] Nama layanan di Edge dibuat biasa (tidak cnc_grafana, cachexy, dll) — menjadi: influxdb, grafana, emqx, dsb
5.  [SELESAI] Hilangkan emot-emot pada halaman Go Edge MANGO
6.  [SELESAI] Hilangkan protokol Modbus dan HTTP Polling dari daftar protokol yang ditampilkan
7.  [SELESAI] Berikan indikator status koneksi untuk setiap protokol (MQTT, OPCUA, dll) — sudah terhubung atau belum
8.  [SELESAI] Buat fitur serial monitor per mesin: tampilkan log real-time apakah port/IP terhubung atau tidak, terhubung di ethernet/IP berapa
9.  [SELESAI] Desain Edge: background putih, warna primary biru Navy MANGO
10. [SELESAI] Desain Edge: lebih lebar, ada pagination dan filter di tabel
11. Untuk Keterangan WORK ORDER, Operator, Shift, Mesin dan lain-lainnya, visualisasikan di Grafana — tidak kaku CNC, tapi dinamis sesuai value dari topik MQTT
12. [SELESAI] Komunikasi dari Edge ke MANGO menggunakan MQTT Cloud dan REST API
13. [SELESAI] Untuk Grafana: tambahkan mode kiosk/readonly agar user tidak bisa edit atau membuka setting panel
14. [SELESAI] Buat topic MQTT yang rapi dan terurut (struktur hierarki yang konsisten)
15. Anggap Edge ini untuk 1 Industri/Kampus (Polman Bandung). Admin kampus yang mengelola ERP dan MES-nya. Role dan UMKM lain tidak bisa melihat datanya.


Integrasi Edge ↔ MANGO
1.  [SELESAI] Work Order dari MANGO disinkronisasi ke Edge via REST API (polling/webhook)
2.  [SELESAI] Data OEE/telemetri dari Edge dikirim ke MANGO via REST API dan MQTT Cloud
3. [SELESAI] Buat halaman di MANGO (khusus admin kampus) untuk melihat status koneksi Edge secara real-time
4.  Pastikan jika Edge offline, data yang tertunda dikirim ulang otomatis saat kembali online (offline resilience)
5.  Buat webhook atau polling dari MANGO ke Edge untuk push konfigurasi (misal: data shift, target produksi harian)
6.  Untuk visualisasi OEE di dashboard MANGO, pastikan data dari Edge sudah real-time (bukan hanya snapshot)


Seeder
1. Untuk Seeder mesin yang terkait dengan Edge: admin kampus yang baru mendaftarkan MES dan ERP-nya — data cukup CNC DMG Mori NTX 1000 dan CNC Makino
2. Pastikan seeder untuk role kampus (admin Polman Bandung) sudah terhubung dengan data Edge, ERP, dan MES yang benar
3. Perbaiki seeder agar tidak ada duplikasi data saat dijalankan ulang (idempotent seeder)


Bilingual (i18n)
1. [SELESAI] Browser Title Bar: Semua `export const metadata = { title: "..." }` di file page Next.js masih menggunakan teks statis (hardcoded) dan belum diubah menjadi `generateMetadata` untuk mendukung terjemahan dinamis `next-intl`.
2. [SELESAI] Dashboard Page Shell: Parameter `title` dan `subtitle` pada komponen `<DashboardPageShell>` di sebagian besar halaman (seperti Reservasi, Assessment, Mentoring, dll) masih hardcoded menggunakan bahasa Indonesia.
3. [SELESAI] Form & Table Labels: Masih banyak teks UI seperti nama kolom tabel, peringatan (alert), dan label input yang belum menggunakan fungsi `t('...')` dari i18n (belum didefinisikan di `messages/en.json` dan `id.json`).
4. [SELESAI] Capitalize Browser Title: Pastikan semua judul halaman (Title Bar browser) menggunakan format kapital pada setiap awal kata (Title Case/Capitalize) agar terlihat profesional dan konsisten.
5. [SELESAI] Notifikasi Toast (Alerts): Sebagian besar pop-up notifikasi aksi (`toast.success` dan `toast.error`) di sisi *frontend* masih diketik statis dengan bahasa Indonesia (contoh: "Status Work Order diperbarui" atau "Material ditambahkan").
6. [SELESAI] Pesan Error Validasi (Zod Schema): Beberapa file skema validasi (*form validation*) masih menggunakan pesan *error hardcoded* bahasa Indonesia yang belum diubah menjadi kunci terjemahan (contoh: "Nama organisasi minimal 3 karakter").
7. Audit menyeluruh: pastikan tidak ada teks hardcoded yang tersisa di seluruh komponen frontend — semua harus menggunakan kunci i18n dari `messages/id.json` dan `messages/en.json`


Bug & Tech Debt
1. Pastikan tidak ada error 422 saat membuat/memperbarui kapasitas produksi dan pendaftaran mesin (validasi backend sudah sinkron dengan form frontend)
2. Pastikan UPT Profile menampilkan data organisasi yang benar (bukan data kampus) — sudah direfactor ke dedicated Organization Profile view
3. Pastikan sidebar active state tidak sticky/salah match saat navigasi antar route (sudah diperbaiki tapi perlu diverifikasi di semua halaman)
4. Email verification link harus bisa diakses tanpa session aktif — sudah dibuat custom endpoint, perlu diverifikasi di berbagai browser/device
5. Pastikan semua relasi model di namespace `App\Models\Erp` dan `App\Models\Mes` sudah benar setelah refactoring dari `App\Models\ErpMes`

