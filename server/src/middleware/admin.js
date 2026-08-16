import { supabaseAdmin } from '../config/supabase.js'

export async function requireAdmin(req, res, next) {
  try {
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', req.user.id)
      .single()

    console.log('Admin check:', {
      userId: req.user.id,
      userEmail: req.user.email,
      profile,
      error,
    })

    if (error || !profile) {
      return res.status(403).json({ error: 'Forbidden: admin access required' })
    }

    if (profile.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: admin access required' })
    }

    next()
  } catch (err) {
    console.error('Admin check error:', err)
    return res.status(500).json({ error: 'Failed to verify permissions' })
  }
}
