import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase, errorMessage, isSupabaseConfigured } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { Button, Field, Input, useToast } from '@/components/admin/ui'

type Mode = 'signin' | 'signup'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [mode, setMode] = useState<Mode>('signin')
  const [checked, setChecked] = useState(false)
  const [unreachable, setUnreachable] = useState(!isSupabaseConfigured)
  const toast = useToast()
  const navigate = useNavigate()
  const { session, isAdmin, loading } = useAuth()

  // First visitor with no admin on record gets a sign-up form instead.
  useEffect(() => {
    if (!isSupabaseConfigured) return
    let cancelled = false
    ;(async () => {
      try {
        const { data, error } = await supabase.rpc('admin_exists')
        if (cancelled) return
        if (error) setUnreachable(true)
        else setMode(data ? 'signin' : 'signup')
      } catch {
        if (!cancelled) setUnreachable(true)
      } finally {
        if (!cancelled) setChecked(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!loading && session && isAdmin) navigate('/admin', { replace: true })
  }, [loading, session, isAdmin, navigate])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        })
        if (error) throw error
        toast({ title: 'Admin account created', description: 'You can sign in now.', tone: 'ok' })
        setMode('signin')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        navigate('/admin', { replace: true })
      }
    } catch (err) {
      toast({ title: 'Sign-in failed', description: errorMessage(err), tone: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-svh items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <p className="label mb-6">
          <Link to="/" className="link-line">
            ← Back to site
          </Link>
        </p>
        <h1 className="text-4xl font-medium tracking-tight">
          {mode === 'signup' ? 'Create the admin' : 'Admin'}
          <span className="text-ember">.</span>
        </h1>
        <p className="mt-3 text-bone-dim">
          {mode === 'signup' ? 'No admin exists yet. The first account becomes the admin.' : 'Sign in to edit the site content.'}
        </p>

        {unreachable && (
          <p className="mt-6 rounded-xl border border-ember/50 p-4 text-sm text-bone-dim">
            Supabase is not reachable right now, so signing in will fail. Check the project is running and the
            env values are set.
          </p>
        )}

        <form onSubmit={submit} className="mt-10 space-y-6">
          <Field label="Email">
            <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field label="Password">
            <Input
              id="password"
              type="password"
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
          <Button type="submit" className="w-full justify-center" disabled={submitting || (!checked && !unreachable)}>
            {submitting ? 'Please wait…' : mode === 'signup' ? 'Create admin' : 'Sign in'}
          </Button>
        </form>
      </div>
    </main>
  )
}
