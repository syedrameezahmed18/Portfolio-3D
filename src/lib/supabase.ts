import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

/** False when the env is missing; every query then short-circuits to its fallback. */
export const isSupabaseConfigured = Boolean(url && key)

// A placeholder URL keeps createClient from throwing at import time when the
// env is absent, so a missing config degrades to local content instead of a
// blank page.
export const supabase = createClient<Database>(
  url || 'https://placeholder.supabase.co',
  key || 'placeholder',
  // Sessions persist so the admin panel stays signed in across reloads.
  { auth: { persistSession: true, autoRefreshToken: true } },
)

/** Human-readable message from a Supabase or generic error. */
export const errorMessage = (err: unknown): string =>
  err instanceof Error ? err.message : typeof err === 'string' ? err : 'Something went wrong'
