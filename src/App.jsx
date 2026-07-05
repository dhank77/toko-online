import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import NavWithCart from './components/NavWithCart'
import HomePage from './pages/HomePage'
import CartPage from './pages/CartPage'
import Footer from './components/Footer'

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <NavWithCart />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/cart" element={<CartPage />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </CartProvider>
  )
}
