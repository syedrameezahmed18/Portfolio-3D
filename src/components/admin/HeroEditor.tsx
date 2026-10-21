import { heroFallback, type HeroContent } from '@/data/fallback'
import { SectionEditor } from './SectionEditor'
import { Field, Input, Textarea } from './ui'

export default function HeroEditor() {
  return (
    <SectionEditor<HeroContent>
      section="hero"
      title="Hero"
      fallback={heroFallback}
      render={(v, set) => (
        <>
          <Field label="Greeting">
            <Input value={v.greeting} onChange={(e) => set({ ...v, greeting: e.target.value })} />
          </Field>
          <Field label="Name" hint="Rendered letter by letter, one word per line on phones.">
            <Input value={v.name} onChange={(e) => set({ ...v, name: e.target.value })} />
          </Field>
          <Field label="Title / role" hint="Shown in italics, lower-cased.">
            <Input value={v.title} onChange={(e) => set({ ...v, title: e.target.value })} />
          </Field>
          <Field label="Description">
            <Textarea rows={4} value={v.description} onChange={(e) => set({ ...v, description: e.target.value })} />
          </Field>
        </>
      )}
    />
  )
}
