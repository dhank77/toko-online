import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect, useState } from 'react'

export default function AdminRoute({ children }) {
  const { user, loading, fetchProfile } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    let active = true
    const check = async () => {
      if (!user) {
        if (active) setIsAdmin(false)
        setChecking(false)
        return
      }
      const profile = await fetchProfile()
      if (active) {
        setIsAdmin(profile?.role === 'admin')
        setChecking(false)
      }
    }
    check()
    return () => {
      active = false
    }
  }, [user, fetchProfile])

  if (loading || checking) {
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
