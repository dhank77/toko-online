import { Outlet, NavLink, useLocation } from 'react-router-dom'

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
    <div className="flex min-h-screen bg-background text-on-background">
      {/* SideNavBar */}
      <aside className="hidden md:flex flex-col h-screen p-sm space-y-base bg-tertiary-container dark:bg-tertiary text-secondary-fixed dark:text-secondary-fixed-dim w-64 fixed left-0 top-0 z-50">
        <div className="px-sm py-md">
          <h1 className="text-headline-sm font-headline-sm text-on-tertiary">Admin Workspace</h1>
          <p className="font-label-sm text-label-sm text-on-tertiary-container opacity-80 uppercase tracking-wider">Global Operations</p>
        </div>
        <nav className="flex-1 flex flex-col space-y-xs px-xs">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive: active }) =>
                `flex items-center gap-sm px-sm py-base transition-all duration-150 rounded-lg ${
                  active
                    ? 'bg-secondary dark:bg-on-secondary-container text-on-secondary'
                    : 'text-on-tertiary-container hover:bg-tertiary hover:text-on-tertiary'
                }`
              }
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="font-label-md text-label-md">{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="pt-md border-t border-on-tertiary-container/20 flex flex-col space-y-xs px-xs pb-sm">
          <NavLink to="/" className="flex items-center gap-sm px-sm py-base text-on-tertiary-container hover:bg-tertiary hover:text-on-tertiary transition-all duration-150 rounded-lg">
            <span className="material-symbols-outlined">arrow_back</span>
            <span className="font-label-md text-label-md">Back to Store</span>
          </NavLink>
          <a className="flex items-center gap-sm px-sm py-base text-on-tertiary-container hover:bg-tertiary hover:text-on-tertiary transition-all duration-150 rounded-lg" href="#">
            <span className="material-symbols-outlined">settings</span>
            <span className="font-label-md text-label-md">Settings</span>
          </a>
          <a className="flex items-center gap-sm px-sm py-base text-on-tertiary-container hover:bg-tertiary hover:text-on-tertiary transition-all duration-150 rounded-lg" href="#">
            <span className="material-symbols-outlined">help</span>
            <span className="font-label-md text-label-md">Support</span>
          </a>
          <div className="flex items-center gap-sm px-sm py-sm mt-sm">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-surface-container-high">
              <img
                className="w-full h-full object-cover"
                data-alt="Admin profile"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAaKRwo4p7v9iQY3VZeVmRNogGHt25rkobmurKp3vJGofPzg0dBZauXhUhknatFroepE4Ep21_yztkag-7Rxzm4HhIboF-6uV4LejDcmhKstl1XpQlc3WsYyagDmjPI1HAgqsO9OrfrfxfVfMprY_FoKjFWJMgs6b-KREcfGC-3vAgvTJZfdJEoCyWK9H08EtRVEOwptLXMIi34Hg3J4KfUINNjn8mS6CrZeT8lgXID-oF2BSrmdlORzQ"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-label-md text-label-md text-on-tertiary truncate">Admin Profile</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 min-h-screen bg-surface flex flex-col">
        {/* TopAppBar */}
        <header className="h-20 bg-surface dark:bg-inverse-surface shadow-sm sticky top-0 z-40 flex items-center">
          <div className="flex justify-between items-center w-full px-gutter max-w-container-max mx-auto h-full">
            <div className="flex items-center gap-md">
              <span className="md:hidden material-symbols-outlined text-primary cursor-pointer">menu</span>
              <h2 className="text-headline-md font-headline-md font-bold text-primary dark:text-inverse-primary tracking-tight">ShopComposed</h2>
            </div>
            <div className="hidden lg:flex flex-1 max-w-md mx-xl">
              <div className="relative w-full">
                <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-x-1/2 text-on-surface-variant">search</span>
                <input className="w-full pl-xl pr-sm py-xs bg-surface-container-low border-none rounded-xl font-body-md text-body-md focus:ring-2 focus:ring-primary/20" placeholder="Search orders, customers, or stock..." type="text" />
              </div>
            </div>
            <div className="flex items-center gap-sm">
              <button className="p-xs text-on-surface-variant hover:text-primary transition-colors duration-200">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <button className="p-xs text-on-surface-variant hover:text-primary transition-colors duration-200">
                <span className="material-symbols-outlined">person</span>
              </button>
              <div className="h-8 w-[1px] bg-outline-variant mx-xs"></div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <section className="p-gutter max-w-container-max mx-auto w-full flex-1">
          <Outlet />
        </section>

        {/* Footer */}
        <footer className="w-full py-xl px-gutter grid grid-cols-1 md:grid-cols-4 gap-gutter max-w-container-max mx-auto border-t border-outline-variant bg-surface-container-lowest dark:bg-surface-container-highest mt-auto">
          <div className="col-span-1 md:col-span-1">
            <p className="text-label-md font-label-md font-bold text-on-surface mb-sm">ShopComposed</p>
            <p className="text-body-sm text-on-surface-variant">Efficiency and composition at scale. The premier workspace for global seller operations.</p>
          </div>
          <div>
            <p className="text-label-md font-label-md text-primary mb-sm">Resources</p>
            <ul className="space-y-xs">
              <li><a className="text-on-surface-variant hover:text-primary transition-colors duration-200" href="#">Help Center</a></li>
              <li><a className="text-on-surface-variant hover:text-primary transition-colors duration-200" href="#">Shipping Info</a></li>
            </ul>
          </div>
          <div>
            <p className="text-label-md font-label-md text-primary mb-sm">Legal</p>
            <ul className="space-y-xs">
              <li><a className="text-on-surface-variant hover:text-primary transition-colors duration-200" href="#">Privacy Policy</a></li>
              <li><a className="text-on-surface-variant hover:text-primary transition-colors duration-200" href="#">Terms of Service</a></li>
            </ul>
          </div>
          <div className="md:text-right">
            <p className="text-on-surface-variant font-body-sm">© 2024 ShopComposed. All rights reserved.</p>
          </div>
        </footer>
      </main>
    </div>
  )
}
