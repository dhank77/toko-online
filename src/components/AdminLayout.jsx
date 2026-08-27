import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'

export default function AdminLayout() {
  const location = useLocation()

  const navItems = [
    { to: '/admin', label: 'Dashboard', icon: 'dashboard', end: true },
    { to: '/admin/categories', label: 'Master Data', icon: 'category' },
    { to: '/admin/products', label: 'Product Management', icon: 'inventory_2' },
    { to: '/admin/orders', label: 'Order Management', icon: 'shopping_cart' },
    { to: '/admin/customers', label: 'Customer CRM', icon: 'group' },
    { to: '/admin/analytics', label: 'Analytics', icon: 'analytics' },
  ]

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* SideNavBar */}
      <aside className="hidden md:flex flex-col h-screen p-4 space-y-4 bg-muted/50 border-r border-border w-64 fixed left-0 top-0 z-50">
        <div className="px-4 py-6">
          <h1 className="text-xl font-bold text-foreground">Admin Workspace</h1>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Global Operations</p>
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
            <span className="text-sm font-medium">Back to Store</span>
          </NavLink>
          <a className="flex items-center gap-3 px-3 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-150 rounded-lg" href="#">
            <span className="material-symbols-outlined">settings</span>
            <span className="text-sm font-medium">Settings</span>
          </a>
          <a className="flex items-center gap-3 px-3 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-150 rounded-lg" href="#">
            <span className="material-symbols-outlined">help</span>
            <span className="text-sm font-medium">Support</span>
          </a>
          <div className="flex items-center gap-3 px-3 py-2 mt-2">
            <Avatar className="h-8 w-8">
              <img
                className="w-full h-full object-cover"
                data-alt="Admin profile"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAaKRwo4p7v9iQY3VZeVmRNogGHt25rkobmurKp3vJGofPzg0dBZauXhUhknatFroepE4Ep21_yztkag-7Rxzm4HhIboF-6uV4LejDcmhKstl1XpQlc3WsYyagDmjPI1HAgqsO9OrfrfxfVfMprY_FoKjFWJMgs6b-KREcfGC-3vAgvTJZfdJEoCyWK9H08EtRVEOwptLXMIi34Hg3J4KfUINNjn8mS6CrZeT8lgXID-oF2BSrmdlORzQ"
              />
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-foreground truncate">Admin Profile</span>
            </div>
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
              <h2 className="text-xl font-bold text-primary tracking-tight">ShopComposed</h2>
            </div>
            <div className="hidden lg:flex flex-1 max-w-md mx-6">
              <div className="relative w-full">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-x-1/2 text-muted-foreground">search</span>
                <Input className="pl-10 pr-4 py-2 rounded-xl" placeholder="Search orders, customers, or stock..." />
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

        {/* Footer */}
        <footer className="py-10 px-6 border-t border-border bg-muted/50">
          <div className="md:text-right">
            <p className="text-muted-foreground text-sm">© 2026 ShopComposed. All rights reserved.</p>
          </div>
        </footer>
      </main>
    </div>
  )
}
