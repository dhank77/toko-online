import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { formatRupiah } from '../lib/utils'
import { api } from '../utils/api'
import { loadSnapScript } from '../utils/midtrans'
import toast from 'react-hot-toast'

export default function CartPage() {
  const {
    items,
    loading,
    increment,
    decrement,
    removeItem,
    removeSelected,
    toggleSelect,
    toggleSelectAll,
    selectedCount,
    selectedItems,
    selectedSubtotal,
    tax,
    total,
  } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [paying, setPaying] = useState(false)

  const allSelected = items.length > 0 && items.every((item) => item.selected)

  const handleCheckout = async () => {
    if (!user) {
      toast.error('Silakan login terlebih dahulu')
      navigate('/login')
      return
    }
    if (selectedCount === 0) {
      toast.error('Pilih minimal 1 item untuk checkout')
      return
    }
    if (total < 1000) {
      toast.error('Total minimal Rp 1.000 untuk pembayaran Midtrans')
      return
    }

    setPaying(true)
    try {
      // Pastikan Snap ter-load (fallback jika script di index.html belum siap)
      try {
        await loadSnapScript()
      } catch (e) {
        console.warn('Snap preload failed, retry via script tag in index.html:', e)
      }

      if (typeof window === 'undefined' || !window.snap) {
        throw new Error('Midtrans Snap belum siap. Refresh halaman dan coba lagi.')
      }

      // Payload sesuai docs/midtrans_integration_guide.md
      // Midtrans requires gross_amount == sum(item_details). Pajak 2% harus jadi line item terpisah.
      const itemDetails = selectedItems.map((it) => ({
        id: String(it.id).slice(0, 50),
        price: Math.round(Number(it.price)),
        quantity: Number(it.quantity),
        name: String(it.name).slice(0, 50),
      }))
      // Tambahkan pajak sebagai item agar sum == gross_amount (fix: transaction_details.gross_amount is not equal to sum of item_details)
      const taxRounded = Math.round(tax)
      if (taxRounded > 0) {
        itemDetails.push({
          id: 'TAX-2PCT',
          price: taxRounded,
          quantity: 1,
          name: 'Pajak 2%',
        })
      }

      const payload = {
        items: itemDetails,
        gross_amount: Math.round(total),
        customerDetails: {
          firstName: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Pelanggan',
          email: user?.email,
          phone: user?.phone || '081234567890',
        },
      }

      const data = await api.createTransaction(payload)

      if (!data?.token) {
        throw new Error(data?.error || 'Gagal mendapatkan token Midtrans')
      }

      // Redirect ke Midtrans Snap - popup
      window.snap.pay(data.token, {
        onSuccess: async function (result) {
          toast.success('Pembayaran berhasil!')
          console.log('Midtrans success:', result)
          try {
            await api.finishPayment(data.order_id)
            toast.success('Pesanan disimpan ke riwayat')
            // Bersihkan cart lokal: reload dari server (sudah dihapus di backend)
            // Cart akan kosong untuk item yang dibeli; navigasi ke halaman sukses
            navigate(`/payment/success?order_id=${encodeURIComponent(data.order_id)}&status=success`)
          } catch (e) {
            console.warn('finishPayment after onSuccess failed:', e)
            navigate(`/payment/success?order_id=${encodeURIComponent(data.order_id)}&status=success`)
          }
        },
        onPending: function (result) {
          toast('Menunggu pembayaran Anda...', { icon: '⏳' })
          console.log('Midtrans pending:', result)
          navigate(`/payment/success?order_id=${encodeURIComponent(data.order_id)}&status=pending`)
        },
        onError: function (result) {
          toast.error('Pembayaran gagal!')
          console.log('Midtrans error:', result)
          navigate(`/payment/success?order_id=${encodeURIComponent(data.order_id)}&status=failed`)
        },
        onClose: function () {
          toast('Anda menutup popup pembayaran tanpa menyelesaikan transaksi', { icon: 'ℹ️' })
        },
      })
    } catch (err) {
      console.error('Checkout error:', err)
      toast.error(err?.message || 'Gagal memproses pembayaran')
    } finally {
      setPaying(false)
    }
  }

  if (!user) {
    return (
      <main className="flex-grow w-full max-w-7xl mx-auto px-6 py-16">
        <h1 className="text-2xl font-bold mb-8">Keranjang Belanja</h1>
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">Silakan login untuk melihat keranjang belanja Anda.</p>
          <Link to="/login" className="text-primary font-medium hover:underline">
            Masuk
          </Link>
        </div>
      </main>
    )
  }

  if (loading && items.length === 0) {
    return (
      <main className="flex-grow w-full max-w-7xl mx-auto px-6 py-16">
        <h1 className="text-2xl font-bold mb-8">Keranjang Belanja</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-background p-6 rounded-xl border border-border animate-pulse flex gap-4 items-center">
              <div className="w-24 h-24 bg-muted rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-1/3" />
                <div className="h-4 bg-muted rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </main>
    )
  }

  return (
    <main className="flex-grow w-full max-w-7xl mx-auto px-6 py-16">
        <h1 className="text-2xl font-bold mb-8">Keranjang Belanja</h1>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">Keranjang Anda kosong.</p>
          <Link to="/" className="text-primary font-medium hover:underline">
            Lanjut Belanja
          </Link>
        </div>
      ) : (
        <div className="grid checkout-grid gap-8 items-start">
          {/* Left: Cart Items */}
          <div className="space-y-6">
            {/* Select All Header */}
            <div className="bg-background p-4 rounded-xl border border-border shadow-sm flex items-center justify-between">
              <label className="flex items-center gap-3 cursor-pointer group">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={toggleSelectAll}
                />
                <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                  Pilih Semua ({items.length} item)
                </span>
              </label>
              <Button
                variant="ghost"
                className="text-destructive font-medium"
                onClick={removeSelected}
                disabled={selectedCount === 0}
              >
                 Hapus yang Dipilih
              </Button>
            </div>

            {/* Items List */}
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="item-row bg-background p-6 rounded-xl border border-transparent hover:border-border transition-all flex flex-col sm:flex-row gap-4 items-start sm:items-center"
                >
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <Checkbox
                      checked={item.selected}
                      onCheckedChange={() => toggleSelect(item.id)}
                    />
                    <div className="w-24 h-24 rounded-lg bg-muted overflow-hidden shrink-0">
                      {item.image ? (
                        <img
                          className="w-full h-full object-cover"
                          data-alt={item.name}
                          src={item.image}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <span className="material-symbols-outlined">image</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-grow space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-foreground text-lg">{item.name}</h3>
                        {item.variant && (
                          <p className="text-sm text-muted-foreground">{item.variant}</p>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="delete-btn opacity-0 text-muted-foreground hover:text-destructive transition-all"
                      >
                        <span className="material-symbols-outlined" data-icon="delete">
                          delete
                        </span>
                      </button>
                    </div>
                    <div className="flex justify-between items-end mt-2">
                      <div className="text-primary font-semibold text-xl">{formatRupiah(item.price)}</div>
                      <div className="flex items-center bg-muted rounded-lg p-1 border border-border">
                        <button
                          onClick={() => decrement(item.id)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-background rounded transition-colors"
                        >
                          <span className="material-symbols-outlined text-lg" data-icon="remove">
                            remove
                          </span>
                        </button>
                        <span className="w-10 text-center font-medium quantity">{item.quantity}</span>
                        <button
                          onClick={() => increment(item.id)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-background rounded transition-colors"
                        >
                          <span className="material-symbols-outlined text-lg" data-icon="add">
                            add
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Sidebar: Order Summary */}
          <aside className="space-y-6 sticky top-24">
            <div className="bg-background p-8 rounded-xl border border-border shadow-sm">
              <h2 className="text-xl font-semibold mb-6">Ringkasan Pesanan</h2>
              <div className="space-y-4 pb-6 border-b border-border">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Subtotal ({selectedCount} items)</span>
                  <span className="text-foreground font-semibold">
                    {formatRupiah(selectedSubtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Pengiriman</span>
                  <span className="text-secondary font-semibold">GRATIS</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Estimasi pajak</span>
                  <span className="text-foreground font-semibold">{formatRupiah(tax)}</span>
                </div>
              </div>
              <div className="py-6 space-y-4">
                <label className="text-sm font-medium text-muted-foreground block">Kode Promo</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Masukkan kode"
                    type="text"
                    className="flex-grow"
                  />
                  <Button variant="outline" className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                    Terapkan
                  </Button>
                </div>
              </div>
              <div className="flex justify-between py-6">
                <span className="text-xl font-semibold">Total</span>
                <span className="text-2xl font-bold text-primary">{formatRupiah(total)}</span>
              </div>
              <Button
                onClick={handleCheckout}
                disabled={paying || selectedCount === 0}
                className="w-full py-4 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-60"
              >
                {paying ? (
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                ) : null}
                <span>{paying ? 'Memproses...' : 'Lanjut ke Pembayaran'}</span>
                {!paying && (
                  <span className="material-symbols-outlined" data-icon="arrow_forward">
                    arrow_forward
                  </span>
                )}
              </Button>
              {selectedCount === 0 && (
                <p className="text-xs text-amber-600 text-center mt-2">Pilih item terlebih dahulu</p>
              )}
              {/* Payment Methods */}
              <div className="mt-8">
                <p className="text-xs text-muted-foreground text-center uppercase tracking-wider mb-4">
                  Metode Pembayaran Aman
                </p>
                <div className="flex justify-center items-center gap-6 opacity-60 hover:opacity-100 transition-all duration-300">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                      <span className="material-symbols-outlined text-2xl text-secondary" data-icon="account_balance_wallet">
                        account_balance_wallet
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground">GOPAY</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                      <span className="material-symbols-outlined text-2xl text-primary" data-icon="payments">
                        payments
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground">OVO</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                      <span className="material-symbols-outlined text-2xl text-foreground" data-icon="qr_code_2">
                        qr_code_2
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground">QRIS</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-muted/50 p-4 rounded-xl flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary" data-icon="verified_user">
                verified_user
              </span>
              <p className="text-sm text-muted-foreground">
                Belanja dengan percaya diri dengan{' '}
                <span className="text-primary font-semibold">Jaminan Pembelian Aman</span>. Pengembalian
                mudah dalam 30 hari.
              </p>
            </div>
          </aside>
        </div>
      )}
    </main>
  )
}
