import { Router } from 'express'
import { supabaseAdmin } from '../config/supabase.js'
import { authenticate } from '../middleware/auth.js'
import { requireAdmin } from '../middleware/admin.js'

const router = Router()

// Admin: list orders (with customer info)
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        profiles:profiles!customer_id(full_name, email)
      `)
      .order('created_at', { ascending: false })

    if (error) return res.status(400).json({ error: error.message })
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' })
  }
})

// Admin: update order status
router.patch('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const { data, error } = await supabaseAdmin
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) return res.status(400).json({ error: error.message })
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order' })
  }
})

export default router
