import { useState, useEffect } from 'react'
import { api } from '../utils/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export default function AdminDashboard() {
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, ordersData] = await Promise.all([
          api.getProducts(1, 3),
          api.getOrders(),
        ])
        setProducts(productsData.data)
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
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-destructive/10 text-destructive px-6 py-3 rounded-lg shadow-lg font-medium border border-destructive/20">
          {error}
        </div>
      )}
      {/* Welcome Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">Dashboard Overview</h1>
          <p className="text-sm text-muted-foreground">Real-time performance tracking for your store operations.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">calendar_today</span>
            Last 30 Days
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">download</span>
            Export Data
          </Button>
        </div>
      </div>

      {/* Bento Analytic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Daily Revenue */}
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-primary/10 text-primary rounded-lg">
                <span className="material-symbols-outlined">payments</span>
              </div>
              <span className="text-secondary text-xs font-medium flex items-center">+12.4% <span className="material-symbols-outlined text-sm">trending_up</span></span>
            </div>
            <p className="text-sm text-muted-foreground">Daily Revenue</p>
            <h3 className="text-xl font-bold text-foreground mt-1">$4,280.50</h3>
          </CardContent>
        </Card>

        {/* Total Orders */}
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-secondary/10 text-secondary rounded-lg">
                <span className="material-symbols-outlined">shopping_bag</span>
              </div>
              <span className="text-secondary text-xs font-medium flex items-center">+8.1% <span className="material-symbols-outlined text-sm">trending_up</span></span>
            </div>
            <p className="text-sm text-muted-foreground">Total Orders</p>
            <h3 className="text-xl font-bold text-foreground mt-1">154</h3>
          </CardContent>
        </Card>

        {/* New Customers */}
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-muted text-foreground rounded-lg">
                <span className="material-symbols-outlined">person_add</span>
              </div>
              <span className="text-destructive text-xs font-medium flex items-center">-2.4% <span className="material-symbols-outlined text-sm">trending_down</span></span>
            </div>
            <p className="text-sm text-muted-foreground">New Customers</p>
            <h3 className="text-xl font-bold text-foreground mt-1">28</h3>
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card className="border-l-4 border-destructive">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-destructive/10 text-destructive rounded-lg">
                <span className="material-symbols-outlined">warning</span>
              </div>
              <span className="text-destructive text-xs font-medium">Critical</span>
            </div>
            <p className="text-sm text-muted-foreground">Low Stock Alert</p>
            <h3 className="text-xl font-bold text-foreground mt-1">12 SKUs</h3>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Sales Overview Chart */}
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-sm font-medium text-foreground uppercase tracking-tight">Sales Overview</h4>
              <div className="flex gap-2">
                <span className="inline-block w-3 h-3 rounded-full bg-primary"></span>
                <span className="text-xs text-muted-foreground">Revenue</span>
              </div>
            </div>
            <div className="relative h-64 w-full flex items-end justify-between gap-2 px-2">
              <div className="w-full bg-primary/20 rounded-t-lg transition-all hover:bg-primary hover:scale-y-105" style={{ height: '40%' }} />
              <div className="w-full bg-primary/20 rounded-t-lg transition-all hover:bg-primary hover:scale-y-105" style={{ height: '60%' }} />
              <div className="w-full bg-primary/20 rounded-t-lg transition-all hover:bg-primary hover:scale-y-105" style={{ height: '45%' }} />
              <div className="w-full bg-primary/20 rounded-t-lg transition-all hover:bg-primary hover:scale-y-105" style={{ height: '80%' }} />
              <div className="w-full bg-primary/20 rounded-t-lg transition-all hover:bg-primary hover:scale-y-105" style={{ height: '55%' }} />
              <div className="w-full bg-primary/20 rounded-t-lg transition-all hover:bg-primary hover:scale-y-105" style={{ height: '90%' }} />
              <div className="w-full bg-primary rounded-t-lg" style={{ height: '70%' }} />
            </div>
            <div className="flex justify-between mt-4 px-2 text-xs text-muted-foreground">
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
            </div>
          </CardContent>
        </Card>

        {/* Top Selling Products */}
        <Card className="flex flex-col">
          <CardContent className="p-6 flex-1 flex flex-col">
            <h4 className="text-sm font-medium text-foreground uppercase tracking-tight mb-6">Top Selling Products</h4>
            <div className="flex-1 space-y-4">
              {loading ? (
                Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-muted animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/4" />
                    </div>
                    <div className="h-4 bg-muted rounded w-16" />
                  </div>
                ))
              ) : (
                products.map((product) => (
                  <div key={product.id} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                      <img className="w-full h-full object-cover" data-alt={product.name} src={product.image_url} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.review_count} reviews</p>
                    </div>
                    <p className="text-sm font-medium text-primary">${Number(product.price).toFixed(2)}</p>
                  </div>
                ))
              )}
            </div>
            <Button variant="ghost" className="w-full mt-4 text-primary hover:underline decoration-2">View Full Report</Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders Table */}
      <Card className="overflow-hidden mb-8">
        <CardContent className="p-0">
          <div className="p-6 flex justify-between items-center border-b border-border">
            <h4 className="text-sm font-medium text-foreground uppercase tracking-tight">Recent Orders</h4>
            <Button variant="ghost" className="text-primary hover:underline">View All</Button>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-xs uppercase tracking-wider">Order ID</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider">Customer</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider">Product</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider">Amount</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider">Status</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border">
                {loading ? (
                  Array.from({ length: 3 }).map((_, idx) => (
                    <TableRow key={idx} className="hover:bg-muted/50 transition-colors group">
                      <TableCell><div className="h-4 bg-muted rounded w-16 animate-pulse" /></TableCell>
                      <TableCell><div className="h-4 bg-muted rounded w-24 animate-pulse" /></TableCell>
                      <TableCell><div className="h-4 bg-muted rounded w-32 animate-pulse" /></TableCell>
                      <TableCell><div className="h-4 bg-muted rounded w-16 animate-pulse" /></TableCell>
                      <TableCell><div className="h-4 bg-muted rounded w-16 animate-pulse" /></TableCell>
                      <TableCell><div className="h-4 bg-muted rounded w-8 animate-pulse" /></TableCell>
                    </TableRow>
                  ))
                ) : (
                  orders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-muted/50 transition-colors group">
                      <TableCell className="text-sm font-medium">{order.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-[10px] font-bold text-muted-foreground">
                              {(order.profiles?.full_name || order.customer_name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-foreground">{order.profiles?.full_name || order.customer_name || 'Unknown'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{order.product_id ? 'Product order' : 'Order'}</TableCell>
                      <TableCell className="text-sm font-medium">${Number(order.total_amount || 0).toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={order.status === 'shipped' ? 'default' : order.status === 'processed' ? 'secondary' : 'outline'}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                          <span className="material-symbols-outlined">more_vert</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
