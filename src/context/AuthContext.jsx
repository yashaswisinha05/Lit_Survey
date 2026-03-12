import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase, isDemoMode } from '../lib/supabase'
import { ADMIN_EMAIL } from '../config/admin'

const AuthContext = createContext(null)

const DEMO_USER = {
  id: 'demo-user-001',
  email: 'demo@litsurvey.app',
  user_metadata: { full_name: 'Demo Researcher' }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(isDemoMode ? DEMO_USER : null)
  const [loading, setLoading] = useState(!isDemoMode)

  useEffect(() => {
    // No Supabase client available — stay in demo mode
    if (isDemoMode || !supabase) return

    let subscription = null

    const init = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('[LitSurvey] getSession error:', error.message)
        } else {
          setUser(session?.user ?? null)
        }
      } catch (err) {
        console.error('[LitSurvey] Auth init failed:', err)
      } finally {
        setLoading(false)
      }
    }

    init()

    try {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null)
      })
      subscription = data?.subscription
    } catch (err) {
      console.error('[LitSurvey] Auth listener failed:', err)
    }

    return () => {
      try { subscription?.unsubscribe() } catch (_) {}
    }
  }, [])

  const signUp = async (email, password, fullName) => {
    if (isDemoMode || !supabase) { setUser(DEMO_USER); return { error: null } }
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } }
      })
      return { error }
    } catch (err) {
      return { error: { message: 'Sign up failed. Please try again.' } }
    }
  }

  const signIn = async (email, password) => {
    if (isDemoMode || !supabase) { setUser(DEMO_USER); return { error: null } }
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      return { error }
    } catch (err) {
      return { error: { message: 'Sign in failed. Please check your connection.' } }
    }
  }

  const signOut = async () => {
    if (isDemoMode || !supabase) { setUser(null); return }
    try { await supabase.auth.signOut() } catch (_) {}
    setUser(null)
  }

  const isAdmin = user?.email === ADMIN_EMAIL

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut, isDemoMode, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
