import { useState } from 'react'

export default function AdminDashboard() {
  const products = [
    {
      id: 1,
      name: 'Ergo-Flow Executive Chair',
      sold: '42 units sold',
      revenue: '$12,400',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCvXtMwX8ccxJjLmeGhnOhGJT5aj7Fzgf2OZz2KzQdKt_8kYAqcVNkB0FUsei03kF0bnYwyU2g75uDdYKWLFGWJh9KMTzT1I8-H1zeaGVUcvyi7E4SktDwVPzSlcgH4TsuvKaPfnsNPugL2-fPuz2YBx3NToR2ZROBWDFcmFQllTiJxQUqYk1D4hz7JWfemSyedOpx2cV1B3qKSHR4SQsCfqJpyoVD9HukUXwHuPBvwEI3DC7XfVsZKSw',
    },
    {
      id: 2,
      name: 'HyperCharge Pro Pad',
      sold: '38 units sold',
      revenue: '$2,280',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuD168sSfZO2YjiNNCSSPtvl3nToQVRshYJ1IZBsHnQWcx9949MfbmdqzBLt2eGerrhpLZZS_RoTm472vf0KJcYMi4zTcJAt39xBAAanXg8m8aItYaUarSjGVndb09mQJ_hqeaoEFrLGZwd_Gi-YdZI89iSvGLmAt7jeNqS75SYSRc4e5342LMUc_-YVc_MnAQJsd1Ejy9Wnl1bKw1RpXK3pR7Zcb3Zc6JMp3Vby2gYyKb83PyH1hhLkLw',
    },
    {
      id: 3,
      name: 'K-Series Silent Mech',
      sold: '31 units sold',
      revenue: '$5,580',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDA9iHglJGqkuy_-s58oYnXzcQO0jC7mQjF5RWDhMLV5dS8B2uhtR3M0OGeWAcPhpUoOT5ECD5Sc1_yaN6hDSmpg7j-D5lKWBqSjnEtg2P-I5YSnv5UHEWoHkIA60DkQYa7p_3oPJ4kDeBhP2f20-FABQDP5BN7ZQ35xw4b6M3FjLBIsBRw-0CPGU9PUdIXGKpl63-uk---vQUv6ce9ST4juhEPndshKQGFiP6pEJeupEc750yA5wK5ag',
    },
  ]

  const orders = [
    { id: '#ORD-2049', customer: 'Jane Doe', initials: 'JD', color: 'bg-primary-fixed', textColor: 'text-primary', product: 'Ergo Chair x 1', amount: '$599.00', status: 'Shipped', statusBg: 'bg-secondary-container', statusText: 'text-on-secondary-container' },
    { id: '#ORD-2048', customer: 'Mark Smith', initials: 'MS', color: 'bg-secondary-fixed', textColor: 'text-secondary', product: 'HyperCharge x 2', amount: '$120.00', status: 'Processed', statusBg: 'bg-primary-fixed', statusText: 'text-primary' },
    { id: '#ORD-2047', customer: 'Alice Lo', initials: 'AL', color: 'bg-tertiary-fixed', textColor: 'text-tertiary', product: 'Silent Mech x 1', amount: '$180.00', status: 'Pending', statusBg: 'bg-surface-container-highest', statusText: 'text-on-surface-variant' },
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
          <a className="flex items-center gap-sm px-sm py-base bg-secondary dark:bg-on-secondary-container text-on-secondary rounded-lg transition-all duration-150" href="#">
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-label-md text-label-md">Dashboard</span>
          </a>
          <a className="flex items-center gap-sm px-sm py-base text-on-tertiary-container hover:bg-tertiary hover:text-on-tertiary transition-all duration-150 rounded-lg" href="#">
            <span className="material-symbols-outlined">inventory_2</span>
            <span className="font-label-md text-label-md">Product Management</span>
          </a>
          <a className="flex items-center gap-sm px-sm py-base text-on-tertiary-container hover:bg-tertiary hover:text-on-tertiary transition-all duration-150 rounded-lg" href="#">
            <span className="material-symbols-outlined">shopping_cart</span>
            <span className="font-label-md text-label-md">Order Management</span>
          </a>
          <a className="flex items-center gap-sm px-sm py-base text-on-tertiary-container hover:bg-tertiary hover:text-on-tertiary transition-all duration-150 rounded-lg" href="#">
            <span className="material-symbols-outlined">group</span>
            <span className="font-label-md text-label-md">Customer CRM</span>
          </a>
          <a className="flex items-center gap-sm px-sm py-base text-on-tertiary-container hover:bg-tertiary hover:text-on-tertiary transition-all duration-150 rounded-lg" href="#">
            <span className="material-symbols-outlined">analytics</span>
            <span className="font-label-md text-label-md">Analytics</span>
          </a>
        </nav>
        <div className="pt-md border-t border-on-tertiary-container/20 flex flex-col space-y-xs px-xs pb-sm">
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
                <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
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
              <button className="flex items-center gap-xs bg-primary text-on-primary px-sm py-xs rounded-xl font-label-md text-label-md hover:bg-primary-container transition-colors duration-200 shadow-sm active:scale-95">
                <span className="material-symbols-outlined text-[20px]">add</span>
                New Product
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <section className="p-gutter max-w-container-max mx-auto w-full flex-1">
          {/* Welcome Header */}
          <div className="mb-lg flex flex-col md:flex-row md:items-end justify-between gap-md">
            <div>
              <h1 className="font-headline-lg text-headline-lg text-on-surface mb-xs">Dashboard Overview</h1>
              <p className="font-body-md text-body-md text-on-surface-variant">Real-time performance tracking for your store operations.</p>
            </div>
            <div className="flex gap-sm">
              <button className="flex items-center gap-xs px-sm py-xs bg-surface-container border border-outline-variant rounded-lg font-label-md text-label-md text-on-surface-variant hover:bg-surface-variant transition-colors">
                <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                Last 30 Days
              </button>
              <button className="flex items-center gap-xs px-sm py-xs bg-surface-container border border-outline-variant rounded-lg font-label-md text-label-md text-on-surface-variant hover:bg-surface-variant transition-colors">
                <span className="material-symbols-outlined text-[18px]">download</span>
                Export Data
              </button>
            </div>
          </div>

          {/* Bento Analytic Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter mb-lg">
            {/* Daily Revenue */}
            <div className="glass-card p-md rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-sm">
                <div className="p-xs bg-primary-fixed text-primary rounded-lg">
                  <span className="material-symbols-outlined">payments</span>
                </div>
                <span className="text-secondary font-label-sm text-label-sm flex items-center">+12.4% <span className="material-symbols-outlined text-[14px]">trending_up</span></span>
              </div>
              <p className="font-label-md text-label-md text-on-surface-variant">Daily Revenue</p>
              <h3 className="font-headline-md text-headline-md text-on-surface mt-xs">$4,280.50</h3>
            </div>

            {/* Total Orders */}
            <div className="glass-card p-md rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-sm">
                <div className="p-xs bg-secondary-fixed text-secondary rounded-lg">
                  <span className="material-symbols-outlined">shopping_bag</span>
                </div>
                <span className="text-secondary font-label-sm text-label-sm flex items-center">+8.1% <span className="material-symbols-outlined text-[14px]">trending_up</span></span>
              </div>
              <p className="font-label-md text-label-md text-on-surface-variant">Total Orders</p>
              <h3 className="font-headline-md text-headline-md text-on-surface mt-xs">154</h3>
            </div>

            {/* New Customers */}
            <div className="glass-card p-md rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-sm">
                <div className="p-xs bg-tertiary-fixed text-on-tertiary-fixed-variant rounded-lg">
                  <span className="material-symbols-outlined">person_add</span>
                </div>
                <span className="text-error font-label-sm text-label-sm flex items-center">-2.4% <span className="material-symbols-outlined text-[14px]">trending_down</span></span>
              </div>
              <p className="font-label-md text-label-md text-on-surface-variant">New Customers</p>
              <h3 className="font-headline-md text-headline-md text-on-surface mt-xs">28</h3>
            </div>

            {/* Low Stock Alert */}
            <div className="glass-card p-md rounded-xl border-l-4 border-error shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-sm">
                <div className="p-xs bg-error-container text-error rounded-lg">
                  <span className="material-symbols-outlined">warning</span>
                </div>
                <span className="text-error font-label-md text-label-md">Critical</span>
              </div>
              <p className="font-label-md text-label-md text-on-surface-variant">Low Stock Alert</p>
              <h3 className="font-headline-md text-headline-md text-on-surface mt-xs">12 SKUs</h3>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter mb-lg">
            {/* Sales Overview Chart */}
            <div className="lg:col-span-2 glass-card p-md rounded-xl shadow-sm">
              <div className="flex justify-between items-center mb-md">
                <h4 className="font-label-md text-label-md text-on-surface uppercase tracking-tight">Sales Overview</h4>
                <div className="flex gap-xs">
                  <span className="inline-block w-3 h-3 rounded-full bg-primary"></span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Revenue</span>
                </div>
              </div>
              <div className="relative h-64 w-full flex items-end justify-between gap-base px-sm">
                <div className="w-full bg-primary-fixed rounded-t-lg transition-all hover:bg-primary hover:scale-y-105" style={{ height: '40%' }} />
                <div className="w-full bg-primary-fixed rounded-t-lg transition-all hover:bg-primary hover:scale-y-105" style={{ height: '60%' }} />
                <div className="w-full bg-primary-fixed rounded-t-lg transition-all hover:bg-primary hover:scale-y-105" style={{ height: '45%' }} />
                <div className="w-full bg-primary-fixed rounded-t-lg transition-all hover:bg-primary hover:scale-y-105" style={{ height: '80%' }} />
                <div className="w-full bg-primary-fixed rounded-t-lg transition-all hover:bg-primary hover:scale-y-105" style={{ height: '55%' }} />
                <div className="w-full bg-primary-fixed rounded-t-lg transition-all hover:bg-primary hover:scale-y-105" style={{ height: '90%' }} />
                <div className="w-full bg-primary rounded-t-lg" style={{ height: '70%' }} />
              </div>
              <div className="flex justify-between mt-sm px-xs font-label-sm text-label-sm text-on-surface-variant">
                <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
              </div>
            </div>

            {/* Top Selling Products */}
            <div className="glass-card p-md rounded-xl shadow-sm flex flex-col">
              <h4 className="font-label-md text-label-md text-on-surface uppercase tracking-tight mb-md">Top Selling Products</h4>
              <div className="flex-1 space-y-md">
                {products.map((product) => (
                  <div key={product.id} className="flex items-center gap-sm">
                    <div className="w-10 h-10 rounded-lg bg-surface-container-high overflow-hidden flex-shrink-0">
                      <img className="w-full h-full object-cover" data-alt={product.name} src={product.image} />
                    </div>
                    <div className="flex-1">
                      <p className="font-label-md text-label-md text-on-surface truncate">{product.name}</p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">{product.sold}</p>
                    </div>
                    <p className="font-label-md text-label-md text-primary">{product.revenue}</p>
                  </div>
                ))}
              </div>
              <button className="w-full mt-md py-xs text-primary font-label-md text-label-md hover:underline decoration-2 transition-all">View Full Report</button>
            </div>
          </div>

          {/* Recent Orders Table */}
          <div className="glass-card rounded-xl shadow-sm overflow-hidden mb-xl">
            <div className="p-md flex justify-between items-center border-b border-outline-variant">
              <h4 className="font-label-md text-label-md text-on-surface uppercase tracking-tight">Recent Orders</h4>
              <button className="text-primary font-label-md text-label-md hover:underline">View All</button>
            </div>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface-container text-on-surface-variant">
                    <th className="px-md py-sm font-label-sm text-label-sm uppercase tracking-wider">Order ID</th>
                    <th className="px-md py-sm font-label-sm text-label-sm uppercase tracking-wider">Customer</th>
                    <th className="px-md py-sm font-label-sm text-label-sm uppercase tracking-wider">Product</th>
                    <th className="px-md py-sm font-label-sm text-label-sm uppercase tracking-wider">Amount</th>
                    <th className="px-md py-sm font-label-sm text-label-sm uppercase tracking-wider">Status</th>
                    <th className="px-md py-sm font-label-sm text-label-sm uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-surface-container-low transition-colors group">
                      <td className="px-md py-md font-label-md text-label-md">{order.id}</td>
                      <td className="px-md py-md">
                        <div className="flex items-center gap-xs">
                          <div className={`w-6 h-6 rounded-full ${order.color} flex items-center justify-center text-[10px] font-bold ${order.textColor}`}>
                            {order.initials}
                          </div>
                          <span className="font-body-sm text-body-sm text-on-surface">{order.customer}</span>
                        </div>
                      </td>
                      <td className="px-md py-md font-body-sm text-body-sm text-on-surface-variant">{order.product}</td>
                      <td className="px-md py-md font-label-md text-label-md text-on-surface">{order.amount}</td>
                      <td className="px-md py-md">
                        <span className={`px-xs py-[2px] ${order.statusBg} ${order.statusText} rounded-full text-[12px] font-bold`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-md py-md">
                        <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">more_vert</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
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

      {/* FAB for mobile */}
      <button className="fixed bottom-md right-md bg-primary text-on-primary w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:bg-primary-container transition-all active:scale-90 z-50 md:hidden">
        <span className="material-symbols-outlined text-[24px]">add</span>
      </button>
    </div>
  )
}
