import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getProductBySlug } from '../lib/supabase'
import { api } from '../utils/api'
import { useCart } from '../context/CartContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import toast from 'react-hot-toast'
import { formatRupiah } from '../lib/utils'

export default function ProductDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [variants, setVariants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const [isBuying, setIsBuying] = useState(false)
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
        setError(err.message || 'Produk tidak ditemukan')
        setLoading(false)
      })
  }, [slug])

  const currentPrice = product
    ? selectedVariant
      ? Number(product.price) + Number(selectedVariant.price_adjustment || 0)
      : Number(product.price)
    : 0

  const images = product?.image_url ? [product.image_url] : []

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

  const ensureAuthed = () => {
    if (!isAuthed) {
      toast.error('Silakan login terlebih dahulu')
      navigate('/login')
      return false
    }
    return true
  }

  const handleAddToCart = async () => {
    if (!ensureAuthed()) return
    if (!product) return
    setIsAdding(true)
    try {
      await addItem({
        productId: product.id,
        variantId: selectedVariant?.id || null,
        variant: selectedVariant?.name || null,
        quantity,
        name: product.name,
        image: product.image_url,
        price: currentPrice,
      })
      toast.success(`${product.name} ditambahkan ke keranjang`)
    } catch (err) {
      toast.error(err?.message || 'Gagal menambahkan ke keranjang')
    } finally {
      setIsAdding(false)
    }
  }

  const handleBuyNow = async () => {
    if (!ensureAuthed()) return
    if (!product) return
    setIsBuying(true)
    try {
      await addItem({
        productId: product.id,
        variantId: selectedVariant?.id || null,
        variant: selectedVariant?.name || null,
        quantity,
        name: product.name,
        image: product.image_url,
        price: currentPrice,
      })
      toast.success(`${product.name} ditambahkan — lanjut ke keranjang`)
      navigate('/cart')
    } catch (err) {
      toast.error(err?.message || 'Gagal memproses pembelian')
    } finally {
      setIsBuying(false)
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
          <h2 className="text-xl font-semibold text-foreground">Produk Tidak Ditemukan</h2>
          <p className="text-muted-foreground">{error || 'Produk yang Anda cari tidak ada.'}</p>
          <Button asChild>
            <Link to="/">Kembali ke Beranda</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary transition-colors">Beranda</Link>
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
            <div className="relative rounded-2xl overflow-hidden bg-muted/30 border border-border group cursor-crosshair h-[400px] sm:h-[500px] flex items-center justify-center">
              {images.length > 0 ? (
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
              ) : (
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                  <span className="material-symbols-outlined text-6xl">image_not_supported</span>
                  <span className="text-sm">Tidak ada gambar</span>
                </div>
              )}
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
                 ({Number(product.rating || 0).toFixed(1)}/5) — {product.review_count || 0} Ulasan
              </span>
            </div>

            {/* Title & Price */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">{product.name}</h1>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-primary">{formatRupiah(currentPrice)}</span>
                {product.in_stock ? (
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-0">Stok Tersedia</Badge>
                ) : (
                  <Badge variant="destructive">Stok Habis</Badge>
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
                <span className="text-sm font-semibold text-foreground uppercase tracking-wider">Varian</span>
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
                          ({Number(v.price_adjustment) > 0 ? '+' : ''}{formatRupiah(v.price_adjustment)})
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="space-y-3">
              <span className="text-sm font-semibold text-foreground uppercase tracking-wider">Kuantitas</span>
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-muted rounded-xl border border-border p-1">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-9 h-9 flex items-center justify-center hover:bg-background rounded-lg transition-colors disabled:opacity-40"
                    disabled={quantity <= 1}
                    aria-label="Kurangi jumlah"
                  >
                    <span className="material-symbols-outlined text-lg">remove</span>
                  </button>
                  <span className="w-12 text-center font-semibold text-foreground">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-9 h-9 flex items-center justify-center hover:bg-background rounded-lg transition-colors"
                    aria-label="Tambah jumlah"
                  >
                    <span className="material-symbols-outlined text-lg">add</span>
                  </button>
                </div>
                <span className="text-sm text-muted-foreground">Subtotal: <span className="font-semibold text-foreground">{formatRupiah(currentPrice * quantity)}</span></span>
              </div>
            </div>

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
                disabled={!product.in_stock || isAdding || isBuying}
              >
                {isAdding ? (
                  <span className="material-symbols-outlined mr-2 animate-spin">progress_activity</span>
                ) : (
                  <span className="material-symbols-outlined mr-2">shopping_cart</span>
                )}
                {isAdding ? 'Menambahkan...' : 'Tambah ke Keranjang'}
              </Button>
              <Button
                onClick={handleBuyNow}
                variant="secondary"
                className="flex-1 py-6 text-base font-semibold"
                disabled={!product.in_stock || isAdding || isBuying}
              >
                {isBuying ? (
                  <span className="material-symbols-outlined mr-2 animate-spin">progress_activity</span>
                ) : null}
                {isBuying ? 'Memproses...' : 'Beli Sekarang'}
              </Button>
            </div>
            {!isAuthed && (
              <p className="text-xs text-muted-foreground text-center">
                Kamu belum login. Klik tombol akan mengarahkan ke halaman login.
              </p>
            )}
          </div>
        </div>

        {/* Product Description Full */}
        {product.description && (
          <div className="mt-16 grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8">
              <div className="border-b border-border pb-6 mb-6">
                <h2 className="text-xl font-bold text-foreground mb-4">Tentang produk ini</h2>
                <p className="text-muted-foreground leading-relaxed">{product.description}</p>
              </div>
            </div>
            <div className="lg:col-span-4 bg-muted/50 p-6 rounded-xl border border-border self-start">
              <h3 className="font-semibold text-foreground mb-4">Detail Produk</h3>
              <div className="space-y-3">
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-sm text-muted-foreground">Kategori</span>
                  <span className="text-sm font-medium text-foreground">{product.categories?.name || '-'}</span>
                </div>
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-sm text-muted-foreground">Ketersediaan</span>
                  <span className="text-sm font-medium text-foreground">{product.in_stock ? 'Stok Tersedia' : 'Stok Habis'}</span>
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

      {/* Mobile Sticky Tambah ke Keranjang */}
      <div className="md:hidden fixed bottom-0 left-0 w-full p-4 bg-background border-t border-border z-40 flex gap-3 items-center shadow-2xl">
        <Button onClick={handleAddToCart} className="flex-1 py-5" disabled={!product.in_stock || isAdding || isBuying}>
          {isAdding ? 'Menambahkan...' : 'Tambah ke Keranjang'}
        </Button>
        <Button onClick={handleBuyNow} variant="secondary" className="flex-1 py-5" disabled={!product.in_stock || isAdding || isBuying}>
          {isBuying ? 'Memproses...' : 'Beli Sekarang'}
        </Button>
      </div>
    </div>
  )
}
