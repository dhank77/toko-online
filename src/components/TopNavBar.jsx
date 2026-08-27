import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'

export default function TopNavBar({ cartCount = 0 }) {
  const { user, signOut } = useAuth()
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef(null)

  const getInitial = () => {
    const name = user?.user_metadata?.full_name || user?.email || ''
    return name.charAt(0).toUpperCase()
  }

  const avatarSrc = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null

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
    <header className="fixed top-0 left-0 right-0 z-50 glass-header bg-background/80 border-b border-border h-20 flex items-center">
      <nav className="flex justify-between items-center w-full px-6 max-w-7xl mx-auto h-20">
        <div className="flex items-center gap-6">
          <Link className="text-xl font-bold text-primary tracking-tight" to="/">
            ShopComposed
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link className="text-sm font-semibold text-primary border-b-2 border-primary pb-1" to="/">
              Home
            </Link>
            <a className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200" href="#">
              Categories
            </a>
            <a className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200" href="#">
              Help Center
            </a>
          </div>
        </div>

        <div className="flex-1 max-w-xl mx-6 hidden lg:block">
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              search
            </span>
            <input
              className="w-full bg-muted/50 border border-border rounded-full py-2.5 pl-12 pr-4 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm"
              placeholder="Search for 'Sustainable Home Decor'..."
              type="text"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
            <span className="material-symbols-outlined">location_on</span>
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full"></span>
          </Button>
          <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Link to="/cart">
              <span className="material-symbols-outlined">shopping_cart</span>
              <span className="font-medium">Cart ({cartCount})</span>
            </Link>
          </Button>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full overflow-hidden">
                  <Avatar className="h-10 w-10">
                    {avatarSrc ? (
                      <AvatarImage src={avatarSrc} alt={getInitial()} />
                    ) : (
                      <AvatarFallback>{getInitial()}</AvatarFallback>
                    )}
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleLogout}>
                  <span className="material-symbols-outlined mr-2">logout</span>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="outline" size="icon" className="rounded-full">
              <Link to="/login">
                <span className="material-symbols-outlined">login</span>
              </Link>
            </Button>
          )}
        </div>
      </nav>
    </header>
  )
}
