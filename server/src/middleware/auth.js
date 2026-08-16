import { supabaseAdmin } from '../config/supabase.js'
import jwt from 'jsonwebtoken'

export async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization
  const cookieToken = req.cookies?.sb-access-token

  const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : cookieToken

  if (!token) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' })
  }

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' })
    }

    req.user = user
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}
