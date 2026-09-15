import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '../lib/utils'

export default function ProductRow({ children, className }) {
  const trackRef = useRef(null)

  const scroll = (dir) => {
    const el = trackRef.current
    if (!el) return
    el.scrollBy({ left: dir * Math.round(el.clientWidth * 0.8), behavior: 'smooth' })
  }

  return (
    <div className={cn('relative', className)}>
      <div
        ref={trackRef}
        className="flex gap-3 md:gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2"
      >
        {children}
      </div>

      <Button
        variant="outline"
        size="icon"
        aria-label="Geser ke kiri"
        onClick={() => scroll(-1)}
        className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 rounded-full bg-background shadow-md z-10"
      >
        <span className="material-symbols-outlined">chevron_left</span>
      </Button>
      <Button
        variant="outline"
        size="icon"
        aria-label="Geser ke kanan"
        onClick={() => scroll(1)}
        className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 rounded-full bg-background shadow-md z-10"
      >
        <span className="material-symbols-outlined">chevron_right</span>
      </Button>
    </div>
  )
}
