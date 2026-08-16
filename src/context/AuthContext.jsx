import { useState, useEffect, createContext, useContext, useCallback } from 'react'
import { supabase } from '../utils/supabaseClient'
import { api } from '../utils/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [checkingAdmin, setCheckingAdmin] = useState(false)

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const signUp = async (email, password, metadata = {}) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata },
    })
    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const signInWithOAuth = async (provider) => {
    const { error } = await supabase.auth.signInWithOAuth({ provider })
    if (error) throw error
  }

  const checkAdmin = useCallback(async () => {
    if (!user) {
      setIsAdmin(false)
      return
    }
    setCheckingAdmin(true)
    try {
      const profile = await api.getProfile()
      console.log('Admin check profile:', profile)
      setIsAdmin(profile?.role === 'admin')
    } catch (err) {
      console.error('Admin check error:', err)
      setIsAdmin(false)
    } finally {
      setCheckingAdmin(false)
    }
  }, [user])

  const refreshAdminStatus = useCallback(async () => {
    await checkAdmin()
  }, [checkAdmin])

  const value = {
    user,
    loading,
    isAdmin,
    checkingAdmin,
    signIn,
    signUp,
    signOut,
    signInWithOAuth,
    checkAdmin,
    refreshAdminStatus,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
