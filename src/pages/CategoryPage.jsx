import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getProducts, getCategories } from '../lib/supabase'
import { Button } from '@/components/ui/button'
import ProductCard, { ProductCardSkeleton } from '../components/ProductCard'

const PAGE_SIZE = 20

const SORT_OPTIONS = [
  { value: 'newest', label: 'Paling Baru', sort: 'created_at', order: 'desc' },
  { value: 'popular', label: 'Paling Populer', sort: 'rating', order: 'desc' },
  { value: 'cheapest', label: 'Harga Terendah', sort: 'price', order: 'asc' },
  { value: 'expensive', label: 'Harga Tertinggi', sort: 'price', order: 'desc' },
  { value: 'name', label: 'Nama A-Z', sort: 'name', order: 'asc' },
]

export default function CategoryPage() {
  const { slug } = useParams()
  const [category, setCategory] = useState(null)
  const [catLoading, setCatLoading] = useState(true)
  const [products, setProducts] = useState([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [total, setTotal] = useState(0)
  const [initialLoading, setInitialLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [sortKey, setSortKey] = useState('newest')

  // Selalu mulai dari atas saat buka / pindah kategori
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [slug])

  useEffect(() => {
    let active = true
    setCatLoading(true)
    getCategories()
      .then((data) => {
        if (!active) return
        const found = (data || []).find((c) => c.slug === slug || String(c.id) === String(slug))
        setCategory(found || null)
        setCatLoading(false)
      })
      .catch(() => {
        if (active) setCatLoading(false)
      })
    return () => {
      active = false
    }
  }, [slug])

  const activeSort = SORT_OPTIONS.find((o) => o.value === sortKey) || SORT_OPTIONS[0]

  useEffect(() => {
    if (catLoading) return
    let active = true
    setInitialLoading(true)
    setProducts([])
    setPage(1)
    setHasMore(false)
    const filter = category ? { category: category.id } : { category_slug: slug }
    getProducts(1, PAGE_SIZE, { ...filter, sort: activeSort.sort, order: activeSort.order })
      .then((res) => {
        if (!active) return
        setProducts(res.data || [])
        setTotal(res.pagination?.total ?? (res.data || []).length)
        setHasMore(res.pagination ? res.pagination.page < res.pagination.totalPages : false)
        setInitialLoading(false)
      })
      .catch(() => {
        if (active) setInitialLoading(false)
      })
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, category?.id, catLoading, sortKey])

  const loadMore = async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    try {
      const nextPage = page + 1
      const filter = category ? { category: category.id } : { category_slug: slug }
      const res = await getProducts(nextPage, PAGE_SIZE, {
        ...filter,
        sort: activeSort.sort,
        order: activeSort.order,
      })
      setProducts((prev) => [...prev, ...(res.data || [])])
      setPage(nextPage)
      setTotal(res.pagination?.total ?? total)
      setHasMore(res.pagination ? res.pagination.page < res.pagination.totalPages : false)
    } catch {
      // Biarkan produk yang sudah ada tetap tampil
    } finally {
      setLoadingMore(false)
    }
  }

  const title = catLoading ? 'Memuat kategori...' : category ? category.name : slug?.replace(/-/g, ' ')

  return (
    <main className="pt-20 min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary transition-colors">Beranda</Link>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-foreground font-medium capitalize">{title}</span>
        </nav>

        <div className="flex flex-wrap items-center gap-4 mb-8">
          <span className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-3xl">{category?.icon || 'category'}</span>
          </span>
          <div className="min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground capitalize leading-tight">{title}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {initialLoading ? 'Memuat produk...' : `${total} produk ditemukan`}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <label htmlFor="sort" className="text-sm text-muted-foreground hidden sm:block">Urutkan:</label>
            <select
              id="sort"
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value)}
              className="h-10 rounded-full border border-border bg-card px-4 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {initialLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
            {Array.from({ length: PAGE_SIZE }).map((_, idx) => (
              <ProductCardSkeleton key={idx} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-2xl bg-card">
            <span className="material-symbols-outlined text-6xl text-muted-foreground/50 mb-4">package_2</span>
            <h2 className="text-lg font-semibold text-foreground">Belum ada produk di kategori ini</h2>
            <p className="text-sm text-muted-foreground mt-1 mb-6 max-w-sm">
              Coba jelajahi kategori lain atau kembali ke beranda untuk melihat rekomendasi produk.
            </p>
            <Button asChild>
              <Link to="/">Kembali ke Beranda</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
              {loadingMore &&
                Array.from({ length: 5 }).map((_, idx) => (
                  <ProductCardSkeleton key={`more-${idx}`} />
                ))}
            </div>
            {hasMore && (
              <div className="flex justify-center mt-10">
                <Button variant="outline" size="lg" onClick={loadMore} disabled={loadingMore}>
                  {loadingMore ? 'Memuat...' : 'Muat Lebih Banyak'}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}
