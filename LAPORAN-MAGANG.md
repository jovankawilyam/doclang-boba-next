# Bab ... : Metode dan Tools Pembangunan Website Doclang Boba

## 3.1 Metode Pengembangan

Pengembangan website Doclang Boba (KPKNL Bogor) menggunakan **metode Agile (Sprint-based)** yang dibagi dalam beberapa tahapan:

1. **Analisis kebutuhan** — Mengkaji sistem lama (Laravel + MySQL) sebagai acuan untuk UI/perilaku.ı
2. **Perencanaan** — Menyusun rencana pembangunan berfase (fase UI → integrasi Google Sheets → deploy).
3. **Implementasi bertahap (Sprint)** — Pembangunan per halaman dan fitur secara bertahap (landing page, form, admin, dst).
4. **Pengujian & revisi** — Memperbaiki error lint, TypeScript, dan responsif desain mobile.

Proyek ini menerapkan pendekatan **component-based development**, yaitu membangun halaman dari kumpulan komponen yang dapat digunakan ulang (navbar, form, tabel, dll).

## 3.2 Tools yang Digunakan

### Framework & Bahasa
| Tools | Fungsi |
|---|---|
| **Next.js 16 (App Router)** | Framework React untuk membangun web (server-side rendering, API routes) |
| **React 19** | Library untuk membangun antarmuka pengguna (UI) |
| **TypeScript** | Superset JavaScript untuk keamanan tipe data |
| **Tailwind CSS 4** | Framework CSS untuk styling cepat dan responsif |

### Database & Backend
| Tools | Fungsi |
|---|---|
| **Prisma 7 (ORM)** | Memudahkan akses & migrasi database |
| **Neon (PostgreSQL Serverless)** | Database cloud sebagai penyimpanan data permohonan |
| **Google Sheets API & Google Drive API** | Integrasi dengan spreadsheet KPKNL Bogor untuk backend/admin |

### Library Pendukung
| Tools | Fungsi |
|---|---|
| **react-hook-form + Zod** | Manajemen form dan validasi input |
| **UploadThing** | Upload berkas/file |
| **Recharts** | Membuat grafik/dashboard admin |
| **lucide-react** | Ikon antarmuka |
| **Auth (HMAC/SHA-256)** | Autentikasi login admin |

### Tools Lainnya
- **Vercel** — Platform deployment (hosting)
- **Git & GitHub** — Version control (pelacakan perubahan kode)
- **npm** — Package manager (manajemen dependensi)
- **Postman** — Pengujian API (opsional)
- **Google Workspace (Docs/Sheets)** — Dokumentasi dan data spreadsheet

## 3.3 Arsitektur Aplikasi

```
Pengguna (User)
      │
      ▼
Next.js (Frontend: Landing, Form, Persyaratan, Admin)
      │
      ├── Google Sheets API  →  Data permohonan
      ├── Google Drive API   →  Upload berkas
      ├── PostgreSQL (Neon)  →  Database utama (Prisma)
      └── Vercel             →  Hosting/deploy
```

## 3.4 Fitur yang Dibangun

1. **Landing page** — beranda dengan hero, pencarian/lacak permohonan, layanan, dan statistik.
2. **Form permohonan** — form multi-step (pilih layanan → data pemohon → data permohonan → upload → konfirmasi).
3. **Halaman persyaratan** — daftar persyaratan dokumen per jenis layanan.
4. **Halaman tarif layanan** — daftar biaya layanan.
5. **Dashboard admin** — login admin, tabel permohonan, update status, grafik, notifikasi WhatsApp.

## 3.5 Fitur Keamanan

- **Autentikasi admin** menggunakan token HMAC-SHA256 dengan masa berlaku 24 jam.
- **Validasi input** form menggunakan Zod schema.
- **Environment variables** (`.env`) untuk menyimpan kredensial/rahasia (tidak di-commit ke Git).
