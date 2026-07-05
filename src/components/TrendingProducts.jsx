import { getProducts } from '../lib/supabase'
import { useCart } from '../context/CartContext'
import { useState, useEffect } from 'react'

export default function TrendingProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const { addItem } = useCart()

  useEffect(() => {
    getProducts()
      .then((data) => {
        setProducts(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const renderStars = (rating) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(
          <span key={i} className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
            star
          </span>
        )
      } else if (i - 0.5 === rating) {
        stars.push(
          <span key={i} className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
            star_half
          </span>
        )
      } else {
        stars.push(
          <span key={i} className="material-symbols-outlined text-sm">
            star
          </span>
        )
      }
    }
    return stars
  }

  return (
    <section className="py-lg bg-surface-container-low">
      <div className="max-w-container-max mx-auto px-gutter">
        <div className="flex justify-between items-center mb-lg">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-primary">Trending Now</h2>
            <p className="text-on-surface-variant font-body-md text-body-md">
              Selected by our community of professional shoppers.
            </p>
          </div>
          <div className="flex gap-2">
            <button className="w-12 h-12 rounded-full border border-outline-variant flex items-center justify-center hover:bg-surface transition-all">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <button className="w-12 h-12 rounded-full border border-outline-variant flex items-center justify-center hover:bg-surface transition-all">
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="bg-surface rounded-2xl overflow-hidden animate-pulse">
                <div className="h-64 bg-surface-variant" />
                <div className="p-sm space-y-2">
                  <div className="h-4 bg-surface-variant rounded w-3/4" />
                  <div className="h-4 bg-surface-variant rounded w-1/4" />
                  <div className="h-8 bg-surface-variant rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
            {products.map((product) => (
              <div key={product.id} className="bg-surface rounded-2xl overflow-hidden ambient-card group cursor-pointer hover:elevated-card transition-all">
                <div className="relative h-64 overflow-hidden">
                  <img
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    data-alt={`Product image for ${product.name}`}
                    src={product.image_url}
                  />
                  <button className="absolute top-4 right-4 w-10 h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all">
                    <span className="material-symbols-outlined">favorite</span>
                  </button>
                  {product.badge && (
                    <span className="absolute bottom-4 left-4 bg-secondary-fixed text-on-secondary-fixed text-label-sm px-2 py-1 rounded">
                      {product.badge}
                    </span>
                  )}
                </div>
                <div className="p-sm">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-headline-md text-body-lg font-bold text-on-surface">{product.name}</h3>
                    <span className="font-bold text-primary">${Number(product.price).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-1 mb-4">
                    <div className="flex text-secondary">{renderStars(product.rating)}</div>
                    <span className="text-label-sm text-on-surface-variant">({product.review_count} reviews)</span>
                  </div>
                  <button
                    onClick={() => addItem({ id: product.id, name: product.name, price: `$${Number(product.price).toFixed(2)}`, image: product.image_url })}
                    className="w-full border border-primary text-primary py-2 rounded-xl font-label-md hover:bg-primary hover:text-on-primary transition-all"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
