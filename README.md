# Toko Online — ShopComposed

Aplikasi e-commerce dengan frontend **React + Vite**, backend **Express.js**,
database **Supabase**, dan payment gateway **Midtrans**.

Frontend dan backend dapat di-deploy ke **satu project Vercel** sehingga
berbagi domain yang sama dan tidak ada masalah CORS.

---

## Stack

| Lapisan | Teknologi |
| --- | --- |
| Frontend | React 18, Vite 6, React Router 7, Tailwind CSS 4, Radix UI, Lucide |
| Backend | Node.js 22, Express 4, Helmet, CORS, express-rate-limit, JWT |
| Database & Auth | Supabase (Postgres + GoTrue + Storage) |
| Payment | Midtrans Snap |
| Deployment | Vercel (static frontend + serverless function backend) |

---

## Struktur Project

```
.
├── api/
│   └── index.js              # Entry point serverless Vercel
├── server/
│   ├── src/
│   │   ├── index.js          # Listener untuk development lokal
│   │   ├── app.js            # Express app (export default)
│   │   ├── config/
│   │   │   ├── env.js        # Loader .env terpusat
│   │   │   └── supabase.js   # Supabase client (service role)
│   │   ├── middleware/
│   │   │   ├── auth.js       # Verifikasi JWT / session Supabase
│   │   │   └── admin.js      # Guard role admin
│   │   └── routes/
│   │       ├── auth.js       ├── orders.js       └── payment.js
│   │       ├── cart.js       ├── profiles.js     └── heroSlides.js
│   │       ├── products.js   └── variants.js
│   │       └── categories.js
│   └── .env.example
├── src/                      # Frontend React + Vite
├── supabase/migrations/      # Migration database
├── docs/
│   ├── DEPLOYMENT_VERCEL.md  # ← Dokumentasi deployment (mulai di sini)
│   └── midtrans_integration_guide.md
├── vercel.json               # Konfigurasi Vercel
└── .env.example
```

---

## Menjalankan Secara Lokal

Prasyarat: Node.js 22.

```bash
# 1. Install dependensi frontend + backend
npm install
npm run install:server

# 2. Siapkan environment variable
cp .env.example .env
cp server/.env.example server/.env
# lalu isi keduanya dengan nilai Anda

# 3. Jalankan backend (terminal 1) → http://localhost:3001
npm run dev:server

# 4. Jalankan frontend (terminal 2) → http://localhost:5173
npm run dev
```

Health check backend: <http://localhost:3001/health>

---

## Deployment ke Vercel

**📖 Dokumentasi lengkap: [`docs/DEPLOYMENT_VERCEL.md`](docs/DEPLOYMENT_VERCEL.md)**

Dokumen tersebut mencakup:

1. Arsitektur aplikasi
2. Ringkasan & alasan setiap perubahan kode
3. Environment variables (backend & frontend)
4. Cara kerja routing `vercel.json`
5. Langkah deployment langkah demi langkah
6. Konfigurasi Supabase & Midtrans
7. Verifikasi & smoke test
8. Tabel troubleshooting
9. Opsi dua project terpisah

Ringkasnya:

```bash
git push origin main      # deploy otomatis, atau:
vercel --prod             # deploy via CLI
```

Pastikan **semua** environment variable (§4 di dokumen deployment) sudah diisi di
Vercel sebelum deploy.

---

## Environment Variable

| Kelompok | Prefix | Dibaca saat | Contoh |
| --- | --- | --- | --- |
| Backend | *(tanpa prefix)* | saat request | `SUPABASE_SERVICE_ROLE_KEY`, `MIDTRANS_SERVER_KEY` |
| Frontend | `VITE_` | **saat build** | `VITE_API_URL`, `VITE_SUPABASE_ANON_KEY` |

> Env var `VITE_*` di-*bake* ke dalam bundle. Mengubahnya di Vercel wajib
> diikuti **Redeploy**. Lihat `.env.example` dan `server/.env.example`.

---

## Dokumentasi Lain

- [`docs/DEPLOYMENT_VERCEL.md`](docs/DEPLOYMENT_VERCEL.md) — panduan deployment
- [`docs/midtrans_integration_guide.md`](docs/midtrans_integration_guide.md) —
  integrasi pembayaran Midtrans

---

## Catatan Keamanan

- `SUPABASE_SERVICE_ROLE_KEY` bersifat rahasia dan **tidak boleh** masuk ke
  frontend (jangan memakai prefix `VITE_`).
- Pastikan **Row Level Security** aktif di Supabase agar `anon` key tidak bisa
  mengakses data secara bebas.
- Bila service role key pernah bocor, segera regenerate di Supabase Dashboard.

---

## Lisensi

MIT
