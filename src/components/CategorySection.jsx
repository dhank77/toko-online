import { useState, useEffect } from 'react'
import { api } from '../utils/api'
import SectionHeader from './SectionHeader'

export default function CategorySection() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    const load = async () => {
      try {
        const data = await api.getCategories()
        if (active) {
          setCategories(data)
        }
      } catch {
        if (active) {
          setCategories([])
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      active = false
    }
  }, [])

  return (
    <section id="kategori" className="py-10 scroll-mt-24">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeader title="Kategori Pilihan" actionLabel="Lihat Semuanya" />

        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-x-2 gap-y-6">
          {loading
            ? Array.from({ length: 10 }).map((_, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2 animate-pulse">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-muted" />
                  <div className="h-3 w-12 bg-muted rounded" />
                </div>
              ))
            : categories.slice(0, 20).map((cat) => (
                <button key={cat.id} type="button" className="flex flex-col items-center gap-2 group cursor-pointer">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-muted border-2 border-transparent group-hover:border-secondary transition-all flex items-center justify-center overflow-hidden">
                    <span className="material-symbols-outlined text-3xl md:text-4xl text-primary group-hover:scale-110 transition-transform">
                      {cat.icon || 'category'}
                    </span>
                  </div>
                  <span className="text-xs md:text-sm font-medium text-foreground text-center leading-tight line-clamp-2">
                    {cat.name}
                  </span>
                </button>
              ))}
        </div>
      </div>
    </section>
  )
}
