import NavWithCart from './NavWithCart'
import Footer from './Footer'

export default function SiteLayout({ children }) {
  return (
    <>
      <NavWithCart />
      {children}
      <Footer />
    </>
  )
}
