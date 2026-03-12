import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Demo mode when env vars are missing or placeholder
export const isDemoMode = !supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project-id')

// Safely create Supabase client — never crash the app
let _client = null
if (!isDemoMode) {
  try {
    _client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  } catch (err) {
    console.error('[LitSurvey] Supabase init failed, falling back to demo mode:', err)
    _client = null
  }
}

export const supabase = _client
