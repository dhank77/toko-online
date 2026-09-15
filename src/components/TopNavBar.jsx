import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../utils/api'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { cn } from '../lib/utils'

const SEARCH_HINTS = [
  'iPhone 17 Pro Max',
  'Sneakers lari terbaru',
  'Kopi Arabica Gayo 1kg',
  'Monitor gaming 144Hz',
  'Sepeda lipat urban',
  'Keyboard mechanical RGB',
]

export default function TopNavBar({ cartCount = 0 }) {
  const { user, signOut } = useAuth()
  const [categories, setCategories] = useState([])
  const [catLoading, setCatLoading] = useState(true)
  const [hintIdx, setHintIdx] = useState(0)
  const [query, setQuery] = useState('')
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    let active = true
    api.getCategories()
      .then((data) => {
        if (active) {
          setCategories(data)
          setCatLoading(false)
        }
      })
      .catch(() => {
        if (active) setCatLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  // Rotating search hint (ala Tokopedia)
  useEffect(() => {
    const id = setInterval(() => setHintIdx((i) => (i + 1) % SEARCH_HINTS.length), 2800)
    return () => clearInterval(id)
  }, [])

  // Shrink header on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const fullName = user?.user_metadata?.full_name || user?.email || ''
  const email = user?.email || ''
  const getInitial = () => fullName.charAt(0).toUpperCase()
  const avatarSrc = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null

  const handleLogout = async () => {
    await signOut()
  }

  const logo = (compact = false) => (
    <Link to="/" className="flex items-center gap-2 shrink-0 group">
      <span
        className={cn(
          'rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all',
          compact ? 'w-7 h-7' : 'w-9 h-9'
        )}
      >
        <span className={cn('material-symbols-outlined', compact ? 'text-lg' : 'text-xl')}>storefront</span>
      </span>
      <span className={cn('font-bold tracking-tight leading-none', compact ? 'text-base' : 'text-xl')}>
        <span className="text-foreground">Toko</span>
        <span className="text-primary">Rakyat.id</span>
      </span>
    </Link>
  )

  const cartButton = (
    <Button asChild variant="ghost" size="icon" className="relative text-muted-foreground hover:text-primary hover:bg-muted" title="Keranjang">
      <Link to="/cart">
        <span className="material-symbols-outlined">shopping_cart</span>
        {cartCount > 0 && (
          <span
            key={cartCount}
            className="badge-pop absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center"
          >
            {cartCount > 99 ? '99+' : cartCount}
          </span>
        )}
      </Link>
    </Button>
  )

  const notificationButton = (
    <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-primary hover:bg-muted" title="Notifikasi">
      <span className="material-symbols-outlined">notifications</span>
      <span className="absolute top-1.5 right-1.5 flex">
        <span className="absolute inline-flex h-2 w-2 rounded-full bg-destructive opacity-75 animate-ping"></span>
        <span className="relative inline-flex h-2 w-2 rounded-full bg-destructive"></span>
      </span>
    </Button>
  )

  const authArea = user ? (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Menu akun"
          className="rounded-full ml-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ring-offset-2"
        >
          <Avatar className="h-9 w-9 border-2 border-primary/20 hover:border-primary/60 transition-colors">
            {avatarSrc ? (
              <AvatarImage src={avatarSrc} alt={getInitial()} />
            ) : (
              <AvatarFallback className="bg-primary/10 text-primary font-bold">{getInitial()}</AvatarFallback>
            )}
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={10} className="w-64 p-0 overflow-hidden fade-slide-down">
        <div className="p-4 bg-muted/50 border-b border-border flex items-center gap-3">
          <Avatar className="h-11 w-11 border border-border">
            {avatarSrc ? (
              <AvatarImage src={avatarSrc} alt={getInitial()} />
            ) : (
              <AvatarFallback className="bg-primary text-primary-foreground font-bold">{getInitial()}</AvatarFallback>
            )}
          </Avatar>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{fullName || 'Pengguna'}</p>
            <p className="text-xs text-muted-foreground truncate">{email}</p>
          </div>
        </div>
        <div className="p-1.5">
          <DropdownMenuItem asChild className="gap-3 rounded-lg cursor-pointer py-2.5">
            <Link to="/orders" className="flex items-center w-full">
              <span className="material-symbols-outlined text-xl text-muted-foreground">receipt_long</span>
              Pesanan Saya
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="gap-3 rounded-lg cursor-pointer py-2.5">
            <Link to="/cart" className="flex items-center w-full">
              <span className="material-symbols-outlined text-xl text-muted-foreground">shopping_cart</span>
              Keranjang
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout} className="gap-3 rounded-lg cursor-pointer py-2.5 text-destructive focus:text-destructive">
            <span className="material-symbols-outlined text-xl">logout</span>
            Keluar
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    <div className="flex items-center gap-2">
      <Button asChild variant="outline" size="sm" className="rounded-full gap-1.5">
        <Link to="/login">
          <span className="material-symbols-outlined text-base">person</span>
          Masuk
        </Link>
      </Button>
      <Button asChild size="sm" className="rounded-full hidden sm:inline-flex bg-gradient-to-r from-primary to-accent hover:opacity-90">
        <Link to="/register">Daftar</Link>
      </Button>
    </div>
  )

  const kategoriMenu = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="group gap-2 text-foreground hover:bg-muted font-semibold shrink-0 px-3">
          <span className="material-symbols-outlined text-2xl text-primary">menu</span>
          Kategori
          <span className="material-symbols-outlined text-base text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180">
            expand_more
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" sideOffset={14} className="w-[440px] p-2 fade-slide-down">
        <div className="grid grid-cols-2 gap-1 max-h-[320px] overflow-y-auto">
          {catLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2.5 animate-pulse">
                  <div className="w-9 h-9 rounded-lg bg-muted shrink-0" />
                  <div className="h-4 w-24 bg-muted rounded" />
                </div>
              ))
            : categories.map((cat) => (
                <DropdownMenuItem key={cat.id} className="gap-3 px-3 py-2.5 rounded-xl cursor-pointer">
                  <span className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-lg">{cat.icon || 'category'}</span>
                  </span>
                  <span className="text-sm font-medium truncate">{cat.name}</span>
                </DropdownMenuItem>
              ))}
        </div>
        <div className="mt-1 pt-2 border-t border-border">
          <DropdownMenuItem className="justify-center gap-1.5 text-primary font-semibold cursor-pointer rounded-xl py-2.5">
            Lihat Semua Kategori
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 glass-header bg-background/80 border-b border-border transition-all duration-300',
        scrolled && 'shadow-lg shadow-black/5 bg-background/95'
      )}
    >
      {/* Desktop */}
      <nav
        className={cn(
          'hidden lg:flex items-center gap-3 xl:gap-4 max-w-7xl mx-auto px-6 transition-all duration-300',
          scrolled ? 'h-16' : 'h-20'
        )}
      >
        {logo(false)}

        {kategoriMenu}

        <button
          type="button"
          title="Atur alamat pengiriman"
          className="hidden xl:flex items-center gap-2 h-11 px-2.5 rounded-xl hover:bg-muted transition-colors shrink-0"
        >
          <span className="material-symbols-outlined text-primary">location_on</span>
          <span className="flex flex-col items-start leading-tight">
            <span className="text-[10px] text-muted-foreground">Dikirim ke</span>
            <span className="text-xs font-semibold text-foreground">Jakarta Pusat</span>
          </span>
        </button>

        <div className="relative flex-1 lg:min-w-[240px] max-w-xl xl:max-w-2xl min-w-0">
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="group relative flex items-center h-11 bg-card border border-border rounded-full shadow-sm transition-all duration-200 hover:border-primary/50 hover:shadow-md focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15">
              <span className="material-symbols-outlined absolute left-4 text-xl text-muted-foreground group-focus-within:text-primary transition-colors">search</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                type="text"
                aria-label="Cari produk"
                autoComplete="off"
                enterKeyHint="search"
                placeholder={SEARCH_HINTS[hintIdx]}
                className="w-full bg-transparent h-full pl-12 pr-16 text-sm text-foreground placeholder:text-muted-foreground/70 caret-primary focus:outline-none"
              />
              {query ? (
                <button
                  type="button"
                  title="Bersihkan pencarian"
                  onClick={() => setQuery('')}
                  className="absolute right-1.5 w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              ) : (
                <button
                  type="button"
                  title="Cari dengan gambar"
                  className="absolute right-1.5 w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">photo_camera</span>
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="flex items-center gap-0.5 ml-auto shrink-0">
          {notificationButton}
          <Button asChild variant="ghost" size="icon" className="text-muted-foreground hover:text-primary hover:bg-muted" title="Pesanan Saya">
            <Link to="/orders">
              <span className="material-symbols-outlined">receipt_long</span>
            </Link>
          </Button>
          {cartButton}
          <div className="w-px h-6 bg-border mx-1.5" />
          {authArea}
        </div>
      </nav>

      {/* Mobile */}
      <div className="lg:hidden h-20 px-4 py-1 flex flex-col justify-center gap-1">
        <div className="h-9 flex items-center justify-between">
          {logo(true)}
          <div className="flex items-center gap-0.5">
            {notificationButton}
            {cartButton}
            {authArea}
          </div>
        </div>
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="group relative flex items-center h-8 bg-card border border-border rounded-full transition-all duration-200 hover:border-primary/50 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
            <span className="material-symbols-outlined absolute left-3 text-base text-muted-foreground group-focus-within:text-primary transition-colors">search</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text"
              aria-label="Cari produk"
              autoComplete="off"
              enterKeyHint="search"
              placeholder={SEARCH_HINTS[hintIdx]}
              className="w-full bg-transparent h-full pl-10 pr-11 text-[13px] text-foreground placeholder:text-muted-foreground/70 caret-primary focus:outline-none"
            />
            {query ? (
              <button
                type="button"
                title="Bersihkan pencarian"
                onClick={() => setQuery('')}
                className="absolute right-1 w-6 h-6 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            ) : (
              <button
                type="button"
                title="Cari dengan gambar"
                className="absolute right-1 w-6 h-6 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-base">photo_camera</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </header>
  )
}
