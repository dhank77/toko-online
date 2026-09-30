# Deployment ke Vercel — Dokumentasi Lengkap

Dokumen ini mencakup arsitektur, konfigurasi Express.js agar berjalan di Vercel,
langkah deployment, setup environment variable, sampai troubleshooting.

---

## 1. Arsitektur

```
                    ┌──────────────────────────┐
  Browser ────────► │  Vercel (satu project)   │
                    │                          │
                    │  /       → dist/         │  ← Frontend React + Vite (SPA)
                    │                 (rewrite → index.html)
                    │                          │
                    │  /api/*   → fungsi       │  ← Backend Express (serverless)
                    │            Node.js       │
                    └───────────┬──────────────┘
                                │
                ┌───────────────┴────────────────┐
                │                                │
        ┌───────▼────────┐              ┌────────▼────────┐
        │  Supabase      │              │  Midtrans       │
        │  Auth+Postgres │              │  Snap + Status  │
        │  + Storage     │              └─────────────────┘
        └────────────────┘
```

| Komponen | Lokasi | Peran |
| --- | --- | --- |
| `src/` (React + Vite) | Vercel (static) | Halaman toko, katalog, cart, checkout, panel admin |
| `server/src/` (Express) | Vercel (serverless function) | API, otorisasi, proxy Midtrans, akses DB via service role |
| Supabase | Repo `supabase/migrations` | Auth, database, storage |
| Midtrans | Dashboard Midtrans | Payment gateway (Snap) |

> **Penting:** `SUPABASE_SERVICE_ROLE_KEY` hanya boleh ada di environment
> variable server. Kunci ini tidak pernah masuk ke bundle frontend.

---

## 2. Ringkasan Perubahan Kode

Semua perubahan sudah diterapkan di repo ini. Tabel ini menjelaskan **mengapa**
setiap perubahan diperlukan.

| Berkas | Aksi | Alasan |
| --- | --- | --- |
| `api/index.js` | **Baru** | Entry point serverless. Vercel mencari fungsi di folder `api/`. |
| `server/src/app.js` | **Baru** | Express app yang di-`export default`. Vercel butuh app, bukan proses yang `listen`. |
| `server/src/index.js` | Diubah | Sekarang hanya listener untuk `npm run dev`. |
| `server/src/config/env.js` | **Baru** | Memuat `.env` secara terpusat & terjamin dieksekusi pertama. |
| `server/src/config/supabase.js` | Diubah | Import `env.js` + validasi env var yang jelas. |
| `server/src/middleware/auth.js` | Diubah | `JWT_SECRET` dibaca saat request, bukan saat module load. |
| `vercel.json` | Diubah | Tambah routing `/api/*` ke fungsi, konfigurasi build & install. |
| `.vercelignore` | **Baru** | Mempercepat upload, mencegah `.env` ikut ter-upload. |
| `.nvmrc` | **Baru** | Mengunci versi Node.js (22). |
| `.gitignore` | Diubah | Tambah `.vercel` dan log. |
| `.env.example` | **Baru** | Template env var frontend. |
| `server/.env.example` | Diubah | Template env var backend (lengkap). |
| `package.json` | Diubah | Script bantu: `dev:server`, `install:server`, `start:server`. |
| `index.html` | Diubah | Hapus hardcode Midtrans Sandbox (blocker produksi). |

### 2.1 Tiga masalah kritis yang diperbaiki

**a) `app.listen()` tidak bisa dipakai di Vercel**

Vercel menjalankan kode sebagai *serverless function*. Fungsi hanya hidup saat
ada request, lalu dihentikan. Tidak ada proses yang boleh "menunggu" di port.

```
Sebelum:  index.js ──▶ app.listen(3001)    ❌ proses menggantung tanpa batas
Sesudah:  app.js   ──▶ export default app  ✅ Vercel yang mengatur lifecycle
          index.js ──▶ import app; listen  ✅ hanya untuk lokal
```

**b) `express-rate-limit` akan CRASH tanpa `trust proxy`**

`express-rate-limit` v7 memvalidasi: bila melihat header `X-Forwarded-For`
tetapi `trust proxy` tidak aktif, ia melempar
`ERR_ERL_UNEXPECTED_X_FORWARDED_FOR`. Di Vercel **setiap** request punya header
itu karena Vercel selalu menjadi proxy. Tanpa perbaikan ini seluruh API 500.

---

## 3. Prasyarat

- Akun **Vercel** dan repository GitHub sudah terhubung.
- **Node.js 22** (sesuai `.nvmrc`). Cek dengan `node -v`.
- **Vercel CLI** (opsional, untuk deploy dari terminal): `npm i -g vercel`
- Project **Supabase** aktif beserta migration di `supabase/migrations/`.
- Akun **Midtrans** (Sandbox untuk uji coba, Production untuk go-live).

---

## 4. Environment Variables

Ada **dua kelompok** env var yang wajib diisi di Vercel.

### 4.1 Backend / Express (tanpa prefix)

| Nama | Wajib | Contoh | Keterangan |
| --- | :---: | --- | --- |
| `SUPABASE_URL` | ya | `https://xxxx.supabase.co` | URL project Supabase. |
| `SUPABASE_SERVICE_ROLE_KEY` | ya | `eyJhbGciOi...` | **Rahasia.** Bypass RLS. Hanya untuk server. |
| `FRONTEND_URL` | ya | `https://toko.vercel.app` | Origin yang diizinkan CORS. Pisahkan dengan koma untuk multi-domain. |
| `MIDTRANS_MERCHANT_ID` | ya | `M326393779` | ID merchant Midtrans. |
| `MIDTRANS_SERVER_KEY` | ya | `Mid-server-...` | **Rahasia.** Untuk verifikasi status & webhook. |
| `MIDTRANS_CLIENT_KEY` | tidak | `Mid-client-...` | Agar frontend & server konsisten. |
| `MIDTRANS_IS_PRODUCTION` | ya | `false` / `true` | `false` saat uji, `true` saat produksi. |
| `JWT_SECRET` | tidak | *(kosong)* | Lihat catatan §4.3. |
| `RATE_LIMIT_ENABLED` | tidak | `true` | `false` untuk mematikan rate limiter. |
| `PORT` | **jangan** | *(kosong)* | Di Vercel port ditentukan platform. |

### 4.2 Frontend / Vite (prefix `VITE_`)

| Nama | Wajib | Contoh | Keterangan |
| --- | :---: | --- | --- |
| `VITE_SUPABASE_URL` | ya | `https://xxxx.supabase.co` | Aman dipublikasikan. |
| `VITE_SUPABASE_ANON_KEY` | ya | `eyJhbGciOi...` | Anon key memang untuk client. Pastikan RLS aktif. |
| `VITE_API_URL` | ya | `https://toko.vercel.app/api` | **Base URL API.** Lihat §7.3. |
| `VITE_MIDTRANS_CLIENT_KEY` | ya | `Mid-client-...` | Client key versi yang dipakai. |
| `VITE_MIDTRANS_IS_PRODUCTION` | ya | `false` / `true` | Harus **sama** dengan `MIDTRANS_IS_PRODUCTION`. |

> **Dua hal yang sering bikin frustrasi:**
>
> 1. **Prefix `VITE_` = bake-time.** Nilainya di-bake ke `dist/` saat
>    `vite build`. Mengubah env var di Vercel **tidak berefek** sampai Anda
>    melakukan **Redeploy**. Sebaliknya env var backend (tanpa `VITE_`)
>    dibaca saat request, jadi langsung aktif.
> 2. **Jangan tertukar** antara `SUPABASE_SERVICE_ROLE_KEY` (rahasia, server)
>    dan `VITE_SUPABASE_ANON_KEY` (publik, client).

### 4.3 Catatan tentang `JWT_SECRET`

Middleware `authenticate()` punya *fast path*: memverifikasi JWT Supabase secara
lokal dengan `HS256` tanpa panggilan jaringan. Agar jalur ini bekerja, `JWT_SECRET`
**harus sama persis** dengan JWT Secret di
`Supabase Dashboard → Settings → API → JWT Secret`.

Bila kosong atau salah, `jwt.verify` gagal lalu server otomatis *fallback* ke
verifikasi remote (`supabaseAdmin.auth.getUser`). **Tetap berfungsi aman**,
hanya menambah satu panggilan jaringan. Jadi `JWT_SECRET` boleh dikosongkan;
isi nilai aslinya hanya bila Anda ingin kecepatan.

---

## 5. Cara Kerja Routing di `vercel.json`

```json
"rewrites": [
  { "source": "/api/(.*)", "destination": "/api/index.js" },
  { "source": "/health",     "destination": "/api/index.js" },
  { "source": "/(.*)",       "destination": "/" }
]
```

| Request | Diproses oleh | Alasan |
| --- | --- | --- |
| `/api/products` | fungsi `api/index.js` → Express | Rewrite pertama cocok. |
| `/api/payment/notification` | fungsi → Express | Rewrite pertama cocok. |
| `/health` | fungsi → Express | Health check, tidak tertangkap SPA. |
| `/assets/index-abc.js` | file statis | Sudah ada di filesystem, rewrite dilewati. |
| `/produk` | `index.html` | SPA fallback agar React Router aman saat refresh. |

> Vercel memproses `rewrites` **setelah** pengecekan filesystem. Karena itu aset
> statis tetap aman, dan urutan di atas penting: `/api/(.*)` harus **sebelum**
> `/(.*)`.

`api/index.js` juga melakukan normalisasi kecil: bila `req.url` berisi
`/index.js` (bentuk path hasil rewrite), segmen itu dibuang. Ini membuat aplikasi
tahan bantal terhadap perbedaan perilaku antar versi runtime Vercel.


```js
app.set('trust proxy', 1)   // ← wajib ada di server/src/app.js
```

**c) `index.html` mengunci Snap ke Sandbox**

`index.html` memuat `https://app.sandbox.midtrans.com/snap/snap.js` secara
hardcode. Akibatnya di produksi checkout **tetap** membuka Sandbox, karena
`loadSnapScript()` di `src/utils/midtrans.js` berhenti lebih dulu begitu
`window.snap` ada. Sekarang URL dan client key dipilih dari env saat build.

---

## 6. Pilihan Arsitektur Deployment

Ada dua opsi. **Opsi A direkomendasikan.**

### Opsi A — Satu Project (rekomendasi)

Frontend dan API berada di satu project/domain yang sama.

- ✅ Satu URL, satu deployment, satu tempat env var.
- ✅ **Tidak ada CORS** — frontend dan API same-origin.
- ✅ `VITE_API_URL` bisa ditentukan sebelum deploy pertama.
- ⚠️ Frontend ikut di-deploy ulang (memakai konfigurasi terbaru).

Base URL API: `https://<project>.vercel.app/api`

### Opsi B — Dua Project Terpisah

Frontend di project yang sudah ada, backend di project baru
(Root Directory `server`). Diperlukan restrukturisasi berkas, lihat §12.

- ✅ Siklus deploy frontend tidak menyentuh API.
- ⚠️ Dua project, dua kali deploy, env var terpisah.
- ⚠️ CORS aktif (cross-origin) — `FRONTEND_URL` wajib diisi benar.
- ⚠️ Harus deploy backend dulu untuk tahu URL-nya, baru rebuild frontend.

Base URL API: `https://<api-project>.vercel.app/api`

---

## 7. Langkah Deployment (Opsi A)

### 7.1 Siapkan env var lokal (opsional, untuk uji dulu)

```bash
cp .env.example .env
cp server/.env.example server/.env
# lalu isi .env dan server/.env dengan nilai asli Anda
npm run install:server
```

Pastikan aplikasi masih jalan lokal:

```bash
npm run dev:server   # terminal 1 → http://localhost:3001
npm run dev          # terminal 2 → http://localhost:5173
```

### 7.2 Push perubahan ke GitHub

```bash
git add -A
git commit -m "feat: konfigurasi Express untuk deployment Vercel"
git push origin main
```

### 7.3 Isi Environment Variables di Vercel

Dashboard → project Anda → **Settings → Environment Variables**.

Tambahkan **semua** variabel dari §4.1 dan §4.2. Untuk `VITE_API_URL`, isi
`https://<nama-project>.vercel.app/api`.

> Ganti `<nama-project>` dengan nama project Vercel Anda (bisa dilihat di URL
> project, contoh `toko-online` → `toko-online.vercel.app`).

Environment target: pilih **Production**, **Preview**, dan **Development** bila
Anda ingin konsisten di semua environment.

### 7.4 Deploy

**Cara 1 — lewat Dashboard (paling umum)**

1. Buka project → tab **Deployments**.
2. Klik **Deployments → ⋮ → Redeploy**, atau push commit baru.
3. Tunggu status **Ready**.

**Cara 2 — lewat Vercel CLI**

```bash
# Sekali saja: hubungkan lokal dengan project Vercel
vercel link

# Preview dulu (uji sebelum kena production)
vercel

# Production
vercel --prod
```

### 7.5 Verifikasi

```bash
# 1. Health check API
curl https://<project>.vercel.app/health
# Harap: {"status":"ok","service":"toko-online-api"}

# 2. Daftar kategori (butuh Supabase)
curl https://<project>.vercel.app/api/categories

# 3. Endpoint yang butuh auth harus 401 (bukan 500)
curl https://<project>.vercel.app/api/cart
# diharapkan: {"error":"Missing or invalid authorization header"}

# 4. Frontend & API same-origin
curl -I https://<project>.vercel.app/
```

Buka juga `https://<project>.vercel.app` di browser, login, lalu coba keranjang.
Bila browser menampilkan error CORS, berarti Anda salah mengisi `FRONTEND_URL`.


---

## 8. Konfigurasi Supabase

### 8.1 Ambil nilainya

**Supabase Dashboard → Project Settings → API**

| Yang diambil | Dipakai sebagai |
| --- | --- |
| Project URL | `SUPABASE_URL` dan `VITE_SUPABASE_URL` |
| `anon` / `public` key | `VITE_SUPABASE_ANON_KEY` |
| `service_role` key | `SUPABASE_SERVICE_ROLE_KEY` |

### 8.2 URL Redirect Auth

**Supabase Dashboard → Authentication → URL Configuration**

Tambahkan domain produksi Anda:

- **Site URL**: `https://<project>.vercel.app`
- **Redirect URLs**: tambahkan `https://<project>.vercel.app/**`

Ditambahkan agar login/redirect (mis. setelah konfirmasi email) kembali ke
domain yang benar.

### 8.3 Pastikan migration sudah diterapkan

```bash
# di root project
npx supabase link --project-ref <project-ref>
npx supabase db push
```

Atau jalankan setiap file di `supabase/migrations/` secara berurutan lewat SQL
Editor di dashboard Supabase.

### 8.4 Keamanan

- Pastikan **anon key** tidak punya akses bebas — andalkan **Row Level Security**.
- **Jangan pernah** menaruh `service_role` key di mana pun yang bisa diakses
  publik (variabel `VITE_*`, repo Git, frontend).
- Bila service role key pernah bocor: **segera regenerate** di dashboard.

---

## 9. Konfigurasi Midtrans

### 9.1 Pilih mode: Sandbox atau Produksi

| | Sandbox (uji) | Produksi (go-live) |
| --- | --- | --- |
| `MIDTRANS_IS_PRODUCTION` | `false` | `true` |
| `VITE_MIDTRANS_IS_PRODUCTION` | `false` | `true` |
| Key yang dipakai | Sandbox key | **Production key** |
| URL Snap | `app.sandbox.midtrans.com` | `app.midtrans.com` |

> ⚠️ **Kombinasikan `isProduction=true` dengan Sandbox key akan gagal.**
> Keduanya harus pasangan yang sesuai. Ini otomatis ditangani `index.html`
> dan `src/utils/midtrans.js` selama env var diisi konsisten.

### 9.2 Setting Notification URL

**Midtrans Dashboard → Snap → Notification URL**

Isi dengan endpoint webhook backend Anda:

```
https://<project>.vercel.app/api/payment/notification
```

Route ini (`server/src/routes/payment.js`) menerima callback status pembayaran
dari Midtrans, membuat order, dan mengosongkan keranjang. **Tanpa setting ini,
pembayaran bisa "berhasil" di Midtrans tetapi order tidak pernah dibuat.**

### 9.3 Ambil key

**Midtrans Dashboard → Access Keys**

- **Server Key** → `MIDTRANS_SERVER_KEY` (rahasia, server)
- **Client Key** → `MIDTRANS_CLIENT_KEY` dan `VITE_MIDTRANS_CLIENT_KEY`

---

## 10. Verifikasi

### 10.1 Smoke test via terminal

```bash
BASE=https://<project>.vercel.app

# API hidup
curl -s $BASE/health

# Database terhubung (butuh Supabase benar)
curl -s $BASE/api/categories

# Auth hidup (harus 401, bukan 500)
curl -s $BASE/api/cart

# Frontend hidup (harus 200 + HTML)
curl -s -o /dev/null -w "%{http_code}\n" $BASE/

# Aset frontend ter-build
curl -s $BASE/ | grep -o 'src="/assets/[^"]*\.js"'
```

### 10.2 Checklist manual di browser

1. [ ] Halaman utama memuat produk dari database.
2. [ ] Refresh di URL dalam (mis. `/produk`) tidak menghasilkan 404 — SPA fallback OK.
3. [ ] Register/login berhasil.
4. [ ] Tambah produk ke keranjang tersimpan.
5. [ ] Checkout membuka Midtrans Snap dengan **mode yang benar**.
6. [ ] Setelah pembayaran sukses, order muncul di riwayat.
7. [ ] Buka panel admin — hanya user `role: 'admin'` yang bisa akses.

### 10.3 Cek log server

Dashboard Vercel → project → **Logs** → pilih deployment → **Runtime Logs**.
Pilih function `api/index.js` untuk melihat `console.log` dari Express.

---


## 11. Troubleshooting

### 11.1 Error Build & Dependency

| Gejala | Penyebab | Solusi |
| --- | --- | --- |
| `Cannot find module 'express'` | Dependensi `server/` tidak ter-install | `installCommand` di `vercel.json` sudah menyertakan `npm install --prefix server`. Pastikan tidak tertimpa di Project Settings. |
| `ERR_MODULE_NOT_FOUND ... config/config/env.js` | Path import relatif salah di `supabase.js` | Sudah diperbaiki: `import './env.js'` (bukan `'./config/env.js'`). |
| Build gagal: `outputDirectory` not found | Vite tidak menghasilkan `dist/` | Pastikan `buildCommand` = `npm run build` dan `package.json` root punya script `build`. |

### 11.2 Error runtime

| Gejala | Penyebab | Solusi |
| --- | --- | --- |
| Semua API 500, log `ERR_ERL_UNEXPECTED_X_FORWARDED_FOR` | `trust proxy` tidak di-set | Sudah diperbaiki di `server/src/app.js`. |
| `[config] SUPABASE_URL ... belum diset` (500) | Env var backend belum diisi di Vercel | Isi `SUPABASE_URL` & `SUPABASE_SERVICE_ROLE_KEY`, lalu **Redeploy**. |
| `{"error":"Endpoint tidak ditemukan"}` untuk semua route | Rewrite tidak aktif / `api/index.js` tidak terbaca | Cek `vercel.json`, pastikan file `api/index.js` ada di root repo. |
| `/api/*` mengembalikan HTML halaman frontend | Rewrite `/api/(.*)` hilang atau urut salah | Pastikan urutannya sebelum `/(.*)`. |
| Refresh halaman detail → 404 | SPA fallback hilang | Pastikan rewrite `{ "source": "/(.*)", "destination": "/" }` ada. |

### 11.3 Error konfigurasi

| Gejala | Penyebab | Solusi |
| --- | --- | --- |
| Frontend masih memanggil `localhost:3001` | Env `VITE_*` di-bake saat build, belum di-redeploy | **Redeploy** setelah mengubah env var. |
| Error CORS di browser | `FRONTEND_URL` tidak cocok dengan origin | Isi persis, tanpa trailing slash. Boleh beberapa origin dipisah koma. |
| Login berhasil tapi API 401 | Token tidak terkirim / `JWT_SECRET` salah | Login harus lewat Supabase client (bukan `/api/auth/login` tanpa session). |
| Checkout membuka Sandbox di produksi | `VITE_MIDTRANS_IS_PRODUCTION` masih `false` | Set `true` **dan** pakai production client key, lalu redeploy. |
| Pembayaran sukses tapi order tidak dibuat | Notification URL belum diset di Midtrans | Set URL webhook di Midtrans Dashboard → Snap. |

### 11.4 Cara melihat log

1. Dashboard Vercel → project → **Logs**.
2. Pilih deployment.
3. **Runtime Logs** → pilih function `api/index.js`.
4. Reproduksi masalah, log `console.log`/`console.error` langsung tampil.

Log build ada di tab **Build Logs** saat proses deployment.

---

## 12. Catatan Performansi & Limitasi

**Rate limiter bersifat best-effort di serverless.** `express-rate-limit`
pakai store in-memory. Di Vercel tiap instance punya store sendiri dan sering
di-*cold start*, jadi batas 500 request/15 menit tidak berlaku global. Untuk
protection serius, tambahkan proteksi di lapisan lain (mis. Vercel WAF, atau
rate limit di Supabase).

**Serverless tidak persisten.** Tidak ada file system yang bertahan antar
request. Semua state harus di Supabase. Ini sudah diterapkan di kode.

**Duration dibatasi.** Default `maxDuration` 30 detik (lihat `vercel.json`).
Cukup untuk operasi normal. Naikkan hanya bila Anda memang butuh operasi
panjang (mis. laporan analitik berat).

**Cold start.** Request pertama setelah idle bisa memakan 1–3 detik. Ini
normal untuk serverless.

---

## 13. Opsi B — Dua Project Terpisah (opsional)

Bila Anda memilih backend terpisah:

### 13.1 Restrukturisasi entry point

Vercel mencari fungsi di folder `api/` **relatif terhadap Root Directory**.
Jika Root Directory = `server`, entry point harus berada di `server/api/`.

Buat `server/api/index.js`:

```js
import app from '../src/app.js'

export default function handler(req, res) {
  if (typeof req.url === 'string' && req.url.includes('/index.js')) {
    req.url = req.url.replace('/index.js', '')
  }
  return app(req, res)
}
```

Buat `server/vercel.json`:

```json
{
  "rewrites": [{ "source": "/api/(.*)", "destination": "/api/index.js" }]
}
```

### 13.2 Urutan deploy

1. Deploy project backend lebih dulu (Root Directory = `server`).
2. Catat URL API, mis. `https://toko-api.vercel.app`.
3. Di project **frontend**, set `VITE_API_URL=https://toko-api.vercel.app/api`.
4. Di project **backend**, set `FRONTEND_URL=https://<frontend-project>.vercel.app`.
5. **Redeploy** frontend (wajib, karena `VITE_*` bersifat bake-time).

---

## 14. Ringkasan Alur Kerja

```
Push ke GitHub
      │
      ▼
Vercel build otomatis ── npm install ──▶ npm install --prefix server
      │                                    │
      │                                    ▼
      │                            Serverless function siap
      │                                    │
      ▼                                    │
  vite build ──▶ dist/  ──▶ /  routes ke frontend
                                   /api/*  routes ke Express
      │                                    │
      └──────────── Keduanya satu domain, tanpa CORS ───────┘
```

---

## 15. Referensi Cepat

| Kebutuhan | Perintah / Lokasi |
| --- | --- |
| Link project lokal | `vercel link` |
| Deploy preview | `vercel` |
| Deploy production | `vercel --prod` |
| Lihat log | Dashboard → Logs → Runtime Logs |
| Redeploy | Dashboard → Deployments → ⋮ → Redeploy |
| Setting env var | Dashboard → Settings → Environment Variables |
| Health check | `curl https://<project>.vercel.app/health` |
| Jalankan API lokal | `npm run dev:server` |
| Jalankan frontend lokal | `npm run dev` |
| Panduan Midtrans | [`docs/midtrans_integration_guide.md`](midtrans_integration_guide.md) |

---

*Dokumen ini berlaku untuk konfigurasi repo pada commit `97b2709` dan seterusnya.*

