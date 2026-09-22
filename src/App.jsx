import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import SiteLayout from './components/SiteLayout'
import HomePage from './pages/HomePage'
import CategoryPage from './pages/CategoryPage'
import CartPage from './pages/CartPage'
import AdminLayout from './components/AdminLayout'
import AdminDashboard from './pages/AdminDashboard'
import AdminCategories from './pages/AdminCategories'
import AdminProducts from './pages/AdminProducts'
import AdminHeroSlides from './pages/AdminHeroSlides'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import AdminRoute from './components/AdminRoute'
import ProductDetail from './pages/ProductDetail'
import OrdersPage from './pages/OrdersPage'
import OrderDetail from './pages/OrderDetail'
import PaymentSuccess from './pages/PaymentSuccess'
import { Toaster } from 'react-hot-toast'

export default function App() {
  return (
    <ThemeProvider>
    <AuthProvider>
      <CartProvider>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<SiteLayout><HomePage /></SiteLayout>} />
            <Route path="/category/:slug" element={<SiteLayout><CategoryPage /></SiteLayout>} />
            <Route path="/product/:slug" element={<SiteLayout><ProductDetail /></SiteLayout>} />
            <Route path="/cart" element={<SiteLayout><CartPage /></SiteLayout>} />
            <Route path="/orders" element={<SiteLayout><OrdersPage /></SiteLayout>} />
            <Route path="/orders/:orderId" element={<SiteLayout><OrderDetail /></SiteLayout>} />
            <Route path="/payment/success" element={<SiteLayout><PaymentSuccess /></SiteLayout>} />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="hero-slides" element={<AdminHeroSlides />} />
            </Route>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
    </ThemeProvider>
  )
}
