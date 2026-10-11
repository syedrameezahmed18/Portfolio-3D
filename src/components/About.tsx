import { useRef } from 'react'
import { ArrowUpRight, Download } from 'lucide-react'
import { gsap, isFinePointer, prefersReducedMotion, useGSAP } from '@/lib/motion'
import { useSiteContent } from '@/hooks/useContent'
import { aboutFallback, type AboutContent } from '@/data/fallback'
import portrait from '@/assets/main-profile.jpg'
import Magnetic from './ui/Magnetic'

export default function About() {
  const root = useRef<HTMLElement>(null)
  const card = useRef<HTMLDivElement>(null)
  const c = useSiteContent<AboutContent>('about', aboutFallback)
  const words = c.paragraph1.split(' ')

  useGSAP(
    () => {
      if (prefersReducedMotion()) return

      // Words brighten one by one as the paragraph is scrolled through.
      gsap.fromTo(
        '.about-word',
        { opacity: 0.14 },
        {
          opacity: 1,
          ease: 'none',
          stagger: 0.03,
          scrollTrigger: {
            trigger: '.about-lead',
            start: 'top 72%',
            end: 'bottom 45%',
            scrub: true,
          },
        },
      )

      gsap.from('.about-rise', {
        y: 36,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        stagger: 0.08,
        scrollTrigger: { trigger: '.about-grid', start: 'top 78%', once: true },
      })

      // The portrait drifts slower than the page.
      gsap.to(card.current, {
        yPercent: -14,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true },
      })

      if (!isFinePointer() || !card.current) return
      const el = card.current
      const rx = gsap.quickTo(el, 'rotationX', { duration: 0.6, ease: 'power3.out' })
      const ry = gsap.quickTo(el, 'rotationY', { duration: 0.6, ease: 'power3.out' })
      const move = (e: MouseEvent) => {
        const r = el.getBoundingClientRect()
        const px = (e.clientX - r.left) / r.width - 0.5
        const py = (e.clientY - r.top) / r.height - 0.5
        ry(px * 16)
        rx(-py * 16)
      }
      const leave = () => {
        rx(0)
        ry(0)
      }
      el.addEventListener('mousemove', move)
      el.addEventListener('mouseleave', leave)
      return () => {
        el.removeEventListener('mousemove', move)
        el.removeEventListener('mouseleave', leave)
      }
    },
    { scope: root, dependencies: [c.paragraph1], revertOnUpdate: true },
  )

  return (
    <section id="about" ref={root} className="relative px-6 py-28 md:px-10 md:py-40">
      <div className="label mb-10 flex items-center gap-3">
        <span className="text-ember">(01)</span>
        <span>About</span>
      </div>

      <p className="about-lead max-w-5xl text-[clamp(1.5rem,3.4vw,3.1rem)] leading-[1.18] font-normal tracking-[-0.02em]">
        {words.map((w, i) => (
          <span key={i} className="about-word inline-block">
            {w}
            {i < words.length - 1 ? ' ' : ''}
          </span>
        ))}
      </p>

      <div className="about-grid mt-20 grid gap-12 md:mt-28 md:grid-cols-12 md:gap-8">
        <div className="about-rise md:col-span-5" style={{ perspective: '1200px' }}>
          <div ref={card} className="relative aspect-[4/5] max-w-md will-change-transform" style={{ transformStyle: 'preserve-3d' }}>
            <div className="absolute inset-0 translate-x-4 translate-y-4 border border-ember/50" />
            <img
              src={portrait}
              alt={`Portrait of ${aboutFallback.highlights.length ? 'Syed Rameez Ahmed' : ''}`}
              className="relative h-full w-full object-cover grayscale-[20%] contrast-[1.05]"
              loading="lazy"
            />
            <span className="label absolute bottom-4 left-4 bg-ink/80 px-2 py-1 backdrop-blur">Germany</span>
          </div>
        </div>

        <div className="md:col-span-6 md:col-start-7">
          <p className="about-rise text-lg leading-relaxed text-bone-dim md:text-xl">{c.paragraph2}</p>

          <ul className="about-rise mt-10 grid grid-cols-2 gap-x-6">
            {c.highlights.map((h, i) => (
              <li key={h} className="line-top flex items-baseline gap-3 py-4 text-base">
                <span className="font-mono text-xs text-ember">0{i + 1}</span>
                {h}
              </li>
            ))}
          </ul>

          <div className="about-rise mt-10 flex flex-wrap items-center gap-4">
            <Magnetic>
              <a
                href={c.hire_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 rounded-full border border-bone/30 px-6 py-3 text-sm font-medium transition-colors hover:border-ember hover:bg-ember hover:text-ink"
              >
                Hire me
                <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:rotate-45" />
              </a>
            </Magnetic>
            <Magnetic>
              <a
                href={c.cv_url}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="label link-line inline-flex items-center gap-2 py-3 text-bone"
              >
                <Download className="h-3.5 w-3.5" />
                Download CV
              </a>
            </Magnetic>
          </div>
        </div>
      </div>
    </section>
  )
}
