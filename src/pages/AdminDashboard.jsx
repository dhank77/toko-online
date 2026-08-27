import { useState, useEffect } from 'react'
import { api } from '../utils/api'

export default function AdminDashboard() {
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, ordersData] = await Promise.all([
          api.getProducts(),
          api.getOrders(),
        ])
        setProducts(productsData.slice(0, 3))
        setOrders(ordersData.slice(0, 5))
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <>
      {error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-error-container text-error px-md py-sm rounded-lg shadow-lg font-label-md">
          {error}
        </div>
      )}
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
        <div className="glass-card p-md rounded-xl shadow-sm hover:shadow-md transition-shadow border-l-4 border-error">
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
            {loading ? (
              Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="flex items-center gap-sm">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-high animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-surface-variant rounded w-3/4" />
                    <div className="h-3 bg-surface-variant rounded w-1/4" />
                  </div>
                  <div className="h-4 bg-surface-variant rounded w-16" />
                </div>
              ))
            ) : (
              products.map((product) => (
                <div key={product.id} className="flex items-center gap-sm">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-high overflow-hidden flex-shrink-0">
                    <img className="w-full h-full object-cover" data-alt={product.name} src={product.image_url} />
                  </div>
                  <div className="flex-1">
                    <p className="font-label-md text-label-md text-on-surface truncate">{product.name}</p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">{product.review_count} reviews</p>
                  </div>
                  <p className="font-label-md text-label-md text-primary">${Number(product.price).toFixed(2)}</p>
                </div>
              ))
            )}
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
              {loading ? (
                Array.from({ length: 3 }).map((_, idx) => (
                  <tr key={idx} className="hover:bg-surface-container-low transition-colors group">
                    <td className="px-md py-md"><div className="h-4 bg-surface-variant rounded w-16 animate-pulse" /></td>
                    <td className="px-md py-md"><div className="h-4 bg-surface-variant rounded w-24 animate-pulse" /></td>
                    <td className="px-md py-md"><div className="h-4 bg-surface-variant rounded w-32 animate-pulse" /></td>
                    <td className="px-md py-md"><div className="h-4 bg-surface-variant rounded w-16 animate-pulse" /></td>
                    <td className="px-md py-md"><div className="h-4 bg-surface-variant rounded w-16 animate-pulse" /></td>
                    <td className="px-md py-md"><div className="h-4 bg-surface-variant rounded w-8 animate-pulse" /></td>
                  </tr>
                ))
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-surface-container-low transition-colors group">
                    <td className="px-md py-md font-label-md text-label-md">{order.id}</td>
                    <td className="px-md py-md">
                      <div className="flex items-center gap-xs">
                        <div className={`w-6 h-6 rounded-full bg-surface-container-high flex items-center justify-center text-[10px] font-bold text-on-surface-variant`}>
                          {(order.profiles?.full_name || order.customer_name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-body-sm text-body-sm text-on-surface">{order.profiles?.full_name || order.customer_name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-md py-md font-body-sm text-body-sm text-on-surface-variant">{order.product_id ? 'Product order' : 'Order'}</td>
                    <td className="px-md py-md font-label-md text-label-md text-on-surface">${Number(order.total_amount || 0).toFixed(2)}</td>
                    <td className="px-md py-md">
                      <span className={`px-xs py-[2px] rounded-full text-[12px] font-bold ${order.status === 'shipped' ? 'bg-secondary-container text-on-secondary-container' : order.status === 'processed' ? 'bg-primary-fixed text-primary' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-md py-md">
                      <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">more_vert</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
