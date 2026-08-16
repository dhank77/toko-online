import { Router } from 'express'
import { supabaseAdmin } from '../config/supabase.js'
import { authenticate } from '../middleware/auth.js'
import { requireAdmin } from '../middleware/admin.js'

const router = Router()

// Public: read categories
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('categories')
      .select('*')
      .order('name')

    if (error) return res.status(400).json({ error: error.message })
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories' })
  }
})

// Admin: create category
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, slug, icon } = req.body

    const { data, error } = await supabaseAdmin
      .from('categories')
      .insert([{ name, slug, icon }])
      .select()
      .single()

    if (error) return res.status(400).json({ error: error.message })
    res.status(201).json(data)
  } catch (err) {
    res.status(500).json({ error: 'Failed to create category' })
  }
})

// Admin: update category
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body

    const { data, error } = await supabaseAdmin
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) return res.status(400).json({ error: error.message })
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Failed to update category' })
  }
})

// Admin: delete category
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { error } = await supabaseAdmin
      .from('categories')
      .delete()
      .eq('id', id)

    if (error) return res.status(400).json({ error: error.message })
    res.status(204).send()
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete category' })
  }
})

export default router
