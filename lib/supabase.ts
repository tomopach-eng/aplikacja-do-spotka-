import { createClient, SupabaseClient } from '@supabase/supabase-js'

let supabaseInstance: SupabaseClient | null = null
let supabaseAdminInstance: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (supabaseInstance) return supabaseInstance

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error('Missing Supabase environment variables')
  }

  supabaseInstance = createClient(url, key)
  return supabaseInstance
}

export function getSupabaseAdmin(): SupabaseClient {
  if (supabaseAdminInstance) return supabaseAdminInstance

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('Missing Supabase environment variables')
  }

  supabaseAdminInstance = createClient(url, key)
  return supabaseAdminInstance
}

// Lazy initialization for backward compatibility
// The Proxy defers client creation until runtime when properties are accessed
export const supabase = new Proxy({} as SupabaseClient, {
  get: (target, prop) => {
    const client = getSupabase()
    return (client as any)[prop]
  },
})

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get: (target, prop) => {
    const client = getSupabaseAdmin()
    return (client as any)[prop]
  },
})
