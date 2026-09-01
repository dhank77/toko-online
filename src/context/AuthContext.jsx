import { useState, useEffect, useRef, createContext, useContext, useCallback } from 'react'
import { supabase } from '../utils/supabaseClient'
import { api } from '../utils/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [checkingAdmin, setCheckingAdmin] = useState(false)
  const userRef = useRef(null)
  const cachedAdminRef = useRef(null)
  const cachedAdminUserRef = useRef(null)
  const rateLimitUntilRef = useRef(null)

  useEffect(() => {
    userRef.current = user
    if (cachedAdminUserRef.current !== user?.id) {
      cachedAdminRef.current = null
      cachedAdminUserRef.current = user?.id || null
    }
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
    cachedAdminRef.current = null
    cachedAdminUserRef.current = null
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const signInWithOAuth = async (provider) => {
    const { error } = await supabase.auth.signInWithOAuth({ provider })
    if (error) throw error
  }

  const checkAdmin = useCallback(async (userId, bypassCache = false) => {
    const id = userId || userRef.current?.id
    if (!id) {
      setIsAdmin(false)
      return false
    }

    const now = Date.now()
    if (!bypassCache && rateLimitUntilRef.current && now < rateLimitUntilRef.current) {
      console.log('Rate limited, using cached value')
      return cachedAdminRef.current ?? false
    }

    if (!bypassCache && cachedAdminUserRef.current === id && cachedAdminRef.current !== null) {
      console.log('Using cached admin status:', cachedAdminRef.current)
      setIsAdmin(cachedAdminRef.current)
      return cachedAdminRef.current
    }

    setCheckingAdmin(true)

    try {
      const profile = await api.getProfile()
      console.log('Admin check profile:', profile)
      const admin = profile?.role === 'admin'
      setIsAdmin(admin)
      cachedAdminRef.current = admin
      cachedAdminUserRef.current = id
      rateLimitUntilRef.current = null
      return admin
    } catch (err) {
      console.error('Admin check error:', err)
      if (err.status === 429) {
        rateLimitUntilRef.current = now + 60000
        console.log('Rate limited for 60s, cache preserved')
      }
      setIsAdmin(false)
      return false
    } finally {
      setCheckingAdmin(false)
    }
  }, [])

  const refreshAdminStatus = useCallback(async () => {
    await checkAdmin(null, true)
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
