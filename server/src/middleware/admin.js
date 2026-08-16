import { supabaseAdmin } from '../config/supabase.js'

export async function requireAdmin(req, res, next) {
  try {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', req.user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: admin access required' })
    }

    next()
  } catch (err) {
    return res.status(500).json({ error: 'Failed to verify permissions' })
  }
}
