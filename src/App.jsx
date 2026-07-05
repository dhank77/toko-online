import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import SiteLayout from './components/SiteLayout'
import HomePage from './pages/HomePage'
import CartPage from './pages/CartPage'
import AdminDashboard from './pages/AdminDashboard'

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SiteLayout><HomePage /></SiteLayout>} />
          <Route path="/cart" element={<SiteLayout><CartPage /></SiteLayout>} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  )
}
