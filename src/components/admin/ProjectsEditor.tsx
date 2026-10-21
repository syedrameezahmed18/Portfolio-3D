import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { supabase, errorMessage } from '@/lib/supabase'
import type { Tables, TablesInsert } from '@/lib/database.types'
import { projectsFallback } from '@/data/fallback'
import { Button, Card, Field, Input, Spinner, Textarea, Toggle, useToast } from './ui'

type Row = Tables<'projects'>
type Draft = Omit<Row, 'id' | 'created_at' | 'updated_at'> & { id?: string }

const empty: Draft = {
  title: '',
  description: '',
  image_url: null,
  tags: [],
  live_url: '',
  github_url: '',
  is_contribution: false,
  sort_order: 0,
}

const safeName = (name: string) => `${Date.now()}-${name.replace(/[^a-zA-Z0-9.-]/g, '_')}`

export default function ProjectsEditor() {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Draft | null>(null)
  const [tagsInput, setTagsInput] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const toast = useToast()
  const qc = useQueryClient()

  const load = async () => {
    const { data, error } = await supabase.from('projects').select('*').order('sort_order')
    if (error) toast({ title: 'Could not load projects', description: errorMessage(error), tone: 'error' })
    setRows(data ?? [])
    setLoading(false)
  }
  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const invalidate = () => qc.invalidateQueries({ queryKey: ['projects'] })

  const openNew = () => {
    setEditing({ ...empty, sort_order: rows.length + 1 })
    setTagsInput('')
    setImageFile(null)
  }
  const openEdit = (r: Row) => {
    setEditing({ ...r })
    setTagsInput(r.tags.join(', '))
    setImageFile(null)
  }

  const remove = async (id: string, title: string) => {
    if (!window.confirm(`Delete “${title}”?`)) return
    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (error) return toast({ title: 'Delete failed', description: errorMessage(error), tone: 'error' })
    toast({ title: 'Deleted', tone: 'ok' })
    invalidate()
    void load()
  }

  const save = async () => {
    if (!editing) return
    if (!editing.title.trim()) return toast({ title: 'Title is required', tone: 'error' })
    setSaving(true)
    try {
      let image_url = editing.image_url
      if (imageFile) {
        const path = safeName(imageFile.name)
        const { error } = await supabase.storage.from('project-images').upload(path, imageFile, { upsert: false })
        if (error) throw error
        image_url = supabase.storage.from('project-images').getPublicUrl(path).data.publicUrl
      }
      const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean)
      const row: TablesInsert<'projects'> = {
        ...editing,
        image_url,
        tags,
        live_url: editing.live_url || null,
        github_url: editing.github_url || null,
      }
      if (!row.id) delete row.id
      const { error } = await supabase.from('projects').upsert(row)
      if (error) throw error
      toast({ title: 'Project saved', tone: 'ok' })
      setEditing(null)
      invalidate()
      await load()
    } catch (err) {
      toast({ title: 'Save failed', description: errorMessage(err), tone: 'error' })
    } finally {
      setSaving(false)
    }
  }

  /** Copies the site's built-in projects into the table as a starting point. */
  const seed = async () => {
    const inserts: TablesInsert<'projects'>[] = projectsFallback.map((p, i) => ({
      title: p.title,
      description: p.description,
      image_url: null,
      tags: p.tags,
      live_url: p.liveUrl,
      github_url: p.githubUrl,
      is_contribution: p.isContribution,
      sort_order: i + 1,
    }))
    const { error } = await supabase.from('projects').insert(inserts)
    if (error) return toast({ title: 'Seed failed', description: errorMessage(error), tone: 'error' })
    toast({ title: 'Site defaults imported', description: 'Local artwork stays attached by title until you upload images.', tone: 'ok' })
    invalidate()
    void load()
  }

  if (loading) return <Spinner />

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="label">
          {rows.length === 0 ? 'No rows yet. The site is showing its built-in projects.' : `${rows.length} project${rows.length === 1 ? '' : 's'}`}
        </p>
        <div className="flex gap-2">
          {rows.length === 0 && (
            <Button variant="outline" size="sm" onClick={seed}>
              Import site defaults
            </Button>
          )}
          <Button size="sm" onClick={openNew}>
            <Plus className="h-4 w-4" /> New project
          </Button>
        </div>
      </div>

      {editing && (
        <Card title={editing.id ? 'Edit project' : 'New project'}>
          <Field label="Title">
            <Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
          </Field>
          <Field label="Description" hint="Clamped to three lines on the card; the full text shows on hover.">
            <Textarea rows={5} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
          </Field>
          <Field label="Tags" hint="Comma separated.">
            <Input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="React, Node.js, Postgres" />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Live URL">
              <Input value={editing.live_url ?? ''} onChange={(e) => setEditing({ ...editing, live_url: e.target.value })} />
            </Field>
            <Field label="GitHub URL">
              <Input value={editing.github_url ?? ''} onChange={(e) => setEditing({ ...editing, github_url: e.target.value })} />
            </Field>
            <Field label="Sort order">
              <Input type="number" value={editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} />
            </Field>
            <div className="flex items-end pb-2">
              <Toggle checked={editing.is_contribution} onChange={(c) => setEditing({ ...editing, is_contribution: c })} label="Mark as a contribution" />
            </div>
          </div>
          <Field label="Image" hint="PNG or JPG. Shown letter-boxed on a dark frame.">
            {editing.image_url && (
              <img src={editing.image_url} alt="" className="mb-3 h-28 w-40 rounded-lg bg-white object-contain p-2" />
            )}
            <Input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} />
          </Field>
          <div className="flex gap-3 pt-2">
            <Button onClick={save} disabled={saving}>
              {saving ? 'Saving…' : 'Save project'}
            </Button>
            <Button variant="ghost" onClick={() => setEditing(null)}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      <ul className="space-y-3">
        {rows.map((r) => (
          <li key={r.id} className="flex items-center gap-4 rounded-2xl border border-line bg-ink-2/60 p-4">
            <div className="flex h-16 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white">
              {r.image_url ? <img src={r.image_url} alt="" className="h-full w-full object-contain p-1" /> : <span className="font-mono text-[10px] text-ink">no image</span>}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">
                <span className="mr-2 font-mono text-xs text-ember">{String(r.sort_order).padStart(2, '0')}</span>
                {r.title}
              </p>
              <p className="line-clamp-2 text-sm text-bone-dim">{r.description}</p>
              {r.tags.length > 0 && <p className="label mt-1">{r.tags.join(' · ')}</p>}
            </div>
            <div className="flex shrink-0 gap-2">
              <Button variant="outline" size="icon" aria-label="Edit" onClick={() => openEdit(r)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="danger" size="icon" aria-label="Delete" onClick={() => remove(r.id, r.title)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
