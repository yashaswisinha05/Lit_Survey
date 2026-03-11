import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// When Supabase is not configured, we run in demo mode
export const isDemoMode = !supabaseUrl || supabaseUrl.includes('your-project-id')

export const supabase = isDemoMode
  ? null
  : createClient(supabaseUrl, supabaseAnonKey)
