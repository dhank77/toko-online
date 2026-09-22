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
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Label } from '@/components/ui/label'

function initials(name) {
  return String(name || 'U').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
}
export default function AdminCustomers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  // Kata kunci berasal dari kolom pencarian di header admin (state global),
  // sehingga kolom di halaman ini dan di header selalu sinkron.
  const { query: search, setQuery: setSearch } = useAdminSearch()
  const [roleFilter, setRoleFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [editForm, setEditForm] = useState({ full_name: '', role: 'customer' })
  const [saving, setSaving] = useState(false)

  const loadCustomers = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await api.getAdminCustomers()
      setCustomers(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message || 'Gagal memuat pelanggan')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadCustomers() }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    let list = [...customers]
    if (roleFilter !== 'all') list = list.filter((c) => c.role === roleFilter)
    if (q) {
      list = list.filter((c) =>
        (c.displayName || '').toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q)
      )
    }
    list.sort((a, b) => {
      if (sortBy === 'spent') return (b.totalSpent || 0) - (a.totalSpent || 0)
      if (sortBy === 'orders') return (b.totalOrders || 0) - (a.totalOrders || 0)
      if (sortBy === 'name') return (a.displayName || '').localeCompare(b.displayName || '')
      return new Date(b.created_at || 0) - new Date(a.created_at || 0)
    })
    return list
  }, [customers, search, roleFilter, sortBy])

  const stats = useMemo(() => ({
    total: customers.length,
    admins: customers.filter((c) => c.role === 'admin').length,
    buyers: customers.filter((c) => (c.totalOrders || 0) > 0).length,
    revenue: customers.reduce((s, c) => s + Number(c.totalSpent || 0), 0),
  }), [customers])

  const openDetail = async (row) => {
    setDetail({ ...row, orders: null })
    setEditForm({ full_name: row.full_name || '', role: row.role || 'customer' })
    setDetailLoading(true)
    try {
      const full = await api.getAdminCustomer(row.id)
      setDetail(full)
      setEditForm({ full_name: full.full_name || '', role: full.role || 'customer' })
    } catch (err) {
      toast.error(err.message || 'Gagal memuat detail')
    } finally {
      setDetailLoading(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!detail) return
    setSaving(true)
    try {
      const updated = await api.updateAdminCustomer(detail.id, editForm)
      setCustomers((prev) => prev.map((c) =>
        c.id === detail.id ? { ...c, ...updated, displayName: updated.full_name || updated.email?.split('@')[0] } : c
      ))
      setDetail((prev) => ({ ...prev, ...updated }))
      toast.success('Pelanggan diperbarui')
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan')
    } finally {
      setSaving(false)
    }
  }

  const list = filtered
  return (
    <>
      {error && (<div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-destructive/10 text-destructive px-6 py-3 rounded-lg shadow-lg border border-destructive/20 text-sm">{error}</div>)}
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">CRM Pelanggan</h1>
          <p className="text-sm text-muted-foreground">Lihat, cari, dan kelola data pelanggan beserta riwayat belanjanya.</p>
        </div>
        <Button variant="outline" onClick={loadCustomers} className="flex items-center gap-2 w-fit">
          <span className="material-symbols-outlined text-lg">refresh</span>Muat Ulang
        </Button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card><CardContent className="p-5"><p className="text-xs text-muted-foreground">Total Pelanggan</p><p className="text-xl font-bold">{loading ? '...' : stats.total}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-xs text-muted-foreground">Sudah Belanja</p><p className="text-xl font-bold">{loading ? '...' : stats.buyers}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-xs text-muted-foreground">Admin</p><p className="text-xl font-bold">{loading ? '...' : stats.admins}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-xs text-muted-foreground">Total Belanja</p><p className="text-base font-bold text-primary">{loading ? '...' : formatRupiah(stats.revenue)}</p></CardContent></Card>
      </div>
      <div className="mb-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">search</span>
          <Input placeholder="Cari nama atau email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="px-3 py-2 border rounded-md bg-background text-sm">
          <option value="all">Semua Role</option>
          <option value="customer">Customer</option>
          <option value="admin">Admin</option>
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-3 py-2 border rounded-md bg-background text-sm">
          <option value="newest">Terbaru daftar</option>
          <option value="name">Nama A-Z</option>
          <option value="orders">Order terbanyak</option>
          <option value="spent">Belanja terbesar</option>
        </select>
      </div>
      {!loading && (search.trim() || roleFilter !== 'all') && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>
            Menampilkan <span className="font-semibold text-foreground">{list.length}</span> dari {customers.length} pelanggan
            {search.trim() ? <> untuk &quot;{search.trim()}&quot;</> : null}
            {roleFilter !== 'all' ? <> · role {roleFilter}</> : null}.
          </span>
          <button
            type="button"
            onClick={() => { setSearch(''); setRoleFilter('all') }}
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
                  <TableHead className="text-xs uppercase">Pelanggan</TableHead>
                  <TableHead className="text-xs uppercase">Role</TableHead>
                  <TableHead className="text-xs uppercase">Order</TableHead>
                  <TableHead className="text-xs uppercase">Belanja</TableHead>
                  <TableHead className="text-xs uppercase text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  [1,2,3].map((i) => (
                    <TableRow key={i}>
                      <TableCell><div className="h-4 bg-muted rounded w-36 animate-pulse" /></TableCell>
                      <TableCell><div className="h-4 bg-muted rounded w-14 animate-pulse" /></TableCell>
                      <TableCell><div className="h-4 bg-muted rounded w-10 animate-pulse" /></TableCell>
                      <TableCell><div className="h-4 bg-muted rounded w-20 animate-pulse" /></TableCell>
                      <TableCell><div className="h-8 bg-muted rounded w-16 animate-pulse ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : list.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12">
                      <span className="material-symbols-outlined text-5xl text-muted-foreground block mb-2">group</span>
                      <p className="text-sm text-muted-foreground">Tidak ada pelanggan yang cocok.</p>
                    </TableCell>
                  </TableRow>
                ) : list.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          {c.avatar_url && (<AvatarImage src={c.avatar_url} alt={c.displayName} />)}
                          <AvatarFallback className="text-[11px] font-bold">{initials(c.displayName)}</AvatarFallback>
                        </Avatar>
                        <div><p className="text-sm font-medium">{c.displayName}</p><p className="text-[11px] text-muted-foreground">{c.email || '-'}</p></div>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant={c.role === 'admin' ? 'default' : 'secondary'} className="capitalize">{c.role}</Badge></TableCell>
                    <TableCell className="text-sm font-semibold">{c.totalOrders || 0}x</TableCell>
                    <TableCell className="text-sm">{formatRupiah(c.totalSpent || 0)}</TableCell>
                    <TableCell className="text-right"><Button variant="outline" size="sm" onClick={() => openDetail(c)}>Detail</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>


      <Dialog open={!!detail} onOpenChange={(o) => { if (!o) setDetail(null) }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Detail Pelanggan</DialogTitle></DialogHeader>
          {detail && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  {detail.avatar_url && (<AvatarImage src={detail.avatar_url} alt={detail.full_name || detail.displayName} />)}
                  <AvatarFallback className="font-bold">{initials(detail.full_name || detail.displayName)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-bold">{detail.full_name || detail.displayName}</p>
                  <p className="text-xs text-muted-foreground">{detail.email}</p>
                </div>
                <Badge variant={detail.role === 'admin' ? 'default' : 'secondary'} className="ml-auto capitalize">{detail.role}</Badge>
              </div>
              <form onSubmit={handleSave} className="grid sm:grid-cols-2 gap-3 p-4 rounded-lg bg-muted/50 border">
                <div><Label>Nama Lengkap</Label><Input value={editForm.full_name} onChange={(e) => setEditForm((p) => ({ ...p, full_name: e.target.value }))} placeholder="Nama pelanggan" /></div>
                <div><Label>Role</Label><select value={editForm.role} onChange={(e) => setEditForm((p) => ({ ...p, role: e.target.value }))} className="w-full h-9 px-3 border rounded-md bg-background text-sm"><option value="customer">Customer</option><option value="admin">Admin</option></select></div>
                <div className="sm:col-span-2"><Button type="submit" size="sm" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</Button></div>
              </form>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Riwayat Order ({detail.orders ? detail.orders.length : '...'})</p>
                {detailLoading ? (
                  <div className="h-12 bg-muted rounded-lg animate-pulse" />
                ) : (detail.orders || []).length === 0 ? (
                  <p className="text-sm text-muted-foreground border rounded-lg p-4 text-center">Belum pernah belanja.</p>
                ) : (
                  <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
                    {(detail.orders || []).map((o) => (
                      <div key={o.id} className="flex justify-between items-center px-4 py-2.5 text-sm">
                        <div><p className="font-mono text-xs font-semibold">{o.order_id}</p><p className="text-[11px] text-muted-foreground">{o.status}</p></div>
                        <p className="font-semibold">{formatRupiah(o.gross_amount || 0)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <DialogFooter><Button variant="outline" onClick={() => setDetail(null)}>Tutup</Button></DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

