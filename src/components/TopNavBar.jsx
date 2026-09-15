import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../utils/api'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'

export default function TopNavBar({ cartCount = 0 }) {
  const { user, signOut } = useAuth()
  const [categories, setCategories] = useState([])

  useEffect(() => {
    let active = true
    api.getCategories()
      .then((data) => {
        if (active) setCategories(data)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])

  const getInitial = () => {
    const name = user?.user_metadata?.full_name || user?.email || ''
    return name.charAt(0).toUpperCase()
  }

  const avatarSrc = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null

  const handleLogout = async () => {
    await signOut()
  }

  const cartButton = (
    <Button asChild variant="ghost" size="icon" className="relative text-muted-foreground hover:text-primary" title="Keranjang">
      <Link to="/cart">
        <span className="material-symbols-outlined">shopping_cart</span>
        {cartCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
            {cartCount > 99 ? '99+' : cartCount}
          </span>
        )}
      </Link>
    </Button>
  )

  const notificationButton = (
    <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-primary" title="Notifikasi">
      <span className="material-symbols-outlined">notifications</span>
      <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full"></span>
    </Button>
  )

  const authArea = user ? (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full overflow-hidden">
          <Avatar className="h-9 w-9">
            {avatarSrc ? (
              <AvatarImage src={avatarSrc} alt={getInitial()} />
            ) : (
              <AvatarFallback>{getInitial()}</AvatarFallback>
            )}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link to="/orders" className="flex items-center w-full">
            <span className="material-symbols-outlined mr-2">receipt_long</span>
            Pesanan Saya
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/cart" className="flex items-center w-full">
            <span className="material-symbols-outlined mr-2">shopping_cart</span>
            Keranjang
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout}>
          <span className="material-symbols-outlined mr-2">logout</span>
          Keluar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    <div className="flex items-center gap-2">
      <Button asChild variant="outline" size="sm" className="rounded-full">
        <Link to="/login">Masuk</Link>
      </Button>
      <Button asChild size="sm" className="rounded-full hidden sm:inline-flex">
        <Link to="/register">Daftar</Link>
      </Button>
    </div>
  )

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-header bg-background/80 border-b border-border">
      {/* Desktop */}
      <nav className="hidden lg:flex items-center gap-4 h-20 max-w-7xl mx-auto px-6">
        <Link to="/" className="text-xl font-bold text-primary tracking-tight shrink-0">
          ShopComposed
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="shrink-0 gap-2 border-border">
              <span className="material-symbols-outlined text-xl">menu</span>
              Kategori
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-60 max-h-96 overflow-y-auto">
            {categories.length === 0 ? (
              <div className="px-3 py-3 text-sm text-muted-foreground">Memuat kategori...</div>
            ) : (
              categories.map((cat) => (
                <DropdownMenuItem key={cat.id} className="gap-3 cursor-pointer">
                  <span className="material-symbols-outlined text-xl text-primary">{cat.icon || 'category'}</span>
                  <span>{cat.name}</span>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex-1 max-w-2xl">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              search
            </span>
            <input
              className="w-full bg-background border border-border rounded-full py-2.5 pl-12 pr-4 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm"
              placeholder="Cari produk, merek, dan kategori"
              type="text"
            />
          </div>
        </div>

        <div className="flex items-center gap-1 ml-auto shrink-0">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary" title="Lokasi Pengiriman">
            <span className="material-symbols-outlined">location_on</span>
          </Button>
          {notificationButton}
          <Button asChild variant="ghost" size="icon" className="text-muted-foreground hover:text-primary" title="Pesanan Saya">
            <Link to="/orders">
              <span className="material-symbols-outlined">receipt_long</span>
            </Link>
          </Button>
          {cartButton}
          {authArea}
        </div>
      </nav>

      {/* Mobile */}
      <div className="lg:hidden h-20 px-4 py-3 flex flex-col justify-center gap-2">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-lg font-bold text-primary tracking-tight">
            ShopComposed
          </Link>
          <div className="flex items-center gap-0.5">
            {cartButton}
            {authArea}
          </div>
        </div>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xl">
            search
          </span>
          <input
            className="w-full bg-background border border-border rounded-full py-2 pl-10 pr-4 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm"
            placeholder="Cari produk, merek, dan kategori"
            type="text"
          />
        </div>
      </div>
    </header>
  )
}
