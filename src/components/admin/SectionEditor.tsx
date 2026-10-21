import { useEffect, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase, errorMessage } from '@/lib/supabase'
import type { Json } from '@/lib/database.types'
import { Button, Card, Spinner, useToast } from './ui'

interface Props<T extends object> {
  section: string
  title: string
  /** The site's built-in content; shown when the table has no row yet. */
  fallback: T
  render: (value: T, set: (v: T) => void) => ReactNode
}

/**
 * Loads one `site_content` row merged over the site fallback, lets the
 * editor mutate it, and upserts it back. Saving with no row present writes
 * the fallback plus edits, so the first save never produces empty fields.
 */
export function SectionEditor<T extends object>({ section, title, fallback, render }: Props<T>) {
  const [value, setValue] = useState<T>(fallback)
  const [hasRow, setHasRow] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const toast = useToast()
  const qc = useQueryClient()

  useEffect(() => {
    let cancelled = false
    supabase
      .from('site_content')
      .select('content')
      .eq('section', section)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return
        // PGRST116 is PostgREST's "no rows" for a single-object request: not an error here.
        if (error && error.code !== 'PGRST116') toast({ title: 'Could not load', description: errorMessage(error), tone: 'error' })
        if (data?.content && typeof data.content === 'object') {
          setValue({ ...fallback, ...(data.content as Partial<T>) })
          setHasRow(true)
        }
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
    // The fallback is a module constant; only the section matters here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section])

  const save = async () => {
    setSaving(true)
    const { error } = await supabase
      .from('site_content')
      .upsert({ section, content: value as unknown as Json, updated_at: new Date().toISOString() })
    setSaving(false)
    if (error) {
      toast({ title: 'Save failed', description: errorMessage(error), tone: 'error' })
      return
    }
    setHasRow(true)
    toast({ title: 'Saved', description: `${title} updated.`, tone: 'ok' })
    qc.invalidateQueries({ queryKey: ['site_content', section] })
  }

  const reset = () => setValue(fallback)

  if (loading) return <Spinner />

  return (
    <Card
      title={title}
      actions={
        !hasRow && <span className="label rounded-full border border-line px-2 py-1">Showing site defaults</span>
      }
    >
      {render(value, setValue)}
      <div className="flex flex-wrap items-center gap-3 pt-2">
        <Button onClick={save} disabled={saving}>
          {saving ? 'Saving…' : 'Save changes'}
        </Button>
        <Button variant="ghost" size="sm" onClick={reset}>
          Reset to site defaults
        </Button>
      </div>
    </Card>
  )
}
