// Harus import pertama: mengisi process.env sebelum modul lain membacanya.
import './env.js'

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    '[config] SUPABASE_URL dan/atau SUPABASE_SERVICE_ROLE_KEY belum diset. ' +
      'Isi di Vercel > Settings > Environment Variables, atau di server/.env untuk lokal.'
  )
}

// Service role: melewati Row Level Security, HANYA boleh dipakai di server.
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

