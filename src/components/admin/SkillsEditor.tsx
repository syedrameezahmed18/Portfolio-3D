import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Trash2 } from 'lucide-react'
import { supabase, errorMessage } from '@/lib/supabase'
import type { TablesInsert } from '@/lib/database.types'
import { skillsFallback } from '@/data/fallback'
import { Button, Card, Input, Label, Spinner, useToast } from './ui'

type Category = 'frontend' | 'backend' | 'other'

interface Skill {
  id?: string
  category: Category
  name: string
  percentage: number
  icon: string
  sort_order: number
}

const CATS: { key: Category; title: string }[] = [
  { key: 'frontend', title: 'Frontend' },
  { key: 'backend', title: 'Backend' },
  { key: 'other', title: 'Tooling & cloud' },
]

export default function SkillsEditor() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const toast = useToast()
  const qc = useQueryClient()

  const load = async () => {
    const { data, error } = await supabase.from('skills').select('*').order('category').order('sort_order')
    if (error) toast({ title: 'Could not load skills', description: errorMessage(error), tone: 'error' })
    setSkills(((data ?? []) as Skill[]).map((s) => ({ ...s })))
    setLoading(false)
  }
  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const invalidate = () => qc.invalidateQueries({ queryKey: ['skills'] })

  const update = (idx: number, patch: Partial<Skill>) =>
    setSkills((list) => list.map((s, i) => (i === idx ? { ...s, ...patch } : s)))

  const add = (category: Category) =>
    setSkills((list) => [
      ...list,
      { category, name: '', percentage: 80, icon: '⭐', sort_order: list.filter((s) => s.category === category).length + 1 },
    ])

  const remove = async (idx: number) => {
    const s = skills[idx]
    if (s.id) {
      const { error } = await supabase.from('skills').delete().eq('id', s.id)
      if (error) return toast({ title: 'Delete failed', description: errorMessage(error), tone: 'error' })
      invalidate()
    }
    setSkills((list) => list.filter((_, i) => i !== idx))
  }

  const saveAll = async () => {
    setSaving(true)
    const rows: TablesInsert<'skills'>[] = skills
      .map((s) => ({ ...s, name: s.name.trim(), percentage: Math.min(100, Math.max(0, s.percentage)) }))
      .filter((s) => s.name)
      .map((s) => {
        const row: TablesInsert<'skills'> = { ...s }
        if (!row.id) delete row.id
        return row
      })
    const { error } = await supabase.from('skills').upsert(rows)
    setSaving(false)
    if (error) return toast({ title: 'Save failed', description: errorMessage(error), tone: 'error' })
    toast({ title: 'Skills saved', tone: 'ok' })
    invalidate()
    void load()
  }

  const seed = () =>
    setSkills(
      skillsFallback.map((s, i) => ({
        category: (s.category as Category) ?? 'other',
        name: s.name,
        percentage: s.percentage,
        icon: '⭐',
        sort_order: i + 1,
      })),
    )

  if (loading) return <Spinner />

  return (
    <div className="space-y-5">
      {skills.length === 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line p-4">
          <p className="label">No rows yet. The site is showing its built-in skills.</p>
          <Button variant="outline" size="sm" onClick={seed}>
            Load site defaults into the form
          </Button>
        </div>
      )}

      {CATS.map((cat) => (
        <Card key={cat.key} title={cat.title}>
          <div className="space-y-3">
            {skills.map(
              (s, i) =>
                s.category === cat.key && (
                  <div key={s.id ?? `new-${i}`} className="grid grid-cols-12 items-end gap-2">
                    <div className="col-span-12 sm:col-span-7">
                      <Label>Name</Label>
                      <Input value={s.name} onChange={(e) => update(i, { name: e.target.value })} />
                    </div>
                    <div className="col-span-5 sm:col-span-2">
                      <Label>Level %</Label>
                      <Input type="number" min={0} max={100} value={s.percentage} onChange={(e) => update(i, { percentage: Number(e.target.value) })} />
                    </div>
                    <div className="col-span-4 sm:col-span-2">
                      <Label>Order</Label>
                      <Input type="number" value={s.sort_order} onChange={(e) => update(i, { sort_order: Number(e.target.value) })} />
                    </div>
                    <div className="col-span-3 flex justify-end sm:col-span-1">
                      <Button variant="danger" size="icon" aria-label="Remove" onClick={() => remove(i)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ),
            )}
            <Button variant="outline" size="sm" onClick={() => add(cat.key)}>
              + Add {cat.title.toLowerCase()} skill
            </Button>
          </div>
        </Card>
      ))}

      <Button onClick={saveAll} disabled={saving}>
        {saving ? 'Saving…' : 'Save all skills'}
      </Button>
    </div>
  )
}
