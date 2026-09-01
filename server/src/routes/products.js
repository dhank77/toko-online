import { Router } from 'express'
import { supabaseAdmin } from '../config/supabase.js'
import { authenticate } from '../middleware/auth.js'
import { requireAdmin } from '../middleware/admin.js'

const router = Router()

// Public: read products (paginated)
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 12))
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await supabaseAdmin
      .from('products')
      .select('*, categories(name, slug, icon)', { count: 'exact' })
      .eq('in_stock', true)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) return res.status(400).json({ error: error.message })
    res.json({
      data,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' })
  }
})

// Public: read product by slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*, categories(name, slug, icon)')
      .eq('slug', req.params.slug)
      .single()

    if (error) return res.status(404).json({ error: 'Product not found' })
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch product' })
  }
})

// Admin: create product
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, slug, description, price, image_url, badge, rating, review_count, category_id, in_stock } = req.body

    const { data, error } = await supabaseAdmin
      .from('products')
      .insert([{ name, slug, description, price, image_url, badge, rating, review_count, category_id, in_stock }])
      .select('*, categories(name, slug, icon)')
      .single()

    if (error) return res.status(400).json({ error: error.message })
    res.status(201).json(data)
  } catch (err) {
    res.status(500).json({ error: 'Failed to create product' })
  }
})

// Admin: update product
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body

    const { data, error } = await supabaseAdmin
      .from('products')
      .update(updates)
      .eq('id', id)
      .select('*, categories(name, slug, icon)')
      .single()

    if (error) return res.status(400).json({ error: error.message })
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Failed to update product' })
  }
})

// Admin: delete product
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', id)

    if (error) return res.status(400).json({ error: error.message })
    res.status(204).send()
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete product' })
  }
})

export default router
