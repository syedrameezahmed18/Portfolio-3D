import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/motion'
import { lockScroll, scrollToId } from '@/lib/smooth-scroll'
import Magnetic from './ui/Magnetic'

const links = [
  { label: 'About', href: '#about' },
  { label: 'Work', href: '#work' },
  { label: 'Capabilities', href: '#capabilities' },
  { label: 'Stack', href: '#stack' },
  { label: 'Contact', href: '#contact' },
]

const useLeipzigTime = () => {
  const [time, setTime] = useState('')
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Berlin',
      hour: '2-digit',
      minute: '2-digit',
    })
    const tick = () => setTime(fmt.format(new Date()))
    tick()
    const id = window.setInterval(tick, 10_000)
    return () => window.clearInterval(id)
  }, [])
  return time
}

export default function Nav() {
  const bar = useRef<HTMLElement>(null)
  const overlay = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const time = useLeipzigTime()

  // Slide the bar away when scrolling down, bring it back on any upward move.
  useGSAP(() => {
    const show = gsap.quickTo(bar.current, 'yPercent', { duration: 0.5, ease: 'power3.out' })
    ScrollTrigger.create({
      start: 80,
      end: 'max',
      onUpdate: (self) => show(self.direction === 1 ? -110 : 0),
    })
  })

  useGSAP(
    () => {
      if (!overlay.current) return
      gsap.set(overlay.current, { clipPath: 'inset(0 0 100% 0)' })
    },
    { scope: overlay },
  )

  const toggle = (next: boolean) => {
    setOpen(next)
    lockScroll(next)
    if (!overlay.current) return
    gsap.to(overlay.current, {
      clipPath: next ? 'inset(0 0 0% 0)' : 'inset(0 0 100% 0)',
      duration: 0.9,
      ease: 'expo.inOut',
    })
    if (next) {
      gsap.fromTo(
        '.ov-link > span',
        { yPercent: 110 },
        { yPercent: 0, duration: 0.9, ease: 'expo.out', stagger: 0.06, delay: 0.3 },
      )
    }
  }

  const go = (href: string) => {
    if (open) toggle(false)
    window.setTimeout(() => scrollToId(href), open ? 500 : 0)
  }

  return (
    <>
      <header
        ref={bar}
        className="fixed top-0 left-0 z-50 flex w-full items-center justify-between px-6 py-5 mix-blend-difference md:px-10"
      >
        <button
          type="button"
          onClick={() => go('#top')}
          className="font-display text-sm font-semibold tracking-tight"
          aria-label="Back to top"
        >
          SRA<span className="text-ember">.</span>
        </button>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {links.map((l) => (
            <button
              key={l.href}
              type="button"
              onClick={() => go(l.href)}
              className="label link-line hover:text-bone"
            >
              {l.label}
            </button>
          ))}
        </nav>

        <div className="hidden items-center gap-6 md:flex">
          <span className="label tabular-nums">Leipzig {time}</span>
          <span className="label flex items-center gap-2">
            <span className="pulse-dot relative inline-block h-1.5 w-1.5 rounded-full bg-ember" />
            Open to work
          </span>
        </div>

        <Magnetic className="md:hidden">
          <button
            type="button"
            onClick={() => toggle(!open)}
            className="label flex h-10 items-center"
            aria-expanded={open}
            aria-controls="menu"
          >
            {open ? 'Close' : 'Menu'}
          </button>
        </Magnetic>
      </header>

      <div
        id="menu"
        ref={overlay}
        className="fixed inset-0 z-40 flex flex-col justify-end bg-ink px-6 pb-10 md:hidden"
      >
        <nav className="flex flex-col gap-2" aria-label="Mobile">
          {links.map((l, i) => (
            <button
              key={l.href}
              type="button"
              onClick={() => go(l.href)}
              className="ov-link mask text-left text-[clamp(2.6rem,12vw,4.5rem)] leading-none font-medium"
            >
              <span>
                <span className="mr-3 align-top font-mono text-xs text-ember">0{i + 1}</span>
                {l.label}
              </span>
            </button>
          ))}
        </nav>
        <div className="label mt-10 flex justify-between">
          <span>Leipzig {time}</span>
          <span>Open to work</span>
        </div>
      </div>
    </>
  )
}
