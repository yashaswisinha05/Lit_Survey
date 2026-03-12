import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase, isDemoMode } from '../lib/supabase'
import { ADMIN_EMAIL } from '../config/admin'

const AuthContext = createContext(null)

// Demo user for when Supabase is not configured
const DEMO_USER = {
  id: 'demo-user-001',
  email: 'demo@litsurvey.app',
  user_metadata: { full_name: 'Demo Researcher' }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(isDemoMode ? DEMO_USER : null)
  const [loading, setLoading] = useState(!isDemoMode)

  useEffect(() => {
    if (isDemoMode) return

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        if (loading) setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email, password, fullName) => {
    if (isDemoMode) { setUser(DEMO_USER); return { error: null } }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    })
    return { error }
  }

  const signIn = async (email, password) => {
    if (isDemoMode) { setUser(DEMO_USER); return { error: null } }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  const signOut = async () => {
    if (isDemoMode) { setUser(null); return }
    await supabase.auth.signOut()
    setUser(null)
  }

  // Admin check — only the configured email gets delete powers
  const isAdmin = user?.email === ADMIN_EMAIL

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut, isDemoMode, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
