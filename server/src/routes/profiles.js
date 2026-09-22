import { Router } from 'express'
import { supabaseAdmin } from '../config/supabase.js'
import { authenticate } from '../middleware/auth.js'
import { requireAdmin } from '../middleware/admin.js'

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
    res.status(500).json({ error: 'Gagal mengambil profil' })
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
    res.status(500).json({ error: 'Gagal memperbarui profil' })
  }
})

// Ambil peta avatar dari Supabase Auth (foto Google hanya tersimpan di
// user_metadata, bukan di tabel profiles). Tanpa migrasi DB.
async function getAvatarMap() {
  const map = {}
  try {
    let page = 1
    for (;;) {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 100 })
      if (error || !data?.users?.length) break
      for (const u of data.users) {
        const url =
          u.user_metadata?.avatar_url ||
          u.user_metadata?.picture ||
          u.identities?.[0]?.identity_data?.avatar_url ||
          u.identities?.[0]?.identity_data?.picture ||
          null
        if (url) map[u.id] = url
      }
      if (data.users.length < 100) break
      page += 1
      if (page > 20) break // batas aman 2000 user
    }
  } catch {
    // abaikan — avatar opsional, halaman tetap jalan dengan inisial
  }
  return map
}

// ---- Admin: CRM Pelanggan ----

// GET /api/profiles/admin/all - daftar semua pelanggan + ringkasan order
router.get('/admin/all', authenticate, requireAdmin, async (req, res) => {
  try {
    const { data: profiles, error: profErr } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name, role, created_at, updated_at')
      .order('created_at', { ascending: false })
    if (profErr) return res.status(400).json({ error: profErr.message })

    const { data: orders } = await supabaseAdmin
      .from('orders')
      .select('customer_id, gross_amount, status, created_at')

    const avatarMap = await getAvatarMap()

    const statsByUser = {}
    for (const o of orders || []) {
      if (!o.customer_id) continue
      const s = (statsByUser[o.customer_id] ||= { totalOrders: 0, totalSpent: 0, lastOrderAt: null })
      s.totalOrders += 1
      if (!['failed', 'cancelled', 'expire', 'deny'].includes(String(o.status).toLowerCase())) {
        s.totalSpent += Number(o.gross_amount || 0)
      }
      if (!s.lastOrderAt || new Date(o.created_at) > new Date(s.lastOrderAt)) {
        s.lastOrderAt = o.created_at
      }
    }

    const merged = (profiles || []).map((p) => ({
      ...p,
      displayName: p.full_name || (p.email ? p.email.split('@')[0] : 'Pelanggan'),
      avatar_url: avatarMap[p.id] || null,
      ...(statsByUser[p.id] || { totalOrders: 0, totalSpent: 0, lastOrderAt: null }),
    }))
    res.json(merged)
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil data pelanggan' })
  }
})

// GET /api/profiles/admin/:id - detail 1 pelanggan + riwayat order
router.get('/admin/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const [{ data: profile, error: profErr }, { data: orders }] = await Promise.all([
      supabaseAdmin.from('profiles').select('id, email, full_name, role, created_at, updated_at').eq('id', id).single(),
      supabaseAdmin.from('orders').select('id, order_id, gross_amount, status, payment_type, items, created_at').eq('customer_id', id).order('created_at', { ascending: false }),
    ])
    if (profErr) return res.status(404).json({ error: 'Pelanggan tidak ditemukan' })
    let avatar_url = null
    try {
      const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(id)
      const u = authUser?.user
      avatar_url =
        u?.user_metadata?.avatar_url ||
        u?.user_metadata?.picture ||
        u?.identities?.[0]?.identity_data?.avatar_url ||
        u?.identities?.[0]?.identity_data?.picture ||
        null
    } catch {
      // abaikan
    }
    res.json({ ...(profile || {}), avatar_url, orders: orders || [] })
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil detail pelanggan' })
  }
})

// PATCH /api/profiles/admin/:id - ubah nama / role pelanggan
router.patch('/admin/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { full_name, role } = req.body || {}
    const updates = {}
    if (typeof full_name === 'string') updates.full_name = full_name.trim()
    if (role === 'admin' || role === 'customer') updates.role = role
    if (Object.keys(updates).length === 0) return res.status(400).json({ error: 'Tidak ada perubahan' })
    // Admin tidak bisa menurunkan role dirinya sendiri
    if (id === req.user.id && updates.role && updates.role !== 'admin') {
      return res.status(400).json({ error: 'Tidak bisa menurunkan role akun sendiri' })
    }
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select('id, email, full_name, role, created_at, updated_at')
      .single()
    if (error) return res.status(400).json({ error: error.message })
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Gagal memperbarui pelanggan' })
  }
})

export default router
