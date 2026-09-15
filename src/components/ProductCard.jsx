import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import { useCart } from '../context/CartContext'
import { cn, formatRupiah, getPseudoDiscount, getOriginalPrice } from '../lib/utils'

export function ProductCardSkeleton({ className }) {
  return (
    <div className={cn('bg-card rounded-2xl overflow-hidden border border-border animate-pulse', className)}>
      <div className="aspect-square bg-muted" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-4 bg-muted rounded w-1/3" />
        <div className="h-3 bg-muted rounded w-1/2" />
        <div className="h-8 bg-muted rounded" />
      </div>
    </div>
  )
}

export default function ProductCard({ product, showDiscount = false, className }) {
  const { addItem, isAuthed } = useCart()
  const navigate = useNavigate()
  const [liked, setLiked] = useState(false)

  const discount = showDiscount ? getPseudoDiscount(product) : 0
  const originalPrice = discount > 0 ? getOriginalPrice(product.price, discount) : null

  const handleAddToCart = async () => {
    if (!isAuthed) {
      toast.error('Silakan login untuk menambahkan item ke keranjang')
      navigate('/login')
      return
    }
    try {
      await addItem({
        productId: product.id,
        variantId: null,
        quantity: 1,
        name: product.name,
        image: product.image_url,
        price: product.price,
      })
      toast.success(`${product.name} ditambahkan ke keranjang`)
    } catch (err) {
      console.error('Add to cart failed:', err)
      toast.error(err?.message || 'Gagal menambahkan ke keranjang, coba lagi')
    }
  }

  return (
    <div
      className={cn(
        'group bg-card rounded-2xl overflow-hidden border border-border hover:shadow-md hover:border-secondary/50 transition-all flex flex-col',
        className
      )}
    >
      <Link to={`/product/${product.slug}`} className="relative block aspect-square bg-muted overflow-hidden">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {discount > 0 ? (
          <span className="absolute top-3 left-3 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-0.5 rounded-md">
            {discount}%
          </span>
        ) : product.badge ? (
          <span className="absolute top-3 left-3 bg-secondary text-secondary-foreground text-xs font-semibold px-2 py-0.5 rounded-md">
            {product.badge}
          </span>
        ) : null}
        <button
          type="button"
          aria-label="Tambah ke wishlist"
          onClick={(e) => {
            e.preventDefault()
            setLiked((v) => !v)
          }}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-background/80 backdrop-blur flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
        >
          <span
            className="material-symbols-outlined text-lg"
            style={liked ? { fontVariationSettings: "'FILL' 1" } : undefined}
          >
            favorite
          </span>
        </button>
      </Link>

      <div className="p-3 flex flex-col flex-1">
        <Link
          to={`/product/${product.slug}`}
          className="text-sm font-medium text-foreground line-clamp-2 leading-snug mb-2 hover:text-primary transition-colors"
        >
          {product.name}
        </Link>
        <div className="flex items-baseline gap-2 mb-1.5">
          <span className="font-bold text-primary">{formatRupiah(product.price)}</span>
          {originalPrice && (
            <span className="text-xs text-muted-foreground line-through">{formatRupiah(originalPrice)}</span>
          )}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
          <span
            className="material-symbols-outlined text-sm text-secondary"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            star
          </span>
          <span className="font-medium text-foreground">{Number(product.rating || 0).toFixed(1)}</span>
          <span>· Terjual {product.review_count ?? 0}</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddToCart}
          className="w-full mt-auto border-border text-primary hover:bg-primary hover:text-primary-foreground gap-1.5"
        >
          <span className="material-symbols-outlined text-base">add_shopping_cart</span>
          Keranjang
        </Button>
      </div>
    </div>
  )
}
