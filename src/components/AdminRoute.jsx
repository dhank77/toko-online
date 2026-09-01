import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect } from 'react'

export default function AdminRoute({ children }) {
  const { user, loading, isAdmin, checkingAdmin, checkAdmin } = useAuth()

  useEffect(() => {
    if (user && !isAdmin && !checkingAdmin) {
      checkAdmin(user.id)
    }
  }, [user, isAdmin, checkingAdmin, checkAdmin])

  console.log('AdminRoute render:', { loading, checkingAdmin, hasUser: !!user, isAdmin })

  if (loading || checkingAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <span className="text-sm">Loading...</span>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">403</h1>
          <p className="text-sm text-muted-foreground">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return children
}
