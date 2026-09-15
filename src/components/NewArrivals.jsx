import { useState, useEffect } from 'react'
import { getProducts } from '../lib/supabase'
import SectionHeader from './SectionHeader'
import ProductRow from './ProductRow'
import ProductCard, { ProductCardSkeleton } from './ProductCard'

const CARD_WIDTH = 'w-[160px] sm:w-[200px] lg:w-[228px] flex-shrink-0 snap-start'

export default function NewArrivals() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    // Halaman 2 dipakai agar produknya tidak sama persis dengan Flash Sale & Trending (keduanya memakai halaman 1).
    getProducts(2, 8)
      .then((res) => {
        if (active) {
          setProducts(res.data)
          setLoading(false)
        }
      })
      .catch(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  return (
    <section id="baru" className="py-10 bg-muted/40 scroll-mt-24">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeader title="Baru di ShopComposed" subtitle="Produk paling baru dari brand pilihan." />

        <ProductRow>
          {loading
            ? Array.from({ length: 6 }).map((_, idx) => <ProductCardSkeleton key={idx} className={CARD_WIDTH} />)
            : products.map((product) => <ProductCard key={product.id} product={product} className={CARD_WIDTH} />)}
        </ProductRow>
      </div>
    </section>
  )
}
