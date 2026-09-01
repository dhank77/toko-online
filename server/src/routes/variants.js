import { Router } from 'express'
import { supabaseAdmin } from '../config/supabase.js'
import { authenticate } from '../middleware/auth.js'
import { requireAdmin } from '../middleware/admin.js'

const router = Router()

router.use(authenticate, requireAdmin)

router.get('/products/:productId/variants', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('product_variants')
      .select('*')
      .eq('product_id', req.params.productId)
      .order('created_at', { ascending: true })

    if (error) return res.status(400).json({ error: error.message })
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch variants' })
  }
})

router.post('/products/:productId/variants', async (req, res) => {
  try {
    const { name, price_adjustment, stock } = req.body

    const { data, error } = await supabaseAdmin
      .from('product_variants')
      .insert([{ product_id: req.params.productId, name, price_adjustment, stock }])
      .select()
      .single()

    if (error) return res.status(400).json({ error: error.message })
    res.status(201).json(data)
  } catch (err) {
    res.status(500).json({ error: 'Failed to create variant' })
  }
})

router.put('/variants/:id', async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body

    const { data, error } = await supabaseAdmin
      .from('product_variants')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) return res.status(400).json({ error: error.message })
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Failed to update variant' })
  }
})

router.delete('/variants/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { error } = await supabaseAdmin
      .from('product_variants')
      .delete()
      .eq('id', id)

    if (error) return res.status(400).json({ error: error.message })
    res.status(204).send()
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete variant' })
  }
})

export default router
