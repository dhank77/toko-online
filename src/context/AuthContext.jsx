import { useState, useEffect, useRef, createContext, useContext, useCallback } from 'react'
import { supabase } from '../utils/supabaseClient'
import { api } from '../utils/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [checkingAdmin, setCheckingAdmin] = useState(false)
  const userRef = useRef(user)

  useEffect(() => {
    userRef.current = user
  }, [user])

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
    const currentUser = userRef.current
    if (!currentUser) {
      setIsAdmin(false)
      return false
    }

    setCheckingAdmin(true)

    const tryCheck = async (retries = 2) => {
      try {
        const profile = await api.getProfile()
        console.log('Admin check profile:', profile)
        const admin = profile?.role === 'admin'
        setIsAdmin(admin)
        return admin
      } catch (err) {
        if (err.status === 429 && retries > 0) {
          console.error(`Admin check rate limited, retrying in 2s... (${retries} retries left)`)
          await new Promise((resolve) => setTimeout(resolve, 2000))
          return tryCheck(retries - 1)
        }

        console.error('Admin check error:', err)
        setIsAdmin(false)
        return false
      }
    }

    try {
      return await tryCheck()
    } finally {
      setCheckingAdmin(false)
    }
  }, [])

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
