# MANGO Project UI/UX & Typography Standards

Aturan ini wajib diikuti untuk setiap pembuatan atau pembaruan halaman (Dashboard & Public) guna menjaga konsistensi visual.

## 1. Arsitektur Tipografi (Font Sizes)

Selalu gunakan utilitas Tailwind CSS untuk pengaturan font.

| Elemen | Ukuran (Tailwind) | Pixel | Font Weight | Keterangan |
| :--- | :--- | :--- | :--- | :--- |
| **Page Header** | `text-2xl` | 24px | `font-bold` | Judul utama halaman (Dashboard Shell). |
| **Page Subtitle** | `text-sm` | 14px | `font-medium` | Penjelasan singkat di bawah judul halaman. |
| **Card Header** | `text-base` | 16px | `font-bold` | Judul di dalam kartu (Section Card). |
| **Main Value / Text**| `text-sm` | 14px | `font-semibold` | Data utama, isi input, atau teks konten. |
| **Label / Muted** | `text-xs` | 12px | `font-medium` | Label form, deskripsi kecil, atau metadata. |
| **Meta / Detail** | `text-[10px]` | 10px | `font-bold` | Kode SKU, Badge ID, atau teks uppercase terbatas. |

## 2. Aturan Penulisan (Capitalization)

1.  **Anti All-Caps:** Dilarang keras menggunakan `uppercase` pada label panjang, judul, atau isi data.
2.  **Sentence Case:** Gunakan huruf besar hanya di awal kata/kalimat secara natural (contoh: "Nama Lengkap", "Identitas Pemilik").
3.  **Caps Sparingly:** Huruf kapital semua hanya diizinkan untuk **Kode SKU**, **ID Registrasi**, atau **Singkatan (NIK/NPWP)** dalam ukuran font kecil (`text-[10px]`).

## 3. Komponen & Layout

1.  **Shadcn UI:** Gunakan komponen dasar dari `src/components/ui/`.
2.  **Container Radius:**
    *   Main Content Container: `rounded-[2.5rem]` (Untuk dashboard shell utama).
    *   Standard Cards: `rounded-xl` (Untuk kartu informasi seperti profil).
    *   Internal Items: `rounded-lg` (Untuk item di dalam kartu).
3.  **Symmetry & Proportions (PENTING):**
    *   Gunakan Grid 12 kolom (`grid-cols-12`).
    *   **Forced Height Alignment:** Gunakan wrapper `grid` pada baris yang sejajar dan berikan `h-full` pada kartu di dalamnya agar tinggi kartu di kolom kiri (col-4) sama persis dengan tinggi baris di kolom kanan (col-8).
    *   **Flex Alignment:** Gunakan `items-stretch` pada kontainer grid untuk memaksa elemen anak mengisi tinggi yang tersedia.
    *   **Consistency:** Jarak antar kartu (gap) harus konsisten (gunakan `gap-6` atau `gap-8`).
    *   **Responsive Scaling:** Pastikan grid berubah dari 12 kolom di desktop menjadi 1 kolom di mobile tanpa merusak keterbacaan data.
4.  **No Nested Cards:** Hindari memasukkan `Card` ke dalam `Card`. Gunakan `Separator` atau `bg-muted/30` untuk memisahkan konten di dalam satu kartu.

## 4. Estetika Visual

*   **Border:** Gunakan `border-border/50` (tipis dan halus).
*   **Shadow:** Gunakan `shadow-sm` untuk kartu standar, `shadow-xl` hanya untuk elemen floating/hover.
*   **Icons:** Gunakan `lucide-react` dengan `strokeWidth={1.5}` untuk tampilan yang lebih modern.
