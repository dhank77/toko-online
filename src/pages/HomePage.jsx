import HeroCarousel from '../components/HeroCarousel'
import CategorySection from '../components/CategorySection'
import FlashSale from '../components/FlashSale'
import TrendingProducts from '../components/TrendingProducts'
import NewArrivals from '../components/NewArrivals'
import ProductFeed from '../components/ProductFeed'

// Struktur mengikuti pola homepage Tokopedia:
// Hero carousel -> Kategori Pilihan -> Flash Sale (countdown) -> Trending -> Baru -> Rekomendasi (feed)
export default function HomePage() {
  return (
    <main className="pt-20">
      <HeroCarousel />
      <CategorySection />
      <FlashSale />
      <TrendingProducts />
      <NewArrivals />
      <ProductFeed />
    </main>
  )
}
