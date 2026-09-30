# Deployment ke cPanel — Dokumentasi Lengkap

Panduan deploy aplikasi Toko Online ke hosting **cPanel** (shared hosting yang
menyediakan Node.js), tanpa menggunakan Vercel.

---

## 1. Perbedaan Vercel vs cPanel

Kode Anda sudah cocok untuk keduanya, tapi mekanismenya berlawanan:

| | Vercel | cPanel |
|---|---|---|
| Nature | Serverless (AWS Lambda) | Server permanen (Apache + Node.js) |
| `app.listen()` | tidak boleh | **wajib** |
| Entry point | `api/index.js` | `server/src/index.js` |
| Environment var | Dashboard Vercel | File `.env` / cPanel UI |
| Proses penjaga app | Vercel | **PM2** |
| Routing | `vercel.json` rewrites | `.htaccess` |
| Update | `git push` | Upload manual + restart PM2 |

> Kabar baik: `server/src/index.js` di repo Anda **sudah** memakai
> `app.listen()`, jadi tidak perlu perubahan kode. Yang perlu disiapkan hanya
> `.htaccess` dan konfigurasi PM2 — keduanya sudah dibuat di `deploy/cpanel/`
> dan `server/ecosystem.config.cjs`.

---

## 2. Arsitektur di cPanel

```
Browser
   │  https://domainanda.com
   ▼
┌────────────────────────────────────┐
│  Apache / LiteSpeed  (port 80/443) │  ← public_html/
│  .htaccess sebagai router          │
└────────────┬───────────────────────┘
             │
   ┌─────────┴──────────┐
   │                    │
   ▼                    ▼
/api/*              /produk, /cart, ...
/assets/*           (tidak ada file)
   │                    │
   ▼                    ▼
┌────────────────┐   ┌──────────────┐
│ Express        │   │ index.html   │
│ port 3001      │   │ (SPA React)  │
│ (diurus PM2)   │   └──────────────┘
└────────┬───────┘
         ▼
   Supabase + Midtrans
```

Kunci dari diagram ini: **frontend dan API sama-sama lewat `domainanda.com`**.
Semua request masuk ke Apache, lalu Apache memutuskan forwards ke Node atau
melayani file statis. Karena itu **CORS tidak perlu diaktifkan** — dan
`FRONTEND_URL` di cPanel sebaiknya diisi domain Anda sendiri.

---

## 3. Prasyarat

Pastikan hosting Anda punya:

- **cPanel** dengan menu **"Setup Node.js App"** (atau **"Application Manager"**)
- **Akses SSH / Terminal** (wajib — untuk `npm install` dan `pm2`)
- **Node.js versi 22** tersedia di dropdown cPanel
- Modul **`mod_rewrite`** aktif (biasanya sudah default)
- **SSL aktif** (cPanel → Security → SSL/TLS Status → Run AutoSSL)

> ⚠️ Tidak semua shared hosting menyediakan Node.js. Cek dulu di cPanel
> apakah ada menu **Setup Node.js App**. Kalau tidak ada, hosting Anda tidak
> bisa menjalankan Express — hubungi provider atau pindah ke VPS.

---

## 4. Menapkan File ke cPanel

### Struktur folder di server

```
/home/akunanda/
├── public_html/              ← ISI folder dist/ + .htaccess
│   ├── index.html
│   ├── .htaccess
│   ├── logo.png
│   └── assets/
│       ├── index-xxxx.js
│       └── index-xxxx.css
│
└── toko-online/              ← backend (di luar public_html!)
    ├── package.json
    ├── ecosystem.config.cjs
    ├── .env                  ← env var backend
    ├── logs/
    └── src/
```

> **Aturan emas:** backend **TIDAK BOLEH** berada di dalam `public_html/`.
> Kalau ditaruh di sana, file `.env` dan source code bisa diunduh siapa saja
> lewat browser. Taruh di luar, misalnya `~/toko-online/`.

### 4.1 Build frontend di komputer lokal

```bash
npm install
npm run build
```

Pastikan `VITE_API_URL` menunjuk ke domain cPanel Anda **sebelum** build:

```
# .env (lokal)
VITE_API_URL=https://domainanda.com/api
VITE_SUPABASE_URL=https://vywnwqayuscbihrjmfsl.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_MIDTRANS_CLIENT_KEY=Mid-client-xxxx
VITE_MIDTRANS_IS_PRODUCTION=false
```

### 4.2 Upload frontend ke public_html

**Cara 1 — File Manager cPanel**

1. Buka **cPanel → File Manager → `public_html`**
2. Hapus isi default — termasuk **`.htaccess` bawaan**, karena kita memakai milik sendiri
3. Upload **isi** folder `dist/` lokal ke `public_html/`

**Cara 2 — SCP dari komputer lokal**

```bash
scp -r dist/* akunanda@domainanda.com:~/public_html/
scp deploy/cpanel/.htaccess akunanda@domainanda.com:~/public_html/
```

> ⚠️ Gunakan `dist/*` (isi), **bukan** `dist` (folder-nya). Kalau Anda upload
> folder `dist`, struktur di server menjadi `public_html/dist/index.html` dan
> situs tidak akan terbuka.

### 4.3 Upload backend

```bash
scp -r server/* akunanda@domainanda.com:~/toko-online/
```

---


---

## 5. Setup Backend di cPanel

### 5.1 Buat aplikasi Node.js

**cPanel → Setup Node.js App → Create Application**

| Field | Isi |
|---|---|
| Node.js version | **22.x** |
| Application mode | **Production** |
| Application root | `toko-online` |
| Application URL | *(kosongkan — kita pakai domain utama)* |
| Application startup file | `src/index.js` |

Klik **Create**, lalu catat **port** yang diberikan cPanel (mis. `3001`).

> Kalau cPanel memberi port sendiri, pakai port tersebut secara konsisten di
> `.htaccess` dan `ecosystem.config.cjs`.

### 5.2 Buat file `.env` backend

```bash
nano ~/toko-online/.env
```

Isi dengan:

```bash
NODE_ENV=production
PORT=3001

FRONTEND_URL=https://domainanda.com

SUPABASE_URL=https://vywnwqayuscbihrjmfsl.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

MIDTRANS_MERCHANT_ID=M326393779
MIDTRANS_CLIENT_KEY=Mid-client-YB3sPx8HmfM2RPD8
MIDTRANS_SERVER_KEY=Mid-server-PYW1XmJ8dXPsv3XHr4n_MMlB
MIDTRANS_IS_PRODUCTION=false
```

Amankan agar tidak bisa dibaca lewat web:

```bash
chmod 600 ~/toko-online/.env
```

### 5.3 Install dependensi

```bash
cd ~/toko-online
npm install --omit=dev
mkdir -p logs
```

### 5.4 Jalankan dengan PM2

```bash
npm i -g pm2          # install PM2
pm2 start ecosystem.config.cjs
pm2 save              # agar hidup setelah reboot
pm2 startup
```

Cek hasil:

```bash
pm2 status            # harus "online"
pm2 logs toko-api     # lihat log
```

---

## 6. Verifikasi

```bash
# 1. Node hidup langsung (tanpa lewat Apache)
curl http://127.0.0.1:3001/health
# diharapkan: {"status":"ok","service":"toko-online-api"}

# 2. Lewat Apache — frontend
curl -s -o /dev/null -w "%{http_code}\n" https://domainanda.com/

# 3. Lewat Apache — API
curl https://domainanda.com/health
curl https://domainanda.com/api/categories

# 4. Aset frontend ter-load
curl -s https://domainanda.com/ | grep -o 'src="/assets/[^"]*\.js"'
```

Buka `https://domainanda.com` di browser dan coba login. Kalau gagal, cek
`pm2 logs toko-api` untuk pesan errornya.

---

## 7. Update Aplikasi Nanti

cPanel tidak punya CI/CD otomatis. Alur update:

```bash
# 1. Update di komputer lokal
git pull
npm install
npm run build

# 2. Upload ulang frontend
scp -r dist/* akunanda@domainanda.com:~/public_html/
scp deploy/cpanel/.htaccess akunanda@domainanda.com:~/public_html/

# 3. Upload backend yang berubah saja
scp -r server/src akunanda@domainanda.com:~/toko-online/

# 4. Restart backend
ssh akunanda@domainanda.com 'cd ~/toko-online && pm2 restart toko-api'
```

Restart PM2 **wajib** setiap kali upload backend, karena Node sudah memuat
kode ke memori saat start.

---

## 8. Troubleshooting

| Gejala | Penyebab | Solusi |
| --- | --- | --- |
| Situs putih / 404 semua halaman | Isi `dist/` tidak ter-upload ke `public_html` | Upload **isi** `dist/`, bukan foldernya. |
| Halaman 500 dari Apache | `.htaccess` salah syntax atau `mod_rewrite` mati | Cek syntax; aktifkan `mod_rewrite`. |
| `/api/...` 404 | `mod_proxy` tidak aktif atau port salah | Minta provider aktifkan `mod_proxy`; samakan port di `.htaccess` & PM2. |
| `/api/...` 502 Bad Gateway | PM2 mati atau `npm install` belum selesai | `pm2 status` lalu `pm2 logs toko-api` |
| Refresh halaman detail → 404 | `.htaccess` tidak ter-upload / tertimpa | Upload ulang `deploy/cpanel/.htaccess` ke `public_html/` |
| API jalan tapi hanya dari `localhost` | Alamat proxy salah | Pastikan `http://127.0.0.1:3001` benar, bukan `localhost` saja. |
| `[config] SUPABASE_URL belum diset` | `.env` tidak terbaca | Cek `~/toko-online/.env` ada, lalu `pm2 restart toko-api` |
| `Cannot find module 'express'` | `npm install` belum dijalankan | `cd ~/toko-online && npm install --omit=dev` |
| App mati setelah server reboot | PM2 belum disave | `pm2 save` lalu `pm2 startup` |
| `Too many open files` / sering crash | Shared hosting membatasi proses | `npm install --omit=dev` (buang devDependencies) |
| Login Google berputar / redirect gagal | Redirect URL Supabase tidak sesuai | Tambah `https://domainanda.com/**` di Supabase → Auth → URL Configuration |

### Perbedaan dari Vercel yang sering membingungkan

| Topik | Vercel | cPanel |
|---|---|---|
| Ganti env var backend | Langsung aktif | `pm2 restart toko-api` |
| Ganti env var `VITE_*` | Redeploy | Build ulang + upload ulang `dist/` |
| Lihat log | Dashboard → Logs | `pm2 logs toko-api` atau `logs/*.log` |
| SSL | Otomatis | Manual: **Security → SSL/TLS Status → Run AutoSSL** |
| Auto-deploy | `git push` | Tidak ada — upload manual |

---

## 9. Checklist Ringkas

- [ ] cPanel punya menu **Setup Node.js App** dan **SSH Terminal**
- [ ] Node.js versi 22 tersedia
- [ ] SSL aktif (Run AutoSSL)
- [ ] `npm run build` di lokal dengan `VITE_API_URL=https://domainanda.com/api`
- [ ] Isi `dist/` + `.htaccess` ke `public_html/`
- [ ] Backend di `~/toko-online/` (di luar `public_html`)
- [ ] `~/toko-online/.env` terisi + `chmod 600`
- [ ] `npm install --omit=dev` di folder backend
- [ ] `pm2 start ecosystem.config.cjs` → status **online**
- [ ] `curl http://127.0.0.1:3001/health` → OK
- [ ] `curl https://domainanda.com/health` → OK
- [ ] `curl https://domainanda.com/api/categories` → dapat data
- [ ] Redirect URL Supabase sudah ditambah untuk domain baru

---

## 10. Kapan sebaiknya pilih yang mana?

| Pertimbangan | Vercel | cPanel |
| --- | --- | --- |
| Biaya | Gratis (Hobby) | Sudah bayar hosting |
| Otomatisasi | `git push` | Upload manual |
| Skala | Infrastruktur global, auto-scale | Sesuai paket hosting |
| Serverless | Ya (startup cepat) | Tidak |
| Kontrol penuh | Terbatas | Penuh (SSH, cron, dll) |

Kalau Anda sudah punya hosting cPanel berbayar, deploy ke sana **lebih murah**.
Kalau belum punya hosting sama sekali, **Vercel gratis** adalah pilihan paling
cepat untuk mulai.

---

*Dokumen ini berlaku untuk konfigurasi repo pada commit `97b2709` dan seterusnya.*
