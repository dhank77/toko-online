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

// PUT /api/cart - upsert an item (add to cart / change quantity)
// body: { product_id, variant_id?, quantity }
router.put('/', async (req, res) => {
  try {
    const { product_id, variant_id = null, quantity = 1 } = req.body
    if (!product_id) return res.status(400).json({ error: 'product_id is required' })

    const { data: existing, error: findErr } = await supabaseAdmin
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', req.user.id)
      .eq('product_id', product_id)
      .eq('variant_id', variant_id)
      .maybeSingle()

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

    const cart = await fetchCart(req.user.id)
    res.json({ item: result, cart })
  } catch (err) {
    res.status(500).json({ error: 'Failed to update cart' })
  }
})

// PATCH /api/cart/:id - update quantity and/or selected
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { quantity, selected } = req.body
    const updates = {}
    if (quantity !== undefined) updates.quantity = quantity
    if (selected !== undefined) updates.selected = selected

    const { data, error } = await supabaseAdmin
      .from('cart_items')
      .update(updates)
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single()

    if (error) return res.status(400).json({ error: error.message })
    const cart = await fetchCart(req.user.id)
    res.json({ item: data, cart })
  } catch (err) {
    res.status(500).json({ error: 'Failed to update cart item' })
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
    const cart = await fetchCart(req.user.id)
    res.json({ cart })
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove cart item' })
  }
})

// DELETE /api/cart/selected - remove all selected items
router.delete('/selected/all', async (req, res) => {
  try {
    const { data: selected, error: findErr } = await supabaseAdmin
      .from('cart_items')
      .select('id')
      .eq('user_id', req.user.id)
      .eq('selected', true)

    if (findErr) return res.status(400).json({ error: findErr.message })

    if (selected && selected.length > 0) {
      const ids = selected.map((s) => s.id)
      const { error } = await supabaseAdmin
        .from('cart_items')
        .delete()
        .in('id', ids)
        .eq('user_id', req.user.id)
      if (error) return res.status(400).json({ error: error.message })
    }

    const cart = await fetchCart(req.user.id)
    res.json({ cart })
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove selected items' })
  }
})

export default router
