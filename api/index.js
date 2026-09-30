// Entry point serverless untuk Vercel.
//
// Vercel membungkus aplikasi Express sebagai fungsi Node.js — tidak ada
// app.listen(). Request arrive sebagai (req, res) dan diteruskan ke Express.
//
// Routing diatur lewat `rewrites` di vercel.json:
//   /api/(.*)  ->  /api/index.js
//
// Catatan normalisasi: sebagian konfigurasi meneruskan req.url apa adanya
// (`/api/products`), sebagian meneruskan path hasil rewrite (`/api/index.js`).
// Keduanya dinormalisasi di sini agar route Express selalu konsisten.
import app from '../server/src/app.js'

export default function handler(req, res) {
  if (typeof req.url === 'string' && req.url.includes('/index.js')) {
    req.url = req.url.replace('/index.js', '')
  }
  return app(req, res)
}
