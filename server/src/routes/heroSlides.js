import { Router } from 'express'
import { supabaseAdmin } from '../config/supabase.js'
import { authenticate } from '../middleware/auth.js'
import { requireAdmin } from '../middleware/admin.js'

const router = Router()

// Public: read active hero slides (ordered)
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('hero_slides')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')

    if (error) return res.status(400).json({ error: error.message })
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil hero slides' })
  }
})

// Admin: read all hero slides (including inactive)
router.get('/admin', authenticate, requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('hero_slides')
      .select('*')
      .order('sort_order')

    if (error) return res.status(400).json({ error: error.message })
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil hero slides' })
  }
})

// Admin: create hero slide
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const {
      img, badge, title, description,
      cta_label, cta_href,
      secondary_cta_label, secondary_cta_href,
      sort_order, is_active
    } = req.body

    if (!img || !title) {
      return res.status(400).json({ error: 'img dan title wajib diisi' })
    }

    const { data, error } = await supabaseAdmin
      .from('hero_slides')
      .insert([{
        img,
        badge: badge || null,
        title,
        description: description || null,
        cta_label: cta_label || null,
        cta_href: cta_href || null,
        secondary_cta_label: secondary_cta_label || null,
        secondary_cta_href: secondary_cta_href || null,
        sort_order: sort_order ?? 0,
        is_active: is_active ?? true,
      }])
      .select()
      .single()

    if (error) return res.status(400).json({ error: error.message })
    res.status(201).json(data)
  } catch (err) {
    res.status(500).json({ error: 'Gagal membuat hero slide' })
  }
})

// Admin: update hero slide
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body

    const { data, error } = await supabaseAdmin
      .from('hero_slides')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) return res.status(400).json({ error: error.message })
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Gagal memperbarui hero slide' })
  }
})

// Admin: delete hero slide
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { error } = await supabaseAdmin
      .from('hero_slides')
      .delete()
      .eq('id', id)

    if (error) return res.status(400).json({ error: error.message })
    res.status(204).send()
  } catch (err) {
    res.status(500).json({ error: 'Gagal menghapus hero slide' })
  }
})

export default router
