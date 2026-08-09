import HeroSection from '../components/HeroSection'
import CategorySection from '../components/CategorySection'
import TrendingProducts from '../components/TrendingProducts'
import FlashSale from '../components/FlashSale'
import NewArrivals from '../components/NewArrivals'
import TrustedBy from '../components/TrustedBy'

export default function HomePage() {
  return (
    <main className="pt-20">
      <HeroSection />
      <TrustedBy />
      <CategorySection />
      <TrendingProducts />
      <FlashSale />
      <NewArrivals />
    </main>
  )
}
