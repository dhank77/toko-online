import { useEffect, useMemo, useState } from 'react'
import { api } from '../utils/api'
import { formatRupiah } from '../lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'

// ---- helpers ----
const PERIODS = [
  { value: 7, label: '7 Hari' },
  { value: 30, label: '30 Hari' },
  { value: 90, label: '90 Hari' },
  { value: 0, label: 'Semua' },
]
const FAIL_STATUSES = new Set(['failed', 'cancelled', 'deny', 'expire', 'expired'])
function isSuccess(o) { return !FAIL_STATUSES.has(String(o.status || '').toLowerCase()) }
function statusLabel(s) {
  const m = { pending: 'Pending', paid: 'Dibayar', success: 'Success', processed: 'Diproses', shipped: 'Dikirim', completed: 'Selesai', failed: 'Gagal', cancelled: 'Dibatalkan', challenge: 'Challenge', deny: 'Ditolak', expire: 'Kedaluwarsa' }
  return m[String(s || '').toLowerCase()] || s || '-'
}
function statusVariant(s) {
  const v = String(s || '').toLowerCase()
  if (['paid','success','completed','shipped'].includes(v)) return 'default'
  if (['pending','processed','challenge'].includes(v)) return 'secondary'
  if (['failed','cancelled','deny','expire'].includes(v)) return 'destructive'
  return 'outline'
}
function fmtPct(n) {
  if (!Number.isFinite(n)) return '—'
  const sign = n > 0 ? '+' : ''
  return `${sign}${n.toFixed(1)}%`
}
function toDateOnly(d) {
  const x = new Date(d)
  x.setHours(0,0,0,0)
  return x
}
function dateKey(d) {
  const x = new Date(d)
  const y = x.getFullYear(), m = String(x.getMonth()+1).padStart(2,'0'), day = String(x.getDate()).padStart(2,'0')
  return `${y}-${m}-${day}`
}
function shortDate(d) {
  return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })
}
function rangeDates(days) {
  const out = []
  const today = toDateOnly(new Date())
  for (let i = days - 1; i >= 0; i--) {
    const dt = new Date(today)
    dt.setDate(dt.getDate() - i)
    out.push(dt)
  }
  return out
}

function exportOrdersCsv(orders) {
  const header = ['order_id','tanggal','pelanggan','email','status','metode','total','jumlah_item']
  const rows = orders.map(o => {
    const name = o.profiles?.full_name || o.raw_response?.customer?.firstName || o.raw_response?.customer_details?.first_name || ''
    const email = o.profiles?.email || ''
    const cnt = Array.isArray(o.items) ? o.items.filter(x=>x.id!=='TAX' && x.id!=='TAX-2PCT').reduce((s,x)=>s+Number(x.quantity||0),0) : 0
    return [o.order_id || o.id || '', o.created_at ? new Date(o.created_at).toLocaleString('id-ID') : '', `"${String(name).replace(/"/g,'""')}"`, email, o.status||'', o.payment_type||'', String(o.gross_amount||0), String(cnt)]
  })
  const csv = [header.join(','), ...rows.map(r=>r.join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = `analitik-${dateKey(new Date())}.csv`; a.click()
  URL.revokeObjectURL(url)
}

export default function AdminAnalytics() {
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [period, setPeriod] = useState(30)
  const [refreshing, setRefreshing] = useState(false)

  const load = async (silent=false) => {
    if (!silent) setLoading(true); else setRefreshing(true)
    setError('')
    try {
      const [o, p, c] = await Promise.all([
        api.getOrders().catch(()=>[]),
        api.getAdminProducts(1, 50).catch(()=>({data:[]})),
        api.getCategories().catch(()=>[]),
      ])
      setOrders(Array.isArray(o) ? o : [])
      setProducts(Array.isArray(p?.data) ? p.data : Array.isArray(p) ? p : [])
      setCategories(Array.isArray(c) ? c : [])
      // customers optional, ignore failure
      api.getAdminCustomers().then(d=> setCustomers(Array.isArray(d)?d:[])).catch(()=>{})
    } catch (e) {
      setError(e.message || 'Gagal memuat analitik')
    } finally { setLoading(false); setRefreshing(false) }
  }
  useEffect(()=>{ load() }, [])

  // period filtering
  const filtered = useMemo(()=>{
    if (period === 0) return orders
    const cutoff = new Date()
    cutoff.setHours(0,0,0,0)
    cutoff.setDate(cutoff.getDate() - period + 1)
    return orders.filter(o=>{
      const d = o.created_at ? new Date(o.created_at) : null
      return d && d >= cutoff
    })
  }, [orders, period])

  const prevFiltered = useMemo(()=>{
    if (period === 0) return []
    const now = toDateOnly(new Date())
    const curStart = new Date(now); curStart.setDate(curStart.getDate() - period + 1)
    const prevEnd = new Date(curStart); prevEnd.setDate(prevEnd.getDate()-1)
    const prevStart = new Date(prevEnd); prevStart.setDate(prevStart.getDate()-period+1)
    return orders.filter(o=>{
      const d = o.created_at ? toDateOnly(o.created_at) : null
      return d && d >= prevStart && d <= prevEnd
    })
  }, [orders, period])

  // KPIs
  const kpis = useMemo(()=>{
    const curRev = filtered.filter(isSuccess).reduce((s,o)=> s+Number(o.gross_amount||0),0)
    const prevRev = prevFiltered.filter(isSuccess).reduce((s,o)=> s+Number(o.gross_amount||0),0)
    const curOrders = filtered.length
    const prevOrders = prevFiltered.length
    const successOrders = filtered.filter(o=> ['completed','success','shipped','paid'].includes(String(o.status).toLowerCase())).length
    const aov = curOrders ? curRev / filtered.filter(isSuccess).length || 0 : 0
    const prevAov = prevOrders ? prevRev / Math.max(1, prevFiltered.filter(isSuccess).length) : 0
    const pct = (cur, prev) => prev === 0 ? (cur>0?100:0) : ((cur-prev)/prev)*100
    return {
      revenue: curRev, revenuePrev: prevRev, revenuePct: period===0?null:pct(curRev, prevRev),
      ordersCount: curOrders, ordersPct: period===0?null:pct(curOrders, prevOrders),
      aov, aovPct: period===0?null:pct(aov, prevAov),
      successRate: curOrders? (successOrders/curOrders)*100 : 0,
      pending: filtered.filter(o=> String(o.status).toLowerCase()==='pending').length,
      needProcess: filtered.filter(o=> ['paid','success','processed'].includes(String(o.status).toLowerCase())).length,
    }
  }, [filtered, prevFiltered, period])

  // daily series
  const daily = useMemo(()=>{
    if (loading && filtered.length===0) return []
    let days = []
    if (period===0) {
      // derive from filtered range, max 60 points
      const dates = filtered.map(o=> o.created_at ? toDateOnly(o.created_at).getTime(): null).filter(Boolean)
      if (dates.length===0) days = rangeDates(7)
      else {
        const min = Math.min(...dates), max = Math.max(...dates)
        const diff = Math.ceil((max-min)/86400000)+1
        const n = Math.min(60, Math.max(7, diff))
        days = rangeDates(n)
      }
    } else {
      days = rangeDates(period <= 14 ? period : Math.min(period, 30))
      // for 30/90 show daily still but sample to keep readable: if 90 show 30 points aggregated by 3 days
      if (period===90) {
        // bucket every 3 days
        const buckets = []
        for (let i=0;i<days.length;i+=3) {
          const chunk = days.slice(i,i+3)
          const key = `${shortDate(chunk[0])}–${shortDate(chunk[chunk.length-1])}`
          const map = chunk.map(d=> dateKey(d))
          const rev = filtered.filter(o=> map.includes(dateKey(o.created_at))).filter(isSuccess).reduce((s,o)=>s+Number(o.gross_amount||0),0)
          const cnt = filtered.filter(o=> map.includes(dateKey(o.created_at))).length
          buckets.push({ label: key, revenue: rev, count: cnt })
        }
        return buckets
      }
    }
    const mapKeys = days.map(d=> dateKey(d))
    return days.map((d,idx)=>{
      const key = mapKeys[idx]
      const dayOrders = filtered.filter(o=> dateKey(o.created_at)===key)
      const rev = dayOrders.filter(isSuccess).reduce((s,o)=>s+Number(o.gross_amount||0),0)
      return { label: shortDate(d), revenue: rev, count: dayOrders.length }
    })
  }, [filtered, period, loading])

  const maxRev = Math.max(1, ...daily.map(d=> d.revenue))
  const maxCount = Math.max(1, ...daily.map(d=> d.count))

  // status breakdown
  const statusBreak = useMemo(()=>{
    const counts = {}
    filtered.forEach(o=>{ const k= String(o.status||'unknown').toLowerCase(); counts[k]=(counts[k]||0)+1 })
    const total = filtered.length || 1
    return Object.entries(counts).map(([k,v])=>({ status:k, count:v, pct: (v/total)*100 })).sort((a,b)=> b.count - a.count)
  }, [filtered])

  // payment method
  const paymentBreak = useMemo(()=>{
    const m={}
    filtered.forEach(o=>{ const k=(o.payment_type||'lainnya').toLowerCase(); m[k]=(m[k]||0)+1 })
    const total = filtered.length||1
    return Object.entries(m).map(([k,v])=>({ method:k, count:v, pct:(v/total)*100 })).sort((a,b)=> b.count-a.count).slice(0,6)
  }, [filtered])

  // top products
  const topProducts = useMemo(()=>{
    const acc = new Map()
    filtered.forEach(o=>{
      const items = Array.isArray(o.items)? o.items.filter(x=> x.id!=='TAX' && x.id!=='TAX-2PCT') : []
      items.forEach(it=>{
        const key = String(it.name||it.id||'Produk').trim() || 'Produk'
        const cur = acc.get(key) || { name:key, qty:0, revenue:0 }
        cur.qty += Number(it.quantity||0)
        cur.revenue += Number(it.price||0)*Number(it.quantity||0)
        acc.set(key, cur)
      })
    })
    return Array.from(acc.values()).sort((a,b)=> b.revenue - a.revenue).slice(0,5)
  }, [filtered])

  // top customers
  const topCustomers = useMemo(()=>{
    const acc = new Map()
    filtered.filter(isSuccess).forEach(o=>{
      const name = o.profiles?.full_name || o.raw_response?.customer?.firstName || o.raw_response?.customer_details?.first_name || o.profiles?.email?.split('@')[0] || `User ${String(o.customer_id||'').slice(0,6)}`
      const email = o.profiles?.email || ''
      const key = String(o.customer_id||name)
      const cur = acc.get(key) || { name, email, orders:0, spent:0 }
      cur.orders +=1; cur.spent += Number(o.gross_amount||0)
      cur.name = name || cur.name
      cur.email = email || cur.email
      acc.set(key, cur)
    })
    return Array.from(acc.values()).sort((a,b)=> b.spent - a.spent).slice(0,5)
  }, [filtered])

  // category distribution (from products)
  const categoryDist = useMemo(()=>{
    const byId = new Map(categories.map(c=>[c.id,c.name]))
    const map = new Map()
    products.forEach(p=>{
      const cat = byId.get(p.category_id) || 'Tanpa Kategori'
      map.set(cat, (map.get(cat)||0)+1)
    })
    const total = products.length||1
    return Array.from(map.entries()).map(([name,count])=>({ name, count, pct:(count/total)*100 })).sort((a,b)=> b.count-a.count).slice(0,6)
  }, [products, categories])

  const totalCustomers = customers.length || new Set(orders.map(o=> o.customer_id)).size

  // line path for SVG
  const linePath = useMemo(()=>{
    if (daily.length===0) return ''
    const w = 100, h = 40
    const step = w / Math.max(1, daily.length - 1)
    const points = daily.map((d,i)=>{
      const x = i*step
      const y = h - (d.revenue / maxRev)*h
      return `${i===0?'M':'L'} ${x} ${y}`
    }).join(' ')
    return points
  }, [daily, maxRev])

  return (
    <>
      {error && <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-destructive/10 text-destructive px-6 py-3 rounded-lg shadow-lg border border-destructive/20 text-sm">{error}</div>}

      {/* Header */}
      <div className="mb-6 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analitik</h1>
          <p className="text-sm text-muted-foreground mt-1">Pantau pendapatan, pesanan, dan performa produk secara real-time. Data dihitung langsung dari pesanan toko.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-full border bg-muted p-1">
            {PERIODS.map(p=> (
              <button key={p.value} onClick={()=> setPeriod(p.value)} className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${period===p.value ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>{p.label}</button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={()=> load(true)} disabled={refreshing} className="rounded-full">
            <span className="material-symbols-outlined text-[18px]">{refreshing?'progress_activity':'refresh'}</span> {refreshing?'Memuat…':'Muat Ulang'}
          </Button>
          <Button variant="outline" size="sm" onClick={()=> exportOrdersCsv(filtered)} className="rounded-full">
            <span className="material-symbols-outlined text-[18px]">download</span> Ekspor CSV
          </Button>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="py-5">
          <CardContent className="p-5 pt-0">
            <div className="flex justify-between items-start mb-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary"><span className="material-symbols-outlined">payments</span></div>
              {kpis.revenuePct!==null && (
                <span className={`text-xs font-semibold inline-flex items-center gap-1 px-2 py-1 rounded-full ${kpis.revenuePct>=0?'bg-emerald-500/10 text-emerald-600':'bg-destructive/10 text-destructive'}`}>{fmtPct(kpis.revenuePct)} <span className="material-symbols-outlined text-sm">{kpis.revenuePct>=0?'trending_up':'trending_down'}</span></span>
              )}
            </div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Pendapatan Bersih</p>
            <p className="text-xl font-bold mt-1">{loading? '…' : formatRupiah(kpis.revenue)}</p>
            <p className="text-xs text-muted-foreground mt-1">{period===0? `${filtered.length} pesanan valid` : `vs periode sebelumnya`}</p>
          </CardContent>
        </Card>

        <Card className="py-5">
          <CardContent className="p-5 pt-0">
            <div className="flex justify-between items-start mb-3">
              <div className="p-2 rounded-lg bg-secondary text-foreground"><span className="material-symbols-outlined">shopping_bag</span></div>
              {kpis.ordersPct!==null && (
                <span className={`text-xs font-semibold inline-flex items-center gap-1 px-2 py-1 rounded-full ${kpis.ordersPct>=0?'bg-emerald-500/10 text-emerald-600':'bg-destructive/10 text-destructive'}`}>{fmtPct(kpis.ordersPct)} <span className="material-symbols-outlined text-sm">{kpis.ordersPct>=0?'trending_up':'trending_down'}</span></span>
              )}
            </div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Pesanan</p>
            <p className="text-xl font-bold mt-1">{loading? '…' : kpis.ordersCount}</p>
            <p className="text-xs text-muted-foreground mt-1">{kpis.pending} pending · {kpis.needProcess} perlu diproses</p>
          </CardContent>
        </Card>

        <Card className="py-5">
          <CardContent className="p-5 pt-0">
            <div className="flex justify-between items-start mb-3">
              <div className="p-2 rounded-lg bg-muted text-foreground"><span className="material-symbols-outlined">request_quote</span></div>
              {kpis.aovPct!==null && (
                <span className={`text-xs font-semibold inline-flex items-center gap-1 px-2 py-1 rounded-full ${kpis.aovPct>=0?'bg-emerald-500/10 text-emerald-600':'bg-destructive/10 text-destructive'}`}>{fmtPct(kpis.aovPct)} <span className="material-symbols-outlined text-sm">{kpis.aovPct>=0?'trending_up':'trending_down'}</span></span>
              )}
            </div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Rata-rata Belanja (AOV)</p>
            <p className="text-xl font-bold mt-1">{loading? '…' : formatRupiah(Math.round(kpis.aov))}</p>
            <p className="text-xs text-muted-foreground mt-1">Per transaksi sukses</p>
          </CardContent>
        </Card>

        <Card className={`py-5 ${kpis.successRate<50?'border-l-4 border-destructive':''}`}>
          <CardContent className="p-5 pt-0">
            <div className="flex justify-between items-start mb-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600"><span className="material-symbols-outlined">verified</span></div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${kpis.successRate>=70?'bg-emerald-500/15 text-emerald-700':'bg-amber-500/15 text-amber-700'}`}>{kpis.successRate.toFixed(0)}% sukses</span>
            </div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Tingkat Penyelesaian</p>
            <p className="text-xl font-bold mt-1">{loading? '…' : `${kpis.successRate.toFixed(1)}%`}</p>
            <p className="text-xs text-muted-foreground mt-1">{totalCustomers} pelanggan unik · {products.length} produk</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Revenue trend */}
        <Card className="lg:col-span-2 py-0">
          <CardHeader className="py-5">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm uppercase tracking-tight">Tren Pendapatan</CardTitle>
              <span className="text-xs text-muted-foreground">{period===0?'Semua waktu': period===7?'7 hari terakhir': period===30?'30 hari terakhir':'90 hari (per 3 hari)'}</span>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {daily.length===0 ? (
              <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">Belum ada data pada periode ini</div>
            ) : (
              <>
                <div className="relative h-56 w-full">
                  {/* grid */}
                  <div className="absolute inset-0 flex flex-col justify-between py-2">
                    {[0,1,2,3].map(i=> <div key={i} className="border-t border-dashed border-border/60 w-full" />)}
                  </div>
                  {/* bars */}
                  <div className="absolute inset-0 flex items-end gap-1 sm:gap-1.5 px-1">
                    {daily.map((d,i)=> (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                        <div className="w-full flex justify-center relative" style={{ height: 180 }}>
                          <div className="absolute bottom-0 w-full max-w-[36px] rounded-t-md bg-primary/20 group-hover:bg-primary transition-colors" style={{ height: `${(d.revenue / maxRev)*100}%`, minHeight: d.revenue>0? 6 : 2 }} />
                          {/* tooltip */}
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 hidden group-hover:block z-10 whitespace-nowrap bg-foreground text-background text-xs px-2 py-1 rounded-md shadow">
                            {formatRupiah(d.revenue)} · {d.count} trx
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* line */}
                  <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="absolute inset-0 w-full h-[180px] mt-2 px-1 pointer-events-none">
                    <path d={linePath} fill="none" stroke="hsl(var(--primary))" strokeWidth="0.6" strokeLinejoin="round" strokeLinecap="round" opacity="0.9" vectorEffect="non-scaling-stroke" />
                    {/* area */}
                    <path d={`${linePath} L 100 40 L 0 40 Z`} fill="hsl(var(--primary))" opacity="0.08" />
                  </svg>
                </div>
                <div className="flex justify-between mt-3 px-1">
                  {daily.map((d,i)=> (
                    <span key={i} className="text-[10px] text-muted-foreground flex-1 text-center truncate px-0.5">{d.label}</span>
                  ))}
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3 text-xs border-t pt-3">
                  <div><p className="text-muted-foreground">Puncak Harian</p><p className="font-semibold">{formatRupiah(maxRev)}</p></div>
                  <div><p className="text-muted-foreground">Rata-rata / Hari</p><p className="font-semibold">{formatRupiah(Math.round(daily.reduce((s,d)=>s+d.revenue,0)/Math.max(1,daily.length)))}</p></div>
                  <div className="text-right"><p className="text-muted-foreground">Total Periode</p><p className="font-bold text-primary">{formatRupiah(kpis.revenue)}</p></div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Status & payment */}
        <div className="space-y-6">
          <Card className="py-0">
            <CardHeader className="py-5"><CardTitle className="text-sm uppercase tracking-tight">Status Pesanan</CardTitle></CardHeader>
            <CardContent className="pt-0 space-y-3">
              {loading ? <div className="h-24 bg-muted rounded animate-pulse" /> : statusBreak.length===0 ? <p className="text-sm text-muted-foreground">Tidak ada data</p> : (
                <>
                  <div className="flex items-center justify-center py-2">
                    {/* donut via conic-gradient */}
                    <div className="w-28 h-28 rounded-full border-4 border-border relative flex items-center justify-center"
                      style={{ background: `conic-gradient(${statusBreak.map((s,i)=>{
                        const colors=['hsl(var(--primary))','hsl(var(--chart-2))','hsl(var(--chart-3))','hsl(var(--chart-4))','hsl(var(--destructive))','hsl(var(--muted-foreground))']
                        const c = colors[i%colors.length]
                        return `${c} 0`
                      }).join(',')})`}}
                    >
                      {/* fallback simple */}{statusBreak.slice(0,4).map((_,i)=>null)}
                      <div className="absolute inset-3 bg-card rounded-full flex flex-col items-center justify-center">
                        <span className="text-lg font-bold">{filtered.length}</span><span className="text-[10px] text-muted-foreground uppercase">pesanan</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {statusBreak.map(s=> (
                      <div key={s.status} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2"><Badge variant={statusVariant(s.status)} className="text-[10px] px-1.5 py-0">{statusLabel(s.status)}</Badge><span className="text-muted-foreground">{s.count} trx</span></div>
                        <span className="font-semibold">{s.pct.toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden flex">
                    {statusBreak.map((s,i)=>{
                      const colors=['bg-primary','bg-blue-500','bg-amber-500','bg-purple-500','bg-destructive','bg-muted-foreground']
                      return <div key={s.status} className={`${colors[i%colors.length]}`} style={{ width:`${s.pct}%` }} />
                    })}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="py-0">
            <CardHeader className="py-5"><CardTitle className="text-sm uppercase tracking-tight">Metode Pembayaran</CardTitle></CardHeader>
            <CardContent className="pt-0 space-y-2">
              {paymentBreak.map(m=> (
                <div key={m.method} className="flex items-center justify-between">
                  <span className="text-xs capitalize text-muted-foreground truncate mr-2">{m.method}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary" style={{width:`${m.pct}%`}} /></div>
                    <span className="text-xs font-semibold w-8 text-right">{m.count}</span>
                  </div>
                </div>
              ))}
              {paymentBreak.length===0 && <p className="text-xs text-muted-foreground">Belum ada transaksi</p>}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Top products & customers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="py-0 overflow-hidden">
          <CardHeader className="py-5 flex flex-row items-center justify-between">
            <CardTitle className="text-sm uppercase tracking-tight">Produk Terlaris (Pendapatan)</CardTitle>
            <Badge variant="outline" className="text-xs">{topProducts.length} item</Badge>
          </CardHeader>
          <CardContent className="p-0">
            {topProducts.length===0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">Belum ada penjualan pada periode ini</div>
            ) : (
              <div className="divide-y">
                {topProducts.map((p,idx)=> {
                  const maxQty = Math.max(...topProducts.map(x=>x.qty))
                  return (
                    <div key={idx} className="flex items-center gap-3 px-5 py-3.5">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${idx===0?'bg-amber-500 text-white': idx===1?'bg-zinc-400 text-white': idx===2?'bg-amber-700 text-white':'bg-muted text-muted-foreground'}`}>{idx+1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{p.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden max-w-[120px]"><div className="h-full bg-primary" style={{width:`${(p.qty / maxQty)*100}%`}} /></div>
                          <span className="text-xs text-muted-foreground">{p.qty} terjual</span>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-primary whitespace-nowrap">{formatRupiah(p.revenue)}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="py-0 overflow-hidden">
          <CardHeader className="py-5 flex flex-row items-center justify-between">
            <CardTitle className="text-sm uppercase tracking-tight">Pelanggan Ter loyal</CardTitle>
            <Badge variant="outline" className="text-xs">{totalCustomers} pelanggan</Badge>
          </CardHeader>
          <CardContent className="p-0">
            {topCustomers.length===0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">Belum ada pelanggan</div>
            ) : (
              <div className="divide-y">
                {topCustomers.map((c,i)=> (
                  <div key={i} className="flex items-center gap-3 px-5 py-3.5">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{String(c.name||'?').slice(0,2).toUpperCase()}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{c.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{c.email || `${c.orders} transaksi`}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{formatRupiah(c.spent)}</p>
                      <p className="text-xs text-muted-foreground">{c.orders} pesanan</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Category + orders per day */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="py-0">
          <CardHeader className="py-5"><CardTitle className="text-sm uppercase tracking-tight">Sebaran Kategori Produk</CardTitle></CardHeader>
          <CardContent className="pt-0 space-y-3">
            {categoryDist.length===0 ? <p className="text-xs text-muted-foreground">Belum ada kategori</p> : categoryDist.map(c=> (
              <div key={c.name}>
                <div className="flex justify-between text-xs mb-1"><span className="truncate mr-2">{c.name}</span><span className="font-semibold">{c.count}</span></div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary" style={{width:`${c.pct}%`}} /></div>
              </div>
            ))}
            <p className="text-xs text-muted-foreground pt-2">{products.length} total produk · {categories.length} kategori</p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 py-0">
          <CardHeader className="py-5"><CardTitle className="text-sm uppercase tracking-tight">Volume Pesanan Harian</CardTitle></CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-end gap-1.5 h-40 px-1">
              {daily.map((d,i)=> (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[11px] font-medium">{d.count || ''}</span>
                  <div className="w-full max-w-[32px] rounded-t bg-secondary hover:bg-primary/60 transition-colors" style={{ height: `${(d.count / maxCount)*100}%`, minHeight: d.count? 8 : 2, background: d.count? undefined : 'hsl(var(--muted))' }} />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 px-1">{daily.map((d,i)=> <span key={i} className="text-[10px] text-muted-foreground flex-1 text-center truncate">{d.label}</span>)}</div>
            <div className="flex gap-4 mt-4 text-xs border-t pt-3">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-secondary inline-block" /> Pesanan</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-primary/20 inline-block border border-primary/30" /> Pendapatan</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent orders analytics table */}
      <Card className="overflow-hidden py-0">
        <CardHeader className="py-5 flex flex-row items-center justify-between">
          <CardTitle className="text-sm uppercase tracking-tight">Rincian Pesanan Periode Ini</CardTitle>
          <span className="text-xs text-muted-foreground">{filtered.length} pesanan · {filtered.filter(isSuccess).length} sukses</span>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-xs">Tanggal</TableHead>
                  <TableHead className="text-xs">Order ID</TableHead>
                  <TableHead className="text-xs">Pelanggan</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  [1,2,3,4].map(i=> <TableRow key={i}><TableCell colSpan={5}><div className="h-4 bg-muted rounded animate-pulse" /></TableCell></TableRow>)
                ) : filtered.length===0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-12 text-sm text-muted-foreground">Tidak ada pesanan pada periode ini.</TableCell></TableRow>
                ) : filtered.slice(0,12).map(o=> {
                  const name = o.profiles?.full_name || o.raw_response?.customer?.firstName || o.raw_response?.customer_details?.first_name || o.profiles?.email?.split('@')[0] || '-'
                  return (
                    <TableRow key={o.id}>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{o.created_at ? new Date(o.created_at).toLocaleDateString('id-ID', { day:'2-digit', month:'short', year:'numeric'}) : '-'}</TableCell>
                      <TableCell className="font-mono text-xs font-semibold">{o.order_id || String(o.id).slice(0,8)}</TableCell>
                      <TableCell className="text-sm truncate max-w-[140px]">{name}</TableCell>
                      <TableCell><Badge variant={statusVariant(o.status)} className="text-[11px] capitalize">{statusLabel(o.status)}</Badge></TableCell>
                      <TableCell className="text-sm font-semibold text-right whitespace-nowrap">{formatRupiah(o.gross_amount||0)}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
          {filtered.length>12 && <div className="p-3 text-center text-xs text-muted-foreground border-t">+{filtered.length-12} pesanan lainnya — ekspor CSV untuk data lengkap</div>}
        </CardContent>
      </Card>

      <div className="mt-6 flex flex-wrap gap-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"/> Sukses = paid / success / shipped / completed</span>
        <span className="hidden sm:inline">·</span>
        <span>Data diperbarui {new Date().toLocaleString('id-ID')}</span>
      </div>
    </>
  )
}
