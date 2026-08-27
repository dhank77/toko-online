import { useState, useEffect } from 'react'
import { api } from '../utils/api'
import { Button } from '@/components/ui/button'

export default function CategorySection() {
  const [categories, setCategories] = useState([])

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
      }
    }

    load()

    return () => {
      active = false
    }
  }, [])

  return (
    <section className="py-8 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-4 flex justify-between items-end">
        <h2 className="text-2xl font-bold text-primary">Browse Categories</h2>
        <Button variant="ghost" size="sm" className="text-secondary hover:text-secondary/80">
          View All <span className="material-symbols-outlined text-sm">chevron_right</span>
        </Button>
      </div>
      <div className="flex gap-4 overflow-x-auto no-scrollbar px-6 pb-4">
        {categories.map((cat) => (
          <div key={cat.id} className="flex-shrink-0 w-32 flex flex-col items-center gap-3 group cursor-pointer">
            <div className="w-24 h-24 rounded-full bg-muted border-2 border-transparent group-hover:border-secondary transition-all flex items-center justify-center overflow-hidden">
              <span className="material-symbols-outlined text-4xl text-primary group-hover:scale-110 transition-transform">
                {cat.icon || 'category'}
              </span>
            </div>
            <span className="text-sm font-medium text-foreground">{cat.name}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
