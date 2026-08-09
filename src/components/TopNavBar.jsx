import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function TopNavBar({ cartCount = 0 }) {
  const { user, signOut } = useAuth()
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef(null)

  const getInitial = () => {
    const name = user?.user_metadata?.full_name || user?.email || ''
    return name.charAt(0).toUpperCase()
  }

  const avatarSrc = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null

  const renderAvatar = () => {
    if (avatarSrc) {
      return (
        <img
          alt={getInitial()}
          className="w-full h-full object-cover"
          src={avatarSrc}
        />
      )
    }

    return (
      <span className="w-full h-full flex items-center justify-center text-sm font-bold text-primary">
        {getInitial()}
      </span>
    )
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await signOut()
    setShowMenu(false)
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-header bg-surface shadow-sm h-20 flex items-center">
      <nav className="flex justify-between items-center w-full px-gutter max-w-container-max mx-auto h-20">
        <div className="flex items-center gap-lg">
          <span className="text-headline-md font-headline-md font-bold text-primary dark:text-inverse-primary cursor-pointer">
            ShopComposed
          </span>
          <div className="hidden md:flex items-center gap-md">
            <Link className="text-primary font-bold border-b-2 border-primary pb-1 font-body-md text-body-md" to="/">
              Home
            </Link>
            <a className="text-on-surface-variant hover:text-primary transition-colors duration-200 font-body-md text-body-md" href="#">
              Categories
            </a>
            <a className="text-on-surface-variant hover:text-primary transition-colors duration-200 font-body-md text-body-md" href="#">
              Help Center
            </a>
          </div>
        </div>

        <div className="flex-1 max-w-xl mx-lg hidden lg:block">
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
              search
            </span>
            <input
              className="w-full bg-surface-container border border-outline-variant rounded-full py-3 pl-12 pr-4 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all font-body-md"
              placeholder="Search for 'Sustainable Home Decor'..."
              type="text"
            />
          </div>
        </div>

        <div className="flex items-center gap-sm">
          <button className="p-2 text-on-surface-variant hover:text-primary transition-transform active:scale-90 flex flex-col items-center">
            <span className="material-symbols-outlined">location_on</span>
            <span className="text-label-sm font-label-sm hidden sm:block">Location</span>
          </button>
          <button className="p-2 text-on-surface-variant hover:text-primary transition-transform active:scale-90 relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
          </button>
          <Link
            to="/cart"
            className="flex items-center gap-xs bg-primary text-on-primary px-4 py-2 rounded-xl scale-95 active:scale-90 transition-transform"
          >
            <span className="material-symbols-outlined">shopping_cart</span>
            <span className="font-label-md text-label-md">Cart ({cartCount})</span>
          </Link>
          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                className="w-10 h-10 rounded-full border-2 border-primary overflow-hidden"
                onClick={() => setShowMenu((prev) => !prev)}
              >
                {renderAvatar()}
              </button>
              {showMenu && (
                <div className="absolute right-0 mt-2 w-40 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-lg py-2">
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-variant transition-colors"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="w-10 h-10 rounded-full border-2 border-primary overflow-hidden flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-on-surface">login</span>
            </Link>
          )}
        </div>
      </nav>
    </header>
  )
}
