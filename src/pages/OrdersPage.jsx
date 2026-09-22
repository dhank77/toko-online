import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../utils/api'
import { formatRupiah } from '../lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuth } from '../context/AuthContext'

export default function OrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tab, setTab] = useState('orders')

  useEffect(() => {
    if (!user) return
    setLoading(true)
    // Sinkronkan dulu: perbaiki order yang hilang dari transaksi success,
    // lalu ambil ulang orders + transactions
    api.syncMyOrders().catch(() => {}).finally(() => {
      Promise.allSettled([api.getMyOrders(), api.getMyTransactions()]).then(([oRes, tRes]) => {
        if (oRes.status === 'fulfilled') setOrders(Array.isArray(oRes.value) ? oRes.value : [])
        else setOrders([])
        if (tRes.status === 'fulfilled') setTransactions(Array.isArray(tRes.value) ? tRes.value : [])
        else setTransactions([])
        setLoading(false)
      }).catch((e) => {
        setError(e.message)
        setLoading(false)
      })
    })
  }, [user])

  if (!user) {
    return (
      <main className="max-w-7xl mx-auto px-6 py-16">
        <h1 className="text-2xl font-bold mb-8">Pesanan Saya</h1>
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">Silakan login untuk melihat pesanan.</p>
          <Link to="/login" className="text-primary font-medium hover:underline">Masuk</Link>
        </div>
      </main>
    )
  }

  const list = tab === 'orders' ? orders : transactions

  return (
    <main className="max-w-7xl mx-auto px-6 py-16 pt-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pesanan Saya</h1>
          <p className="text-sm text-muted-foreground mt-1">Riwayat produk yang telah Anda beli</p>
        </div>
        <div className="flex items-center gap-2 bg-muted p-1 rounded-xl">
          <button
            onClick={() => setTab('orders')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'orders' ? 'bg-background shadow text-foreground' : 'text-muted-foreground'}`}
          >
            Pesanan ({orders.length})
          </button>
          <button
            onClick={() => setTab('transactions')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'transactions' ? 'bg-background shadow text-foreground' : 'text-muted-foreground'}`}
          >
            Transaksi ({transactions.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="bg-background p-6 rounded-xl border border-border animate-pulse flex gap-4">
              <div className="w-20 h-20 bg-muted rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-1/3" />
                <div className="h-3 bg-muted rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12 text-destructive">{error}</div>
      ) : list.length === 0 ? (
        <div className="text-center py-16 bg-background rounded-xl border border-border">
          <span className="material-symbols-outlined text-6xl text-muted-foreground mb-4">receipt_long</span>
          <p className="text-muted-foreground mb-2">
            {tab === 'orders' ? 'Belum ada pesanan.' : 'Belum ada transaksi.'}
          </p>
          <p className="text-sm text-muted-foreground mb-6">Selesaikan pembayaran di keranjang untuk melihat riwayat di sini.</p>
          <Button asChild>
            <Link to="/cart">Lihat Keranjang</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {list.map((row) => {
            const isOrder = tab === 'orders'
            const orderId = row.order_id
            const status = row.status
            const amount = row.gross_amount || row.total_amount || 0
            const items = row.items || row.raw_response?.items || []
            const date = row.created_at || row.transaction_time
            return (
              <div key={row.id || orderId} className="bg-background p-6 rounded-xl border border-border shadow-sm hover:border-primary/20 transition-colors">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-semibold text-foreground">{orderId}</span>
                      <Badge variant={status === 'success' || status === 'paid' ? 'default' : status === 'pending' ? 'secondary' : 'destructive'} className="capitalize">
                        {status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{date ? new Date(date).toLocaleString('id-ID') : '-'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">{formatRupiah(amount)}</p>
                    {row.payment_type && <p className="text-xs text-muted-foreground">{row.payment_type}</p>}
                  </div>
                </div>
                {Array.isArray(items) && items.length > 0 ? (
                  <div className="space-y-2 border-t border-border pt-4">
                    {items.filter(it => it.id !== 'TAX' && it.id !== 'TAX-2PCT').map((it, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm">
                        <span className="text-foreground">{it.name} <span className="text-muted-foreground">× {it.quantity}</span></span>
                        <span className="font-medium text-foreground">{formatRupiah(it.price * it.quantity)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground border-t border-border pt-4">Detail item tersimpan di transaksi</p>
                )}
                <div className="flex gap-2 mt-4">
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/orders/${encodeURIComponent(orderId)}`}>Detail</Link>
                  </Button>
                  <Button asChild variant="ghost" size="sm">
                    <Link to={`/payment/success?order_id=${encodeURIComponent(orderId)}`}>Lihat Status</Link>
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
