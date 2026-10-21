import { contactFallback, type ContactContent } from '@/data/fallback'
import { SectionEditor } from './SectionEditor'
import { Field, Input, Textarea } from './ui'

export default function ContactEditor() {
  return (
    <SectionEditor<ContactContent>
      section="contact"
      title="Contact"
      fallback={contactFallback}
      render={(v, set) => (
        <>
          <Field label="Intro text">
            <Textarea rows={3} value={v.intro} onChange={(e) => set({ ...v, intro: e.target.value })} />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Email">
              <Input type="email" value={v.email} onChange={(e) => set({ ...v, email: e.target.value })} />
            </Field>
            <Field label="Phone">
              <Input value={v.phone} onChange={(e) => set({ ...v, phone: e.target.value })} />
            </Field>
            <Field label="Location">
              <Input value={v.location} onChange={(e) => set({ ...v, location: e.target.value })} />
            </Field>
            <Field label="GitHub URL">
              <Input value={v.github} onChange={(e) => set({ ...v, github: e.target.value })} />
            </Field>
            <Field label="LinkedIn URL">
              <Input value={v.linkedin} onChange={(e) => set({ ...v, linkedin: e.target.value })} />
            </Field>
          </div>
        </>
      )}
    />
  )
}
