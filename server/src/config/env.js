// Memuat environment variable dari berkas .env.
//
// - Development lokal: membaca `server/.env` (lalu fallback ke `.env` di root).
// - Vercel: process.env sudah diisi dari Settings > Environment Variables,
//   sehingga pemanggilan dotenv di bawah menjadi no-op dan aman.
//
// Berkas ini WAJIB di-import pertama di app/index/api entry point supaya
// process.env terisi sebelum modul lain membacanya saat module evaluation.
import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const serverRoot = path.resolve(__dirname, '../..') // folder server/

// Urutan penting: server/.env lebih spesifik didahulukan.
// dotenv tidak menimpa variabel yang sudah ada, sehingga yang pertama menang.
dotenv.config({ path: path.join(serverRoot, '.env') })
dotenv.config()

export default {}
