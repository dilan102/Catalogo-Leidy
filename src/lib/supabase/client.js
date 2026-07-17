import { createClient as createSupabaseClient } from '@supabase/supabase-js'

let supabase = null

export function createClient() {
  if (supabase) {
    return supabase
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Faltan VITE_SUPABASE_URL o VITE_SUPABASE_PUBLISHABLE_KEY en .env.')
  }

  supabase = createSupabaseClient(supabaseUrl, supabaseKey)
  return supabase
}
