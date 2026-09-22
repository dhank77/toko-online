import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { Toaster } from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import logoUrl from '../assets/logo.png'

export default function AdminLayout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const { resolved, toggleTheme } = useTheme()
  const [confirmLogout, setConfirmLogout] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  // Nama + foto diambil dari Supabase Auth (mendukung login Google),
  // sama seperti yang dipakai TopNavBar di sisi toko.
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
  const initials = String(fullName || 'A')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

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

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* SideNavBar */}
      <aside className="hidden md:flex flex-col h-screen p-4 space-y-4 bg-muted/50 border-r border-border w-64 fixed left-0 top-0 z-50">
        <div className="px-4 py-6">
           <h1 className="text-xl font-bold text-foreground">Workspace Admin</h1>
           <p className="text-xs text-muted-foreground uppercase tracking-wider">Operasi Global</p>
        </div>
        <nav className="flex-1 flex flex-col space-y-1 px-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive: active }) =>
                `flex items-center gap-3 px-3 py-2 transition-all duration-150 rounded-lg ${
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`
              }
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="pt-4 border-t border-border flex flex-col space-y-1 px-2 pb-4">
          <NavLink to="/" className="flex items-center gap-3 px-3 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-150 rounded-lg">
            <span className="material-symbols-outlined">arrow_back</span>
             <span className="text-sm font-medium">Kembali ke Toko</span>
          </NavLink>
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 px-3 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-150 rounded-lg w-full text-left"
          >
            <span className="material-symbols-outlined">{resolved === 'dark' ? 'light_mode' : 'dark_mode'}</span>
            <span className="text-sm font-medium">{resolved === 'dark' ? 'Mode Terang' : 'Mode Gelap'}</span>
          </button>
          <a className="flex items-center gap-3 px-3 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-150 rounded-lg" href="#">
            <span className="material-symbols-outlined">settings</span>
             <span className="text-sm font-medium">Pengaturan</span>
          </a>
          <div className="flex items-center gap-3 px-3 py-2 mt-2 rounded-lg bg-background border border-border">
            <Avatar className="h-9 w-9 shrink-0">
              {avatarSrc && (<AvatarImage src={avatarSrc} alt={fullName} />)}
              <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm font-semibold text-foreground truncate" title={fullName}>{fullName}</span>
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
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 min-h-screen bg-background flex flex-col">
        {/* TopAppBar */}
        <header className="h-20 bg-background border-b border-border sticky top-0 z-40 flex items-center">
          <div className="flex justify-between items-center w-full px-6 max-w-7xl mx-auto h-full">
            <div className="flex items-center gap-4">
              <span className="md:hidden material-symbols-outlined text-primary cursor-pointer">menu</span>
              <img src={logoUrl} alt="Logo Tokorakyat.id" className="w-9 h-9 rounded-xl object-cover" />
              <h2 className="text-xl font-bold text-primary tracking-tight">Tokorakyat.id</h2>
            </div>
            <div className="hidden lg:flex flex-1 max-w-md mx-6">
              <div className="relative w-full">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-x-1/2 text-muted-foreground">search</span>
                <Input className="pl-10 pr-4 py-2 rounded-xl" placeholder="Cari pesanan, pelanggan, atau stok..." />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                <span className="material-symbols-outlined">notifications</span>
              </Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                <span className="material-symbols-outlined">person</span>
              </Button>
              <div className="h-8 w-[1px] bg-border mx-2"></div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <section className="p-6 max-w-7xl mx-auto w-full flex-1">
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
        <footer className="py-10 px-6 border-t border-border bg-muted/50">
          <div className="md:text-right">
             <p className="text-muted-foreground text-sm">© 2026 Tokorakyat.id. Hak cipta dilindungi.</p>
          </div>
        </footer>
      </main>
    </div>
  )
}
