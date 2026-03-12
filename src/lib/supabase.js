import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Demo mode activates only when env vars are missing
export const isDemoMode = !supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project-id')

export const supabase = isDemoMode
  ? null
  : createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
