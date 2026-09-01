import { Router } from 'express'
import { supabaseAdmin } from '../config/supabase.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

router.use(authenticate)

// Helper: build joined select for cart items
const CART_SELECT = `
  id,
  product_id,
  variant_id,
  quantity,
  selected,
  created_at,
  updated_at,
  products!product_id(name, slug, price, image_url, badge, in_stock),
  product_variants!variant_id(name, price_adjustment)
`

async function fetchCart(userId) {
  const { data, error } = await supabaseAdmin
    .from('cart_items')
    .select(CART_SELECT)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// GET /api/cart - current user's cart
router.get('/', async (req, res) => {
  try {
    const data = await fetchCart(req.user.id)
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch cart' })
  }
})

// PUT /api/cart - upsert an item (add to cart / set quantity)
// body: { product_id, variant_id?, quantity }
router.put('/', async (req, res) => {
  try {
    const { product_id, variant_id = null, quantity = 1 } = req.body
    if (!product_id) return res.status(400).json({ error: 'product_id is required' })
    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ error: 'quantity must be a positive integer' })
    }

    let query = supabaseAdmin
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', req.user.id)
      .eq('product_id', product_id)

    if (variant_id === null || variant_id === undefined) {
      query = query.is('variant_id', null)
    } else {
      query = query.eq('variant_id', variant_id)
    }

    const { data: existing, error: findErr } = await query.maybeSingle()
    if (findErr) return res.status(400).json({ error: findErr.message })

    let result
    if (existing) {
      const { data, error } = await supabaseAdmin
        .from('cart_items')
        .update({ quantity: existing.quantity + quantity, selected: true })
        .eq('id', existing.id)
        .select(CART_SELECT)
        .single()
      if (error) return res.status(400).json({ error: error.message })
      result = data
    } else {
      const { data, error } = await supabaseAdmin
        .from('cart_items')
        .insert({ user_id: req.user.id, product_id, variant_id, quantity, selected: true })
        .select(CART_SELECT)
        .single()
      if (error) return res.status(400).json({ error: error.message })
      result = data
    }

    res.json({ item: result })
  } catch (err) {
    res.status(500).json({ error: 'Failed to update cart' })
  }
})

// PATCH /api/cart/select/all - set selected for all items in one call
router.patch('/select/all', async (req, res) => {
  try {
    const { selected } = req.body
    if (typeof selected !== 'boolean') {
      return res.status(400).json({ error: 'selected must be a boolean' })
    }

    const { error } = await supabaseAdmin
      .from('cart_items')
      .update({ selected })
      .eq('user_id', req.user.id)

    if (error) return res.status(400).json({ error: error.message })
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: 'Failed to update cart selection' })
  }
})

// PATCH /api/cart/:id - update quantity and/or selected
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { quantity, selected } = req.body
    const updates = {}
    if (quantity !== undefined) {
      if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({ error: 'quantity must be a positive integer' })
      }
      updates.quantity = quantity
    }
    if (selected !== undefined) updates.selected = selected

    const { data, error } = await supabaseAdmin
      .from('cart_items')
      .update(updates)
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select(CART_SELECT)
      .single()

    if (error) return res.status(400).json({ error: error.message })
    res.json({ item: data })
  } catch (err) {
    res.status(500).json({ error: 'Failed to update cart item' })
  }
})

// DELETE /api/cart/selected/all - remove all selected items (must precede /:id match only for DELETE paths; two-segment path is safe)
router.delete('/selected/all', async (req, res) => {
  try {
    const { data: selected, error: findErr } = await supabaseAdmin
      .from('cart_items')
      .select('id')
      .eq('user_id', req.user.id)
      .eq('selected', true)

    if (findErr) return res.status(400).json({ error: findErr.message })

    const ids = (selected || []).map((s) => s.id)
    if (ids.length > 0) {
      const { error } = await supabaseAdmin
        .from('cart_items')
        .delete()
        .in('id', ids)
        .eq('user_id', req.user.id)
      if (error) return res.status(400).json({ error: error.message })
    }

    res.json({ ids })
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove selected items' })
  }
})

// DELETE /api/cart/:id - remove a single item
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { error } = await supabaseAdmin
      .from('cart_items')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id)

    if (error) return res.status(400).json({ error: error.message })
    res.json({ id })
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove cart item' })
  }
})

export default router