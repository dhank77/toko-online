import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getProductBySlug } from '../lib/supabase'
import { api } from '../utils/api'
import { useCart } from '../context/CartContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import toast from 'react-hot-toast'

export default function ProductDetail() {
  const { slug } = useParams()
  const [product, setProduct] = useState(null)
  const [variants, setVariants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const { addItem, isAuthed } = useCart()

  useEffect(() => {
    setLoading(true)
    setError(null)
    getProductBySlug(slug)
      .then(async (data) => {
        setProduct(data)
        try {
          const vars = await api.getVariants(data.id)
          setVariants(vars || [])
          if (vars && vars.length > 0) setSelectedVariant(vars[0])
        } catch {
          setVariants([])
        }
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message || 'Product not found')
        setLoading(false)
      })
  }, [slug])

  const renderStars = (rating) => {
    const stars = []
    const r = Number(rating) || 0
    for (let i = 1; i <= 5; i++) {
      if (i <= r) {
        stars.push(
          <span key={i} className="material-symbols-outlined text-sm text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
            star
          </span>
        )
      } else if (i - 0.5 === r) {
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

  const handleAddToCart = async () => {
    if (!isAuthed) {
      toast.error('Please login to add items to your cart')
      return
    }
    try {
      await addItem({
        productId: product.id,
        variantId: selectedVariant?.id || null,
        variant: selectedVariant?.name || null,
        quantity: 1,
      })
      toast.success(`${product.name} added to cart`)
    } catch (err) {
      toast.error(err?.message || 'Failed to add to cart')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-pulse">
            <div className="lg:col-span-7 space-y-4">
              <div className="h-[500px] bg-muted rounded-2xl" />
              <div className="flex gap-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-20 h-20 bg-muted rounded-lg" />
                ))}
              </div>
            </div>
            <div className="lg:col-span-5 space-y-6">
              <div className="h-8 bg-muted rounded w-1/3" />
              <div className="h-10 bg-muted rounded w-3/4" />
              <div className="h-12 bg-muted rounded w-1/3" />
              <div className="h-32 bg-muted rounded-xl" />
              <div className="h-14 bg-muted rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-16 flex items-center justify-center">
        <div className="text-center space-y-4">
          <span className="material-symbols-outlined text-6xl text-muted-foreground">error</span>
          <h2 className="text-xl font-semibold text-foreground">Product Not Found</h2>
          <p className="text-muted-foreground">{error || 'The product you are looking for does not exist.'}</p>
          <Button asChild>
            <Link to="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    )
  }

  const images = product.image_url ? [product.image_url] : []
  const currentPrice = selectedVariant
    ? Number(product.price) + Number(selectedVariant.price_adjustment || 0)
    : Number(product.price)

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          {product.categories?.name && (
            <>
              <span className="text-foreground">{product.categories.name}</span>
              <span>/</span>
            </>
          )}
          <span className="text-foreground font-medium">{product.name}</span>
        </nav>

        {/* Product Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Gallery */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative rounded-2xl overflow-hidden bg-muted/30 border border-border group cursor-crosshair h-[400px] sm:h-[500px]">
              <img
                src={images[selectedImage] || product.image_url}
                alt={product.name}
                className="w-full h-full object-contain p-8 transition-transform duration-300 group-hover:scale-150"
                style={{ transformOrigin: 'var(--zoom-x, center) var(--zoom-y, center)' }}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.parentElement.getBoundingClientRect()
                  const x = ((e.clientX - rect.left) / rect.width) * 100
                  const y = ((e.clientY - rect.top) / rect.height) * 100
                  e.currentTarget.style.setProperty('--zoom-x', `${x}%`)
                  e.currentTarget.style.setProperty('--zoom-y', `${y}%`)
                }}
              />
              {product.badge && (
                <Badge variant="secondary" className="absolute top-4 left-4">
                  {product.badge}
                </Badge>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="lg:col-span-5 space-y-6">
            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex text-secondary">{renderStars(product.rating)}</div>
              <span className="text-sm text-muted-foreground">
                ({Number(product.rating || 0).toFixed(1)}/5) — {product.review_count || 0} Reviews
              </span>
            </div>

            {/* Title & Price */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">{product.name}</h1>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-primary">${currentPrice.toFixed(2)}</span>
                {product.in_stock ? (
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-0">In Stock</Badge>
                ) : (
                  <Badge variant="destructive">Out of Stock</Badge>
                )}
              </div>
            </div>

            {/* Category */}
            {product.categories && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="material-symbols-outlined text-base">category</span>
                <span>{product.categories.name}</span>
              </div>
            )}

            {/* Variants */}
            {variants.length > 0 && (
              <div className="space-y-3">
                <span className="text-sm font-semibold text-foreground uppercase tracking-wider">Variant</span>
                <div className="flex flex-wrap gap-2">
                  {variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                        selectedVariant?.id === v.id
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border text-muted-foreground hover:border-primary/50'
                      }`}
                    >
                      {v.name}
                      {Number(v.price_adjustment) !== 0 && (
                        <span className="ml-1 text-xs opacity-70">
                          ({Number(v.price_adjustment) > 0 ? '+' : ''}${Number(v.price_adjustment).toFixed(2)})
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {product.description && (
              <div className="bg-muted/50 rounded-xl p-4 border border-border">
                <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">info</span>
                  Description
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleAddToCart}
                className="flex-[2] py-6 text-base font-semibold"
                disabled={!product.in_stock}
              >
                <span className="material-symbols-outlined mr-2">shopping_cart</span>
                Add to Cart
              </Button>
              <Button
                onClick={handleAddToCart}
                variant="secondary"
                className="flex-1 py-6 text-base font-semibold"
                disabled={!product.in_stock}
              >
                Buy Now
              </Button>
            </div>
          </div>
        </div>

        {/* Product Description Full */}
        {product.description && (
          <div className="mt-16 grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8">
              <div className="border-b border-border pb-6 mb-6">
                <h2 className="text-xl font-bold text-foreground mb-4">About this product</h2>
                <p className="text-muted-foreground leading-relaxed">{product.description}</p>
              </div>
            </div>
            <div className="lg:col-span-4 bg-muted/50 p-6 rounded-xl border border-border self-start">
              <h3 className="font-semibold text-foreground mb-4">Product Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-sm text-muted-foreground">Category</span>
                  <span className="text-sm font-medium text-foreground">{product.categories?.name || '-'}</span>
                </div>
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-sm text-muted-foreground">Availability</span>
                  <span className="text-sm font-medium text-foreground">{product.in_stock ? 'In Stock' : 'Out of Stock'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Rating</span>
                  <span className="text-sm font-medium text-foreground">{Number(product.rating || 0).toFixed(1)} / 5</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Sticky Add to Cart */}
      <div className="md:hidden fixed bottom-0 left-0 w-full p-4 bg-background border-t border-border z-40 flex gap-3 items-center shadow-2xl">
        <Button onClick={handleAddToCart} className="flex-1 py-5" disabled={!product.in_stock}>
          Add to Cart
        </Button>
        <Button variant="ghost" size="icon" className="border border-border">
          <span className="material-symbols-outlined">favorite</span>
        </Button>
      </div>
    </div>
  )
}
