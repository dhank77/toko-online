import { useEffect, useMemo, useRef, useState } from 'react'
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { ADMIN_SEARCH_TARGETS, getAdminSearchTarget, useAdminSearch } from '../context/AdminSearchContext'
import { Toaster } from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import logoUrl from '../assets/logo.png'

const STORAGE_KEY = 'admin-sidebar-collapsed'

export default function AdminLayout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const { resolved, toggleTheme } = useTheme()
  const [confirmLogout, setConfirmLogout] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const searchInputRef = useRef(null)
  const location = useLocation()
  const { query, setQuery, submitSearch, clear } = useAdminSearch()

  // Halaman aktif menentukan placeholder + apakah daftarnya bisa disaring.
  const searchTarget = getAdminSearchTarget(location.pathname)
  const placeholder = searchTarget?.placeholder || 'Cari pesanan, pelanggan, atau produk...'
  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.userAgent || '')
  const shortcutLabel = isMac ? '⌘K' : 'Ctrl K'

  // Saran menu pada dropdown pencarian (difilter oleh kata kunci yang diketik).
  const suggestionItems = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return ADMIN_SEARCH_TARGETS
    return ADMIN_SEARCH_TARGETS.filter(
      (t) => t.label.toLowerCase().includes(q) || (t.keywords || '').toLowerCase().includes(q)
    )
  }, [query])

  useEffect(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY)
      if (v === '1') setCollapsed(true)
    } catch {}
  }, [])
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, collapsed ? '1' : '0') } catch {}
  }, [collapsed])

  // close mobile drawer on nav
  const closeMobile = () => setMobileOpen(false)

  const focusSearch = () => {
    const isDesktop = typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches
    if (!isDesktop) {
      setSearchOpen(true)
      return
    }
    setSearchFocused(true)
    searchInputRef.current?.focus()
  }

  const handleClearSearch = () => {
    clear()
    setSearchFocused(false)
    searchInputRef.current?.focus()
  }

  // Enter = cari di halaman saat ini; kalau halaman tidak punya daftar
  // (mis. Dashboard/Analitik) maka pindah ke menu yang bisa dicari.
  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setSearchFocused(false)
    if (searchTarget?.searchable) {
      submitSearch(query)
      setSearchOpen(false)
      return
    }
    const dest = suggestionItems.find((t) => t.searchable) || ADMIN_SEARCH_TARGETS.find((t) => t.searchable)
    if (dest) {
      setSearchOpen(false)
      navigate(dest.to, { state: { adminQuery: query } })
    }
  }

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      clear()
      setSearchFocused(false)
      setSearchOpen(false)
      e.target.blur?.()
    }
  }

  // Klik saran menu: pindah halaman dan bawa kata kunci agar langsung tersaring.
  const handleSuggestionClick = (t) => {
    setSearchFocused(false)
    setSearchOpen(false)
    if (location.pathname === t.to) {
      if (t.searchable) submitSearch(query)
      return
    }
    navigate(t.to, { state: { adminQuery: query } })
  }

  // Shortcut: ⌘K / Ctrl+K atau "/" memfokuskan kolom pencarian.
  useEffect(() => {
    const onKey = (e) => {
      const el = e.target
      const typing =
        el instanceof HTMLElement &&
        (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        focusSearch()
        return
      }
      if (e.key === '/' && !typing) {
        e.preventDefault()
        focusSearch()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const renderSuggestionList = (listClassName = '') => (
    <div className={listClassName}>
      <p className="px-3 pt-2 pb-1 text-[11px] uppercase tracking-wider text-muted-foreground">
        {query.trim() ? 'Menu yang cocok' : 'Cari di menu'}
      </p>
      {suggestionItems.length === 0 ? (
        <p className="px-3 py-3 text-sm text-muted-foreground">
          Menu tidak ditemukan. Tekan Enter untuk mencari di Manajemen Pesanan.
        </p>
      ) : (
        suggestionItems.map((t) => (
          <button
            key={t.to}
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleSuggestionClick(t)}
            className={`w-full flex items-center gap-3 px-3 py-2 text-left text-sm hover:bg-muted transition-colors ${
              t.to === searchTarget?.to ? 'bg-muted/60' : ''
            }`}
          >
            <span className="material-symbols-outlined text-[20px] text-muted-foreground">{t.icon}</span>
            <span className="flex-1 min-w-0 truncate">{t.label}</span>
            {t.to === searchTarget?.to && t.searchable && (
              <span className="text-[10px] px-1.5 py-0.5 rounded border border-border text-muted-foreground">Di sini</span>
            )}
          </button>
        ))
      )}
    </div>
  )

  const fullName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.identities?.[0]?.identity_data?.full_name ||
    user?.identities?.[0]?.identity_data?.name ||
    user?.email?.split('@')[0] ||
    'Admin'
  const email = user?.email || ''
  const rawAvatar =
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    user?.user_metadata?.image ||
    user?.identities?.[0]?.identity_data?.avatar_url ||
    user?.identities?.[0]?.identity_data?.picture ||
    user?.identities?.[0]?.identity_data?.image ||
    null
  const avatarSrc = rawAvatar ? String(rawAvatar).replace(/=s\d+-c$/, '=s192-c') : null
  const initials = String(fullName || 'A').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await signOut()
      setConfirmLogout(false)
      navigate('/login', { replace: true })
    } finally {
      setLoggingOut(false)
    }
  }

  const navItems = [
    { to: '/admin', label: 'Dashboard', icon: 'dashboard', end: true },
    { to: '/admin/categories', label: 'Data Master', icon: 'category' },
    { to: '/admin/products', label: 'Manajemen Produk', icon: 'inventory_2' },
    { to: '/admin/orders', label: 'Manajemen Pesanan', icon: 'shopping_cart' },
    { to: '/admin/customers', label: 'CRM Pelanggan', icon: 'group' },
    { to: '/admin/hero-slides', label: 'Hero Carousel', icon: 'view_carousel' },
    { to: '/admin/analytics', label: 'Analitik', icon: 'analytics' },
  ]

  const SidebarContent = ({ isMobile = false }) => (
    <>
      <div className={`flex items-center py-6 ${collapsed && !isMobile ? 'px-2 justify-center' : 'px-4 justify-between'} gap-2`}>
        {!collapsed || isMobile ? (
          <div className="min-w-0">
            <h1 className="text-[15px] font-bold leading-none tracking-tight whitespace-nowrap">Workspace Admin</h1>
            <p className="text-[11px] text-muted-foreground uppercase tracking-wider mt-1">Operasi Global</p>
          </div>
        ) : (
          <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shrink-0">T</div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => (isMobile ? closeMobile() : setCollapsed(v => !v))}
          aria-label={isMobile ? 'Tutup menu' : collapsed ? 'Perluas sidebar' : 'Kecilkan sidebar'}
          title={isMobile ? 'Tutup' : collapsed ? 'Perluas (expand)' : 'Kecilkan (collapse)'}
          className={`shrink-0 h-8 w-8 rounded-full border ${collapsed && !isMobile ? 'hidden' : ''} ${isMobile ? 'md:hidden' : 'hidden md:inline-flex'}`}
        >
          <span className="material-symbols-outlined text-[20px]">{isMobile ? 'close' : collapsed ? 'chevron_right' : 'chevron_left'}</span>
        </Button>
        {/* when collapsed desktop, show expand button centered below */}
        {collapsed && !isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(false)}
            aria-label="Perluas sidebar"
            title="Perluas sidebar"
            className="hidden md:inline-flex h-8 w-8 rounded-full border shrink-0 absolute -right-3 top-7 bg-background shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </Button>
        )}
      </div>

      <nav className={`flex-1 flex flex-col space-y-1 ${collapsed && !isMobile ? 'px-2' : 'px-2'}`}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            title={collapsed && !isMobile ? item.label : undefined}
            onClick={isMobile ? closeMobile : undefined}
            className={({ isActive: active }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-sm font-medium group relative ${
                collapsed && !isMobile ? 'justify-center px-2' : ''
              } ${
                active
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`
            }
          >
            <span className="material-symbols-outlined shrink-0 text-[22px]">{item.icon}</span>
            {(!collapsed || isMobile) && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className={`pt-4 border-t border-border flex flex-col space-y-1 pb-4 ${collapsed && !isMobile ? 'px-2' : 'px-2'}`}>
        <NavLink
          to="/"
          title={collapsed && !isMobile ? 'Kembali ke Toko' : undefined}
          className={`flex items-center gap-3 px-3 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors rounded-xl ${collapsed && !isMobile ? 'justify-center px-2' : ''}`}
        >
          <span className="material-symbols-outlined">arrow_back</span>
          {(!collapsed || isMobile) && <span className="text-sm font-medium">Kembali ke Toko</span>}
        </NavLink>
        <button
          onClick={toggleTheme}
          title={collapsed && !isMobile ? (resolved === 'dark' ? 'Mode Terang' : 'Mode Gelap') : undefined}
          className={`flex items-center gap-3 px-3 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors rounded-xl w-full text-left ${collapsed && !isMobile ? 'justify-center px-2' : ''}`}
        >
          <span className="material-symbols-outlined">{resolved === 'dark' ? 'light_mode' : 'dark_mode'}</span>
          {(!collapsed || isMobile) && <span className="text-sm font-medium">{resolved === 'dark' ? 'Mode Terang' : 'Mode Gelap'}</span>}
        </button>
        {(!collapsed || isMobile) && (
          <a className="hidden md:flex items-center gap-3 px-3 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors rounded-xl" href="#">
            <span className="material-symbols-outlined">settings</span>
            <span className="text-sm font-medium">Pengaturan</span>
          </a>
        )}

        {/* User card */}
        {collapsed && !isMobile ? (
          <div className="flex flex-col items-center gap-2 mt-2 pt-3 border-t border-border/60">
            <Avatar className="h-9 w-9">
              {avatarSrc && <AvatarImage src={avatarSrc} alt={fullName} />}
              <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">{initials}</AvatarFallback>
            </Avatar>
            <Button
              variant="ghost"
              size="icon"
              title="Keluar"
              onClick={() => setConfirmLogout(true)}
              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
            >
              <span className="material-symbols-outlined text-lg">logout</span>
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-3 px-3 py-2 mt-2 rounded-xl bg-background border border-border">
            <Avatar className="h-9 w-9 shrink-0">
              {avatarSrc && <AvatarImage src={avatarSrc} alt={fullName} />}
              <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm font-semibold truncate" title={fullName}>{fullName}</span>
              <span className="text-[11px] text-muted-foreground truncate" title={email}>{email || 'Administrator'}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              title="Keluar"
              onClick={() => setConfirmLogout(true)}
              className="shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <span className="material-symbols-outlined text-lg">logout</span>
            </Button>
          </div>
        )}
      </div>
    </>
  )

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Desktop SideNavBar */}
      <aside
        className={`hidden md:flex flex-col h-screen bg-muted/50 border-r border-border fixed left-0 top-0 z-40 transition-all duration-300 ease-in-out overflow-hidden ${
          collapsed ? 'w-[72px]' : 'w-64'
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeMobile} />
          <aside className="absolute left-0 top-0 h-full w-[280px] bg-background border-r border-border flex flex-col overflow-y-auto shadow-xl animate-in slide-in-from-left duration-200">
            <SidebarContent isMobile />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className={`flex-1 min-h-screen bg-background flex flex-col transition-all duration-300 ease-in-out ${collapsed ? 'md:ml-[72px]' : 'md:ml-64'}`}>
        {/* TopAppBar */}
        <header className="h-[64px] md:h-20 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border sticky top-0 z-30 flex items-center relative">
          <div className="flex justify-between items-center w-full px-4 md:px-6 max-w-7xl mx-auto h-full gap-3">
            <div className="flex items-center gap-2 md:gap-3 min-w-0">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-9 w-9 shrink-0"
                onClick={() => setMobileOpen(true)}
                aria-label="Buka menu"
              >
                <span className="material-symbols-outlined">menu</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="hidden md:inline-flex h-9 w-9 shrink-0 rounded-full border"
                onClick={() => setCollapsed(v => !v)}
                aria-label={collapsed ? 'Perluas sidebar' : 'Kecilkan sidebar'}
                title={collapsed ? 'Perluas sidebar' : 'Kecilkan sidebar'}
              >
                <span className="material-symbols-outlined text-[20px]">{collapsed ? 'menu_open' : 'menu'}</span>
              </Button>
              <img src={logoUrl} alt="Logo Tokorakyat.id" className="w-8 h-8 md:w-9 md:h-9 rounded-xl object-cover shrink-0" />
              <h2 className="text-base md:text-xl font-bold text-primary tracking-tight truncate">Tokorakyat.id</h2>
              <span className="hidden lg:inline-flex ml-2 text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground border">Admin</span>
            </div>
            <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md mx-3 lg:mx-6">
              <div className="relative w-full">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-[20px]">search</span>
                <Input
                  ref={searchInputRef}
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setSearchFocused(true) }}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => window.setTimeout(() => setSearchFocused(false), 120)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder={placeholder}
                  aria-label="Pencarian admin"
                  className="pl-11 pr-16 py-2 rounded-full bg-muted/50"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {query ? (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      title="Bersihkan pencarian"
                      aria-label="Bersihkan pencarian"
                      className="h-7 w-7 inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  ) : (
                    <kbd className="hidden lg:inline-flex items-center px-2 py-0.5 rounded border border-border bg-background text-[10px] font-medium text-muted-foreground">
                      {shortcutLabel}
                    </kbd>
                  )}
                </div>
                {searchFocused && (
                  <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 rounded-xl border border-border bg-popover text-popover-foreground shadow-lg overflow-hidden max-h-[70vh] overflow-y-auto">
                    {renderSuggestionList()}
                  </div>
                )}
              </div>
            </form>
            <div className="flex items-center gap-1 md:gap-2 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-muted-foreground hover:text-primary h-9 w-9"
                onClick={() => setSearchOpen((v) => !v)}
                aria-label="Pencarian"
                title="Pencarian"
              >
                <span className="material-symbols-outlined">{searchOpen ? 'close' : 'search'}</span>
              </Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary h-9 w-9">
                <span className="material-symbols-outlined">notifications</span>
              </Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary h-9 w-9 hidden sm:inline-flex">
                <span className="material-symbols-outlined">person</span>
              </Button>
              <div className="h-8 w-[1px] bg-border mx-1 hidden sm:block"></div>
            </div>
          </div>
        </header>

        {/* Pencarian mobile (kolom header hanya tampil di md+) */}
        {searchOpen && (
          <>
            <div
              className="md:hidden fixed inset-0 top-[64px] z-30 bg-black/30 backdrop-blur-sm"
              onClick={() => setSearchOpen(false)}
            />
            <div className="md:hidden absolute inset-x-0 top-full z-40 border-b border-border bg-background p-3 shadow-lg">
              <form onSubmit={handleSearchSubmit} className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-[20px]">search</span>
                <Input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder={placeholder}
                  aria-label="Pencarian admin"
                  className="pl-11 pr-12 py-2 rounded-full bg-muted/50"
                />
                {query && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    title="Bersihkan pencarian"
                    aria-label="Bersihkan pencarian"
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-7 w-7 inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                )}
              </form>
              <p className="mt-2 px-1 text-[11px] text-muted-foreground">
                {searchTarget?.searchable
                  ? `Mencari di ${searchTarget.label} — tekan Enter untuk menerapkan.`
                  : 'Pilih menu tujuan, lalu tekan Enter.'}
              </p>
              <div className="mt-2 max-h-[55vh] overflow-y-auto rounded-xl border border-border bg-popover text-popover-foreground">
                {renderSuggestionList()}
              </div>
            </div>
          </>
        )}

        {/* Page Content */}
        <section className="p-4 md:p-6 max-w-7xl mx-auto w-full flex-1">
          <Outlet />
        </section>

        <Toaster position="bottom-left" />

        {/* Dialog konfirmasi logout */}
        <Dialog open={confirmLogout} onOpenChange={(o) => { if (!o) setConfirmLogout(false) }}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Keluar dari Admin?</DialogTitle>
              <DialogDescription>
                Anda akan keluar dari akun <span className="font-semibold text-foreground">{email || fullName}</span> dan kembali ke halaman login.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmLogout(false)} disabled={loggingOut}>
                Batal
              </Button>
              <Button variant="destructive" onClick={handleLogout} disabled={loggingOut}>
                {loggingOut ? 'Keluar...' : 'Ya, Keluar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Footer */}
        <footer className="py-8 md:py-10 px-6 border-t border-border bg-muted/50">
          <div className="md:text-right">
            <p className="text-muted-foreground text-sm">© 2026 Tokorakyat.id. Hak cipta dilindungi.</p>
          </div>
        </footer>
      </main>
    </div>
  )
}
