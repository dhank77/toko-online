import { Router } from 'express'
import { supabaseAdmin } from '../config/supabase.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

// Get own profile
router.get('/me', authenticate, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name, role, created_at, updated_at')
      .eq('id', req.user.id)
      .single()

    if (error) return res.status(400).json({ error: error.message })
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' })
  }
})

// Update own profile
router.put('/me', authenticate, async (req, res) => {
  try {
    const { full_name } = req.body

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ full_name })
      .eq('id', req.user.id)
      .select('id, email, full_name, role, created_at, updated_at')
      .single()

    if (error) return res.status(400).json({ error: error.message })
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile' })
  }
})

export default router
