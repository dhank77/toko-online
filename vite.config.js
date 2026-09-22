import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig(({ mode }) => {
  // Ambil PORT / VITE_PORT dari env, CLI (--port), atau .env agar dinamis.
  // Prioritas: CLI `vite --port=xxxx` > process.env.PORT > .env (PORT/VITE_PORT) > default 5174
  const env = loadEnv(mode, process.cwd(), '')
  const port = Number(process.env.PORT || env.PORT || env.VITE_PORT || 5173)

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      host: '0.0.0.0',
      port,
      // false = kalau port sudah dipakai, Vite otomatis naik ke port kosong berikutnya
      // (5174 -> 5175 -> 5176, dst) tanpa perlu ubah-ubah config.
      strictPort: false,
    },
  }
})
