import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'
import SiteLayout from './components/SiteLayout'
import HomePage from './pages/HomePage'
import CartPage from './pages/CartPage'
import AdminLayout from './components/AdminLayout'
import AdminDashboard from './pages/AdminDashboard'
import AdminCategories from './pages/AdminCategories'
import AdminProducts from './pages/AdminProducts'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import AdminRoute from './components/AdminRoute'
import ProductDetail from './pages/ProductDetail'

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<SiteLayout><HomePage /></SiteLayout>} />
            <Route path="/product/:slug" element={<SiteLayout><ProductDetail /></SiteLayout>} />
            <Route path="/cart" element={<SiteLayout><CartPage /></SiteLayout>} />
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
            </Route>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  )
}
