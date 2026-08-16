import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect } from 'react'

export default function AdminRoute({ children }) {
  const { user, loading, isAdmin, checkingAdmin, checkAdmin } = useAuth()

  useEffect(() => {
    if (user) {
      checkAdmin()
    }
  }, [user, checkAdmin])

  console.log('AdminRoute render:', { loading, checkingAdmin, hasUser: !!user, isAdmin })

  if (loading || checkingAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-on-background">
        <span className="font-body-md text-body-md">Loading...</span>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-on-background">
        <div className="text-center">
          <h1 className="font-headline-lg text-headline-lg text-error mb-sm">403</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return children
}
