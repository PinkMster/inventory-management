'use server'

import { createClient } from '@supabase/supabase-js'
import { Database } from '../database.types'

export const createServerSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

  return createClient<Database>(supabaseUrl, supabaseKey)
}

// Export the admin client directly for easier imports in server components
export const supabaseAdmin = createServerSupabaseClient()