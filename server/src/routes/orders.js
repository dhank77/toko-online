import { Router } from 'express'
import { supabaseAdmin } from '../config/supabase.js'
import { authenticate } from '../middleware/auth.js'
import { requireAdmin } from '../middleware/admin.js'

const router = Router()

// User: list own orders (must be before admin '/' to avoid conflict)
router.get('/my', authenticate, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('customer_id', req.user.id)
      .order('created_at', { ascending: false })

    if (error) {
      if (error.code === 'PGRST205') return res.json([])
      return res.status(400).json({ error: error.message })
    }
    res.json(data || [])
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil pesanan' })
  }
})

// User: get single own order
router.get('/my/:order_id', authenticate, async (req, res) => {
  try {
    const { order_id } = req.params
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('order_id', order_id)
      .eq('customer_id', req.user.id)
      .single()
    if (error) return res.status(404).json({ error: 'Pesanan tidak ditemukan' })
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil pesanan' })
  }
})

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
    res.status(500).json({ error: 'Gagal mengambil pesanan' })
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
    res.status(500).json({ error: 'Gagal memperbarui pesanan' })
  }
})

export default router
