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
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}