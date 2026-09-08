import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { api } from '../utils/api'
import { formatRupiah } from '../lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCart } from '../context/CartContext'
import toast from 'react-hot-toast'

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('order_id')
  const statusParam = searchParams.get('status')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { loadCart } = useCart() || {}

  useEffect(() => {
    if (!orderId) { setLoading(false); return }
    // Coba verifikasi finish jika masih pending
    api.getTransactionStatus(orderId).then(setData).catch(() => {
      // fallback ke my-transactions
      api.getMyTransactions().then(list => {
        const found = Array.isArray(list) ? list.find(t => t.order_id === orderId) : null
        if (found) setData(found)
        else setError('Transaksi tidak ditemukan')
      }).catch(e => setError(e.message))
    }).finally(() => setLoading(false))
  }, [orderId])

  // Jika datang dari Midtrans redirect, refresh cart agar item yang dibeli hilang
  useEffect(() => {
    if (statusParam === 'success' && orderId) {
      // trigger finish verification once
      api.finishPayment(orderId).then(() => {
        toast.success('Pembayaran berhasil diverifikasi')
        if (typeof loadCart === 'function') loadCart()
      }).catch(() => {})
    }
  }, [statusParam, orderId])

  if (!orderId) {
    return (
      <main className="max-w-3xl mx-auto px-6 py-16 pt-24 text-center">
        <span className="material-symbols-outlined text-6xl text-amber-500 mb-4">warning</span>
        <h1 className="text-2xl font-bold mb-2">Tidak ada order_id</h1>
        <p className="text-muted-foreground mb-6">Akses halaman ini dari riwayat pesanan.</p>
        <Button asChild><Link to="/orders">Lihat Pesanan</Link></Button>
      </main>
    )
  }

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto px-6 py-16 pt-24">
        <div className="bg-background p-8 rounded-xl border border-border animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/2" />
          <div className="h-4 bg-muted rounded w-1/3" />
        </div>
      </main>
    )
  }

  const status = data?.status || statusParam || 'pending'
  const isSuccess = status === 'success' || status === 'paid'
  const items = data?.items || data?.raw_response?.items || []

  return (
    <main className="max-w-3xl mx-auto px-6 py-16 pt-24">
      <div className={`p-8 rounded-2xl border text-center ${isSuccess ? 'bg-emerald-50 border-emerald-200' : status === 'pending' ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'}`}>
        <span className={`material-symbols-outlined text-6xl mb-4 ${isSuccess ? 'text-emerald-600' : status === 'pending' ? 'text-amber-600' : 'text-red-600'}`}>
          {isSuccess ? 'check_circle' : status === 'pending' ? 'hourglass_top' : 'error'}
        </span>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          {isSuccess ? 'Pembayaran Berhasil!' : status === 'pending' ? 'Menunggu Pembayaran' : 'Pembayaran Gagal'}
        </h1>
        <p className="text-sm text-muted-foreground mb-4">Order ID: <span className="font-mono font-semibold text-foreground">{orderId}</span></p>
        {data && (
          <div className="inline-flex items-center gap-2 mb-6">
            <Badge variant={isSuccess ? 'default' : 'secondary'} className="capitalize">{status}</Badge>
            {data.payment_type && <span className="text-xs text-muted-foreground">{data.payment_type}</span>}
            {data.gross_amount && <span className="text-sm font-bold text-primary">{formatRupiah(data.gross_amount)}</span>}
          </div>
        )}
        <p className="text-sm text-muted-foreground max-w-lg mx-auto">
          {isSuccess
            ? 'Terima kasih! Pesanan Anda sedang diproses. Produk telah dihapus dari keranjang dan tersimpan di riwayat pesanan.'
            : status === 'pending'
            ? 'Selesaikan pembayaran di Midtrans. Status akan otomatis diperbarui via webhook.'
            : 'Transaksi dibatalkan atau kedaluwarsa. Silakan coba checkout lagi.'}
        </p>
      </div>

      {items.length > 0 && (
        <div className="mt-8 bg-background p-6 rounded-xl border border-border">
          <h3 className="font-semibold mb-4">Rincian Produk</h3>
          <div className="space-y-3">
            {items.filter(it => it.id !== 'TAX' && it.id !== 'TAX-2PCT').map((it, idx) => (
              <div key={idx} className="flex justify-between text-sm border-b border-border pb-2 last:border-0">
                <span>{it.name} × {it.quantity}</span>
                <span className="font-medium">{formatRupiah(it.price * it.quantity)}</span>
              </div>
            ))}
            {data?.gross_amount && (
              <div className="flex justify-between font-bold pt-2">
                <span>Total</span>
                <span className="text-primary">{formatRupiah(data.gross_amount)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {error && <p className="text-sm text-destructive mt-4 text-center">{error}</p>}

      <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
        <Button asChild className="flex-1 sm:flex-none">
          <Link to="/orders">Lihat Pesanan Saya</Link>
        </Button>
        <Button asChild variant="outline" className="flex-1 sm:flex-none">
          <Link to="/">Lanjut Belanja</Link>
        </Button>
        <Button asChild variant="ghost" className="flex-1 sm:flex-none">
          <Link to="/cart">Kembali ke Keranjang</Link>
        </Button>
      </div>
    </main>
  )
}
