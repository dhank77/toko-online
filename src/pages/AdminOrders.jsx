import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-hot-toast'
import { api } from '../utils/api'
import { useAdminSearch } from '../context/AdminSearchContext'
import { formatRupiah } from '../lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const STATUS_OPTIONS = [
  { value: 'all', label: 'Semua Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Dibayar' },
  { value: 'processed', label: 'Diproses' },
  { value: 'shipped', label: 'Dikirim' },
  { value: 'completed', label: 'Selesai' },
  { value: 'success', label: 'Success' },
  { value: 'failed', label: 'Gagal' },
  { value: 'cancelled', label: 'Dibatalkan' },
]

const NEXT_STATUS = ['pending', 'paid', 'processed', 'shipped', 'completed', 'cancelled']

function statusVariant(status) {
  const s = String(status || '').toLowerCase()
  if (['paid', 'success', 'completed', 'shipped'].includes(s)) return 'default'
  if (['pending', 'processed', 'challenge'].includes(s)) return 'secondary'
  if (['failed', 'cancelled', 'deny', 'expire'].includes(s)) return 'destructive'
  return 'outline'
}

function statusLabel(status) {
  const map = {
    pending: 'Pending', paid: 'Dibayar', success: 'Success',
    processed: 'Diproses', shipped: 'Dikirim', completed: 'Selesai',
    failed: 'Gagal', challenge: 'Challenge', cancelled: 'Dibatalkan',
    deny: 'Ditolak', expire: 'Kedaluwarsa',
  }
  return map[String(status || '').toLowerCase()] || status || '-'
}

function initials(name) {
  return String(name || 'U').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
}

function itemSummary(items) {
  if (!Array.isArray(items) || items.length === 0) return '-'
  const real = items.filter((it) => it.id !== 'TAX' && it.id !== 'TAX-2PCT')
  if (real.length === 0) return '-'
  const first = real[0]
  const rest = real.length - 1
  return rest > 0 ? `${first.name} x ${first.quantity} (+${rest} lainnya)` : `${first.name} x ${first.quantity}`
}
export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  // Kata kunci berasal dari kolom pencarian di header admin (state global),
  // sehingga kolom di halaman ini dan di header selalu sinkron.
  const { query: search, setQuery: setSearch } = useAdminSearch()
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortOrder, setSortOrder] = useState('desc')
  const [detail, setDetail] = useState(null)
  const [updating, setUpdating] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const loadOrders = async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    setError('')
    try {
      const data = await api.getOrders()
      setOrders(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message || 'Gagal memuat pesanan')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { loadOrders() }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    let list = [...orders]
    if (statusFilter !== 'all') {
      list = list.filter((o) => String(o.status || '').toLowerCase() === statusFilter)
    }
    if (q) {
      list = list.filter((o) => {
        const snap = o.raw_response?.customer?.firstName || o.raw_response?.customer_details?.first_name || ''
        const name = (o.profiles?.full_name || snap || '').toLowerCase()
        const email = (o.profiles?.email || '').toLowerCase()
        const oid = String(o.order_id || o.id || '').toLowerCase()
        return name.includes(q) || email.includes(q) || oid.includes(q)
      })
    }
    list.sort((a, b) => {
      const da = new Date(a.created_at || 0).getTime()
      const db = new Date(b.created_at || 0).getTime()
      return sortOrder === 'desc' ? db - da : da - db
    })
    return list
  }, [orders, search, statusFilter, sortOrder])

  const stats = useMemo(() => {
    const total = orders.length
    const pending = orders.filter((o) => String(o.status).toLowerCase() === 'pending').length
    return { total, pending }
  }, [orders])

  const handleUpdateStatus = async (order, newStatus) => {
    if (!order || order.status === newStatus) return
    setUpdating(true)
    try {
      const updated = await api.updateOrderStatus(order.id, newStatus)
      setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, ...updated } : o)))
      setDetail((prev) => (prev && prev.id === order.id ? { ...prev, ...updated } : prev))
      toast.success(`Status ${order.order_id} -> ${statusLabel(newStatus)}`)
    } catch (err) {
      toast.error(err.message || 'Gagal memperbarui status')
    } finally {
      setUpdating(false)
    }
  }

  const needProcess = useMemo(() => orders.filter((o) => ['paid', 'success', 'processed'].includes(String(o.status).toLowerCase())).length, [orders])
  const revenue = useMemo(() => orders.filter((o) => !['failed', 'cancelled'].includes(String(o.status).toLowerCase())).reduce((s, o) => s + Number(o.gross_amount || 0), 0), [orders])

  return (
    <>
      {error && (<div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-destructive/10 text-destructive px-6 py-3 rounded-lg shadow-lg border border-destructive/20 text-sm">{error}</div>)}
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Manajemen Pesanan</h1>
          <p className="text-sm text-muted-foreground">Kelola pesanan pelanggan — verifikasi, proses, kirim, selesaikan.</p>
        </div>
        <Button variant="outline" onClick={() => loadOrders(true)} disabled={refreshing} className="flex items-center gap-2 w-fit">
          <span className="material-symbols-outlined text-lg">refresh</span>{refreshing ? 'Memuat...' : 'Muat Ulang'}
        </Button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card><CardContent className="p-5"><p className="text-xs text-muted-foreground">Total Pesanan</p><p className="text-xl font-bold">{loading ? '...' : stats.total}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-xs text-muted-foreground">Menunggu Bayar</p><p className="text-xl font-bold">{loading ? '...' : stats.pending}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-xs text-muted-foreground">Perlu Diproses</p><p className="text-xl font-bold">{loading ? '...' : needProcess}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-xs text-muted-foreground">Pendapatan</p><p className="text-base font-bold text-primary">{loading ? '...' : formatRupiah(revenue)}</p></CardContent></Card>
      </div>
      <div className="mb-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">search</span>
          <Input placeholder="Cari No. Pesanan, nama, atau email pembeli..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border rounded-md bg-background text-sm">
          {STATUS_OPTIONS.map((s) => (<option key={s.value} value={s.value}>{s.label}</option>))}
        </select>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="px-3 py-2 border rounded-md bg-background text-sm">
          <option value="desc">Terbaru dulu</option>
          <option value="asc">Terlama dulu</option>
        </select>
      </div>

      {!loading && (search.trim() || statusFilter !== 'all') && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>
            Menampilkan <span className="font-semibold text-foreground">{filtered.length}</span> dari {orders.length} pesanan
            {search.trim() ? <> untuk &quot;{search.trim()}&quot;</> : null}
            {statusFilter !== 'all' ? <> · status {statusLabel(statusFilter)}</> : null}.
          </span>
          <button
            type="button"
            onClick={() => { setSearch(''); setStatusFilter('all') }}
            className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">filter_alt_off</span>Bersihkan pencarian
          </button>
        </div>
      )}

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-xs uppercase">Order ID</TableHead>
                  <TableHead className="text-xs uppercase">Pelanggan</TableHead>
                  <TableHead className="text-xs uppercase">Produk</TableHead>
                  <TableHead className="text-xs uppercase">Total</TableHead>
                  <TableHead className="text-xs uppercase">Status</TableHead>
                  <TableHead className="text-xs uppercase text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  [1,2,3].map((i) => (
                    <TableRow key={i}>
                      <TableCell><div className="h-4 bg-muted rounded w-24 animate-pulse" /></TableCell>
                      <TableCell><div className="h-4 bg-muted rounded w-28 animate-pulse" /></TableCell>
                      <TableCell><div className="h-4 bg-muted rounded w-32 animate-pulse" /></TableCell>
                      <TableCell><div className="h-4 bg-muted rounded w-16 animate-pulse" /></TableCell>
                      <TableCell><div className="h-4 bg-muted rounded w-14 animate-pulse" /></TableCell>
                      <TableCell><div className="h-8 bg-muted rounded w-20 animate-pulse ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <span className="material-symbols-outlined text-5xl text-muted-foreground block mb-2">receipt_long</span>
                      <p className="text-sm text-muted-foreground">
                        {orders.length === 0
                          ? 'Belum ada pesanan masuk.'
                          : search.trim()
                            ? `Tidak ada pesanan yang cocok dengan "${search.trim()}".`
                            : 'Tidak cocok dengan filter.'}
                      </p>
                      {(search.trim() || statusFilter !== 'all') && (
                        <Button variant="outline" size="sm" className="mt-3" onClick={() => { setSearch(''); setStatusFilter('all') }}>
                          Bersihkan pencarian
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ) : filtered.map((order) => {
                  // Nama: profil -> snapshot checkout -> email -> potongan ID
                  const snapName = order.raw_response?.customer?.firstName || order.raw_response?.customer_details?.first_name || null
                  const emailName = order.profiles?.email ? order.profiles.email.split('@')[0] : null
                  const name = order.profiles?.full_name || snapName || emailName || `User ${String(order.customer_id || '').slice(0, 8)}`
                  const email = order.profiles?.email || null
                  return (
                    <TableRow key={order.id}>
                      <TableCell><span className="font-mono text-xs font-semibold">{order.order_id}</span><span className="block text-[11px] text-muted-foreground">{order.payment_type || ''}</span></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7"><AvatarFallback className="text-[10px] font-bold">{initials(name)}</AvatarFallback></Avatar>
                          <div><p className="text-sm font-medium">{name}</p><p className="text-[11px] text-muted-foreground">{email || ''}</p></div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{itemSummary(order.items)}</TableCell>
                      <TableCell className="text-sm font-semibold">{formatRupiah(order.gross_amount || 0)}</TableCell>
                      <TableCell><Badge variant={statusVariant(order.status)} className="capitalize">{statusLabel(order.status)}</Badge></TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button variant="outline" size="sm" onClick={() => setDetail(order)}>Detail</Button>
                          <select value={String(order.status || '').toLowerCase()} onChange={(e) => handleUpdateStatus(order, e.target.value)} disabled={updating} className="h-8 px-2 text-xs border rounded-md bg-background">
                            {NEXT_STATUS.map((s) => (<option key={s} value={s}>{statusLabel(s)}</option>))}
                          </select>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!detail} onOpenChange={(o) => { if (!o) setDetail(null) }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Detail Pesanan</DialogTitle></DialogHeader>
          {detail && (
            <div className="space-y-4">
              <div className="flex justify-between gap-3">
                <div><p className="font-mono text-sm font-bold">{detail.order_id}</p><p className="text-xs text-muted-foreground">{detail.created_at ? new Date(detail.created_at).toLocaleString('id-ID') : ''}</p></div>
                <Badge variant={statusVariant(detail.status)} className="capitalize">{statusLabel(detail.status)}</Badge>
              </div>
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <div className="p-4 rounded-lg bg-muted/50 border"><p className="text-xs text-muted-foreground mb-1">PELANGGAN</p><p className="font-semibold">{detail.profiles?.full_name || detail.raw_response?.customer?.firstName || detail.raw_response?.customer_details?.first_name || detail.profiles?.email?.split('@')[0] || '-'}</p><p className="text-xs text-muted-foreground">{detail.profiles?.email || ''}</p></div>
                <div className="p-4 rounded-lg bg-muted/50 border"><p className="text-xs text-muted-foreground mb-1">PEMBAYARAN</p><p className="font-semibold">{detail.payment_type || '-'}</p><p className="text-lg font-bold text-primary">{formatRupiah(detail.gross_amount || 0)}</p></div>
              </div>
              <div className="border rounded-lg divide-y">
                {(detail.items || []).filter((i) => i.id !== 'TAX').map((it, idx) => (
                  <div key={idx} className="flex justify-between px-4 py-3 text-sm"><span>{it.name} x {it.quantity}</span><span className="font-semibold">{formatRupiah(Number(it.price) * Number(it.quantity))}</span></div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {NEXT_STATUS.map((s) => (<Button key={s} size="sm" variant={String(detail.status).toLowerCase() === s ? 'default' : 'outline'} disabled={updating} onClick={() => handleUpdateStatus(detail, s)}>{statusLabel(s)}</Button>))}
              </div>
              <DialogFooter><Button variant="outline" onClick={() => setDetail(null)}>Tutup</Button></DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

