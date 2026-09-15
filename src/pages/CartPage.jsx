import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { formatRupiah } from '../lib/utils'
import { api } from '../utils/api'
import { getProducts } from '../lib/supabase'
import { loadSnapScript } from '../utils/midtrans'
import SectionHeader from '../components/SectionHeader'
import ProductRow from '../components/ProductRow'
import ProductCard, { ProductCardSkeleton } from '../components/ProductCard'
import toast from 'react-hot-toast'

const REC_CARD_WIDTH = 'w-[160px] sm:w-[200px] lg:w-[224px] flex-shrink-0 snap-start'

function QtyStepper({ quantity, onDecrement, onIncrement }) {
  return (
    <div className="flex items-center rounded-lg border border-border overflow-hidden">
      <button
        type="button"
        aria-label="Kurangi jumlah"
        onClick={onDecrement}
        disabled={quantity <= 1}
        className="w-8 h-8 flex items-center justify-center hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <span className="material-symbols-outlined text-base">remove</span>
      </button>
      <span className="w-9 text-center text-sm font-semibold tabular-nums">{quantity}</span>
      <button
        type="button"
        aria-label="Tambah jumlah"
        onClick={onIncrement}
        className="w-8 h-8 flex items-center justify-center hover:bg-muted transition-colors"
      >
        <span className="material-symbols-outlined text-base">add</span>
      </button>
    </div>
  )
}

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
  const [confirm, setConfirm] = useState(null) // { type: 'selected' } | { type: 'item', id }

  // Rekomendasi "Produk Lainnya" ala halaman cart Tokopedia
  const [recs, setRecs] = useState([])
  const [recsLoading, setRecsLoading] = useState(true)
  useEffect(() => {
    let active = true
    getProducts(3, 8)
      .then((res) => {
        if (active) {
          setRecs(res.data)
          setRecsLoading(false)
        }
      })
      .catch(() => {
        if (active) setRecsLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

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

      window.snap.pay(data.token, {
        onSuccess: async function (result) {
          toast.success('Pembayaran berhasil!')
          console.log('Midtrans success:', result)
          try {
            await api.finishPayment(data.order_id)
            toast.success('Pesanan disimpan ke riwayat')
            navigate(`/payment/success?order_id=${encodeURIComponent(data.order_id)}&status=success`)
          } catch (e) {
            console.warn('finishPayment after onSuccess failed:', e)
            navigate(`/payment/success?order_id=${encodeURIComponent(data.order_id)}&status=success`)
          }
        },
        onPending: function (result) {
          toast('Menunggu pembayaran Anda...', { icon: '⏳' })
          navigate(`/payment/success?order_id=${encodeURIComponent(data.order_id)}&status=pending`)
        },
        onError: function (result) {
          toast.error('Pembayaran gagal!')
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

  const handleConfirmDelete = async () => {
    if (!confirm) return
    try {
      if (confirm.type === 'selected') {
        const n = selectedCount
        await removeSelected()
        toast.success(`${n} produk dihapus dari keranjang`)
      } else {
        await removeItem(confirm.id)
        toast.success('Produk dihapus dari keranjang')
      }
    } catch (err) {
      toast.error(err?.message || 'Gagal menghapus produk')
    } finally {
      setConfirm(null)
    }
  }

  if (!user) {
    return (
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 md:px-6 pt-24 pb-16">
        <div className="flex flex-col items-center text-center py-20">
          <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-6xl text-muted-foreground/60">shopping_cart</span>
          </div>
          <h1 className="text-xl font-bold mb-2">Keranjang belanjamu menunggu</h1>
          <p className="text-muted-foreground text-sm mb-6">Silakan login untuk melihat isi keranjang belanjamu.</p>
          <div className="flex items-center gap-3">
            <Button asChild className="rounded-full px-6 bg-primary hover:bg-primary/90">
              <Link to="/login">Masuk</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full px-6 border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              <Link to="/register">Daftar</Link>
            </Button>
          </div>
        </div>
      </main>
    )
  }

  if (loading && items.length === 0) {
    return (
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 md:px-6 pt-24 pb-16">
        <h1 className="text-xl font-bold mb-6">Keranjang</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card p-4 md:p-6 rounded-xl border border-border animate-pulse flex gap-4 items-center">
              <div className="w-5 h-5 rounded bg-muted shrink-0" />
              <div className="w-16 h-16 md:w-20 md:h-20 bg-muted rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-2/3" />
                <div className="h-3 bg-muted rounded w-1/4" />
              </div>
              <div className="h-8 w-28 bg-muted rounded-lg hidden md:block" />
            </div>
          ))}
        </div>
      </main>
    )
  }

  return (
    <main className="flex-grow w-full max-w-7xl mx-auto px-4 md:px-6 pt-24 pb-28 lg:pb-16">
      <h1 className="text-xl font-bold mb-6">Keranjang</h1>

      {items.length === 0 ? (
        <div className="flex flex-col items-center text-center py-16">
          <div className="w-40 h-40 rounded-full bg-muted flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-7xl text-muted-foreground/50">remove_shopping_cart</span>
          </div>
          <h2 className="text-xl font-bold mb-2">Yah, keranjang belanjamu kosong</h2>
          <p className="text-muted-foreground text-sm mb-6">Coba luangkan waktu untuk mencari barang yang kamu inginkan.</p>
          <Button asChild variant="outline" className="rounded-full px-6 border-primary text-primary hover:bg-primary hover:text-primary-foreground">
            <Link to="/">Belanja Dulu, Yuk</Link>
          </Button>
        </div>
      ) : (
        <div className="grid checkout-grid gap-6 items-start">
          {/* Kolom kiri: daftar produk */}
          <div className="space-y-4 min-w-0">
            {/* Bar aksi pilih semua (ala Tokopedia) */}
            <div className="bg-card rounded-xl border border-border shadow-sm px-4 md:px-6 py-3 flex items-center justify-between">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <Checkbox checked={allSelected} onCheckedChange={toggleSelectAll} aria-label="Pilih semua produk" className="w-5 h-5" />
                <span className="text-sm font-semibold">Pilih semua produk</span>
                <span className="text-xs text-muted-foreground">({items.length} produk)</span>
              </label>
              <Button
                variant="ghost"
                size="icon"
                title="Hapus produk terpilih"
                disabled={selectedCount === 0}
                onClick={() => setConfirm({ type: 'selected' })}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 disabled:opacity-40"
              >
                <span className="material-symbols-outlined">delete</span>
              </Button>
            </div>

            {/* Kartu toko (toko tunggal ala Tokopedia) */}
            <section className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-4 md:px-6 py-4 border-b border-border/70">
                <Checkbox checked={allSelected} onCheckedChange={toggleSelectAll} aria-label="Pilih semua produk toko" className="w-5 h-5" />
                <span className="material-symbols-outlined text-primary text-xl">storefront</span>
                <div className="flex flex-col leading-tight">
                  <span className="font-bold text-[15px] text-foreground">Tokorakyat.id</span>
                  <span className="text-xs text-muted-foreground">Jakarta Pusat</span>
                </div>
              </div>

              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 md:gap-4 px-4 md:px-6 py-4 border-t first:border-t-0 border-border/60"
                >
                  <Checkbox
                    checked={item.selected}
                    onCheckedChange={() => toggleSelect(item.id)}
                    aria-label={`Pilih ${item.name}`}
                    className="mt-1 shrink-0 w-5 h-5"
                  />
                  <Link to={`/product/${item.productId}`} className="shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 md:w-20 md:h-20 rounded-xl border border-border object-cover bg-muted"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/product/${item.productId}`}
                      className="text-sm md:text-[15px] font-medium text-foreground line-clamp-2 leading-snug hover:text-primary transition-colors"
                    >
                      {item.name}
                    </Link>
                    {item.variant && (
                      <span className="inline-block mt-1.5 text-xs bg-muted text-muted-foreground rounded-md px-2 py-0.5">
                        Varian: {item.variant}
                      </span>
                    )}
                    {/* Mobile: stepper + hapus + subtotal */}
                    <div className="flex md:hidden mt-3 items-center justify-between gap-2">
                      <QtyStepper quantity={item.quantity} onDecrement={() => decrement(item.id)} onIncrement={() => increment(item.id)} />
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          title="Hapus produk"
                          onClick={() => setConfirm({ type: 'item', id: item.id })}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                        <span className="font-bold text-sm text-foreground">{formatRupiah(item.price * item.quantity)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Desktop: kolom harga | qty | subtotal | hapus ala Tokopedia */}
                  <div className="hidden md:flex items-center gap-5 shrink-0">
                    <div className="w-28 text-right">
                      <span className="font-semibold text-[15px] text-foreground">{formatRupiah(item.price)}</span>
                    </div>
                    <QtyStepper quantity={item.quantity} onDecrement={() => decrement(item.id)} onIncrement={() => increment(item.id)} />
                    <div className="w-36 text-right">
                      <span className="font-bold text-primary">{formatRupiah(item.price * item.quantity)}</span>
                    </div>
                    <button
                      type="button"
                      title="Hapus produk"
                      onClick={() => setConfirm({ type: 'item', id: item.id })}
                      className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </section>
          </div>

          {/* Kolom kanan: Ringkasan Belanja ala Tokopedia */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 bg-card rounded-xl border border-border shadow-sm">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="font-bold text-lg">Ringkasan Belanja</h2>
              </div>
              <div className="px-6 py-4 space-y-3">
                <div className="flex justify-between gap-3 text-sm">
                  <span className="text-muted-foreground">Total harga produk ({selectedCount} barang)</span>
                  <span className="font-semibold text-foreground whitespace-nowrap">{formatRupiah(selectedSubtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total ongkir</span>
                  <span className="font-bold text-secondary">GRATIS</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Pajak (2%)</span>
                  <span className="font-semibold text-foreground">{formatRupiah(tax)}</span>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-border flex items-center justify-between gap-3">
                <span className="font-semibold">Total belanja</span>
                <span className="text-xl font-bold text-primary">{formatRupiah(total)}</span>
              </div>
              <div className="px-6 pb-6">
                <Button
                  onClick={handleCheckout}
                  disabled={paying || selectedCount === 0}
                  className="w-full h-11 rounded-full bg-primary hover:bg-primary/90 font-bold text-base shadow-md disabled:opacity-60"
                >
                  {paying ? <span className="material-symbols-outlined animate-spin">progress_activity</span> : `Checkout (${selectedCount})`}
                </Button>
                {selectedCount === 0 && <p className="text-xs text-center text-amber-600 mt-2">Pilih produk terlebih dahulu</p>}
                <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mt-4">
                  <span className="material-symbols-outlined text-sm text-secondary">verified_user</span>
                  Transaksi aman via Midtrans
                </p>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Bar checkout sticky mobile ala Tokopedia */}
      {items.length > 0 && (
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-card border-t border-border px-4 py-3 flex items-center justify-between gap-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)]">
          <div className="min-w-0">
            <p className="text-[11px] text-muted-foreground leading-none mb-1">Total belanja ({selectedCount} produk)</p>
            <p className="font-bold text-primary leading-none">{formatRupiah(total)}</p>
          </div>
          <Button
            onClick={handleCheckout}
            disabled={paying || selectedCount === 0}
            className="rounded-full px-6 h-10 bg-primary hover:bg-primary/90 font-bold shrink-0"
          >
            {paying ? <span className="material-symbols-outlined animate-spin">progress_activity</span> : `Checkout (${selectedCount})`}
          </Button>
        </div>
      )}

      {/* Produk Lainnya (rekomendasi ala Tokopedia) */}
      {recs.length > 0 && (
        <section className="mt-12">
          <SectionHeader title="Produk Lainnya" actionLabel="" />
          <ProductRow>
            {recsLoading
              ? Array.from({ length: 6 }).map((_, idx) => <ProductCardSkeleton key={idx} className={REC_CARD_WIDTH} />)
              : recs.map((product) => <ProductCard key={product.id} product={product} className={REC_CARD_WIDTH} />)}
          </ProductRow>
        </section>
      )}

      {/* Dialog konfirmasi hapus */}
      <Dialog open={!!confirm} onOpenChange={(open) => !open && setConfirm(null)}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle>Hapus produk?</DialogTitle>
            <DialogDescription>
              {confirm?.type === 'selected'
                ? `${selectedCount} produk terpilih akan dihapus dari keranjang belanjamu.`
                : 'Produk ini akan dihapus dari keranjang belanjamu.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirm(null)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
