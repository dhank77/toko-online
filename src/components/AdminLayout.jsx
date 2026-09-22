import { useEffect, useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
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
        <header className="h-[64px] md:h-20 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border sticky top-0 z-30 flex items-center">
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
            <div className="hidden lg:flex flex-1 max-w-md mx-6">
              <div className="relative w-full">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">search</span>
                <Input className="pl-10 pr-4 py-2 rounded-full bg-muted/50" placeholder="Cari pesanan, pelanggan, atau stok..." />
              </div>
            </div>
            <div className="flex items-center gap-1 md:gap-2 shrink-0">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary h-9 w-9">
                <span className="material-symbols-outlined">notifications</span>
              </Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary h-9 w-9 hidden sm:inline-flex">
                <span className="material-symbols-outlined">person</span>
              </Button>
              <div className="h-8 w-[1px] bg-border mx-1 hidden sm:block"></div>
              <span className="hidden md:inline-flex text-xs text-muted-foreground mr-1">{collapsed ? 'Diperluas' : 'Diciutkan'}</span>
            </div>
          </div>
        </header>

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
