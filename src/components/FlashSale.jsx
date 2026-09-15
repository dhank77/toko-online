import { useState, useEffect } from 'react'
import { getProducts } from '../lib/supabase'
import { Button } from '@/components/ui/button'
import SectionHeader from './SectionHeader'
import ProductRow from './ProductRow'
import ProductCard, { ProductCardSkeleton } from './ProductCard'

const CARD_WIDTH = 'w-[160px] sm:w-[200px] lg:w-[224px] flex-shrink-0 snap-start'

function calcMsLeft() {
  const now = new Date()
  const midnight = new Date(now)
  midnight.setHours(24, 0, 0, 0)
  return midnight.getTime() - now.getTime()
}

function useCountdownToMidnight() {
  const [msLeft, setMsLeft] = useState(calcMsLeft)

  useEffect(() => {
    const id = setInterval(() => setMsLeft(calcMsLeft()), 1000)
    return () => clearInterval(id)
  }, [])

  const totalSeconds = Math.floor(msLeft / 1000)
  return {
    hours: String(Math.floor(totalSeconds / 3600)).padStart(2, '0'),
    minutes: String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0'),
    seconds: String(totalSeconds % 60).padStart(2, '0'),
  }
}

function CountdownBox({ value, label }) {
  return (
    <div className="flex flex-col items-center bg-foreground text-background rounded-lg px-2.5 py-1.5 min-w-12">
      <span className="text-base font-bold leading-none tabular-nums">{value}</span>
      <span className="text-[10px] opacity-80 mt-0.5">{label}</span>
    </div>
  )
}

export default function FlashSale() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const { hours, minutes, seconds } = useCountdownToMidnight()

  useEffect(() => {
    let active = true
    getProducts(1, 10)
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
    <section id="flash-sale" className="py-10 bg-muted/40 scroll-mt-24">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeader
          title="Flash Sale"
          subtitle="Diskon terbatas, berakhir pukul 00.00"
          right={
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <CountdownBox value={hours} label="Jam" />
                <span className="font-bold text-foreground">:</span>
                <CountdownBox value={minutes} label="Menit" />
                <span className="font-bold text-foreground">:</span>
                <CountdownBox value={seconds} label="Detik" />
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-secondary hover:text-secondary/80 shrink-0 hidden sm:inline-flex"
              >
                Lihat Semuanya <span className="material-symbols-outlined text-sm">chevron_right</span>
              </Button>
            </div>
          }
        />

        <ProductRow>
          {loading
            ? Array.from({ length: 6 }).map((_, idx) => <ProductCardSkeleton key={idx} className={CARD_WIDTH} />)
            : products.map((product) => (
                <ProductCard key={product.id} product={product} showDiscount className={CARD_WIDTH} />
              ))}
        </ProductRow>
      </div>
    </section>
  )
}
