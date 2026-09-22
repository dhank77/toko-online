import { supabaseAdmin } from '../config/supabase.js'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET

async function verifyRemotely(token) {
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !user) return null
  return user
}

export async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization
  const cookieToken = req.cookies?.['sb-access-token']

  const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : cookieToken

  if (!token) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' })
  }

  try {
    // Fast path: verify the Supabase JWT locally (no network round-trip).
    if (JWT_SECRET) {
      try {
        const payload = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] })
        if (typeof payload?.sub === 'string' && payload.sub) {
          req.user = { id: payload.sub, ...payload }
          await ensureProfile(req.user).catch(() => {})
          return next()
        }
      } catch {
        // Invalid/expired token locally — fall through to remote verification
      }
    }

    const user = await verifyRemotely(token)
    if (!user) {
      return res.status(401).json({ error: 'Invalid or expired token' })
    }

    req.user = user
    await ensureProfile(user).catch(() => {})
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

// Pastikan setiap user yang terautentikasi punya row di public.profiles
// (handle_new_user trigger kadang tidak jalan untuk user lama / OAuth).
// Tidak pernah menimpa full_name yang sudah diisi manual.
async function ensureProfile(user) {
  if (!user?.id) return
  const meta = user.user_metadata || {}
  const fallbackName =
    meta.full_name || meta.name || meta.display_name ||
    user.identities?.[0]?.identity_data?.full_name ||
    user.identities?.[0]?.identity_data?.name ||
    (user.email ? user.email.split('@')[0] : null)
  const { data: existing } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name')
    .eq('id', user.id)
    .maybeSingle()
  if (!existing) {
    await supabaseAdmin.from('profiles').upsert(
      [{ id: user.id, email: user.email || null, full_name: fallbackName || 'Pelanggan', role: 'customer' }],
      { onConflict: 'id', ignoreDuplicates: true }
    )
    return
  }
  // Row ada tapi nama kosong -> isi dari metadata auth (hanya jika ada sumber nama)
  if (!existing.full_name && fallbackName) {
    await supabaseAdmin.from('profiles').update({ full_name: fallbackName }).eq('id', user.id)
  }
}