import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ArrowUpRight } from 'lucide-react'
import emailjs from '@emailjs/browser'
import { gsap, prefersReducedMotion, useGSAP } from '@/lib/motion'
import { useSiteContent } from '@/hooks/useContent'
import { contactFallback, type ContactContent } from '@/data/fallback'
import Magnetic from './ui/Magnetic'

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID
const TEMPLATE_ID = 'template_95grbzs'
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY
const COOLDOWN_SECONDS = 60
const COOLDOWN_KEY = 'lastFormSubmission'

type Status = { kind: 'idle' } | { kind: 'sent' } | { kind: 'error'; message: string }

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

export default function Contact() {
  const root = useRef<HTMLElement>(null)
  const form = useRef<HTMLFormElement>(null)
  const c = useSiteContent<ContactContent>('contact', contactFallback)

  const [values, setValues] = useState({ name: '', email: '', message: '' })
  const [errors, setErrors] = useState<Partial<typeof values>>({})
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const [cooldown, setCooldown] = useState(0)

  // Resume any cooldown left over from a previous visit.
  useEffect(() => {
    const last = Number(localStorage.getItem(COOLDOWN_KEY) ?? 0)
    const elapsed = Math.floor((Date.now() - last) / 1000)
    if (last && elapsed < COOLDOWN_SECONDS) setCooldown(COOLDOWN_SECONDS - elapsed)
  }, [])

  useEffect(() => {
    if (cooldown <= 0) return
    const id = window.setTimeout(() => setCooldown((s) => s - 1), 1000)
    return () => window.clearTimeout(id)
  }, [cooldown])

  useEffect(() => {
    if (PUBLIC_KEY) emailjs.init(PUBLIC_KEY)
  }, [])

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.from('.contact-line > span', {
        yPercent: 110,
        duration: 1.2,
        ease: 'expo.out',
        stagger: 0.08,
        scrollTrigger: { trigger: root.current, start: 'top 75%', once: true },
      })
      gsap.from('.contact-rise', {
        y: 30,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        stagger: 0.08,
        scrollTrigger: { trigger: '.contact-grid', start: 'top 80%', once: true },
      })
    },
    { scope: root },
  )

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setValues((v) => ({ ...v, [name]: value }))
    if (errors[name as keyof typeof values]) setErrors((er) => ({ ...er, [name]: undefined }))
  }

  const validate = () => {
    const next: Partial<typeof values> = {}
    if (!values.name.trim()) next.name = 'Name is required'
    if (!values.email.trim()) next.email = 'Email is required'
    else if (!emailOk(values.email)) next.email = 'Enter a valid email'
    if (!values.message.trim()) next.message = 'Message is required'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (cooldown > 0 || sending) return
    if (!validate()) return
    if (!SERVICE_ID || !PUBLIC_KEY || !form.current) {
      setStatus({ kind: 'error', message: 'The contact form is not configured yet. Email me directly instead.' })
      return
    }
    setSending(true)
    setStatus({ kind: 'idle' })
    try {
      await emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, form.current, PUBLIC_KEY)
      localStorage.setItem(COOLDOWN_KEY, String(Date.now()))
      setValues({ name: '', email: '', message: '' })
      setStatus({ kind: 'sent' })
      setCooldown(COOLDOWN_SECONDS)
    } catch (err) {
      console.error('EmailJS error:', err)
      setStatus({ kind: 'error', message: 'Something went wrong. Please try again in a moment.' })
    } finally {
      setSending(false)
    }
  }

  const disabled = sending || cooldown > 0

  return (
    <section id="contact" ref={root} className="relative px-6 py-28 md:px-10 md:py-40">
      <div className="label mb-10 flex items-center gap-3">
        <span className="text-ember">(05)</span>
        <span>Contact</span>
      </div>

      <h2 className="text-[clamp(2.8rem,8.5vw,8.5rem)] leading-[0.92] font-medium">
        <span className="contact-line mask">
          <span>Let’s build</span>
        </span>
        <br />
        <span className="contact-line mask">
          <span>
            something <span className="font-serif-italic font-normal text-ember">worth</span>
          </span>
        </span>
        <br />
        <span className="contact-line mask">
          <span>remembering.</span>
        </span>
      </h2>

      <div className="contact-grid mt-20 grid gap-16 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-5">
          <p className="contact-rise max-w-md text-lg leading-relaxed text-bone-dim">{c.intro}</p>

          <div className="contact-rise mt-12">
            <p className="label mb-3">Email</p>
            <a
              href={`mailto:${c.email}`}
              className="link-line text-[clamp(1.3rem,2.6vw,2.2rem)] leading-tight font-medium tracking-tight break-all"
            >
              {c.email}
            </a>
          </div>

          <dl className="contact-rise mt-10 grid grid-cols-2 gap-6">
            <div>
              <dt className="label mb-2">Phone</dt>
              <dd>
                <a href={`tel:${c.phone.replace(/\s+/g, '')}`} className="link-line">
                  {c.phone}
                </a>
              </dd>
            </div>
            <div>
              <dt className="label mb-2">Based in</dt>
              <dd>{c.location}</dd>
            </div>
          </dl>

          <ul className="contact-rise mt-10 flex gap-6">
            {[
              { label: 'GitHub', href: c.github },
              { label: 'LinkedIn', href: c.linkedin },
            ].map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="label link-line inline-flex items-center gap-1 text-bone"
                >
                  {s.label}
                  <ArrowUpRight className="h-3 w-3" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <form
          ref={form}
          onSubmit={onSubmit}
          noValidate
          className="contact-rise md:col-span-6 md:col-start-7"
          aria-describedby="form-status"
        >
          <div className="grid gap-8 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="label">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                value={values.name}
                onChange={onChange}
                disabled={disabled}
                aria-invalid={Boolean(errors.name)}
                className="field"
                placeholder="Your name"
              />
              {errors.name && <p className="mt-2 font-mono text-xs text-ember">{errors.name}</p>}
            </div>
            <div>
              <label htmlFor="email" className="label">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={values.email}
                onChange={onChange}
                disabled={disabled}
                aria-invalid={Boolean(errors.email)}
                className="field"
                placeholder="you@example.com"
              />
              {errors.email && <p className="mt-2 font-mono text-xs text-ember">{errors.email}</p>}
            </div>
          </div>

          <div className="mt-8">
            <label htmlFor="message" className="label">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              value={values.message}
              onChange={onChange}
              disabled={disabled}
              aria-invalid={Boolean(errors.message)}
              className="field resize-none"
              placeholder="Tell me about the project"
            />
            {errors.message && <p className="mt-2 font-mono text-xs text-ember">{errors.message}</p>}
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-6">
            <Magnetic>
              <button
                type="submit"
                disabled={disabled}
                data-cursor="send"
                className="group inline-flex items-center gap-2 rounded-full bg-bone px-7 py-3.5 text-sm font-medium text-ink transition-colors hover:bg-ember disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sending ? 'Sending…' : cooldown > 0 ? `Wait ${cooldown}s` : 'Send message'}
                <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:rotate-45" />
              </button>
            </Magnetic>
            <p id="form-status" role="status" aria-live="polite" className="font-mono text-xs text-bone-dim">
              {status.kind === 'sent' && 'Message sent. I’ll get back to you soon.'}
              {status.kind === 'error' && <span className="text-ember">{status.message}</span>}
            </p>
          </div>
        </form>
      </div>
    </section>
  )
}
