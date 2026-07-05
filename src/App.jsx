import { useEffect } from 'react'
import { CartProvider, useCart } from './context/CartContext'
import TopNavBar from './components/TopNavBar'
import HeroSection from './components/HeroSection'
import CategorySection from './components/CategorySection'
import TrendingProducts from './components/TrendingProducts'
import FlashSale from './components/FlashSale'
import NewArrivals from './components/NewArrivals'
import Footer from './components/Footer'

function NavWithCart() {
  const { count } = useCart()

  return (
    <TopNavBar cartCount={count} />
  )
}

export default function App() {
  useEffect(() => {
    let h = 12,
      m = 45,
      s = 8
    const hElem = document.getElementById('hours')
    const mElem = document.getElementById('minutes')
    const sElem = document.getElementById('seconds')

    const timer = setInterval(() => {
      s--
      if (s < 0) {
        s = 59
        m--
      }
      if (m < 0) {
        m = 59
        h--
      }
      if (h < 0) {
        h = 23
      }

      if (hElem) hElem.textContent = h.toString().padStart(2, '0')
      if (mElem) mElem.textContent = m.toString().padStart(2, '0')
      if (sElem) sElem.textContent = s.toString().padStart(2, '0')
    }, 1000)

    const handleScroll = () => {
      const header = document.querySelector('header')
      if (header) {
        if (window.scrollY > 50) {
          header.classList.add('shadow-md')
          header.classList.remove('shadow-sm')
        } else {
          header.classList.remove('shadow-md')
          header.classList.add('shadow-sm')
        }
      }
    }

    window.addEventListener('scroll', handleScroll)

    return () => {
      clearInterval(timer)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <CartProvider>
      <NavWithCart />
      <main className="pt-20">
        <HeroSection />
        <CategorySection />
        <TrendingProducts />
        <FlashSale />
        <NewArrivals />
      </main>
      <Footer />
    </CartProvider>
  )
}
