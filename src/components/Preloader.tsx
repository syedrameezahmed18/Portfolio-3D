import { useEffect, useRef, useState } from 'react'
import { finishIntro, gsap, prefersReducedMotion, useGSAP } from '@/lib/motion'
import { lockScroll } from '@/lib/smooth-scroll'

const WORDS = ['designing', 'engineering', 'shipping']
const RING_R = 94
const RING_C = 2 * Math.PI * RING_R

/**
 * An ember arc draws around a ring while the counter climbs, a word cycles
 * through what the work is, then the curtain splits top and bottom to
 * reveal the hero.
 */
export default function Preloader() {
  const root = useRef<HTMLDivElement>(null)
  const counter = useRef<HTMLSpanElement>(null)
  const arc = useRef<SVGCircleElement>(null)
  const [gone, setGone] = useState(false)

  useEffect(() => {
    lockScroll(true)
    window.scrollTo(0, 0)
  }, [])

  useGSAP(
    () => {
      const done = () => {
        lockScroll(false)
        finishIntro()
        setGone(true)
      }
      if (prefersReducedMotion()) {
        done()
        return
      }

      const value = { n: 0 }
      // Start state is set here rather than inline: an inline translate would
      // be parsed as a pixel offset that GSAP then composes with yPercent.
      // 130% rather than 110% so descenders clear the clipped row entirely.
      gsap.set('.pre-word', { yPercent: 130 })
      const tl = gsap.timeline({ onComplete: done, defaults: { ease: 'power3.out' } })

      // Arrive
      tl.from('.pre-fade', { opacity: 0, y: 12, duration: 0.8, stagger: 0.08 }, 0)
        .from('.pre-ring', { scale: 0.85, opacity: 0, duration: 1.1, ease: 'expo.out' }, 0)
        .from('.pre-glow', { opacity: 0, duration: 1.2 }, 0)

      // Count, draw and fill in lockstep
      const LOAD = 2.3
      tl.to(
        value,
        {
          n: 100,
          duration: LOAD,
          ease: 'power2.inOut',
          onUpdate: () => {
            if (counter.current) counter.current.textContent = String(Math.round(value.n)).padStart(3, '0')
          },
        },
        0.25,
      )
        .to(arc.current, { strokeDashoffset: 0, duration: LOAD, ease: 'power2.inOut' }, 0.25)
        .to('.pre-bar', { scaleX: 1, duration: LOAD, ease: 'power2.inOut' }, 0.25)
        .to('.pre-ring', { rotation: 120, duration: LOAD + 0.6, ease: 'power1.inOut' }, 0.25)

      // Cycle the verb underneath
      const slot = LOAD / WORDS.length
      WORDS.forEach((_, i) => {
        const at = 0.35 + i * slot
        tl.fromTo(`.pre-word-${i}`, { yPercent: 130 }, { yPercent: 0, duration: 0.5, ease: 'expo.out' }, at)
        if (i < WORDS.length - 1) {
          tl.to(`.pre-word-${i}`, { yPercent: -130, duration: 0.4, ease: 'power3.in' }, at + slot - 0.35)
        }
      })

      // Leave: the centre blooms out, then the curtain splits
      tl.to('.pre-centre', { scale: 1.12, opacity: 0, duration: 0.5, ease: 'power3.in' }, '>-0.1')
        .to('.pre-fade, .pre-word-wrap, .pre-bar, .pre-glow', { opacity: 0, duration: 0.3 }, '<')
        .to('.pre-seam', { opacity: 1, duration: 0.25 }, '>-0.1')
        .to('.pre-panel-top', { yPercent: -100, duration: 1, ease: 'expo.inOut' }, '>')
        .to('.pre-panel-bottom', { yPercent: 100, duration: 1, ease: 'expo.inOut' }, '<')
        .to('.pre-seam', { scaleX: 0, opacity: 0, duration: 0.5, ease: 'power2.in' }, '<0.3')
    },
    { scope: root },
  )

  if (gone) return null

  return (
    <div ref={root} className="fixed inset-0 z-[90]" aria-hidden="true">
      {/* Curtain halves */}
      <div className="pre-panel-top absolute inset-x-0 top-0 h-1/2 bg-ink" />
      <div className="pre-panel-bottom absolute inset-x-0 bottom-0 h-1/2 bg-ink" />
      <div className="pre-seam absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-ember/70 opacity-0" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-between overflow-hidden px-6 py-6 md:px-10 md:py-8">
        <div className="pre-glow pointer-events-none absolute top-1/2 left-1/2 h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgb(255_106_61/0.18),transparent_60%)]" />

        <div className="pre-fade label flex items-center justify-between">
          <span>Syed Rameez Ahmed</span>
          <span className="hidden sm:inline">Full-stack developer</span>
        </div>

        <div className="pre-centre relative mx-auto flex items-center justify-center">
          <svg className="pre-ring h-[clamp(210px,34vmin,360px)] w-auto" viewBox="0 0 200 200" fill="none">
            <circle cx="100" cy="100" r={RING_R} stroke="rgb(236 229 216 / 0.12)" strokeWidth="0.75" />
            <circle
              ref={arc}
              cx="100"
              cy="100"
              r={RING_R}
              stroke="#ff6a3d"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray={RING_C}
              strokeDashoffset={RING_C}
              transform="rotate(-90 100 100)"
            />
            <circle cx="100" cy="100" r="2" fill="#ff6a3d" transform={`translate(0 ${-RING_R})`} />
          </svg>
          <div className="absolute flex items-baseline gap-1">
            <span ref={counter} className="font-display text-[clamp(3.2rem,10vmin,6.5rem)] leading-none font-medium tracking-tight tabular-nums">
              000
            </span>
            <span className="font-mono text-sm text-ember">%</span>
          </div>
        </div>

        <div className="flex items-end justify-between">
          <div className="pre-word-wrap relative h-[1.2em] overflow-hidden text-[clamp(1.5rem,4vw,2.8rem)] leading-none">
            {WORDS.map((w, i) => (
              <span key={w} className={`pre-word pre-word-${i} font-serif-italic absolute bottom-0 left-0 block text-bone-dim`}>
                {w}
              </span>
            ))}
            {/* keeps the row's width stable */}
            <span className="font-serif-italic invisible">engineering</span>
          </div>
          <span className="pre-fade label">Loading</span>
        </div>

        <div className="pre-bar absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-ember" />
      </div>
    </div>
  )
}
