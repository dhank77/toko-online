import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../utils/api'
import { formatRupiah } from '../lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function OrderDetail() {
  const { orderId } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!orderId) return
    setLoading(true)
    api.getMyOrder(orderId)
      .then(setData)
      .catch(async () => {
        // Fallback ke transactions
        try {
          const list = await api.getMyTransactions()
          const found = Array.isArray(list) ? list.find(t => t.order_id === orderId) : null
          if (found) setData(found)
          else setError('Pesanan tidak ditemukan')
        } catch (e) {
          setError(e.message)
        }
      })
      .finally(() => setLoading(false))
  }, [orderId])

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto px-6 py-16 pt-24">
        <div className="bg-background p-8 rounded-xl border border-border animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/2" />
          <div className="h-4 bg-muted rounded w-1/3" />
        </div>
      </main>
    )
  }

  if (error || !data) {
    return (
      <main className="max-w-3xl mx-auto px-6 py-16 pt-24 text-center">
        <p className="text-muted-foreground mb-4">{error || 'Pesanan tidak ditemukan'}</p>
        <Button asChild><Link to="/orders">Kembali ke Pesanan</Link></Button>
      </main>
    )
  }

  const items = data.items || data.raw_response?.items || []
  const status = data.status
  const isSuccess = status === 'success' || status === 'paid'

  return (
    <main className="max-w-3xl mx-auto px-6 py-16 pt-24">
      <Link to="/orders" className="text-sm text-primary hover:underline flex items-center gap-1 mb-6">
        <span className="material-symbols-outlined text-base">arrow_back</span> Kembali ke Pesanan Saya
      </Link>
      <div className="bg-background p-6 rounded-xl border border-border">
        <div className="flex justify-between items-start gap-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-foreground">Detail Pesanan</h1>
            <p className="font-mono text-sm text-muted-foreground mt-1">{data.order_id}</p>
            <p className="text-xs text-muted-foreground">{data.created_at ? new Date(data.created_at).toLocaleString('id-ID') : data.transaction_time ? new Date(data.transaction_time).toLocaleString('id-ID') : ''}</p>
          </div>
          <Badge variant={isSuccess ? 'default' : status === 'pending' ? 'secondary' : 'destructive'} className="capitalize">{status}</Badge>
        </div>
        <div className="space-y-3">
          {items.filter(it => it.id !== 'TAX' && it.id !== 'TAX-2PCT').map((it, idx) => (
            <div key={idx} className="flex justify-between items-center py-3 border-b border-border last:border-0">
              <div>
                <p className="text-sm font-medium text-foreground">{it.name}</p>
                <p className="text-xs text-muted-foreground">Qty: {it.quantity} × {formatRupiah(it.price)}</p>
              </div>
              <span className="font-semibold text-foreground">{formatRupiah(it.price * it.quantity)}</span>
            </div>
          ))}
          {data.gross_amount && (
            <div className="flex justify-between font-bold text-lg pt-3">
              <span>Total</span>
              <span className="text-primary">{formatRupiah(data.gross_amount)}</span>
            </div>
          )}
          {data.payment_type && (
            <p className="text-xs text-muted-foreground">Metode: {data.payment_type}</p>
          )}
        </div>
      </div>
      <div className="flex gap-3 mt-6">
        <Button asChild><Link to="/orders">Semua Pesanan</Link></Button>
        <Button asChild variant="outline"><Link to="/payment/success?order_id=">Lihat Status Pembayaran</Link></Button>
      </div>
    </main>
  )
}
