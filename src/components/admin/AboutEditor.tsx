import { X } from 'lucide-react'
import { aboutFallback, type AboutContent } from '@/data/fallback'
import { SectionEditor } from './SectionEditor'
import { Button, Field, Input, Label, Textarea } from './ui'

function StringList({
  label,
  items,
  onChange,
  hint,
}: {
  label: string
  items: string[]
  onChange: (next: string[]) => void
  hint?: string
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-6 font-mono text-xs text-ember">{String(i + 1).padStart(2, '0')}</span>
            <Input
              value={item}
              onChange={(e) => {
                const next = [...items]
                next[i] = e.target.value
                onChange(next)
              }}
            />
            <Button variant="outline" size="icon" aria-label="Remove" onClick={() => onChange(items.filter((_, j) => j !== i))}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => onChange([...items, ''])}>
          + Add
        </Button>
      </div>
      {hint && <p className="mt-1.5 font-mono text-[11px] text-bone-mute">{hint}</p>}
    </div>
  )
}

export default function AboutEditor() {
  return (
    <SectionEditor<AboutContent>
      section="about"
      title="About"
      fallback={aboutFallback}
      render={(v, set) => (
        <>
          <Field label="Lead paragraph" hint="Revealed word by word as the visitor scrolls.">
            <Textarea rows={5} value={v.paragraph1} onChange={(e) => set({ ...v, paragraph1: e.target.value })} />
          </Field>
          <Field label="Second paragraph">
            <Textarea rows={3} value={v.paragraph2} onChange={(e) => set({ ...v, paragraph2: e.target.value })} />
          </Field>
          <StringList
            label="Frontend highlights"
            items={v.highlights}
            onChange={(highlights) => set({ ...v, highlights })}
            hint="Four reads best: they sit in a two-column grid."
          />
          <StringList
            label="Backend highlights"
            items={v.backend_highlights}
            onChange={(backend_highlights) => set({ ...v, backend_highlights })}
          />
          <Field label="“Hire me” link">
            <Input value={v.hire_url} onChange={(e) => set({ ...v, hire_url: e.target.value })} />
          </Field>
          <Field label="CV link" hint="Managed from the CV tab; upload a PDF there to replace it.">
            <Input value={v.cv_url} readOnly className="text-bone-dim" />
          </Field>
        </>
      )}
    />
  )
}
