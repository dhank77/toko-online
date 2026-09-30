// Entry point KHUSUS development lokal.
// Di Vercel, yang dipakai adalah /api/index.js (serverless) dan app.listen()
// TIDAK dijalankan karena Vercel yang mengelola lifecycle fungsi.
import app from './app.js'

const PORT = Number(process.env.PORT) || 3001

app.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`)
})

