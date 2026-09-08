import { Router } from 'express'
import { supabaseAdmin } from '../config/supabase.js'
import { authenticate } from '../middleware/auth.js'
import midtransClient from 'midtrans-client'

const router = Router()

function getSnap() {
  return new midtransClient.Snap({
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY,
  })
}

function getCoreApi() {
  return new midtransClient.CoreApi({
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY,
  })
}

// POST /api/payment/create-transaction - create Snap token (authenticated)
router.post('/create-transaction', authenticate, async (req, res) => {
  try {
    const userId = req.user.id
    const { items: bodyItems, customerDetails, gross_amount: bodyGross } = req.body || {}

    let items = []
    let grossAmount = 0

    if (Array.isArray(bodyItems) && bodyItems.length > 0) {
      items = bodyItems.map((it) => ({
        id: String(it.id || it.productId || it.product_id || `ITEM-${Date.now()}`).slice(0, 50),
        price: Math.round(Number(it.price)),
        quantity: Number(it.quantity) || 1,
        name: String(it.name || 'Produk').slice(0, 50),
      }))
      grossAmount = items.reduce((sum, it) => sum + it.price * it.quantity, 0)
    } else {
      // Fallback: ambil dari cart selected milik user
      const { data: cartItems, error: cartErr } = await supabaseAdmin
        .from('cart_items')
        .select(`
          id, quantity,
          products!product_id(name, price),
          product_variants!variant_id(name, price_adjustment)
        `)
        .eq('user_id', userId)
        .eq('selected', true)
      if (cartErr) return res.status(400).json({ error: 'Gagal mengambil keranjang: ' + cartErr.message })
      if (!cartItems || cartItems.length === 0) return res.status(400).json({ error: 'Keranjang kosong atau tidak ada item terpilih' })
      items = cartItems.map((ci) => {
        const basePrice = Number(ci.products?.price || 0) + Number(ci.product_variants?.price_adjustment || 0)
        return {
          id: String(ci.id).slice(0, 50),
          price: Math.round(basePrice),
          quantity: ci.quantity,
          name: String(ci.products?.name || 'Produk').slice(0, 50),
        }
      })
      grossAmount = items.reduce((sum, it) => sum + it.price * it.quantity, 0)
    }

    if (items.length === 0) return res.status(400).json({ error: 'Tidak ada item untuk dibayar' })
    if (grossAmount < 1) return res.status(400).json({ error: 'Gross amount tidak valid' })

    // Midtrans validation: gross_amount harus == sum(item_details.price * quantity)
    // Frontend mengirim total = subtotal + pajak 2%, namun item_details hanya berisi produk
    // Jika bodyGross > sum items, tambahkan line item pajak agar sum = gross_amount
    if (bodyGross && Number(bodyGross) > 0) {
      const requestedGross = Math.round(Number(bodyGross))
      if (requestedGross !== grossAmount) {
        const diff = requestedGross - grossAmount
        if (diff > 0) {
          items.push({
            id: 'TAX',
            price: diff,
            quantity: 1,
            name: 'Pajak 2%',
          })
          grossAmount = requestedGross
        } else if (diff < 0) {
          // Frontend gross lebih kecil (mungkin rounding) -> sesuaikan gross ke sum items
          // Jangan paksa, tetap pakai sum items agar valid
          console.warn(`gross_amount mismatch: requested ${requestedGross} vs sum ${grossAmount}, using sum`)
        }
      }
    }
    // Safety: recalc untuk pastikan match
    const recalc = items.reduce((s, it) => s + it.price * it.quantity, 0)
    if (recalc !== grossAmount) {
      console.warn(`Recalc mismatch: recalc ${recalc} vs grossAmount ${grossAmount}, fixing`)
      grossAmount = recalc
    }

    const orderId = `ORDER-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    // Ambil profile untuk customer details
    let customer = customerDetails || {}
    if (!customer.email || !customer.firstName) {
      try {
        const { data: profile } = await supabaseAdmin.from('profiles').select('email, full_name').eq('id', userId).single()
        const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(userId)
        customer = {
          firstName: customer.firstName || profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Pelanggan',
          email: customer.email || profile?.email || user?.email || `${userId}@example.com`,
          phone: customer.phone || user?.phone || '081234567890',
        }
      } catch {
        customer = {
          firstName: customer.firstName || 'Pelanggan',
          email: customer.email || `${userId}@example.com`,
          phone: customer.phone || '081234567890',
        }
      }
    }

    // Midtrans butuh minimal email dan first_name
    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: grossAmount,
      },
      item_details: items,
      customer_details: {
        first_name: String(customer.firstName || customer.first_name || 'Pelanggan').slice(0, 50),
        email: String(customer.email || `${userId}@example.com`),
        phone: String(customer.phone || '081234567890'),
      },
      callbacks: {
        finish: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/cart?status=success&order_id=${orderId}`,
      },
    }

    const snap = getSnap()
    const transaction = await snap.createTransaction(parameter)
    const snapToken = transaction.token
    const redirectUrl = transaction.redirect_url

    // Simpan ke Supabase (toleran jika tabel belum ada)
    try {
      const { error: dbError } = await supabaseAdmin.from('transactions').insert([
        {
          order_id: orderId,
          user_id: userId,
          gross_amount: grossAmount,
          status: 'pending',
          raw_response: { snapToken, items, customer },
        },
      ])
      if (dbError) {
        // PGRST205 = table not found
        if (dbError.code === 'PGRST205') {
          console.warn('transactions table missing - run supabase/migrations/20260908000000_transactions.sql in SQL Editor')
        } else {
          console.error('Supabase insert transactions error:', dbError)
        }
      }
    } catch (dbErr) {
      console.error('DB insert exception:', dbErr)
    }

    res.json({
      success: true,
      token: snapToken,
      redirect_url: redirectUrl,
      order_id: orderId,
      gross_amount: grossAmount,
    })
  } catch (err) {
    console.error('Error creating Midtrans transaction:', err)
    const msg = err?.message || 'Gagal membuat transaksi'
    // Midtrans error sering punya ApiResponse
    if (err?.ApiResponse) console.error('Midtrans ApiResponse:', err.ApiResponse)
    res.status(500).json({ success: false, error: msg })
  }
})

// POST /api/payment/notification - webhook dari Midtrans (tanpa auth)
router.post('/notification', async (req, res) => {
  try {
    const notificationJson = req.body
    if (!notificationJson?.order_id) return res.status(400).json({ error: 'order_id missing' })

    const core = getCoreApi()
    let statusResponse
    try {
      statusResponse = await core.transaction.notification(notificationJson)
    } catch (e) {
      // Fallback ke status check jika notification gagal
      statusResponse = await core.transaction.status(notificationJson.order_id)
    }

    const orderId = statusResponse.order_id
    const transactionStatus = statusResponse.transaction_status
    const fraudStatus = statusResponse.fraud_status
    const paymentType = statusResponse.payment_type

    let newStatus = 'pending'
    if (transactionStatus === 'capture') {
      newStatus = fraudStatus === 'challenge' ? 'challenge' : fraudStatus === 'accept' ? 'success' : 'pending'
    } else if (transactionStatus === 'settlement') {
      newStatus = 'success'
    } else if (['cancel', 'deny', 'expire'].includes(transactionStatus)) {
      newStatus = 'failed'
    } else if (transactionStatus === 'pending') {
      newStatus = 'pending'
    }

    let updatedTx = null
    try {
      const { data, error: updErr } = await supabaseAdmin
        .from('transactions')
        .update({
          status: newStatus,
          payment_type: paymentType,
          transaction_time: statusResponse.transaction_time || new Date().toISOString(),
          raw_response: statusResponse,
        })
        .eq('order_id', orderId)
        .select()
        .single()
      if (updErr && updErr.code !== 'PGRST205') {
        console.error('Failed to update transaction:', updErr)
      } else {
        updatedTx = data
      }
      if (!updatedTx) {
        const { data: fetched } = await supabaseAdmin.from('transactions').select('*').eq('order_id', orderId).single()
        updatedTx = fetched
      }
    } catch (e) {
      console.error('Update transaction exception:', e)
    }

    // Jika success, buat order & bersihkan keranjang otomatis (webhook)
    if (newStatus === 'success' && updatedTx) {
      await finalizeOrderForTransaction(updatedTx)
    }

    res.json({ status: 'OK', order_id: orderId, newStatus })
  } catch (err) {
    console.error('Notification handler error:', err)
    res.status(500).json({ success: false, error: err.message })
  }
})

// Helper: buat order dari transaction sukses + bersihkan keranjang
async function finalizeOrderForTransaction(txRow) {
  try {
    // cek apakah order sudah ada
    const { data: existing } = await supabaseAdmin.from('orders').select('id').eq('order_id', txRow.order_id).single().catch(() => ({ data: null }))
    // supabase single throws if not found, so use maybeSingle
    const { data: found } = await supabaseAdmin.from('orders').select('id').eq('order_id', txRow.order_id).maybeSingle()
    if (found) return found

    const items = txRow.raw_response?.items || txRow.raw_response?.item_details || []
    const { error: insErr } = await supabaseAdmin.from('orders').insert([{
      order_id: txRow.order_id,
      customer_id: txRow.user_id,
      gross_amount: txRow.gross_amount,
      status: txRow.status === 'success' ? 'paid' : txRow.status,
      payment_type: txRow.payment_type,
      items: items,
      raw_response: txRow.raw_response,
      transaction_time: txRow.transaction_time,
    }])
    if (insErr && insErr.code !== 'PGRST205' && !insErr.message.includes('duplicate')) {
      console.error('Failed to create order from transaction:', insErr)
    }
    // Bersihkan keranjang yang sudah dibeli: hapus item selected milik user
    // Gunakan snapshot items untuk hapus by product_id? Simpler: hapus semua selected
    if (txRow.user_id) {
      await supabaseAdmin.from('cart_items').delete().eq('user_id', txRow.user_id).eq('selected', true)
    }
  } catch (e) {
    console.error('finalizeOrder exception:', e)
  }
}

// GET /api/payment/my-transactions - riwayat transaksi milik user
router.get('/my-transactions', authenticate, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('transactions')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
    if (error) {
      if (error.code === 'PGRST205') return res.json([])
      return res.status(400).json({ error: error.message })
    }
    res.json(data || [])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/payment/finish - frontend konfirmasi setelah snap onSuccess (verifikasi + buat order + bersihkan keranjang)
router.post('/finish', authenticate, async (req, res) => {
  try {
    const { order_id } = req.body || {}
    if (!order_id) return res.status(400).json({ error: 'order_id wajib' })

    // Verifikasi ke Midtrans
    const core = getCoreApi()
    let statusResponse
    try {
      statusResponse = await core.transaction.status(order_id)
    } catch (e) {
      return res.status(400).json({ error: 'Gagal verifikasi Midtrans: ' + (e.message || 'unknown') })
    }

    const transactionStatus = statusResponse.transaction_status
    const fraudStatus = statusResponse.fraud_status
    let newStatus = 'pending'
    if (transactionStatus === 'capture') newStatus = fraudStatus === 'challenge' ? 'challenge' : 'success'
    else if (transactionStatus === 'settlement') newStatus = 'success'
    else if (['cancel', 'deny', 'expire'].includes(transactionStatus)) newStatus = 'failed'

    // Update transactions
    const { data: tx, error: updErr } = await supabaseAdmin
      .from('transactions')
      .update({
        status: newStatus,
        payment_type: statusResponse.payment_type,
        transaction_time: statusResponse.transaction_time,
        raw_response: statusResponse,
      })
      .eq('order_id', order_id)
      .eq('user_id', req.user.id)
      .select()
      .single()

    if (updErr && updErr.code !== 'PGRST205') {
      console.error('Update tx finish error:', updErr)
    }

    // Jika sukses, buat order & bersihkan keranjang
    if (newStatus === 'success' && tx) {
      await finalizeOrderForTransaction(tx)
    } else if (newStatus === 'success') {
      // Fallback fetch tx row
      const { data: fetched } = await supabaseAdmin.from('transactions').select('*').eq('order_id', order_id).single()
      if (fetched) await finalizeOrderForTransaction(fetched)
    }

    res.json({ status: newStatus, order_id, raw: statusResponse })
  } catch (err) {
    console.error('Finish handler error:', err)
    res.status(500).json({ error: err.message })
  }
})

// GET /api/payment/status/:order_id - cek status transaksi (authenticated)
router.get('/status/:order_id', authenticate, async (req, res) => {
  try {
    const { order_id } = req.params
    const { data, error } = await supabaseAdmin.from('transactions').select('*').eq('order_id', order_id).single()
    if (error) return res.status(404).json({ error: 'Transaksi tidak ditemukan' })
    // Hanya pemilik atau admin bisa lihat
    if (data.user_id !== req.user.id) {
      const { data: prof } = await supabaseAdmin.from('profiles').select('role').eq('id', req.user.id).single()
      if (prof?.role !== 'admin') return res.status(403).json({ error: 'Forbidden' })
    }
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
