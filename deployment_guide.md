# Panduan Deployment MANGO Platform (Vercel + Ngrok)

Dokumen ini berisi panduan teknis langkah demi langkah untuk melakukan *deployment* aplikasi, di mana **Frontend (Next.js)** akan di-hosting secara publik menggunakan **Vercel**, sedangkan **Backend (Laravel)** tetap berjalan di mesin lokal Anda namun diekspos ke internet menggunakan **Ngrok**.

> [!IMPORTANT]
> Arsitektur ini sangat cocok untuk tahap presentasi (*showcase*) cepat. Namun, perlu diingat bahwa jika Anda menggunakan versi Ngrok gratis, URL backend akan selalu berubah setiap kali Anda me-restart Ngrok.

---

## 1. Persiapan Sisi Backend (Laravel + Ngrok)

Sisi backend tidak benar-benar di-*deploy* ke sebuah server *cloud*, melainkan di-*tunneling* dari komputer Anda agar bisa dibaca oleh server Vercel.

### A. Jalankan Backend Lokal
Buka terminal Anda, masuk ke direktori proyek `backend`, lalu jalankan *server* lokal Laravel seperti biasa:
```bash
php artisan serve
```
*(Umumnya server ini berjalan pada port 8000)*

### B. Jalankan Ngrok
Buka tab terminal baru, lalu jalankan perintah Ngrok untuk mengekspos port 8000 tersebut ke publik:
```bash
ngrok http 8000
```
Ngrok akan memberikan sebuah URL HTTPS publik (contoh: `https://8a2b-123.ngrok-free.app`). Salin URL tersebut.

### C. Penyesuaian Variabel Lingkungan (`.env`) Laravel
Buka file `.env` di folder `backend`, dan ubah konfigurasinya (contoh di bawah mengasumsikan domain Vercel Anda nantinya adalah `https://mango-platform.vercel.app`):

```env
# Ubah APP_URL dengan URL Ngrok Anda
APP_URL=https://8a2b-123.ngrok-free.app

# Ubah FRONTEND_URL dengan domain Vercel Anda
FRONTEND_URL=https://mango-platform.vercel.app

# Daftarkan domain Vercel ke Sanctum Stateful Domains (PENTING: HILANGKAN protokol http/https)
SANCTUM_STATEFUL_DOMAINS=mango-platform.vercel.app,localhost:3000,127.0.0.1:3000

# Pastikan SESSION_DOMAIN kosong (null) atau merujuk ke domain utama jika diperlukan
SESSION_DOMAIN=null
```

> [!TIP]
> **Autentikasi (Sanctum) Cross-Domain:** Karena Frontend (Vercel) dan Backend (Ngrok) berada di dua domain yang sangat berbeda, Laravel Sanctum mungkin perlu penyesuaian khusus pada `config/cors.php` agar mengizinkan `supports_credentials => true` serta URL Vercel pada bagian `allowed_origins`.

---

## 2. Penyesuaian Sisi Frontend (Next.js)

Karena Vercel nantinya akan mengambil data API melalui Ngrok gratis, Anda harus menambahkan sebuah header khusus agar proses *fetching* API dari *background* tidak diblokir oleh halaman "Peringatan Browser" (*Browser Warning*) bawaan Ngrok.

### A. Menambahkan Header Khusus Ngrok di Axios
Buka konfigurasi Axios Anda (biasanya terletak di `frontend/src/lib/http/axios.ts`). Tambahkan header global berikut ini agar Ngrok mengizinkan akses API secara otomatis:

```typescript
// Tambahkan baris ini setelah instance axios didefinisikan
api.defaults.headers.common['ngrok-skip-browser-warning'] = '69420';
```

---

## 3. Proses Deployment ke Vercel

Sisi Frontend akan sepenuhnya di-hosting menggunakan Vercel.

### A. Commit dan Push Kode
Pastikan seluruh perubahan kode frontend Anda (termasuk penambahan *header* Ngrok di atas) sudah di-*commit* dan di-*push* ke repository GitHub Anda.

### B. Menambahkan Proyek di Vercel
1. Masuk ke [Vercel Dashboard](https://vercel.com/dashboard).
2. Klik tombol **Add New... > Project**.
3. Pilih repository GitHub Anda yang memuat aplikasi MANGO Platform.
4. Pada bagian konfigurasi proyek:
   - **Framework Preset:** Pastikan terpilih **Next.js**.
   - **Root Directory:** Karena Anda memisahkan folder `frontend` dan `backend`, klik tombol *Edit* lalu pilih direktori **`frontend`**.

### C. Mengatur Environment Variables
Masih di halaman pengaturan *deploy* Vercel, *scroll* ke bawah dan temukan bagian **Environment Variables**. Tambahkan variabel berikut:

- **Name:** `NEXT_PUBLIC_BACKEND_URL`
- **Value:** `https://8a2b-123.ngrok-free.app` *(Ganti dengan URL Ngrok Anda saat ini)*

### D. Eksekusi Deploy
Klik tombol **Deploy**. Vercel akan mulai membangun (*build*) aplikasi Anda (memakan waktu sekitar 1-3 menit). Setelah sukses, Anda akan mendapatkan sebuah *link* publik untuk frontend Anda (contoh: `https://mango-platform.vercel.app`).

---

## 4. Pengujian & Catatan Penting

Buka URL Vercel yang diberikan. Cobalah untuk melakukan proses *Login*. Jika berhasil masuk, artinya Frontend di Vercel telah berhasil menjalin komunikasi API dengan Backend di mesin lokal Anda melalui terowongan Ngrok.

> [!WARNING]
> **Kelemahan Ngrok Gratis**
> 
> URL Ngrok versi gratis bersifat **dinamis (sementara)**. Begitu Anda mematikan koneksi internet, me-restart komputer, atau mematikan terminal Ngrok, URL tersebut akan hangus dan Ngrok akan membuat URL baru.
> 
> **Jika URL Ngrok Anda berubah, hal yang HARUS dilakukan adalah:**
> 1. Perbarui kembali `APP_URL` di dalam file `.env` Laravel Anda.
> 2. Masuk ke dashboard Vercel, pilih proyek Anda > **Settings** > **Environment Variables**.
> 3. Edit *value* dari `NEXT_PUBLIC_BACKEND_URL` menggunakan URL Ngrok yang baru.
> 4. **Wajib:** Buka tab **Deployments** di Vercel dan lakukan **Redeploy** (*Redeploy with existing build cache* tidak apa-apa) agar variabel lingkungan yang baru tertanam ke dalam aplikasi.

### Rekomendasi Jangka Panjang:
Untuk menghindari kerepotan pergantian URL yang terus-menerus ini, Anda bisa:
- Berlangganan Ngrok versi berbayar yang memungkinkan konfigurasi *Static Domain* (domain tetap).
- Meng-hosting backend Laravel ke layanan Cloud sungguhan (seperti Railway, Heroku, AWS EC2, atau VPS biasa).
