import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthContextValue {
  session: Session | null
  user: User | null
  isAdmin: boolean
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

/** Tracks the Supabase session and whether the user holds the admin role. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAdmin = async (userId: string | undefined) => {
      if (!userId) {
        setIsAdmin(false)
        return
      }
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle()
      setIsAdmin(Boolean(data))
    }

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
      // Deferred so the role query runs outside the auth callback.
      setTimeout(() => void checkAdmin(next?.user?.id), 0)
    })

    supabase.auth
      .getSession()
      .then(({ data: { session: s } }) => {
        setSession(s)
        return checkAdmin(s?.user?.id)
      })
      .catch(() => setIsAdmin(false))
      .finally(() => setLoading(false))

    return () => sub.subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, isAdmin, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
