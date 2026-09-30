// Entry point untuk hosting yang menjalankan Node.js secara permanen:
//   - Development lokal  → npm run dev:server
//   - cPanel / VPS / dedicated server → PM2 (server/ecosystem.config.cjs)
//
// Catatan: entry point ini TIDAK dipakai di Vercel. Di sana yang dipakai
// adalah /api/index.js (serverless) dan app.listen() sengaja tidak
// dijalankan karena Vercel yang mengelola lifecycle fungsi.
import app from './app.js'

const PORT = Number(process.env.PORT) || 3001

app.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`)
})

