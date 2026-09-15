import { useEffect, useState } from 'react'
import { getProducts } from '../lib/supabase'
import { Button } from '@/components/ui/button'
import SectionHeader from './SectionHeader'
import ProductCard, { ProductCardSkeleton } from './ProductCard'

const PAGE_SIZE = 20

export default function ProductFeed() {
  const [products, setProducts] = useState([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  useEffect(() => {
    let active = true
    getProducts(1, PAGE_SIZE)
      .then((res) => {
        if (!active) return
        setProducts(res.data)
        setHasMore(res.pagination.page < res.pagination.totalPages)
        setInitialLoading(false)
      })
      .catch(() => {
        if (active) setInitialLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const loadMore = async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    try {
      const nextPage = page + 1
      const res = await getProducts(nextPage, PAGE_SIZE)
      setProducts((prev) => [...prev, ...res.data])
      setPage(nextPage)
      setHasMore(res.pagination.page < res.pagination.totalPages)
    } catch {
      // Biarkan produk yang sudah ada tetap tampil saat gagal memuat halaman berikutnya
    } finally {
      setLoadingMore(false)
    }
  }

  return (
    <section id="rekomendasi" className="py-10 scroll-mt-24">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeader title="Rekomendasi Untukmu" actionLabel="" />

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
          {initialLoading
            ? Array.from({ length: PAGE_SIZE }).map((_, idx) => <ProductCardSkeleton key={idx} />)
            : products.map((product) => <ProductCard key={product.id} product={product} />)}
          {loadingMore &&
            Array.from({ length: 5 }).map((_, idx) => <ProductCardSkeleton key={`more-${idx}`} />)}
        </div>

        {hasMore && !initialLoading && (
          <div className="flex justify-center mt-8">
            <Button variant="outline" size="lg" onClick={loadMore} disabled={loadingMore}>
              {loadingMore ? 'Memuat...' : 'Muat Lebih Banyak'}
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}
