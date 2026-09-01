import { getProducts } from '../lib/supabase'
import { useCart } from '../context/CartContext'
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import toast from 'react-hot-toast'

export default function TrendingProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const { addItem, isAuthed } = useCart()
  const navigate = useNavigate()

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
          <span key={i} className="material-symbols-outlined text-sm text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
            star
          </span>
        )
      } else if (i - 0.5 === rating) {
        stars.push(
          <span key={i} className="material-symbols-outlined text-sm text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
            star_half
          </span>
        )
      } else {
        stars.push(
          <span key={i} className="material-symbols-outlined text-sm text-muted-foreground">
            star
          </span>
        )
      }
    }
    return stars
  }

  return (
    <section className="py-10 bg-muted/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-primary">Trending Now</h2>
            <p className="text-muted-foreground text-sm">
              Selected by our community of professional shoppers.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" className="rounded-full">
              <span className="material-symbols-outlined">arrow_back</span>
            </Button>
            <Button variant="outline" size="icon" className="rounded-full">
              <span className="material-symbols-outlined">arrow_forward</span>
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="bg-background rounded-2xl overflow-hidden animate-pulse">
                <div className="h-64 bg-muted" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/4" />
                  <div className="h-8 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-background rounded-2xl overflow-hidden group cursor-pointer hover:shadow-md transition-all">
                <Link to={`/product/${product.slug}`} className="relative h-64 overflow-hidden block">
                  <img
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    data-alt={`Product image for ${product.name}`}
                    src={product.image_url}
                  />
                  <Button variant="secondary" size="icon" className="absolute top-4 right-4 rounded-full" onClick={(e) => e.preventDefault()}>
                    <span className="material-symbols-outlined">favorite</span>
                  </Button>
                  {product.badge && (
                    <Badge variant="secondary" className="absolute bottom-4 left-4">
                      {product.badge}
                    </Badge>
                  )}
                </Link>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <Link to={`/product/${product.slug}`} className="font-semibold text-foreground text-lg hover:text-primary transition-colors">
                      {product.name}
                    </Link>
                    <span className="font-bold text-primary">${Number(product.price).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-1 mb-4">
                    <div className="flex text-secondary">{renderStars(product.rating)}</div>
                    <span className="text-xs text-muted-foreground">({product.review_count} reviews)</span>
                  </div>
                  <Button
                    onClick={async () => {
                      if (!isAuthed) {
                        toast.error('Please login to add items to your cart')
                        navigate('/login')
                        return
                      }
                      await addItem({ productId: product.id, variantId: null, quantity: 1 })
                      toast.success(`${product.name} added to cart`)
                    }}
                    className="w-full border border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                    variant="outline"
                  >
                    Add to Cart
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
