// Serverless entry point untuk Vercel.
//
// Vercel tidak mendukung app.listen(); ia membungkus Express sebagai fungsi
// Node.js. app.listen() hanya dipakai untuk development lokal (src/index.js).
import './config/env.js' // WAJIB pertama, sebelum modul lain membaca process.env

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import cookieParser from 'cookie-parser'

import productRoutes from './routes/products.js'
import categoryRoutes from './routes/categories.js'
import orderRoutes from './routes/orders.js'
import profileRoutes from './routes/profiles.js'
import authRoutes from './routes/auth.js'
import variantRoutes from './routes/variants.js'
import cartRoutes from './routes/cart.js'
import paymentRoutes from './routes/payment.js'
import heroSlideRoutes from './routes/heroSlides.js'

const app = express()

// WAJIB di Vercel: semua request datang lewat proxy (x-forwarded-for).
// Tanpa ini express-rate-limit v7 melempar ERR_ERL_UNEXPECTED_X_FORWARDED_FOR.
app.set('trust proxy', 1)
app.disable('x-powered-by')

// Origin yang diizinkan, dipisah koma. Contoh:
// FRONTEND_URL=https://toko.vercel.app,https://toko-git-main.vercel.app
const allowedOrigins = (
  process.env.FRONTEND_URL ||
  process.env.CORS_ORIGIN ||
  'http://localhost:5173,http://localhost:5174'
)
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

app.use(helmet({ contentSecurityPolicy: false }))

app.use(
  cors({
    origin(origin, callback) {
      // Tidak ada header Origin = request server-to-server, curl, atau
      // same-origin (frontend & API berada di domain yang sama).
      if (!origin) return callback(null, true)
      if (allowedOrigins.includes(origin)) return callback(null, true)
      // Izinkan preview deployment Vercel (branch/PR) bila FRONTEND_URL terisi.
      if (process.env.VERCEL_ENV === 'preview' && /\.vercel\.app$/.test(origin)) {
        return callback(null, true)
      }
      console.warn(`[cors] Origin ditolak: ${origin}`)
      return callback(null, false)
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)

app.use(cookieParser())
app.use(express.json({ limit: '10kb' }))

// Rate limit memakai store in-memory. Di serverless tiap instance punya store
// sendiri, jadi pembatas ini bersifat best-effort (bukan anti-abuse guarantor).
// Set RATE_LIMIT_ENABLED=false untuk menonaktifkan.
if (process.env.RATE_LIMIT_ENABLED !== 'false') {
  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    message: { error: 'Terlalu banyak permintaan, coba lagi nanti.' },
    standardHeaders: true,
    legacyHeaders: false,
  })
  app.use('/api/', globalLimiter)
}

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'toko-online-api' }))
app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'toko-online-api' }))

app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/profiles', profileRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api', variantRoutes)
app.use('/api/payment', paymentRoutes)
app.use('/api/hero-slides', heroSlideRoutes)

// 404 JSON untuk route API yang tidak dikenal (bukan HTML).
app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Endpoint tidak ditemukan' })
})

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(err.status || 500).json({ error: err.message || 'Kesalahan server internal' })
})

export default app
